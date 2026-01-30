/* DOMESTIC COMPONENTS - REALISTIC SWITCHES & IRISH STANDARDS */

// FIX APPLIED: Added 'tools' as a parameter here
const drawRealisticRocker = (ctx, x, y, w, h, state, tools) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = "rgba(0,0,0,0.15)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
    ctx.fillStyle = "#fdfdfd"; ctx.beginPath(); ctx.roundRect(0, 0, w, h, 4); ctx.fill();
    ctx.shadowColor = "transparent";
    const rx = w * 0.2; const rw = w * 0.6; const ry = h * 0.2; const rh = h * 0.6;
    ctx.beginPath(); ctx.roundRect(rx, ry, rw, rh, 2);
    if (state.on) {
        const grd = ctx.createLinearGradient(rx, ry, rx, ry + rh);
        grd.addColorStop(0, "#f1f5f9"); grd.addColorStop(1, "#e2e8f0"); 
        ctx.fillStyle = grd; ctx.fill(); ctx.fillStyle = "rgba(0,0,0,0.1)"; ctx.fillRect(rx, ry, rw, 3);
    } else {
        const grd = ctx.createLinearGradient(rx, ry, rx, ry + rh);
        grd.addColorStop(0, "#e2e8f0"); grd.addColorStop(1, "#f1f5f9"); 
        ctx.fillStyle = grd; ctx.fill(); ctx.fillStyle = "rgba(0,0,0,0.1)"; ctx.fillRect(rx, ry + rh - 3, rw, 3);
    }
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 0.5; ctx.stroke();
    
    // REMOVED: Mounting screws (tools.screw) removed as requested
    
    ctx.restore();
};

// 1. DISTRIBUTION BOARD 
Engine.register({
    type: 'db_board', label: 'DB Board', category: 'Domestic', size: { w: 550, h: 500 }, terminals: [], 
    render: (ctx, state, tools) => {
        const grd = ctx.createLinearGradient(0, 0, 550, 500); grd.addColorStop(0, "#f1f5f9"); grd.addColorStop(1, "#cbd5e1");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.roundRect(0, 0, 550, 500, 12); ctx.fill(); ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 4; ctx.stroke();
        const drawRail = (y) => {
            const railGrd = ctx.createLinearGradient(0, y, 0, y+30); railGrd.addColorStop(0, "#64748b"); railGrd.addColorStop(1, "#64748b");
            ctx.fillStyle = railGrd; ctx.fillRect(20, y, 510, 35);
            ctx.fillStyle = "#000"; for(let i=40; i<500; i+=50) { ctx.beginPath(); ctx.arc(i, y+17, 2, 0, Math.PI*2); ctx.fill(); }
        };
        drawRail(145); drawRail(345); tools.text(ctx, 'HAGER DISTRIBUTION BOARD', 275, 480, '#64748b', 18, "bold");
    }
});

// 2. SERVICE HEAD
Engine.register({
    type: 'service_head', label: 'Mains', role: 'source', size: { w: 90, h: 110 },
    terminals: [ {id:'L', x:25, y:90}, {id:'N', x:65, y:90}, {id:'E', x:45, y:90} ], getInternalPaths: () => [['N', 'E']],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 90, 110, "#1f2937"); ctx.fillStyle = "#ef4444"; ctx.fillRect(15, 15, 60, 30);
        tools.text(ctx, '230V', 45, 38, '#fff', 12); tools.text(ctx, '63A', 45, 65, '#94a3b8', 12);
    }
});

// 3. MAIN FUSE (Bottom Fed)
Engine.register({
    type: 'main_fuse', label: 'Main Fuse', role: 'switch', hasSwitch: true, size: { w: 100, h: 140 },
    terminals: [ {id:'Lin', x:25, y:120}, {id:'Nin', x:85, y:120}, {id:'Lout', x:25, y:20}, {id:'Nout', x:85, y:20} ],
    getInternalPaths: (state) => state.on ? [['Lin', 'Lout'], ['Nin', 'Nout']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 100, 140, "#fff"); tools.plasticRect(ctx, 15, 40, 70, 60, "#f1f5f9", false);
        tools.toggle(ctx, 35, 50, 30, 40, state.on, "#000"); tools.text(ctx, 'MAIN SW', 50, 15, '#334155', 10);
    }
});

