// -------------------------------------------------
// ----------------- FILESYSTEM---------------------
// -------------------------------------------------
// Implementation of a unix filesystem in memory.

"use strict";

var S_IRWXUGO = 0x1FF;
var S_IFMT = 0xF000;
var S_IFSOCK = 0xC000;
var S_IFLNK = 0xA000;
var S_IFREG = 0x8000;
var S_IFBLK = 0x6000;
var S_IFDIR = 0x4000;
var S_IFCHR = 0x2000;

//var S_IFIFO  0010000
//var S_ISUID  0004000
//var S_ISGID  0002000
//var S_ISVTX  0001000

var O_RDONLY = 0x0000; // open for reading only 
var O_WRONLY = 0x0001; // open for writing only
var O_RDWR = 0x0002; // open for reading and writing
var O_ACCMODE = 0x0003; // mask for above modes

var STATUS_INVALID = -0x1;
var STATUS_OK = 0x0;
var STATUS_OPEN = 0x1;
var STATUS_ON_SERVER = 0x2;
var STATUS_LOADING = 0x3;
var STATUS_UNLINKED = 0x4;


function FS() {
    this.inodes = [];
    this.events = [];

    this.qidnumber = 0x0;
    this.filesinloadingqueue = 0;
    this.OnLoaded = function() {};

    this.tar = new TAR(this);
    this.userinfo = [];

    RegisterMessage("LoadFilesystem", this.LoadFilesystem.bind(this) );
    RegisterMessage("MergeFile", this.MergeFile.bind(this) );
    RegisterMessage("tar",
        function(data) {
            SendToMaster("tar", this.tar.Pack(data));
        }.bind(this)
    );
    RegisterMessage("sync",
        function(data) {
            SendToMaster("sync", this.tar.Pack(data));
        }.bind(this)
    );

    // root entry
    this.CreateDirectory("", -1);
}


// -----------------------------------------------------
FS.prototype.LoadFilesystem = function(userinfo)
{
    this.userinfo = userinfo;
    this.LoadFSXML(this.userinfo.basefsURL);
    this.OnLoaded = function() { // the basic filesystem is loaded, so download the rest
        this.LoadFSXML(this.userinfo.extendedfsURL);
        for(var i=0; i<this.userinfo.lazyloadimages.length; i++) {
            this.LoadImage(this.userinfo.lazyloadimages[i]);
        }
    }.bind(this);

}


// -----------------------------------------------------

FS.prototype.AddEvent = function(id, OnEvent) {
    var inode = this.inodes[id];
    if (inode.status == STATUS_OK) {
        OnEvent();
        return;
    }
    this.events.push({id: id, OnEvent: OnEvent});    
}

FS.prototype.HandleEvent = function(id) {
    if (this.filesinloadingqueue == 0) {
        this.OnLoaded();
        this.OnLoaded = function() {}
    }
    //DebugMessage("number of events: " + this.events.length);
    for(var i = this.events.length - 1; i >= 0; i--) {
        if (this.events[i].id != id) continue;
        this.events[i].OnEvent();
        this.events.splice(i, 1);
    }
}


// -----------------------------------------------------
FS.prototype.LoadImage = function(url)
{
    if (!url) return;
    //DebugMessage("Load Image " + url);
/*
    if (typeof Worker !== 'undefined') {
        LoadBZIP2Resource(url, 
            function(m){ for(var i=0; i<m.size; i++) this.tar.Unpack(m.data[i]); }.bind(this), 
            function(e){DebugMessage("Error: Could not load " + url + ". Skipping.");});
        return;
    }
*/
    LoadBinaryResource(url,
    function(buffer){
        var buffer8 = new Uint8Array(buffer);
        bzip2.simple(buffer8, this.tar.Unpack.bind(this.tar));
    }.bind(this),
    function(error){DebugMessage("Error: Could not load " + url + ". Skipping.");});
}
// -----------------------------------------------------


