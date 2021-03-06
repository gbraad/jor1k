// -------------------------------------------------
// ---------------------- IRQ ----------------------
// -------------------------------------------------
// Stefan Kristianssons ompic suitable for smp systems
// Just the ipi part

"use strict";

// Control register
// +---------+---------+----------+---------+
// | 31      | 30      | 29 .. 16 | 15 .. 0 |
// ----------+---------+----------+----------
// | IRQ ACK | IRQ GEN | DST CORE | DATA    |
// +---------+---------+----------+---------+

// Status register
// +----------+-------------+----------+---------+
// | 31       | 30          | 29 .. 16 | 15 .. 0 |
// -----------+-------------+----------+---------+
// | Reserved | IRQ Pending | SRC CORE | DATA    |
// +----------+-------------+----------+---------+

var OMPIC_IPI_CTRL_IRQ_ACK = (1 << 31);
var OMPIC_IPI_CTRL_IRQ_GEN = (1 << 30);
var OMPIC_IPI_STAT_IRQ_PENDING = (1 << 30);

function IRQDev(intdev) {
    this.intdev = intdev;
    this.regs = new Uint32Array(32*2); // maximum 32 cpus
    this.Reset();
}

IRQDev.prototype.Reset = function() {
    for(var i=0; i<32*2; i++) {
        this.regs[i] = 0x0;
    }
}

IRQDev.prototype.ReadReg32 = function (addr) {
    addr >>= 2;
    if (addr > 32*2) {
        DebugMessage("IRQDev: Unknown ReadReg32: " + hex8(addr));
        return 0x0;
    }
    /*
    var cpuid = addr >> 1;    
    if (addr&1) {
        DebugMessage("IRQDev: Read STAT of CPU " + cpuid);
    } else {
        DebugMessage("IRQDev: Read CTRL of CPU " + cpuid);
    }
    */
    return this.regs[addr];
}

IRQDev.prototype.WriteReg32 = function (addr, value) {
    addr >>= 2;
    if (addr > 32*2) {
        DebugMessage("IRQDev: unknown  WriteReg32: " + hex8(addr) + ": " + hex8(value));
        return;
    }

    var cpuid = addr >> 1;
    if (addr&1) {
        DebugMessage("Error in IRQDev: Write STAT of CPU " + cpuid +" : " + hex8(value));
    } else {
        this.regs[addr] = value;
        var irqno = value & 0xFFFF;
        var dstcpu = (value >> 16) & 0x3fff;
        var flags = (value >> 30) & 3;
        /*
        DebugMessage("IRQDev: Write CTRL of CPU " + cpuid + " : " +
            " dstcpu=" + dstcpu  +
            " irqno=" + irqno +
            " flags=" + flags
            );
        */

        if (flags & 1) { // irq gen
            if (dstcpu == cpuid) {
                DebugMessage("Warning in IRQDev: Try to raise its own IRQ");
            }
            if (this.regs[(dstcpu<<1)+1] & OMPIC_IPI_STAT_IRQ_PENDING) {
                DebugMessage("Warning in IRQDev: CPU " + cpuid + " raised irq on cpu " + dstcpu + " without previous acknowledge");
                var h = new Int32Array(this.intdev.heap);
                DebugMessage("The pc of cpu " + dstcpu + " is " + hex8(h[(dstcpu<<15) + 0x124 >> 2]));
                DebugMessage("The IEE flag of cpu " + dstcpu + " is " + ( h[(dstcpu<<15) + 0x120 >> 2] & (1<<2)) );
                DebugMessage("r9 of cpu " + dstcpu + " is " + hex8(h[(dstcpu<<15) + (0x9<<2) >> 2]));
            }
            this.regs[(dstcpu<<1)+1] = OMPIC_IPI_STAT_IRQ_PENDING | ((cpuid & 0x3fff) << 16) | irqno;
            this.intdev.RaiseSoftInterrupt(0x1, dstcpu);
        }
        if (flags & 2) { // irq ack
            this.regs[addr+1] &= ~OMPIC_IPI_STAT_IRQ_PENDING;
            this.intdev.ClearSoftInterrupt(0x1, cpuid);
        }

    }
}