// 4. RCD (Bottom Fed)
Engine.register({
    type: 'rcd', label: 'RCD', role: 'switch', hasSwitch: true, size: { w: 110, h: 130 },
    terminals: [ {id:'Lin', x:25, y:110}, {id:'Nin', x:85, y:110}, {id:'Lout', x:25, y:20}, {id:'Nout', x:85, y:20} ],
    getInternalPaths: (state) => state.on ? [['Lin', 'Lout'], ['Nin', 'Nout']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 110, 130, "#f8fafc"); ctx.fillStyle = "#e2e8f0"; ctx.fillRect(10, 35, 90, 60);
        tools.toggle(ctx, 45, 40, 20, 35, state.on, "#000"); tools.text(ctx, 'RCD', 25, 50, '#64748b', 10);
    }
});

// 5. MCB B20 (Bottom Fed)
Engine.register({
    type: 'mcb_b20', label: 'B20', role: 'switch', hasSwitch: true, size: { w: 45, h: 130 },
    terminals: [ {id:'Lin', x:22.5, y:115}, {id:'Lout', x:22.5, y:15} ], getInternalPaths: (state) => state.on ? [['Lin', 'Lout']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 45, 130, "#fff"); tools.toggle(ctx, 12.5, 45, 20, 30, state.on, "#334155");
        tools.text(ctx, 'B20', 22.5, 95, '#000', 11, "bold");
    }
});

// 6. RCBO Slim
Engine.register({
    type: 'rcbo_slim', label: 'RCBO', role: 'switch', hasSwitch: true, size: { w: 50, h: 130 },
    terminals: [ {id:'Lin', x:12, y:115}, {id:'Nin', x:38, y:115}, {id:'Lout', x:12, y:15}, {id:'Nout', x:38, y:15} ],
    getInternalPaths: (state) => state.on ? [['Lin', 'Lout'], ['Nin', 'Nout']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 50, 130, "#fff"); tools.toggle(ctx, 15, 45, 20, 30, state.on, "#000");
        tools.text(ctx, 'RCBO', 25, 30, '#64748b', 8);
    }
});

// 7. SPD
Engine.register({
    type: 'spd_module', label: 'SPD', category: 'Domestic', size: { w: 60, h: 130 },
    terminals: [ {id:'L', x:20, y:115}, {id:'N', x:40, y:115}, {id:'E', x:30, y:15} ], getInternalPaths: () => [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 60, 130, "#fff"); ctx.fillStyle = "#3b82f6"; ctx.fillRect(0, 0, 60, 10);
        tools.plasticRect(ctx, 5, 25, 50, 80, "#f8fafc", false); tools.text(ctx, 'SPD', 30, 45, '#000', 12, "bold");
    }
});

// 8. MAIN SWITCH 100A (Bottom Fed)
Engine.register({
    type: 'main_switch_100a', label: 'Main Switch', category: 'Domestic', role: 'switch', hasSwitch: true, size: { w: 70, h: 130 },
    terminals: [ {id:'Lin', x:18, y:115}, {id:'Nin', x:52, y:115}, {id:'Lout', x:18, y:15}, {id:'Nout', x:52, y:15} ],
    getInternalPaths: (state) => state.on ? [['Lin', 'Lout'], ['Nin', 'Nout']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 70, 130, "#fff"); tools.toggle(ctx, 15, 40, 40, 40, state.on, "red");
        tools.text(ctx, 'MAIN SW', 35, 20, '#000', 10, "bold");
    }
});

// 9. MCB B6 (Bottom Fed)
Engine.register({
    type: 'mcb_b6', label: 'B6 MCB', category: 'Domestic', role: 'switch', hasSwitch: true, size: { w: 35, h: 130 },
    terminals: [ {id:'Lin', x:17.5, y:115}, {id:'Lout', x:17.5, y:15} ], getInternalPaths: (state) => state.on ? [['Lin', 'Lout']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 35, 130, "#fff"); tools.toggle(ctx, 8, 45, 19, 30, state.on, "#334155");
        tools.text(ctx, 'B6', 17.5, 90, '#000', 12, "bold");
    }
});
// 9b. MCB B10 (Bottom Fed) - NEW ADDITION
Engine.register({
    type: 'mcb_b10', label: 'B10 MCB', category: 'Domestic', role: 'switch', hasSwitch: true, size: { w: 35, h: 130 },
    terminals: [ {id:'Lin', x:17.5, y:115}, {id:'Lout', x:17.5, y:15} ], 
    getInternalPaths: (state) => state.on ? [['Lin', 'Lout']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 35, 130, "#fff"); 
        tools.toggle(ctx, 8, 45, 19, 30, state.on, "#334155");
        tools.text(ctx, 'B10', 17.5, 90, '#000', 12, "bold");
    }
});