function ReadVariable(buffer, offset) {
    var variable = [];
    variable.name = "";
    variable.value = "";

    // read blanks
    for(var i=offset; i<buffer.length; i++) {
        if (buffer[i] == '>') return variable;
        if (buffer[i] == '/') return variable;
        if (buffer[i] != ' ') break;
    }
    offset = i;
    if (buffer[i] == '>') return variable;

    // read variable name
    for(var i=offset; i<buffer.length; i++) {
        if (buffer[i] == '>') break;
        if (buffer[i] == '=') break;
        variable.name = variable.name + buffer[i]; 
    }
    offset = i+1;
    if (variable.name.length == 0) return variable;
    // read variable value
    for(var i=offset+1; i<buffer.length; i++) {
        if (buffer[i] == '>') break;
        if (buffer[i] == '\'') break;
        variable.value = variable.value + buffer[i]; 
    }
    offset = i+1;
    variable.offset = offset;
    //DebugMessage("read " + variable.name + "=" + variable.value);
    return variable;
}

function ReadTag(buffer, offset) {
    var tag = [];
    tag.type = "";
    tag.name = "";
    tag.mode = 0x0;
    tag.uid = 0x0;
    tag.gid = 0x0;
    tag.path = "";
    tag.src = "";
    tag.compressed = false;
    tag.load = false;

    if (buffer[offset] != '<') return tag;
    for(var i=offset+1; i<buffer.length; i++) {
        if (buffer[i] ==  ' ') break;
        if (buffer[i] == '\n') break;
        if (buffer[i] == '>') break;
        tag.type = tag.type + buffer[i]; 
    }
    offset = i;
    // read variables
    do {
        var variable = ReadVariable(buffer, offset);
        if (variable.name == "name") tag.name = variable.value;
        if (variable.name == "mode") tag.mode = parseInt(variable.value, 8);
        if (variable.name == "uid") tag.uid = parseInt(variable.value, 10);
        if (variable.name == "gid") tag.gid = parseInt(variable.value, 10);
        if (variable.name == "path") tag.path = variable.value;
        if (variable.name == "size") tag.size = parseInt(variable.value, 10);
        if (variable.name == "src") tag.src = variable.value;
        if (variable.name == "compressed") tag.compressed = true;
        if (variable.name == "load") tag.load = true;
        offset = variable.offset;
    } while(variable.name.length != 0);
    return tag;
};

FS.prototype.CheckEarlyload = function(path)
{
    for(var i=0; i<this.userinfo.earlyload.length; i++) {
        if (this.userinfo.earlyload[i] == path) {
            return true;
        }
    }
    return false;
}

FS.prototype.LoadFSXML = function(urls)
{
    DebugMessage("Load filesystem information from " + urls);
    LoadXMLResource("../../" + urls, this.OnXMLLoaded.bind(this), function(error){throw error;});
}

FS.prototype.OnXMLLoaded = function(fs)
{
    // At this point I realized, that the dom is not available in worker threads and that I cannot get the xml information directly.
    // So let's analyze ourself
    var sysrootdir = "../../";

    var parentid = 0;
    for(var i=0; i<fs.length; i++)
    {
        if (fs[i] != '<') continue;
        var tag = ReadTag(fs, i, ' ');
        var id = this.Search(parentid, tag.name);
        if (id != -1) {
            if (tag.type == "Dir") parentid = id;             
            continue;
        }
        var inode = this.CreateInode();
        inode.name = tag.name;
        inode.uid = tag.uid;
        inode.gid = tag.gid;
        inode.parentid = parentid;
        inode.mode = tag.mode;
	
        var size = tag.size;

    switch(tag.type) {
    case "FS":
        sysrootdir = "../../" + tag.src + "/";
        break;

    case "Dir":
        inode.mode |= S_IFDIR;
        inode.updatedir = true;
        parentid = this.inodes.length;
        this.PushInode(inode);
        break;

    case "/Dir":
        parentid = this.inodes[parentid].parentid;
        break;

    case "File":
        inode.mode |= S_IFREG;
        var idx = this.inodes.length;
        inode.status = STATUS_ON_SERVER;
        inode.compressed = tag.compressed;
        inode.size = size;
        this.PushInode(inode);
        var url = sysrootdir + (tag.src.length==0?this.GetFullPath(idx):tag.src);
        inode.url = url;
        //DebugMessage("Load id=" + (idx) + " " + url);
        if (tag.load || this.CheckEarlyload(this.GetFullPath(idx)) ) {
            this.LoadFile(idx);
        }
        break;

    case "Link":
        inode.mode = S_IFLNK | S_IRWXUGO;
        inode.symlink = tag.path;
        this.PushInode(inode);
        break;
        }
    }
    DebugMessage("processed " + this.inodes.length + " inodes");
    this.Check();
}

