var h = !0, j = !1, k = "000000 BB0000 00BB00 BBBB00 0000BB BB00BB 00BBBB BBBBBB 555555 FF5555 55FF55 FFFF55 5555FF FF55FF 55FFFF 55FFFF".split(" ");
function l(a) {
  a.X = !a.X;
  var b = a.color[a.a][a.b];
  a.X && (a.color[a.a][a.b] |= 1536);
  m(a, a.a);
  a.color[a.a][a.b] = b;
  window.setTimeout(function() {
    l(n)
  }, 1E3)
}
function q(a, b, c, e, f) {
  for(;b <= e;b++) {
    for(var d = c;d <= f;d++) {
      a.screen[b][d] = 0, a.color[b][d] = 7
    }
    m(a, b)
  }
}
function m(a, b) {
  for(var c = 7, e = j, f = "", d = 0;d < a.p;d++) {
    c != a.color[b][d] && (e && (f += "</span>"), c = a.color[b][d], 7 != c && (f += '<span style="color:#' + k[c & 31] + ";background-color:#" + k[c >>> 8 & 31] + '">', e = h)), f = 0 == a.screen[b][d] ? f + "&nbsp;" : 32 == a.screen[b][d] ? f + "&nbsp;" : f + String.fromCharCode(a.screen[b][d])
  }
  e && (f += "</span>");
  a.ja[a.q - b - 1].innerHTML = f
}
function r(a) {
  for(var b = 0;b < a.q;b++) {
    m(a, b)
  }
}
function s(a) {
  if(a.a != a.q - 1) {
    a.a++
  }else {
    for(var b = 1;b < a.q;b++) {
      for(var c = 0;c < a.p;c++) {
        a.screen[b - 1][c] = a.screen[b][c], a.color[b - 1][c] = a.color[b][c]
      }
    }
    b = a.q - 1;
    for(c = 0;c < a.p;c++) {
      a.screen[b][c] = 0, a.color[b][c] = 7
    }
    m(a, b);
    r(a)
  }
}
function t(a) {
  if("[J" == a.n) {
    q(a, a.a, a.b, a.a, a.p - 1), q(a, a.a + 1, 0, a.q - 1, a.p - 1)
  }else {
    if("[1K" == a.n) {
      q(a, a.a, 0, a.a, a.b)
    }else {
      if("[K" == a.n) {
        q(a, a.a, a.b, a.a, a.p - 1)
      }else {
        var b = a.n;
        if("[" == b.charAt(0)) {
          var b = b.substr(1), c = b.substr(b.length - 1), b = b.substr(0, b.length - 1), b = b.split(";");
          0 == b[0].length && (b = []);
          if("m" == c) {
            c = b;
            for(b = 0;b < c.length;b++) {
              switch(Number(c[b])) {
                case 30:
                ;
                case 31:
                ;
                case 32:
                ;
                case 33:
                ;
                case 34:
                ;
                case 35:
                ;
                case 36:
                ;
                case 37:
                  a.f = a.f & -8 | c[b] - 30 & 7;
                  break;
                case 40:
                ;
                case 41:
                ;
                case 42:
                ;
                case 43:
                ;
                case 44:
                ;
                case 45:
                ;
                case 46:
                ;
                case 47:
                  a.f = a.f & 255 | (c[b] - 40 & 7) << 8;
                  break;
                case 0:
                  a.f = 7;
                  break;
                case 1:
                  a.f |= 10;
                  break;
                case 7:
                  a.f = (a.f & 15) << 8 | a.f >> 8 & 15;
                  break;
                case 39:
                  a.f = a.f & -8 | 7;
                  break;
                case 49:
                  a.f &= 255;
                  break;
                case 10:
                  break;
                default:
                  u("Color " + c[b] + " not found")
              }
            }
          }else {
            if("H" == c || "d" == c) {
              switch(c = b, c.length) {
                case 0:
                  a.b = 0;
                  a.a = 0;
                  break;
                case 1:
                  a.a = c[0];
                  break;
                default:
                  a.a = c[0], a.b = c[1]
              }
            }else {
              if("G" == c) {
                a.b = b[0]
              }else {
                if("A" == c) {
                  0 == b.length ? a.a-- : a.a -= b[0]
                }else {
                  if("E" == c) {
                    0 == b.length ? a.a++ : a.a += b[0]
                  }else {
                    if("C" == c) {
                      0 == b.length ? a.b++ : a.b += b[0]
                    }else {
                      if("D" == c) {
                        0 == b.length ? a.b-- : a.b -= b[0]
                      }else {
                        if("X" == c) {
                          for(c = a.b;c < a.b + b[0];c++) {
                            a.screen[a.a][c] = 0
                          }
                        }else {
                          "r" != c && u("Escape sequence unknown:'" + a.n + "'")
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
function v(a) {
  var b = n;
  if(2 == b.z) {
    b.n += String.fromCharCode(a), 64 <= a && 126 >= a && (t(b), b.z = 0)
  }else {
    if(0 == b.z && 27 == a) {
      b.z = 1, b.n = ""
    }else {
      if(1 == b.z) {
        b.n += String.fromCharCode(a), 91 == a ? b.z = 2 : (t(b), b.z = 0)
      }else {
        switch(a) {
          case 10:
            s(b);
            return;
          case 13:
            b.b = 0;
            return;
          case 7:
            return;
          case 8:
            b.b--;
            0 > b.b && (b.b = 0);
            m(b, b.a);
            return;
          case 0:
          ;
          case 1:
          ;
          case 2:
          ;
          case 3:
          ;
          case 4:
          ;
          case 5:
          ;
          case 6:
          ;
          case 9:
          ;
          case 11:
          ;
          case 12:
          ;
          case 14:
          ;
          case 15:
          ;
          case 16:
          ;
          case 17:
          ;
          case 18:
          ;
          case 19:
          ;
          case 20:
          ;
          case 21:
          ;
          case 22:
          ;
          case 23:
          ;
          case 24:
          ;
          case 25:
          ;
          case 26:
          ;
          case 27:
          ;
          case 28:
          ;
          case 29:
          ;
          case 30:
          ;
          case 31:
            u("unknown command " + w(a));
            return
        }
        b.b >= b.p && (s(b), b.b = 0);
        var c = b.b, e = b.a;
        b.screen[e][c] = a;
        b.color[e][c] = b.f;
        m(b, b.a);
        b.b++
      }
    }
  }
}
function x() {
  this.N = j;
  document.onkeypress = this.la;
  document.onkeydown = this.ka;
  document.onkeyup = this.ma
}
x.prototype.la = function(a) {
  var b = 0, b = a.charCode;
  if(0 == b) {
    return j
  }
  if(this.N && (65 <= b && 90 >= b || 97 <= b && 122 >= b)) {
    b &= 31
  }
  y(b);
  return j
};
x.prototype.ma = function(a) {
  17 == a.keyCode && (this.N = j);
  return j
};
x.prototype.ka = function(a) {
  var b = a.keyCode;
  switch(b) {
    case 16:
      return;
    case 38:
      return y(16), a.preventDefault(), j;
    case 37:
      return y(2), a.preventDefault(), j;
    case 40:
      return y(14), a.preventDefault(), j;
    case 39:
      return y(6), a.preventDefault(), j;
    case 17:
      this.N = h;
      return;
    case 67:
      if(this.N == h) {
        return y(3), a.preventDefault(), j
      }
  }
  if(0 != b && 31 >= b) {
    return y(b), a.preventDefault(), j
  }
};
function z(a) {
  if(a.W) {
    for(var b = 3;b < 4 * a.width * a.height;b += 4) {
      a.W[b] = 255
    }
    a.Y.data.set(a.W);
    a.ia.putImageData(a.Y, 0, 0);
    window.setTimeout(function() {
      z(A)
    }, 500)
  }
}
function u(a) {
  console.log(a)
}
function B() {
  u("Aborting execution.");
  u("Current state of the machine");
  u("PC: " + w(C.r));
  u("next PC: " + w(C.k));
  for(var a = 0;32 > a;a += 4) {
    u("   r" + (a + 0) + ": " + w(C.A[a + 0]) + "   r" + (a + 1) + ": " + w(C.A[a + 1]) + "   r" + (a + 2) + ": " + w(C.A[a + 2]) + "   r" + (a + 3) + ": " + w(C.A[a + 3]))
  }
  C.m && u("delayed instruction");
  C.I ? u("Supervisor mode") : u("User mode");
  C.J && u("tick timer exception enabled");
  C.s && u("interrupt exception enabled");
  C.G && u("data mmu enabled");
  C.H && u("instruction mmu enabled");
  C.S && u("little endian enabled");
  C.Q && u("context id enabled");
  C.c && u("flag set");
  C.j && u("carry set");
  C.t && u("overflow set");
  throw Error("Abort javascript");
}
function w(a) {
  return"0x" + ("00000000" + a.toString(16)).substr(-8).toUpperCase()
}
var D = 32, aa = 64, G = 1;
function H() {
  this.O = 3;
  this.i = aa | D;
  this.oa = 0;
  this.h = G;
  this.input = this.na = this.ca = this.aa = this.ba = this.C = this.v = 0;
  this.D = []
}
function y(a) {
  var b = I;
  b.D.push(a);
  1 <= b.D.length && (b.input = b.D.shift(), b.B(12), b.i |= 1, J(b))
}
function J(a) {
  a.v |= 4096;
  a.C & 1 && (6 != a.h && 4 != a.h) && (a.h = 12, K())
}
function L(a) {
  a.v |= 4;
  if(a.C & 2 && (a.h & G || 0 == a.h || 2 == a.h)) {
    a.h = 2, K()
  }
}
function M(a) {
  a.v & 4096 && a.C & 1 ? J(a) : a.v & 4 && a.C & 2 ? L(a) : (a.h = G, C.B(2))
}
H.prototype.B = function(a) {
  this.v &= ~(1 << a);
  this.h = G;
  a == this.h && M(this)
};
function ba(a) {
  var b = I;
  if(b.O & 128) {
    switch(a) {
      case 0:
        return b.ba;
      case 1:
        return b.aa
    }
  }
  switch(a) {
    case 0:
      return a = b.input, b.input = 0, b.B(4), b.B(12), 1 <= b.D.length ? (b.input = b.D.shift(), b.i |= 1) : b.i &= -2, a;
    case 1:
      return b.C & 15;
    case 6:
      return b.oa;
    case 2:
      return a = b.h & 15 | 192, 2 == b.h && b.B(2), a;
    case 3:
      return b.O;
    case 5:
      return b.i;
    default:
      u("Error in ReadRegister: not supported"), B()
  }
}
var N = 40960, O = 34;
function ca(a) {
  var b = P;
  if(a > b.F - 4) {
    if(2449473536 <= a && 2449477628 >= a) {
      return 2449473536 == a ? N : 2449473592 == a ? (a = O, 5651 == O && (O = 65535), 34 == O && (O = 5651), a) : 0
    }
    u("Error in ReadMemory32: RAM region " + w(a) + " is not accessible");
    B()
  }
  return b.d[a >>> 2]
}
function Q(a) {
  var b = P;
  if(a > b.F - 1) {
    if(2415919104 <= a && 2415919110 >= a) {
      return ba(a - 2415919104)
    }
    u("Error in ReadMemory8: RAM region is not accessible");
    B()
  }
  switch(a & 3) {
    case 0:
      return b.e[a & -4 | 3];
    case 1:
      return b.e[a & -4 | 2];
    case 2:
      return b.e[a & -4 | 1];
    case 3:
      return b.e[a & -4 | 0]
  }
}
function R(a) {
  var b = P;
  a > b.F - 2 && (u("Error in ReadMemory16: RAM region is not accessible"), B());
  return a & 2 ? b.e[a & -4 | 1] << 8 | b.e[a & -4] : b.e[a & -4 | 3] << 8 | b.e[a & -4 | 2]
}
var S = 4, T = 3, U = 256;
function V() {
  var a = new ArrayBuffer(128);
  this.A = new Uint32Array(a);
  a = new ArrayBuffer(4096);
  this.u = new Uint32Array(a);
  a = new ArrayBuffer(4096);
  this.L = new Uint32Array(a);
  a = new ArrayBuffer(4096);
  this.T = new Uint32Array(a);
  this.w = this.k = this.r = 0;
  this.Z = this.m = this.o = j;
  this.K = this.g = this.M = 0;
  this.P = 3;
  this.l = 0;
  this.I = h;
  this.R = this.U = this.V = this.t = this.j = this.c = this.da = this.S = this.H = this.G = this.ga = this.ea = this.s = this.J = j;
  this.fa = h;
  this.ha = j;
  this.Q = 0;
  this.u[S] = 24;
  this.u[T] = 24;
  W(this, U, 0)
}
function da(a, b) {
  a.I = b & 1 ? h : j;
  a.J = b & 2 ? h : j;
  var c = a.s;
  a.s = b & 4 ? h : j;
  a.ea = b & 8 ? h : j;
  a.ga = b & 16 ? h : j;
  a.G = b & 32 ? h : j;
  a.H = b & 64 ? h : j;
  a.S = b & 128 ? h : j;
  a.da = b & 256 ? h : j;
  a.c = b & 512 ? h : j;
  a.j = b & 1024 ? h : j;
  a.t = b & 2048 ? h : j;
  a.V = b & 4096 ? h : j;
  a.U = b & 8192 ? h : j;
  a.R = b & 16384 ? h : j;
  a.fa = h;
  a.ha = b & 65536 ? h : j;
  a.Q = b >>> 28 & 15;
  a.S && (u("little endian not supported"), B());
  a.Q && (u("context id not supported"), B());
  a.R && (u("exception prefix not supported"), B());
  a.U && (u("delay slot exception not supported"), B());
  a.s && !c && ea(a)
}
function fa(a) {
  var b;
  b = 0 | (a.I ? 1 : 0);
  b |= a.J ? 2 : 0;
  b |= a.s ? 4 : 0;
  b |= a.ea ? 8 : 0;
  b |= a.ga ? 16 : 0;
  b |= a.G ? 32 : 0;
  b |= a.H ? 64 : 0;
  b |= a.S ? 128 : 0;
  b |= a.da ? 256 : 0;
  b |= a.c ? 512 : 0;
  b |= a.j ? 1024 : 0;
  b |= a.t ? 2048 : 0;
  b |= a.V ? 4096 : 0;
  b |= a.U ? 8192 : 0;
  b |= a.R ? 16384 : 0;
  b |= a.fa ? 32768 : 0;
  b |= a.ha ? 65536 : 0;
  return b |= a.Q << 28
}
function ea(a) {
  a.s && (a.P & a.l && a.l) && (a.Z = h)
}
function K() {
  var a = C;
  a.l |= 4;
  ea(a)
}
V.prototype.B = function(a) {
  this.l &= ~(1 << a)
};
function X(a, b, c) {
  var e = b & 2047;
  b = b >>> 11 & 31;
  switch(b) {
    case 1:
      a.L[e] = c;
      return;
    case 2:
      a.T[e] = c;
      return;
    case 3:
    ;
    case 4:
      return;
    case 9:
      switch(e) {
        case 0:
          a.P = c | 3;
          a.s && a.P & a.l && (u("Error in SetSPR: Direct triggering interrupt exception not supported? What the hell?"), B());
          break;
        case 2:
          a.l = c;
          break;
        default:
          u("Error in SetSPR: interrupt address not supported"), B()
      }
      return;
    case 10:
      switch(e) {
        case 0:
          a.g = c;
          3 != a.g >>> 30 && (u("Error in SetSPR: Timer mode other than continuous not supported"), B());
          (a.g & 16777215) == (a.K & 16777215) && (a.g &= 1073741823);
          break;
        default:
          u("Error in SetSPR: Tick timer address not supported"), B()
      }
      return
  }
  0 != b && (u("Error in SetSPR: group " + b + " not found"), B());
  switch(e) {
    case 17:
      da(a, c);
      break;
    case 48:
      a.u[48] = c;
      break;
    case 32:
      a.u[32] = c;
      break;
    case 64:
      a.u[64] = c;
      break;
    default:
      u("Error in SetSPR: address not found"), B()
  }
}
function Y(a, b) {
  var c = b & 2047, e = b >>> 11 & 31;
  switch(e) {
    case 9:
      switch(c) {
        case 0:
          return a.P;
        case 2:
          return a.l;
        default:
          u("Error in GetSPR: PIC address unknown"), B()
      }
      break;
    case 10:
      switch(c) {
        case 0:
          return a.g;
        case 1:
          return a.K;
        default:
          u("Error in GetSPR: Tick timer address unknown"), B()
      }
  }
  0 != e && (u("Error in GetSPR: group unknown"), B());
  switch(b) {
    case 17:
      return fa(a);
    case 1:
      return 1561;
    case S:
    ;
    case T:
    ;
    case 48:
    ;
    case 32:
    ;
    case 64:
      return a.u[b];
    case 6:
      return 72;
    case 5:
      return 72;
    case 0:
      return 301989889;
    default:
      u("Error in GetSPR: address unknown"), B()
  }
}
function W(a, b, c) {
  var e = b | (a.R ? 4026531840 : 0);
  X(a, 48, c);
  X(a, 64, fa(a));
  a.V = j;
  a.I = h;
  a.s = j;
  a.J = j;
  a.G = j;
  a.M = 0;
  a.k = e;
  switch(b) {
    case U:
      break;
    case 2560:
    ;
    case 1024:
      X(a, 32, c - (a.m ? 4 : 0));
      break;
    case 2304:
    ;
    case 768:
    ;
    case 512:
      X(a, 32, a.r - (a.m ? 4 : 0));
      break;
    case 1280:
    ;
    case 2048:
      X(a, 32, a.r - (a.m ? 4 : 0));
      a.r = a.k;
      a.k = a.r + 4;
      break;
    case 3072:
      X(a, 32, a.r + 4 - (a.m ? 4 : 0));
      break;
    default:
      u("Error in Exception: exception type not supported"), B()
  }
  a.H = j
}
function ga(a) {
  var b = C;
  if(1472 != P.d[576]) {
    return W(C, 2304, a), j
  }
  var c, e, f, d;
  c = a;
  e = P.d[1222697];
  f = (c >>> 24 << 2) + e;
  d = 1073741824 + f & 4294967295;
  e = P.d[d >>> 2];
  if(0 == e) {
    return W(b, 768, a), j
  }
  d = P.d[d >>> 2];
  d &= 4294959104;
  f = c >>> 13;
  e = (f & 2047) << 2;
  e += d;
  c = P.d[e >>> 2];
  if(0 == (c & 1)) {
    return W(b, 768, a), j
  }
  f &= 63;
  b.L[640 | f] = c & 4294960122;
  d = a & 4294959104;
  d |= 1;
  b.L[512 | f] = d;
  return h
}
function ha(a, b) {
  if(1474 != P.d[640]) {
    return W(C, 2560, b), j
  }
  var c = 0, e = 0, f = 0, d = 0, c = b, e = P.d[1222697], f = (c >>> 24 << 2) + e, d = 1073741824 + f & 4294967295, e = P.d[d >>> 2];
  if(0 == e) {
    return W(a, 768, b), j
  }
  d = P.d[d >>> 2];
  d &= 4294959104;
  f = c >>> 13;
  e = (f & 2047) << 2;
  e += d;
  c = P.d[e >>> 2];
  if(0 == (c & 1)) {
    return W(a, 1024, b), j
  }
  d = c & 4294959162;
  0 != (c & 1984) && (f &= 63, d |= 192);
  a.T[640 | f] = d;
  d = b & 4294959104;
  d |= 1;
  a.T[512 | f] = d;
  return h
}
function Z(a, b, c) {
  if(!a.G) {
    return b >>> 0
  }
  var e = b >>> 13 & 63, f = a.L[512 | e];
  if((0 == (f & 1) || (f & 4294443008) != (b & 4294443008)) && !ga(b)) {
    return 4294967295
  }
  e = a.L[640 | e];
  if(a.I) {
    if(!c && !(e & 256) || c && !(e & 512)) {
      return W(a, 768, b), 4294967295
    }
  }else {
    if(!c && !(e & 64) || c && !(e & 128)) {
      return W(a, 768, b), 4294967295
    }
  }
  return(e & 4294959104 | b & 8191) >>> 0
}
function ia() {
  var a = C, b = 65536, c = 0, e = 0, f = 0, d = 0, e = 0, g = a.A, E = P.d, F = a.T, p = d = c = d = 0;
  do {
    a.r = a.k;
    a.o ? (a.k = a.w, a.o = j, a.m = h) : (a.k += 4, a.m = j);
    0 == (b & 7) && (0 != a.g >>> 30 && (a.K += 16, (a.K & 268435440) == (a.g & 268435440) && (3 != a.g >>> 30 && (u("Error: Timer mode other than continuous not supported"), B()), a.g & 536870912 && (a.g |= 268435456))), a.J && a.g & 268435456 ? (W(a, 1280, a.u[48]), a.m = j) : a.Z && (a.Z = j, a.l && a.s && (W(a, 2048, a.u[48]), a.m = j)));
    if((p ^ a.r) & 4294959104) {
      if(p = a.r, a.H) {
        d = p >>> 13 & 63;
        c = F[512 | d];
        if(0 == (c & 1) || (c & 4294443008) != (p & 4294443008)) {
          if(ha(a, p)) {
            c = F[512 | d]
          }else {
            a.m = j;
            a.o = j;
            continue
          }
        }
        d = F[640 | d];
        a.M = (d ^ c) & 4294959104;
        c = E[(a.M ^ p) >>> 2]
      }else {
        c = E[p >>> 2], a.M = 0
      }
    }else {
      p = a.r, c = E[(a.M ^ p) >>> 2]
    }
    switch(c >>> 26) {
      case 0:
        a.w = p + ((c & 67108863) << 6 >> 4);
        a.o = h;
        break;
      case 1:
        a.w = p + ((c & 67108863) << 6 >> 4);
        g[9] = a.k + 4;
        a.o = h;
        break;
      case 3:
        if(a.c) {
          break
        }
        a.w = p + ((c & 67108863) << 6 >> 4);
        a.o = h;
        break;
      case 4:
        if(!a.c) {
          break
        }
        a.w = p + ((c & 67108863) << 6 >> 4);
        a.o = h;
        break;
      case 5:
        break;
      case 6:
        f = c >>> 21 & 31;
        c & 65536 ? (u("Error: macrc not supported\n"), B()) : g[f] = (c & 65535) << 16;
        break;
      case 8:
        W(C, 3072, a.u[48]);
        break;
      case 9:
        a.k = Y(a, 32);
        da(a, Y(a, 64));
        break;
      case 17:
        a.w = g[c >>> 11 & 31];
        a.o = h;
        break;
      case 18:
        a.w = g[c >>> 11 & 31];
        g[9] = a.k + 4;
        a.o = h;
        break;
      case 17:
        a.w = g[c >>> 11 & 31];
        a.o = h;
        break;
      case 33:
        d = g[c >>> 16 & 31] + ((c & 65535) << 16 >> 16);
        0 != (d & 3) && (u("Error: no unaligned access allowed"), B());
        e = Z(a, d, j);
        if(4294967295 == e) {
          break
        }
        g[c >>> 21 & 31] = ca(e);
        break;
      case 35:
        d = g[c >>> 16 & 31] + ((c & 65535) << 16 >> 16);
        e = Z(a, d, j);
        if(4294967295 == e) {
          break
        }
        g[c >>> 21 & 31] = Q(e);
        break;
      case 36:
        d = g[c >>> 16 & 31] + ((c & 65535) << 16 >> 16);
        e = Z(a, d, j);
        if(4294967295 == e) {
          break
        }
        f = c >>> 21 & 31;
        g[f] = Q(e) << 24 >> 24;
        break;
      case 37:
        d = g[c >>> 16 & 31] + ((c & 65535) << 16 >> 16);
        e = Z(a, d, j);
        if(4294967295 == e) {
          break
        }
        g[c >>> 21 & 31] = R(e);
        break;
      case 38:
        d = g[c >>> 16 & 31] + ((c & 65535) << 16 >> 16);
        e = Z(a, d, j);
        if(4294967295 == e) {
          break
        }
        f = c >>> 21 & 31;
        g[f] = R(e) << 16 >> 16;
        break;
      case 39:
        e = (c & 65535) << 16 >> 16;
        d = g[c >>> 16 & 31];
        f = c >>> 21 & 31;
        g[f] = d + e;
        a.j = g[f] < d;
        a.t = (d ^ e ^ -1) & (d ^ g[f]) & 2147483648;
        break;
      case 41:
        g[c >>> 21 & 31] = g[c >>> 16 & 31] & c & 65535;
        break;
      case 42:
        g[c >>> 21 & 31] = g[c >>> 16 & 31] | c & 65535;
        break;
      case 43:
        d = g[c >>> 16 & 31];
        g[c >>> 21 & 31] = d ^ (c & 65535) << 16 >> 16;
        break;
      case 45:
        g[c >>> 21 & 31] = Y(a, g[c >>> 16 & 31] | c & 65535);
        break;
      case 46:
        switch(c >>> 6 & 3) {
          case 0:
            g[c >>> 21 & 31] = g[c >>> 16 & 31] << (c & 31);
            break;
          case 1:
            g[c >>> 21 & 31] = g[c >>> 16 & 31] >>> (c & 31);
            break;
          case 2:
            g[c >>> 21 & 31] = g[c >>> 16 & 31] >> 0 >> (c & 31);
            break;
          default:
            u("Error: opcode 2E function not implemented"), B()
        }
        break;
      case 47:
        e = (c & 65535) << 16 >> 16;
        switch(c >>> 21 & 31) {
          case 0:
            a.c = g[c >>> 16 & 31] == e >>> 0 ? h : j;
            break;
          case 1:
            a.c = g[c >>> 16 & 31] != e >>> 0 ? h : j;
            break;
          case 2:
            a.c = g[c >>> 16 & 31] > e >>> 0 ? h : j;
            break;
          case 3:
            a.c = g[c >>> 16 & 31] >= e >>> 0 ? h : j;
            break;
          case 4:
            a.c = g[c >>> 16 & 31] < e >>> 0 ? h : j;
            break;
          case 5:
            a.c = g[c >>> 16 & 31] <= e >>> 0 ? h : j;
            break;
          case 10:
            a.c = g[c >>> 16 & 31] >> 0 > e >> 0 ? h : j;
            break;
          case 11:
            a.c = g[c >>> 16 & 31] >> 0 >= e >> 0 ? h : j;
            break;
          case 12:
            a.c = g[c >>> 16 & 31] >> 0 < e >> 0 ? h : j;
            break;
          case 13:
            a.c = g[c >>> 16 & 31] >> 0 <= e >> 0 ? h : j;
            break;
          default:
            u("Error: sf...i not supported yet"), B()
        }
        break;
      case 48:
        e = c & 2047 | c >>> 10 & 63488;
        X(a, g[c >>> 16 & 31] | e, g[c >>> 11 & 31]);
        break;
      case 53:
        e = (c >>> 10 & 63488 | c & 2047) << 16 >> 16;
        d = g[c >>> 16 & 31] + e;
        d & 3 && (u("Error: not aligned memory access"), B());
        e = Z(a, d, h);
        if(4294967295 == e) {
          break
        }
        a: {
          d = e;
          c = g[c >>> 11 & 31];
          f = P;
          if(d > f.F - 4) {
            if(2449473536 <= d && 2449477628 >= d) {
              2449473536 == d && (N = c);
              break a
            }
            if(2432696320 <= d && 2433748988 >= d) {
              2432696340 == d && (d = A, d.W = new Uint8ClampedArray(P.$, (c & 255) << 24 | (c & 65280) << 8 | c >>> 8 & 65280 | c >>> 24 & 255, d.Y.data.length), z(d));
              break a
            }
            u("Error in WriteMemory32: RAM region " + w(d) + " is not accessible");
            B()
          }
          f.d[d >>> 2] = c
        }
        break;
      case 54:
        e = (c >>> 10 & 63488 | c & 2047) << 16 >> 16;
        d = g[c >>> 16 & 31] + e;
        e = Z(a, d, h);
        if(4294967295 == e) {
          break
        }
        a: {
          d = e;
          c = g[c >>> 11 & 31];
          f = P;
          if(d > f.F - 1) {
            if(2415919104 <= d && 2415919110 >= d) {
              b: {
                d -= 2415919104;
                f = I;
                c &= 255;
                if(f.O & 128) {
                  switch(d) {
                    case 0:
                      f.ba = c;
                      break b;
                    case 1:
                      f.aa = c;
                      break b
                  }
                }
                switch(d) {
                  case 0:
                    f.i &= ~D;
                    v(c);
                    f.i |= D;
                    L(f);
                    break;
                  case 1:
                    f.C = c & 15;
                    M(f);
                    break;
                  case 2:
                    f.ca = c;
                    f.ca & 2 && (f.D = []);
                    break;
                  case 3:
                    f.O = c;
                    break;
                  case 4:
                    f.na = c;
                    break;
                  default:
                    u("Error in WriteRegister: not supported"), B()
                }
              }
              break a
            }
            u("Error in WriteMemory8: RAM region is not accessible");
            B()
          }
          switch(d & 3) {
            case 0:
              f.e[d & -4 | 3] = c & 255;
              break;
            case 1:
              f.e[d & -4 | 2] = c & 255;
              break;
            case 2:
              f.e[d & -4 | 1] = c & 255;
              break;
            case 3:
              f.e[d & -4 | 0] = c & 255
          }
        }
        break;
      case 55:
        e = (c >>> 10 & 63488 | c & 2047) << 16 >> 16;
        d = g[c >>> 16 & 31] + e;
        e = Z(a, d, h);
        if(4294967295 == e) {
          break
        }
        d = e;
        c = g[c >>> 11 & 31];
        f = P;
        d > f.F - 2 && (u("Error in WriteMemory16: RAM region is not accessible"), B());
        d & 2 ? (f.e[d & -4 | 1] = c >>> 8 & 255, f.e[d & -4] = c & 255) : (f.e[d & -4 | 3] = c >>> 8 & 255, f.e[d & -4 | 2] = c & 255);
        break;
      case 56:
        d = C.A[c >>> 16 & 31];
        e = C.A[c >>> 11 & 31];
        f = c >>> 21 & 31;
        switch(c >>> 0 & 975) {
          case 0:
            if(0 != (c & 768)) {
              break
            }
            g[f] = d + e;
            a.j = g[f] < d;
            a.t = (d ^ e ^ -1) & (d ^ g[f]) & 2147483648;
            break;
          case 2:
            if(0 != (c & 768)) {
              break
            }
            g[f] = d - e;
            a.j = e > d;
            a.t = (d ^ e) & (d ^ g[f]) & 2147483648;
            break;
          case 3:
            if(0 != (c & 768)) {
              break
            }
            g[f] = d & e;
            break;
          case 4:
            if(0 != (c & 768)) {
              break
            }
            g[f] = d | e;
            break;
          case 5:
            if(0 != (c & 768)) {
              break
            }
            g[f] = d ^ e;
            break;
          case 8:
            g[f] = d << (e & 31);
            break;
          case 72:
            g[f] = d >>> (e & 31);
            break;
          case 15:
            for(c = g[f] = 0;32 > c;c++) {
              if(d & 1 << c) {
                g[f] = c + 1;
                break
              }
            }
            break;
          case 136:
            g[f] = d >> (e & 31);
            break;
          case 271:
            g[f] = 0;
            for(c = 31;0 <= c;c--) {
              if(d & 1 << c) {
                g[f] = c + 1;
                break
              }
            }
            break;
          case 774:
            g[f] = (d >> 0 >> 0) * (e >> 0);
            g[f] = g[f] & 4294901760 | (d & 65535) * (e & 65535) & 65535;
            c = Number(d >> 0) * Number(e >> 0);
            a.t = -2147483648 > c || 2147483647 < c;
            a.j = 4294967295 < (d >>> 0) * (e >>> 0);
            break;
          case 778:
            a.j = 0 == e;
            a.t = 0;
            a.j || (g[f] = d / e);
            break;
          case 777:
            a.j = 0 == e;
            a.t = 0;
            a.j || (g[f] = (d >> 0) / (e >> 0));
            break;
          default:
            u("Error: op38 opcode not supported yet"), B()
        }
        break;
      case 57:
        switch(c >>> 21 & 31) {
          case 0:
            a.c = g[c >>> 16 & 31] == g[c >>> 11 & 31] ? h : j;
            break;
          case 1:
            a.c = g[c >>> 16 & 31] != g[c >>> 11 & 31] ? h : j;
            break;
          case 2:
            a.c = g[c >>> 16 & 31] > g[c >>> 11 & 31] ? h : j;
            break;
          case 3:
            a.c = g[c >>> 16 & 31] >= g[c >>> 11 & 31] ? h : j;
            break;
          case 4:
            a.c = g[c >>> 16 & 31] < g[c >>> 11 & 31] ? h : j;
            break;
          case 5:
            a.c = g[c >>> 16 & 31] <= g[c >>> 11 & 31] ? h : j;
            break;
          case 10:
            a.c = g[c >>> 16 & 31] >> 0 > g[c >>> 11 & 31] >> 0 ? h : j;
            break;
          case 11:
            a.c = g[c >>> 16 & 31] >> 0 >= g[c >>> 11 & 31] >> 0 ? h : j;
            break;
          case 12:
            a.c = g[c >>> 16 & 31] >> 0 < g[c >>> 11 & 31] >> 0 ? h : j;
            break;
          case 13:
            a.c = g[c >>> 16 & 31] >> 0 <= g[c >>> 11 & 31] >> 0 ? h : j;
            break;
          default:
            u("Error: sf.... function supported yet"), B()
        }
        break;
      default:
        u("Error: Instruction with opcode " + w(c >>> 26) + " not supported"), B()
    }
  }while(b--);
  window.setTimeout(ia, 0)
}
var n = new function() {
  this.q = 25;
  this.p = 80;
  this.pa = document.getElementById("Terminal");
  this.ja = Array(this.q);
  this.X = j;
  this.qa = "";
  this.z = this.cursor = 0;
  this.n = "";
  this.a = this.b = 0;
  this.f = 7;
  this.screen = Array(this.q);
  this.color = Array(this.q);
  for(var a = 0;a < this.q;a++) {
    this.screen[a] = Array(this.p);
    this.color[a] = Array(this.p);
    for(var b = 0;b < this.p;b++) {
      this.screen[a][b] = 0, this.color[a][b] = this.f
    }
  }
  for(a = 0;25 > a;a++) {
    var b = this.pa.insertRow(0), c = document.createElement("td");
    this.ja[a] = c;
    b.appendChild(c)
  }
  r(this);
  l(this)
};
u("Terminal initialized");
new x;
u("Terminal input initialized");
var A = new function() {
  var a = document.getElementById("canvas1");
  this.ia = a.getContext("2d");
  this.width = a.width;
  this.height = a.height;
  this.Y = this.ia.createImageData(this.width, this.height)
};
u("Framebuffer initialized");
var P = new function() {
  this.F = 33554432;
  this.$ = new ArrayBuffer(33554432);
  this.d = new Uint32Array(this.$);
  this.e = new Uint8Array(this.$)
};
u("RAM initialized");
var I = new H;
u("UART initialized");
var C = new V;
u("CPU initialized");
u("Loading Image");
for(var i = 0;53 > i;i++) {
  v("Loading Image from Web Server (5 MB). Please wait ...".charCodeAt(i))
}
var $ = new XMLHttpRequest;
$.open("GET", "bin/vmlinux.bin", h);
$.responseType = "arraybuffer";
$.onreadystatechange = function() {
  if(4 == $.readyState) {
    if(200 != $.status && 0 != $.status) {
      u("Error: Could not load file bin/vmlinux.bin")
    }else {
      var a = $.response;
      if(a) {
        a = new Uint8Array(a);
        u("Image loaded: " + a.length + " bytes");
        for(var b = 0;b < a.length;b++) {
          P.e[b] = a[b]
        }
        for(b = 0;b < a.length >>> 2;b++) {
          P.d[b] = (P.d[b] & 255) << 24 | (P.d[b] & 65280) << 8 | P.d[b] >>> 8 & 65280 | P.d[b] >>> 24 & 255
        }
        u("Starting emulation");
        ia()
      }
    }
  }
};
$.send(null);