// 10. MCB B32 (Bottom Fed)
Engine.register({
    type: 'mcb_b32', label: 'B32 MCB', category: 'Domestic', role: 'switch', hasSwitch: true, size: { w: 35, h: 130 },
    terminals: [ {id:'Lin', x:17.5, y:115}, {id:'Lout', x:17.5, y:15} ], getInternalPaths: (state) => state.on ? [['Lin', 'Lout']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 35, 130, "#fff"); tools.toggle(ctx, 8, 45, 19, 30, state.on, "#334155");
        tools.text(ctx, 'B32', 17.5, 90, '#000', 12, "bold");
    }
});
// ... (Place this after the existing MCBs/RCBOs)

// --- ADDITIONAL MCB SIZES ---

// MCB B16 (Immersion/Sockets)
Engine.register({
    type: 'mcb_b16', label: 'B16 MCB', category: 'Domestic', role: 'switch', hasSwitch: true, size: { w: 35, h: 130 },
    terminals: [ {id:'Lin', x:17.5, y:115}, {id:'Lout', x:17.5, y:15} ], 
    getInternalPaths: (state) => state.on ? [['Lin', 'Lout']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 35, 130, "#fff"); tools.toggle(ctx, 8, 45, 19, 30, state.on, "#334155");
        tools.text(ctx, 'B16', 17.5, 90, '#000', 12, "bold");
    }
});

// MCB B40 (Cooker/Shower)
Engine.register({
    type: 'mcb_b40', label: 'B40 MCB', category: 'Domestic', role: 'switch', hasSwitch: true, size: { w: 35, h: 130 },
    terminals: [ {id:'Lin', x:17.5, y:115}, {id:'Lout', x:17.5, y:15} ], 
    getInternalPaths: (state) => state.on ? [['Lin', 'Lout']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 35, 130, "#fff"); tools.toggle(ctx, 8, 45, 19, 30, state.on, "#334155");
        tools.text(ctx, 'B40', 17.5, 90, '#000', 12, "bold");
    }
});

// MCB B50 (Electric Shower)
Engine.register({
    type: 'mcb_b50', label: 'B50 MCB', category: 'Domestic', role: 'switch', hasSwitch: true, size: { w: 35, h: 130 },
    terminals: [ {id:'Lin', x:17.5, y:115}, {id:'Lout', x:17.5, y:15} ], 
    getInternalPaths: (state) => state.on ? [['Lin', 'Lout']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 35, 130, "#fff"); tools.toggle(ctx, 8, 45, 19, 30, state.on, "#334155");
        tools.text(ctx, 'B50', 17.5, 90, '#000', 12, "bold");
    }
});

// --- RCBO RANGE (Single Module Width) ---
// Helper to create RCBOs easily
const createRCBO = (amp) => ({
    type: `rcbo_b${amp}`, label: `RCBO B${amp}`, category: 'Domestic', role: 'switch', hasSwitch: true, size: { w: 50, h: 130 },
    terminals: [ {id:'Lin', x:12, y:115}, {id:'Nin', x:38, y:115}, {id:'Lout', x:12, y:15}, {id:'Nout', x:38, y:15} ],
    getInternalPaths: (state) => state.on ? [['Lin', 'Lout'], ['Nin', 'Nout']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 50, 130, "#fff"); tools.toggle(ctx, 15, 45, 20, 30, state.on, "#000");
        tools.text(ctx, `B${amp}`, 25, 30, '#000', 11, "bold");
        tools.text(ctx, 'RCBO', 25, 95, '#64748b', 8);
        ctx.fillStyle="#3b82f6"; ctx.font="8px Arial"; ctx.fillText("30mA", 25, 105);
    }
});

Engine.register(createRCBO(6));
Engine.register(createRCBO(10));
Engine.register(createRCBO(16));
Engine.register(createRCBO(20));
Engine.register(createRCBO(32));
Engine.register(createRCBO(40));
Engine.register(createRCBO(50));