// The filesystem is responsible to add the correct time. This is a hack
// Have to find a better solution.
FS.prototype.AppendDateHack = function(idx) {
    if (this.GetFullPath(idx) != "etc/init.d/rcS") return; 
    var inode = this.inodes[idx];
    var date = new Date();
    var datestring = 
        "\ndate -s \"" + 
        date.getFullYear() + 
        "-" + 
        (date.getMonth()+1) + 
        "-" + 
        date.getDate() + 
        " " + 
        date.getHours() +
        ":" + 
        date.getMinutes() +
        ":" + 
        date.getSeconds() +
        "\"\n";
    var size = inode.size;
    this.ChangeSize(idx, size+datestring.length);
    for(var i=0; i<datestring.length; i++) {
        inode.data[i+size] = datestring.charCodeAt(i); 
    }
}


// Loads the data from a url for a specific inode
FS.prototype.LoadFile = function(idx) {
    var inode = this.inodes[idx];
    if (inode.status != STATUS_ON_SERVER) {
        return;
    }
    inode.status = STATUS_LOADING;
    this.filesinloadingqueue++;

    if (inode.compressed) {
        inode.data = new Uint8Array(inode.size);
        LoadBinaryResource(inode.url + ".bz2",
        function(buffer){
            var buffer8 = new Uint8Array(buffer);
            var ofs = 0;
            bzip2.simple(buffer8, function(x){inode.data[ofs++] = x;}.bind(this) );    
            inode.status = STATUS_OK;
            this.filesinloadingqueue--;
            this.HandleEvent(idx);            
        }.bind(this), 
        function(error){throw error;});

        return;
    }

    LoadBinaryResource(inode.url, 
        function(buffer){
            inode.data = new Uint8Array(buffer);
            inode.size = this.inodes[idx].data.length; // correct size if the previous was wrong. 
            inode.status = STATUS_OK;
            if (inode.name == "rcS") {
                this.AppendDateHack(idx);
            }
            this.filesinloadingqueue--;
            this.HandleEvent(idx);            
        }.bind(this), 
        function(error){throw error;});

}

// -----------------------------------------------------

FS.prototype.PushInode = function(inode) {
    if (inode.parentid != -1) {
        this.inodes.push(inode);
        this.inodes[inode.parentid].updatedir = true;
        inode.nextid = this.inodes[inode.parentid].firstid;
        this.inodes[inode.parentid].firstid = this.inodes.length-1;
        return;
    } else {
        if (this.inodes.length == 0) { // if root directory
            this.inodes.push(inode);
            return;
        }
    }

    DebugMessage("Error in Filesystem: Pushed inode with name = "+ inode.name + " has no parent");
    abort();

}


FS.prototype.CreateInode = function() {
    this.qidnumber++;
    return {
        updatedir : false, // did the directory listing changed?
        parentid: -1,
        firstid : -1, // first file id in directory
        nextid : -1, // next id in directory
        status : 0,
        name : "",
        size : 0x0,
        uid : 0x0,
        gid : 0x0,
        ctime : Math.floor((new Date()).getTime()/1000),
        atime : Math.floor((new Date()).getTime()/1000),
        mtime : Math.floor((new Date()).getTime()/1000),
        major : 0x0,
        minor : 0x0,
        data : new Uint8Array(0),
        symlink : "",
        mode : 0x01ED,
        qid: {type: 0, version: 0, path: this.qidnumber},
        url: "", // url to download the file
        compressed: false
    };
}



FS.prototype.CreateDirectory = function(name, parentid) {
    var x = this.CreateInode();
    x.name = name;
    x.parentid = parentid;
    x.mode = 0x01FF | S_IFDIR;
    x.updatedir = true;
    if (parentid >= 0) {
        x.uid = this.inodes[parentid].uid;
        x.gid = this.inodes[parentid].gid;
        x.mode = (this.inodes[parentid].mode & 0x1FF) | S_IFDIR;
    }
    x.qid.type = S_IFDIR >> 8;
    this.PushInode(x);
    return this.inodes.length-1;
}

FS.prototype.CreateFile = function(filename, parentid) {
    var x = this.CreateInode();
    x.name = filename;
    x.parentid = parentid;
    x.uid = this.inodes[parentid].uid;
    x.gid = this.inodes[parentid].gid;
    x.qid.type = S_IFREG >> 8;
    x.mode = (this.inodes[parentid].mode & 0x1B6) | S_IFREG;
    this.PushInode(x);
    return this.inodes.length-1;
}


FS.prototype.CreateNode = function(filename, parentid, major, minor) {
    var x = this.CreateInode();
    x.name = filename;
    x.parentid = parentid;
    x.major = major;
    x.minor = minor;
    x.uid = this.inodes[parentid].uid;
    x.gid = this.inodes[parentid].gid;
    x.qid.type = S_IFSOCK >> 8;
    x.mode = (this.inodes[parentid].mode & 0x1B6);
    this.PushInode(x);
    return this.inodes.length-1;
}
     
FS.prototype.CreateSymlink = function(filename, parentid, symlink) {
    var x = this.CreateInode();
    x.name = filename;
    x.parentid = parentid;
    x.uid = this.inodes[parentid].uid;
    x.gid = this.inodes[parentid].gid;
    x.qid.type = S_IFLNK >> 8;
    x.symlink = symlink;
    x.mode = S_IFLNK;
    this.PushInode(x);
    return this.inodes.length-1;
}

FS.prototype.CreateTextFile = function(filename, parentid, str) {
    var id = this.CreateFile(filename, parentid);
    var x = this.inodes[id];
    x.data = new Uint8Array(str.length);
    x.size = str.length;
    for (var j in str) {
        x.data[j] = str.charCodeAt(j);
    }
    return id;
}

FS.prototype.OpenInode = function(id, mode) {
    var inode = this.GetInode(id);
    if ((inode.mode&S_IFMT) == S_IFDIR) {
        this.FillDirectory(id);
    }
    /*
    var type = "";
    switch(inode.mode&S_IFMT) {
        case S_IFREG: type = "File"; break;
        case S_IFBLK: type = "Block Device"; break;
        case S_IFDIR: type = "Directory"; break;
        case S_IFCHR: type = "Character Device"; break;
    }
    */
    //DebugMessage("open:" + this.GetFullPath(id) +  " type: " + type + " status:" + inode.status);
    if (inode.status == STATUS_ON_SERVER) {
        this.LoadFile(id);
        return false;
    }
    return true;
}

FS.prototype.CloseInode = function(id) {
    //DebugMessage("close: " + this.GetFullPath(id));
    var inode = this.GetInode(id);
    if (inode.status == STATUS_UNLINKED) {
        //DebugMessage("Filesystem: Delete unlinked file");
        inode.status == STATUS_INVALID;
        inode.data = new Uint8Array(0);
        inode.size = 0;
    }
}

FS.prototype.Rename = function(olddirid, oldname, newdirid, newname) {
    // DebugMessage("Rename " + oldname + " to " + newname);
    if ((olddirid == newdirid) && (oldname == newname)) {
        return true;
    }
    var oldid = this.Search(olddirid, oldname);
    if (oldid == -1) {
        return false;
    }
    var newid = this.Search(newdirid, newname);
    if (newid != -1) {
        this.Unlink(newid);
    }

    var idx = oldid; // idx contains the id which we want to rename
    var inode = this.inodes[idx];

    // remove inode ids
    if (this.inodes[inode.parentid].firstid == idx) {
        this.inodes[inode.parentid].firstid = inode.nextid;
    } else {
        var id = this.FindPreviousID(idx);
        if (id == -1) {
            DebugMessage("Error in Filesystem: Cannot find previous id of inode");
            abort();
        }
        this.inodes[id].nextid = inode.nextid;
    }

    inode.parentid = newdirid;
    inode.name = newname;
    inode.qid.version++;

    inode.nextid = this.inodes[inode.parentid].firstid;
    this.inodes[inode.parentid].firstid = idx;

    this.inodes[olddirid].updatedir = true;
    this.inodes[newdirid].updatedir = true;
    return true;
}

FS.prototype.Write = function(id, offset, count, GetByte) {
    var inode = this.inodes[id];

    if (inode.data.length < (offset+count)) {
        this.ChangeSize(id, Math.floor(((offset+count)*3)/2) );
        inode.size = offset + count;
    } else
    if (inode.size < (offset+count)) {
        inode.size = offset + count;
    }
    for(var i=0; i<count; i++)
        inode.data[offset+i] = GetByte();
}