// 11. CONTACTOR (Supply Bottom, Load Top)
Engine.register({
    type: 'contactor_2no', label: 'Contactor', category: 'Domestic', role: 'switch', hasSwitch: true, size: { w: 50, h: 130 },
    terminals: [ {id:'A1', x:10, y:15}, {id:'A2', x:40, y:15}, {id:'T1', x:10, y:40}, {id:'T2', x:40, y:40}, {id:'L1', x:10, y:110}, {id:'L2', x:40, y:110} ],
    getInternalPaths: (state) => state.on ? [['L1', 'T1'], ['L2', 'T2']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 50, 130, "#f1f5f9");
        ctx.strokeStyle = "#000"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(25, 25, 8, 0, Math.PI*2); ctx.stroke(); tools.text(ctx, 'COIL', 25, 25, '#000', 6);
        tools.plasticRect(ctx, 15, 60, 20, 20, "#000"); ctx.fillStyle = state.on ? "#22c55e" : "#ef4444"; ctx.fillRect(18, 63, 14, 14);
        tools.plasticRect(ctx, 15, 90, 20, 10, "#94a3b8"); tools.text(ctx, 'AUTO', 25, 105, '#64748b', 8);
    }
});

// --- SWITCHES & NEW COMPONENTS ---

// 12. SWITCH 1-WAY
Engine.register({
    type: 'sw_1way', label: 'Switch 1W', role: 'switch', hasSwitch: true, size: { w: 90, h: 90 },
    terminals: [ {id:'C', x:45, y:20}, {id:'L1', x:45, y:70}, {id:'E', x:75, y:20} ],
    getInternalPaths: (state) => state.on ? [['C', 'L1']] : [],
    render: (ctx, state, tools) => {
        drawRealisticRocker(ctx, 0, 0, 90, 90, state, tools);
        tools.text(ctx, 'C', 45, 12, '#94a3b8', 8); tools.text(ctx, 'L1', 45, 78, '#94a3b8', 8);
    }
});

// 13. SWITCH 2-WAY
Engine.register({
    type: 'sw_2way', label: 'Switch 2W', role: 'switch', hasSwitch: true, size: { w: 90, h: 90 },
    terminals: [ {id:'C', x:45, y:20}, {id:'L1', x:25, y:70}, {id:'L2', x:65, y:70}, {id:'E', x:75, y:20} ],
    getInternalPaths: (state) => state.on ? [['C', 'L2']] : [['C', 'L1']],
    render: (ctx, state, tools) => {
        drawRealisticRocker(ctx, 0, 0, 90, 90, state, tools);
        tools.text(ctx, 'C', 45, 12, '#94a3b8', 8); tools.text(ctx, 'L1', 25, 78, '#94a3b8', 8); tools.text(ctx, 'L2', 65, 78, '#94a3b8', 8);
    }
});

// 14. INTERMEDIATE SWITCH
Engine.register({
    type: 'sw_inter', label: 'Intermediate', role: 'switch', hasSwitch: true, size: { w: 90, h: 90 },
    // MOVED EARTH TERMINAL: 'E' moved from 45,45 (center) to 85,45 (right edge)
    terminals: [ {id:'L1in', x:20, y:20}, {id:'L2in', x:70, y:20}, {id:'L1out', x:20, y:70}, {id:'L2out', x:70, y:70}, {id:'E', x:85, y:45} ],
    getInternalPaths: (state) => state.on ? [['L1in', 'L2out'], ['L2in', 'L1out']] : [['L1in', 'L1out'], ['L2in', 'L2out']],
    render: (ctx, state, tools) => {
        drawRealisticRocker(ctx, 0, 0, 90, 90, state, tools);
        tools.text(ctx, 'INT', 45, 80, '#94a3b8', 10);
    }
});