FS.prototype.Search = function(parentid, name) {
    var id = this.inodes[parentid].firstid;
    while(id != -1) {
        if (this.inodes[id].parentid != parentid) { // consistency check
            DebugMessage("Error in Filesystem: Found inode with wrong parent id");
        }
        if (this.inodes[id].name == name) return id;
        id = this.inodes[id].nextid;
    }
    return -1;
}

FS.prototype.GetTotalSize = function() {
    var size = 0;
    for(var i=0; i<this.inodes.length; i++) {
        size += this.inodes[i].data.length;
    }
    return size;
}

FS.prototype.GetFullPath = function(idx) {
    var path = "";

    while(idx != 0) {
        path = "/" + this.inodes[idx].name + path;
        idx = this.inodes[idx].parentid;
    }
    return path.substring(1);
}

// no double linked list. So, we need this
FS.prototype.FindPreviousID = function(idx) {
    var inode = this.GetInode(idx);
    var id = this.inodes[inode.parentid].firstid;
    while(id != -1) {
        if (this.inodes[id].nextid == idx) return id;
        id = this.inodes[id].nextid;
    }
    return id;
}

FS.prototype.Unlink = function(idx) {
    if (idx == 0) return false; // root node cannot be deleted
    var inode = this.GetInode(idx);
    //DebugMessage("Unlink " + inode.name);

    // check if directory is not empty
    if ((inode.mode&S_IFMT) == S_IFDIR) {
       if (inode.firstid != -1) return false;
    }

    // update ids
    if (this.inodes[inode.parentid].firstid == idx) {
        this.inodes[inode.parentid].firstid = inode.nextid;
    } else {
        var id = this.FindPreviousID(idx);
        if (id == -1) {
            DebugMessage("Error in Filesystem: Cannot find previous id of inode");
            abort();
        }
        this.inodes[id].nextid = inode.nextid;
    }
    // don't delete the content. The file is still accessible
    this.inodes[inode.parentid].updatedir = true;
    inode.status = STATUS_UNLINKED;
    inode.nextid = -1;
    inode.firstid = -1;
    inode.parentid = -1;
    return true;
}

FS.prototype.GetInode = function(idx)
{
    if (isNaN(idx)) {
        DebugMessage("Error in filesystem: id is not a number ");
        return 0;
    }

    if ((idx < 0) || (idx > this.inodes.length)) {
        DebugMessage("Error in filesystem: Attempt to get inode with id " + idx);
        return 0;
    }
    return this.inodes[idx];
}

FS.prototype.ChangeSize = function(idx, newsize)
{
    var inode = this.GetInode(idx);
    var temp = inode.data;
    //DebugMessage("change size to: " + newsize);
    if (newsize == inode.size) return;
    inode.data = new Uint8Array(newsize);
    inode.size = newsize;
    var size = Math.min(temp.length, inode.size);
    for(var i=0; i<size; i++) {
        inode.data[i] = temp[i];
    }
}

FS.prototype.SearchPath = function(path) {
    //path = path.replace(/\/\//g, "/");
    path = path.replace("//", "/");
    var walk = path.split("/");
    var n = walk.length;
    if (walk[n-1].length == 0) walk.pop();
    if (walk[0].length == 0) walk.shift();
    var n = walk.length;

    var parentid = 0;
    var id = -1;
    for(var i=0; i<n; i++) {
        id = this.Search(parentid, walk[i]);        
        if (id == -1) {
            if (i < n-1) return {id: -1, parentid: -1, name: walk[i]}; // one name of the path cannot be found
            return {id: -1, parentid: parentid, name: walk[i]}; // the last element in the path does not exist, but the parent
        }
        parentid = id;
    }
    return {id: id, parentid: parentid, name: walk[i]};
}
// -----------------------------------------------------

FS.prototype.GetRecursiveList = function(dirid, list) {
    var id = this.inodes[dirid].firstid;
    while(id != -1) {
        list.push(id);
        if ((this.inodes[id].mode&S_IFMT) == S_IFDIR) {
            this.GetRecursiveList(id, list);
        }
        id = this.inodes[id].nextid;
    }
}

FS.prototype.MergeFile = function(file) {
    DebugMessage("Merge path:" + file.name);
    var ids = this.SearchPath(file.name);
    if (ids.parentid == -1) return; // not even the path seems to exist
    if (ids.id == -1) {
        ids.id = this.CreateFile(ids.name, ids.parentid); 
    }
    this.inodes[ids.id].data = file.data;
    this.inodes[ids.id].size = file.data.length;
}


FS.prototype.Check = function() {
    for(var i=1; i<this.inodes.length; i++)
    {
        if (this.inodes[i].status == STATUS_INVALID) continue;
        if (this.inodes[i].nextid == i) {
            DebugMessage("Error in filesystem: file points to itself");
            abort();
        }

        var inode = this.GetInode(i);
        if (inode.parentid < 0) {
            DebugMessage("Error in filesystem: negative parent id " + i);
        }
        var n = inode.name.length;
        if (n == 0) {
            DebugMessage("Error in filesystem: inode with no name and id " + i);
        }

        for (var j in inode.name) {
            var c = inode.name.charCodeAt(j);
            if (c < 32) {
                DebugMessage("Error in filesystem: Unallowed char in filename");
            } 
        }
    }

}


FS.prototype.FillDirectory = function(dirid) {
    var inode = this.GetInode(dirid);
    if (!inode.updatedir) return;
    var parentid = inode.parentid;
    if (parentid == -1) parentid = 0; // if root directory point to the root directory

    // first get size
    var size = 0;
    var id = this.inodes[dirid].firstid;
    while(id != -1) {
        size += 13 + 8 + 1 + 2 + UTF8Length(this.inodes[id].name);
        id = this.inodes[id].nextid;
    }

    size += 13 + 8 + 1 + 2 + 1; // "." entry
    size += 13 + 8 + 1 + 2 + 2; // ".." entry
    //DebugMessage("size of dir entry: " + size);
    inode.data = new Uint8Array(size);
    inode.size = size;

    var offset = 0x0;
    offset += Marshall(
        ["Q", "d", "b", "s"],
        [this.inodes[dirid].qid, 
        offset+13+8+1+2+1, 
        this.inodes[dirid].mode >> 12, 
        "."],
        inode.data, offset);

    offset += Marshall(
        ["Q", "d", "b", "s"],
        [this.inodes[parentid].qid,
        offset+13+8+1+2+2, 
        this.inodes[parentid].mode >> 12, 
        ".."],
        inode.data, offset);

    var id = this.inodes[dirid].firstid;
    while(id != -1) {
        offset += Marshall(
        ["Q", "d", "b", "s"],
        [this.inodes[id].qid,
        offset+13+8+1+2+UTF8Length(this.inodes[id].name),
        this.inodes[id].mode >> 12,
        this.inodes[id].name],
        inode.data, offset);
        id = this.inodes[id].nextid;
    }
    inode.updatedir = false;
}


// -----------------------------------------------------

// only support for security.capabilities
// should return a  "struct vfs_cap_data" defined in
// linux/capability for format
// check also:
//   sys/capability.h
//   http://lxr.free-electrons.com/source/security/commoncap.c#L376
//   http://man7.org/linux/man-pages/man7/capabilities.7.html
//   http://man7.org/linux/man-pages/man8/getcap.8.html
//   http://man7.org/linux/man-pages/man3/libcap.3.html
FS.prototype.PrepareCAPs = function(id) {
    var inode = this.GetInode(id);
    if (inode.caps) return inode.caps.length;
    inode.caps = new Uint8Array(12);
    // format is little endian
    // magic_etc (revision=0x01: 12 bytes)
    inode.caps[0]  = 0x00;
    inode.caps[1]  = 0x00;
    inode.caps[2]  = 0x00;
    inode.caps[3]  = 0x01;
    // permitted (full capabilities)
    inode.caps[4]  = 0xFF;
    inode.caps[5]  = 0xFF;
    inode.caps[6]  = 0xFF;
    inode.caps[7]  = 0xFF;
    // inheritable (full capabilities
    inode.caps[8]  = 0xFF;
    inode.caps[9]  = 0xFF;
    inode.caps[10] = 0xFF;
    inode.caps[11] = 0xFF;

    return inode.caps.length;
}