// 15. SWITCHED FUSED SPUR (FCU)
Engine.register({
    type: 'fcu',
    label: 'Switched Spur',
    role: 'switch',
    hasSwitch: true,
    size: { w: 100, h: 100 },
    terminals: [ 
        {id:'Lin', x:20, y:20}, {id:'Nin', x:50, y:20}, {id:'Ein', x:80, y:20},
        {id:'Lout', x:20, y:80}, {id:'Nout', x:50, y:80}, {id:'Eout', x:80, y:80}
    ],
    getInternalPaths: (state) => state.on ? [['Lin', 'Lout'], ['Nin', 'Nout'], ['Ein', 'Eout']] : [['Ein', 'Eout']],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 100, 100, "#fff");
        // Fuse Holder
        tools.plasticRect(ctx, 65, 35, 25, 40, "#f1f5f9");
        tools.text(ctx, 'FUSE', 77.5, 55, '#64748b', 8);
        
        // Rocker Switch (Left side)
        ctx.save(); ctx.translate(15, 30);
        const w = 35, h = 50;
        const rx = w * 0.1, rw = w * 0.8, ry = h * 0.1, rh = h * 0.8;
        ctx.beginPath(); ctx.roundRect(rx, ry, rw, rh, 2);
        if (state.on) {
            const grd = ctx.createLinearGradient(rx, ry, rx, ry + rh); grd.addColorStop(0, "#f1f5f9"); grd.addColorStop(1, "#e2e8f0");
            ctx.fillStyle = grd; ctx.fill(); ctx.fillStyle = "#ef4444"; ctx.fillRect(rx+8, ry+5, 10, 4); // Red indicator
        } else {
            const grd = ctx.createLinearGradient(rx, ry, rx, ry + rh); grd.addColorStop(0, "#e2e8f0"); grd.addColorStop(1, "#f1f5f9");
            ctx.fillStyle = grd; ctx.fill();
        }
        ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 0.5; ctx.stroke();
        ctx.restore();
        
        tools.text(ctx, 'SUPPLY', 50, 12, '#94a3b8', 8); tools.text(ctx, 'LOAD', 50, 92, '#94a3b8', 8);
    }
});

// 16. SOCKET
Engine.register({
    type: 'socket', label: 'Socket', role: 'load', size: { w: 100, h: 100 },
    terminals: [ {id:'L', x:25, y:80}, {id:'N', x:75, y:80}, {id:'E', x:50, y:20} ],
    getInternalPaths: () => [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 100, 100, "#fff");
        ctx.fillStyle = "#1f2937"; ctx.beginPath(); ctx.roundRect(42, 30, 16, 20, 2); ctx.fill();
        ctx.fillRect(20, 60, 20, 12); ctx.fillRect(60, 60, 20, 12);
        tools.toggle(ctx, 75, 10, 15, 20, state.lit, "#fff");
        if(state.lit) { ctx.fillStyle = "red"; ctx.fillRect(78, 12, 9, 4); }
    }
});

// 17. LAMP
Engine.register({
    type: 'lamp', label: 'Lamp', role: 'load', size: { w: 80, h: 100 },
    terminals: [ {id:'L', x:25, y:15}, {id:'N', x:55, y:15}, {id:'E', x:40, y:15} ], getInternalPaths: () => [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 10, 0, 60, 30, "#fff");
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(40, 30); ctx.lineTo(40, 60); ctx.stroke();
        ctx.fillStyle = "#fff"; ctx.fillRect(30, 60, 20, 15);
        const color = state.lit ? "#fef08a" : "#e2e8f0";
        ctx.fillStyle = color; ctx.shadowColor = state.lit ? "#facc15" : "transparent"; ctx.shadowBlur = state.lit ? 20 : 0;
        ctx.beginPath(); ctx.arc(40, 85, 15, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0; ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth=1; ctx.stroke();
    }
});

// 18. COOKER SWITCH
Engine.register({
    type: 'cooker_sw', label: 'Cooker Sw', role: 'switch', hasSwitch: true, size: { w: 100, h: 140 },
    terminals: [ {id:'Lin', x:20, y:20}, {id:'Nin', x:80, y:20}, {id:'Ein', x:50, y:20}, {id:'Lout', x:20, y:120}, {id:'Nout', x:80, y:120}, {id:'Eout', x:50, y:120} ],
    getInternalPaths: (state) => state.on ? [['Lin', 'Lout'], ['Nin', 'Nout'], ['Ein', 'Eout']] : [['Ein', 'Eout']],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 100, 140, "#fff");
        ctx.save(); ctx.translate(20, 50);
        const rockerColor = state.on ? "#dc2626" : "#ef4444";
        const grd = ctx.createLinearGradient(0, 0, 60, 0); grd.addColorStop(0, rockerColor); grd.addColorStop(0.5, "#fca5a5"); grd.addColorStop(1, rockerColor);
        ctx.fillStyle = grd; ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 5; ctx.beginPath(); ctx.roundRect(0, 0, 60, 60, 4); ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.1)"; if(state.on) ctx.fillRect(0, 0, 60, 30); else ctx.fillRect(0, 30, 60, 30);
        ctx.restore();
        ctx.fillStyle = state.on ? "#ef4444" : "#451a03"; if(state.on) { ctx.shadowColor = "red"; ctx.shadowBlur = 10; }
        ctx.fillRect(40, 30, 20, 10); ctx.shadowBlur = 0;
        tools.text(ctx, 'COOKER', 50, 130, '#94a3b8', 10);
    }
});

// 19. FAN
Engine.register({
    type: 'fan', label: 'Fan', role: 'load', size: { w: 100, h: 100 },
    terminals: [ {id:'L', x:30, y:80}, {id:'N', x:70, y:80}, {id:'SL', x:50, y:80} ], getInternalPaths: () => [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 100, 100, "#fff");
        ctx.fillStyle = "#f1f5f9"; ctx.beginPath(); ctx.arc(50, 40, 35, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1; ctx.stroke();
        ctx.save(); ctx.translate(50, 40); if(state.lit) ctx.rotate((Date.now() / 50) % (Math.PI * 2));
        ctx.fillStyle = "#94a3b8"; for(let i=0; i<5; i++) { ctx.rotate((Math.PI * 2) / 5); ctx.beginPath(); ctx.ellipse(0, -15, 8, 20, 0, 0, Math.PI*2); ctx.fill(); }
        ctx.restore();
    }
});

// 20. JUNCTION BOX
Engine.register({
    type: 'junction_box', label: 'Junction Box', role: 'passive', size: { w: 90, h: 90 },
    terminals: [ {id:'L1', x:25, y:25}, {id:'L2', x:45, y:25}, {id:'L3', x:65, y:25}, {id:'N1', x:25, y:45}, {id:'N2', x:45, y:45}, {id:'N3', x:65, y:45}, {id:'S1', x:25, y:65}, {id:'S2', x:45, y:65}, {id:'E', x:80, y:80} ],
    getInternalPaths: () => [['L1','L2'],['L2','L3'],['L1','L3'],['N1','N2'],['N2','N3'],['N1','N3'],['S1','S2']],
    render: (ctx, state, tools) => {
        ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 5;
        const grd = ctx.createRadialGradient(45, 45, 10, 45, 45, 45); grd.addColorStop(0, "#fff"); grd.addColorStop(1, "#f1f5f9");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(45, 45, 45, 0, Math.PI*2); ctx.fill(); ctx.restore();
        tools.text(ctx, 'JB', 45, 45, '#cbd5e1', 20, "bold");
    }
});

// 21. IMMERSION SWITCH
Engine.register({
    type: 'sw_sink_bath', label: 'Immersion Sw', role: 'switch', hasSwitch: true, size: { w: 110, h: 130 },
    terminals: [ {id:'C', x:55, y:30}, {id:'Sink', x:30, y:100}, {id:'Bath', x:80, y:100}, {id:'E', x:100, y:20} ],
    getInternalPaths: (state) => state.on ? [['C', 'Bath']] : [['C', 'Sink']],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 110, 130, "#fff"); tools.toggle(ctx, 40, 25, 30, 40, true, "#fff");
        tools.text(ctx, 'ISOLATOR', 55, 15, '#64748b', 9);
        ctx.save(); ctx.translate(20, 80); ctx.fillStyle = "#f1f5f9"; ctx.fillRect(0,0,70,30);
        ctx.fillStyle = "#fff"; if(state.on) ctx.fillRect(35,0,35,30); else ctx.fillRect(0,0,35,30); ctx.restore();
        tools.text(ctx, 'SINK', 35, 120, state.on ? '#94a3b8' : '#2563eb', 9); tools.text(ctx, 'BATH', 75, 120, state.on ? '#2563eb' : '#94a3b8', 9);
    }
});

// 22. DUAL IMMERSION HEATER
Engine.register({
    type: 'immersion_dual', label: 'Dual Immersion', role: 'load', size: { w: 140, h: 140 },
    terminals: [ {id:'N', x:30, y:50}, {id:'E', x:30, y:90}, {id:'Sink', x:110, y:50}, {id:'Bath', x:110, y:90} ],
    getInternalPaths: () => [],
    render: (ctx, state, tools) => {
        const grd = ctx.createRadialGradient(70, 70, 10, 70, 70, 60); grd.addColorStop(0, "#fcd34d"); grd.addColorStop(1, "#b45309");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(70, 70, 60, 0, Math.PI*2); ctx.fill();
        ctx.lineWidth=4; ctx.strokeStyle = "#78350f"; ctx.stroke();
        ctx.beginPath(); for(let i=0; i<6; i++) { const a = i * Math.PI/3; ctx.lineTo(70 + 30*Math.cos(a), 70 + 30*Math.sin(a)); }
        ctx.closePath(); ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth=2; ctx.stroke();
        tools.text(ctx, 'DUAL ELEMENT', 70, 70, 'rgba(0,0,0,0.5)', 10, "bold");
    }
});

// 23. BARS
Engine.register({ type: 'neutral_bar', label: 'Neutral Bar', role: 'passive', size: { w: 220, h: 40 }, terminals: Array.from({length:8}, (_,i)=>({id:`N${i}`, x:25+(i*22), y:25})), getInternalPaths: () => { const t=[]; for(let i=0;i<7;i++) t.push([`N${i}`,`N${i+1}`]); return t; }, render: (ctx, state, tools) => { const grd = ctx.createLinearGradient(0, 0, 0, 40); grd.addColorStop(0, "#e2e8f0"); grd.addColorStop(1, "#94a3b8"); tools.plasticRect(ctx, 0, 0, 220, 40, "#fff"); ctx.fillStyle = grd; ctx.fillRect(10, 10, 200, 20); }});
Engine.register({ type: 'earth_bar', label: 'Earth Bar', role: 'passive', size: { w: 300, h: 40 }, terminals: Array.from({length:12}, (_,i)=>({id:`E${i}`, x:25+(i*22), y:25})), getInternalPaths: () => { const t=[]; for(let i=0;i<11;i++) t.push([`E${i}`,`E${i+1}`]); return t; }, render: (ctx, state, tools) => { const grd = ctx.createLinearGradient(0, 0, 0, 40); grd.addColorStop(0, "#fcd34d"); grd.addColorStop(1, "#d97706"); tools.plasticRect(ctx, 0, 0, 300, 40, "#fff"); ctx.fillStyle = grd; ctx.fillRect(10, 10, 280, 20); }});

// 24. SMOKE ALARM
Engine.register({
    type: 'smoke_alarm',
    label: 'Smoke Alarm',
    role: 'load',
    size: { w: 110, h: 110 },
    terminals: [ {id:'L', x:30, y:55}, {id:'N', x:55, y:55}, {id:'E', x:80, y:55}, {id:'I', x:55, y:85} ],
    getInternalPaths: () => [],
    render: (ctx, state, tools) => {
        ctx.beginPath(); ctx.arc(55, 55, 50, 0, Math.PI*2); 
        const grd = ctx.createRadialGradient(55, 55, 40, 55, 55, 55); grd.addColorStop(0, "#fff"); grd.addColorStop(1, "#e2e8f0");
        ctx.fillStyle = grd; ctx.fill();
        ctx.shadowColor="rgba(0,0,0,0.1)"; ctx.shadowBlur=5; ctx.strokeStyle="#cbd5e1"; ctx.stroke();
        
        // Vent slots
        ctx.strokeStyle = "#94a3b8"; ctx.lineWidth=2;
        for(let i=0; i<8; i++) {
            const angle = i * (Math.PI/4);
            const x1 = 55 + Math.cos(angle)*30; const y1 = 55 + Math.sin(angle)*30;
            const x2 = 55 + Math.cos(angle)*45; const y2 = 55 + Math.sin(angle)*45;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }
        
        // Green LED
        const lit = state.lit ? "#22c55e" : "#86efac";
        ctx.fillStyle = lit; ctx.beginPath(); ctx.arc(55, 55, 4, 0, Math.PI*2); ctx.fill();
        tools.text(ctx, 'MAINS', 55, 40, '#94a3b8', 8);
        tools.text(ctx, 'LINK', 55, 95, '#ef4444', 8);
    }
});