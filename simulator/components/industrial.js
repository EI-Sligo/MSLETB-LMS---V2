/* INDUSTRIAL COMPONENTS - IRISH STANDARDS */

// 1. 3-PHASE ISOLATOR (Rotary)
Engine.register({
    type: 'isolator_3ph', label: 'Isolator 3PH', category: 'Industrial', role: 'switch', hasSwitch: true, size: { w: 100, h: 140 },
    terminals: [ {id:'L1in', label:'L1', x:20, y:15}, {id:'L2in', label:'L2', x:50, y:15}, {id:'L3in', label:'L3', x:80, y:15}, {id:'L1out', label:'L1', x:20, y:125}, {id:'L2out', label:'L2', x:50, y:125}, {id:'L3out', label:'L3', x:80, y:125} ],
    getInternalPaths: (state) => state.on ? [['L1in', 'L1out'], ['L2in', 'L2out'], ['L3in', 'L3out']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 100, 140, "#f1f5f9");
        ctx.fillStyle = "#fef08a"; ctx.fillRect(20, 40, 60, 60); ctx.strokeStyle = "#000"; ctx.lineWidth = 1; ctx.strokeRect(20, 40, 60, 60);
        tools.text(ctx, 'MAIN SW', 50, 30, '#000', 10, "bold"); tools.text(ctx, '415V', 50, 115, '#ef4444', 12, "bold");
        ctx.save(); ctx.translate(50, 70); if(state.on) ctx.rotate(Math.PI / 2);
        ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 6; ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#b91c1c"; ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(-10, -35, 20, 70, 4); else ctx.rect(-10,-35,20,70); ctx.fill(); ctx.restore();
    }
});

// 2. 3-PHASE MOTOR
Engine.register({
    type: 'motor_3ph', label: 'Motor', category: 'Industrial', role: 'load', size: { w: 120, h: 120 },
    terminals: [ {id:'U', x:30, y:20}, {id:'V', x:60, y:20}, {id:'W', x:90, y:20}, {id:'E', x:105, y:20} ], getInternalPaths: () => [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 20, 0, 80, 30, "#475569");
        const grad = ctx.createLinearGradient(0, 30, 120, 30); grad.addColorStop(0, "#334155"); grad.addColorStop(0.3, "#94a3b8"); grad.addColorStop(1, "#334155");
        ctx.fillStyle = grad; ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(10, 30, 100, 90, 4); else ctx.rect(10,30,100,90); ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 2; for(let y=40; y<110; y+=10) { ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(110, y); ctx.stroke(); }
        ctx.fillStyle = "#cbd5e1"; ctx.beginPath(); ctx.arc(60, 75, 15, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle = "#475569"; ctx.stroke();
        if(state.lit) { ctx.save(); ctx.translate(60, 75); ctx.rotate((Date.now() / 20) % (Math.PI * 2)); ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(-2, -15, 4, 30); ctx.restore(); }
        tools.text(ctx, '3-PHASE', 60, 110, '#fff', 10);
    }
});

// 3. INDUSTRIAL SOCKET
Engine.register({
    type: 'commando_socket', label: '415V Socket', category: 'Industrial', role: 'load', size: { w: 100, h: 140 },
    terminals: [ {id:'L1', x:20, y:30}, {id:'L2', x:50, y:30}, {id:'L3', x:80, y:30}, {id:'N', x:35, y:120}, {id:'E', x:65, y:120} ], getInternalPaths: () => [],
    render: (ctx, state, tools) => {
        const grd = ctx.createLinearGradient(0, 0, 100, 140); grd.addColorStop(0, "#ef4444"); grd.addColorStop(1, "#b91c1c");
        ctx.save(); ctx.fillStyle = grd; ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(10, 10); ctx.lineTo(90, 10); ctx.lineTo(100, 40); ctx.lineTo(100, 130); ctx.lineTo(0, 130); ctx.lineTo(0, 40); ctx.closePath(); ctx.fill(); ctx.restore();
        tools.plasticRect(ctx, 15, 45, 70, 70, "#f3f4f6", false); ctx.fillStyle = "#374151"; ctx.fillRect(25, 40, 50, 8);
        tools.text(ctx, '415V', 50, 80, '#ef4444', 16, "bold");
    }
});

// 4. EMERGENCY STOP
Engine.register({
    type: 'estop', label: 'E-Stop', category: 'Industrial', role: 'switch', hasSwitch: true, size: { w: 90, h: 110 },
    terminals: [ {id:'L1in', label:'1', x:20, y:15}, {id:'L1out', label:'2', x:20, y:95}, {id:'L2in', label:'3', x:70, y:15}, {id:'L2out', label:'4', x:70, y:95} ],
    getInternalPaths: (state) => !state.on ? [['L1in', 'L1out'], ['L2in', 'L2out']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 90, 110, "#facc15"); ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(45, 55, 38, 0, Math.PI*2); ctx.fill();
        tools.text(ctx, 'EMERGENCY', 45, 25, '#facc15', 8, "bold");
        ctx.save(); ctx.translate(45, 55); const scale = state.on ? 0.9 : 1.0; ctx.scale(scale, scale);
        const rGrd = ctx.createRadialGradient(-10, -10, 5, 0, 0, 30); rGrd.addColorStop(0, "#ef4444"); rGrd.addColorStop(1, "#991b1b");
        ctx.fillStyle = rGrd; ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI*2); ctx.fill(); ctx.restore();
    }
});

// 5. HIGH BAY LIGHT
Engine.register({
    type: 'high_bay', label: 'High Bay', category: 'Industrial', role: 'load', size: { w: 120, h: 120 },
    terminals: [ {id:'L', x:30, y:20}, {id:'N', x:60, y:20}, {id:'E', x:90, y:20} ], getInternalPaths: () => [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 25, 0, 70, 40, "#1f2937"); ctx.save(); ctx.translate(60, 70);
        ctx.fillStyle = "#334155"; ctx.beginPath(); ctx.arc(0, 0, 55, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = "#475569"; ctx.lineWidth = 2; for(let i=0; i<12; i++) { ctx.rotate(Math.PI/6); ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(55, 0); ctx.stroke(); } ctx.restore();
        const litColor = state.lit ? "#fef08a" : "#cbd5e1"; ctx.fillStyle = litColor; ctx.beginPath(); ctx.arc(60, 70, 25, 0, Math.PI*2); ctx.fill();
    }
});

// 6. 3-PHASE SUPPLY
Engine.register({
    type: 'supply_3ph', label: '3-Ph Supply', category: 'Industrial', role: 'source', size: { w: 140, h: 120 },
    terminals: [ {id:'L1', x:25, y:100}, {id:'L2', x:55, y:100}, {id:'L3', x:85, y:100}, {id:'N', x:115, y:100}, {id:'E', x:70, y:30} ], getInternalPaths: () => [['N', 'E']],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 140, 120, "#374151"); [25, 55, 85].forEach(x => { ctx.fillStyle="#000"; ctx.fillRect(x-10, 40, 20, 50); });
        ctx.fillStyle="#1f2937"; ctx.fillRect(105, 40, 20, 50); tools.text(ctx, '400V IN', 70, 15, '#fff', 12, "bold");
    }
});

// 7. TPN DISTRIBUTION BOARD
Engine.register({
    type: 'db_3ph', label: 'TPN Board', category: 'Industrial', size: { w: 200, h: 300 },
    terminals: [
        {id:'L1_in', label:'L1', x:40, y:270}, {id:'L2_in', label:'L2', x:70, y:270}, {id:'L3_in', label:'L3', x:100, y:270}, {id:'N_in', label:'N', x:130, y:270}, {id:'E_in', label:'E', x:160, y:270},
        {id:'L1_out', label:'L1', x:40, y:90}, {id:'L2_out', label:'L2', x:70, y:90}, {id:'L3_out', label:'L3', x:100, y:90},
        {id:'L1_out2', label:'L1', x:40, y:140}, {id:'L2_out2', label:'L2', x:70, y:140}, {id:'L3_out2', label:'L3', x:100, y:140},
        {id:'N_bar', label:'N', x:160, y:90}, {id:'E_bar', label:'E', x:180, y:90}
    ],
    getInternalPaths: () => [ ['L1_in','L1_out'], ['L2_in','L2_out'], ['L3_in','L3_out'], ['L1_in','L1_out2'], ['L2_in','L2_out2'], ['L3_in','L3_out2'], ['N_in','N_bar'], ['E_in','E_bar'] ],
    render: (ctx, state, tools) => {
        const grd = ctx.createLinearGradient(0, 0, 200, 300); grd.addColorStop(0, "#9ca3af"); grd.addColorStop(1, "#d1d5db");
        ctx.fillStyle = grd; ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(0, 0, 200, 300, 4); else ctx.rect(0,0,200,300); ctx.fill();
        ctx.strokeStyle = "#4b5563"; ctx.lineWidth = 4; ctx.stroke(); ctx.fillStyle = "#000"; ctx.fillRect(180, 130, 10, 40);
        tools.text(ctx, 'TPN BOARD', 100, 30, '#374151', 12, "bold"); tools.text(ctx, 'SUPPLY IN', 100, 240, '#4b5563', 10);
    }
});

// 8. 3-PHASE MCB
Engine.register({
    type: 'mcb_3ph', label: '3-Ph MCB', category: 'Industrial', role: 'switch', hasSwitch: true, size: { w: 90, h: 130 },
    terminals: [ {id:'L1in', label:'1', x:15, y:115}, {id:'L2in', label:'3', x:45, y:115}, {id:'L3in', label:'5', x:75, y:115}, {id:'L1out', label:'2', x:15, y:15}, {id:'L2out', label:'4', x:45, y:15}, {id:'L3out', label:'6', x:75, y:15} ],
    getInternalPaths: (state) => state.on ? [['L1in','L1out'], ['L2in','L2out'], ['L3in','L3out']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 90, 130, "#fff"); tools.toggle(ctx, 10, 40, 70, 30, state.on, "#334155");
        tools.text(ctx, 'C32', 45, 90, '#000', 12, "bold"); tools.text(ctx, '3-POLE', 45, 105, '#94a3b8', 9);
    }
});

// 9. 3-PHASE CONTACTOR
Engine.register({
    type: 'contactor_3ph', label: 'Contactor', category: 'Industrial', role: 'switch', hasSwitch: true, size: { w: 100, h: 140 },
    terminals: [
        {id:'L1', label:'1/L1', x:25, y:15}, {id:'L2', label:'3/L2', x:50, y:15}, {id:'L3', label:'5/L3', x:75, y:15},
        {id:'T1', label:'2/T1', x:25, y:125}, {id:'T2', label:'4/T2', x:50, y:125}, {id:'T3', label:'6/T3', x:75, y:125},
        {id:'NO13', label:'13', x:88, y:40}, {id:'NO14', label:'14', x:88, y:100}, // Aux NO
        {id:'A1', label:'A1', x:10, y:40}, {id:'A2', label:'A2', x:10, y:100} // Coil
    ],
    getInternalPaths: (state) => state.on ? [['L1','T1'], ['L2','T2'], ['L3','T3'], ['NO13','NO14']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 100, 140, "#f8fafc");
        ctx.fillStyle = "#334155"; ctx.fillRect(20, 45, 60, 50); ctx.fillStyle = state.on ? "#22c55e" : "#64748b"; ctx.fillRect(40, 60, 20, 20);
        tools.text(ctx, 'CONTACTOR', 50, 30, '#000', 9, 'bold'); tools.text(ctx, '230V Coil', 50, 110, '#94a3b8', 8);
    }
});

// 10. PLC PSU
Engine.register({
    type: 'plc_psu', label: '24V PSU', category: 'Industrial', role: 'source', size: { w: 60, h: 130 },
    terminals: [ {id:'L', x:15, y:20}, {id:'N', x:45, y:20}, {id:'Pos', x:15, y:110}, {id:'Neg', x:45, y:110} ], getInternalPaths: () => [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 60, 130, "#fff"); for(let y=40; y<90; y+=6) { ctx.fillStyle="#e2e8f0"; ctx.fillRect(10, y, 40, 2); }
        tools.circle(ctx, 30, 100, 4, "#22c55e"); tools.text(ctx, '24V DC', 30, 60, '#334155', 10, "bold"); tools.text(ctx, '+', 15, 120, '#ef4444', 10); tools.text(ctx, '-', 45, 120, '#1d4ed8', 10);
    }
});

// 11-15. SWITCHES & LIGHTS
Engine.register({ type: 'btn_start', label: 'Start Btn', category: 'Industrial', role: 'switch', hasSwitch: true, size: { w: 60, h: 80 }, terminals: [ {id:'13', x:15, y:65}, {id:'14', x:45, y:65} ], getInternalPaths: (state) => state.on ? [['13', '14']] : [], render: (ctx, state, tools) => { tools.plasticRect(ctx, 0, 0, 60, 80, "#e5e7eb"); const c = state.on ? "#15803d" : "#22c55e"; tools.circle(ctx, 30, 30, 20, c); ctx.strokeStyle = "#9ca3af"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(30,30,20,0,Math.PI*2); ctx.stroke(); tools.text(ctx, 'START', 30, 70, '#064e3b', 8, "bold"); } });
Engine.register({ type: 'btn_stop', label: 'Stop Btn', category: 'Industrial', role: 'switch', hasSwitch: true, size: { w: 60, h: 80 }, terminals: [ {id:'11', x:15, y:65}, {id:'12', x:45, y:65} ], getInternalPaths: (state) => !state.on ? [['11', '12']] : [], render: (ctx, state, tools) => { tools.plasticRect(ctx, 0, 0, 60, 80, "#e5e7eb"); const c = state.on ? "#991b1b" : "#ef4444"; tools.circle(ctx, 30, 30, 20, c); tools.text(ctx, 'STOP', 30, 70, '#7f1d1d', 8, "bold"); } });
Engine.register({ type: 'pilot_green', label: 'Run Light', category: 'Industrial', role: 'load', size: { w: 60, h: 80 }, terminals: [ {id:'X1', x:15, y:65}, {id:'X2', x:45, y:65} ], getInternalPaths: () => [], render: (ctx, state, tools) => { tools.plasticRect(ctx, 0, 0, 60, 80, "#e5e7eb"); const c = state.lit ? "#22c55e" : "#14532d"; const glow = state.lit ? 15 : 0; ctx.shadowColor = "#22c55e"; ctx.shadowBlur = glow; tools.circle(ctx, 30, 30, 18, c); ctx.shadowBlur = 0; ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.beginPath(); ctx.arc(25, 25, 5, 0, Math.PI*2); ctx.fill(); tools.text(ctx, 'RUN', 30, 55, '#000', 8); } });
Engine.register({ type: 'pilot_red', label: 'Trip Light', category: 'Industrial', role: 'load', size: { w: 60, h: 80 }, terminals: [ {id:'X1', x:15, y:65}, {id:'X2', x:45, y:65} ], getInternalPaths: () => [], render: (ctx, state, tools) => { tools.plasticRect(ctx, 0, 0, 60, 80, "#e5e7eb"); const c = state.lit ? "#ef4444" : "#7f1d1d"; const glow = state.lit ? 15 : 0; ctx.shadowColor = "#ef4444"; ctx.shadowBlur = glow; tools.circle(ctx, 30, 30, 18, c); ctx.shadowBlur = 0; tools.text(ctx, 'TRIP', 30, 55, '#000', 8); } });
Engine.register({ type: 'sw_man_auto', label: 'Selector', category: 'Industrial', role: 'switch', hasSwitch: true, states: 3, size: { w: 80, h: 100 }, terminals: [ {id:'C', x:40, y:20}, {id:'1', x:20, y:80}, {id:'2', x:60, y:80} ], getInternalPaths: (state) => { const val = state.switchVal || 0; if(val === 0) return [['C', '1']]; if(val === 2) return [['C', '2']]; return []; }, render: (ctx, state, tools) => { tools.plasticRect(ctx, 0, 0, 80, 100, "#e5e7eb"); tools.text(ctx, 'HAND', 20, 20, '#000', 8); tools.text(ctx, 'OFF', 40, 10, '#000', 8); tools.text(ctx, 'AUTO', 60, 20, '#000', 8); ctx.save(); ctx.translate(40, 50); const val = state.switchVal || 0; let rot = 0; if(val === 0) rot = -Math.PI/4; if(val === 2) rot = Math.PI/4; ctx.rotate(rot); tools.plasticRect(ctx, -8, -20, 16, 40, "#000"); ctx.fillStyle = "#fff"; ctx.fillRect(-2, -15, 4, 15); ctx.restore(); } });

// 16. PLC MINI
Engine.register({
    type: 'plc_mini', label: 'PLC', category: 'Industrial', role: 'controller', size: { w: 380, h: 180 }, 
    terminals: [ {id:'L', x:20, y:15, label:'+24V', labelOffset:12}, {id:'N', x:50, y:15, label:'-24V', labelOffset:12}, {id:'I1', x:90, y:15, label:'I-01', labelOffset:12}, {id:'I2', x:115, y:15, label:'I-02', labelOffset:12}, {id:'I3', x:140, y:15, label:'I-03', labelOffset:12}, {id:'I4', x:165, y:15, label:'I-04', labelOffset:12}, {id:'I5', x:190, y:15, label:'I-05', labelOffset:12}, {id:'I6', x:215, y:15, label:'I-06', labelOffset:12}, {id:'I7', x:240, y:15, label:'I-07', labelOffset:12}, {id:'I8', x:265, y:15, label:'I-08', labelOffset:12}, {id:'I9', x:290, y:15, label:'I-09', labelOffset:12}, {id:'I10', x:315, y:15, label:'I-10', labelOffset:12}, {id:'Q1_in', x:30, y:165, label:'CM1', labelOffset:-12}, {id:'Q1_out', x:50, y:165, label:'O-01', labelOffset:-12}, {id:'Q2_in', x:90, y:165, label:'CM2', labelOffset:-12}, {id:'Q2_out', x:110, y:165, label:'O-02', labelOffset:-12}, {id:'Q3_in', x:150, y:165, label:'CM3', labelOffset:-12}, {id:'Q3_out', x:170, y:165, label:'O-03', labelOffset:-12}, {id:'Q4_in', x:210, y:165, label:'CM4', labelOffset:-12}, {id:'Q4_out', x:230, y:165, label:'O-04', labelOffset:-12} ],
    getInternalPaths: (state) => { const paths = []; if(state.outputs?.Q1) paths.push(['Q1_in', 'Q1_out']); if(state.outputs?.Q2) paths.push(['Q2_in', 'Q2_out']); if(state.outputs?.Q3) paths.push(['Q3_in', 'Q3_out']); if(state.outputs?.Q4) paths.push(['Q4_in', 'Q4_out']); return paths; },
    render: (ctx, state, tools) => { const w = 380, h = 180; tools.plasticRect(ctx, 0, 0, w, h, "#e5e7eb"); ctx.fillStyle = "#1f2937"; ctx.fillRect(0, 0, w, 35); ctx.fillRect(0, h-35, w, 35); ctx.fillStyle = "#00909e"; ctx.fillRect(10, 45, 40, 40); tools.text(ctx, 'AB', 30, 65, '#fff', 14, "bold"); tools.text(ctx, 'Micro820', 90, 70, '#6b7280', 10); const powered = Engine.isLive(state.id, 'L'); tools.circle(ctx, 365, 55, 4, powered ? '#22c55e' : '#9ca3af'); tools.circle(ctx, 365, 75, 4, powered ? '#22c55e' : '#9ca3af'); const ledBoxX = 60, ledBoxY = 90; ctx.fillStyle = "#374151"; ctx.fillRect(ledBoxX, ledBoxY, 260, 45); const drawStatus = (label, idx, on, isInput) => { const lx = ledBoxX + 15 + (idx * 25); const ly = ledBoxY + (isInput ? 15 : 32); ctx.fillStyle = "#9ca3af"; ctx.font = "9px monospace"; ctx.textAlign="center"; ctx.fillText(label, lx, ly - 8); ctx.fillStyle = on ? "#facc15" : "#4b5563"; ctx.beginPath(); ctx.arc(lx, ly, 3, 0, Math.PI*2); ctx.fill(); }; const ins = state.inputs || {}; const outs = state.outputs || {}; for(let i=0; i<10; i++) drawStatus(`0${i}`, i, ins[`I${i+1}`], true); for(let i=0; i<4; i++) drawStatus(`0${i}`, i, outs[`Q${i+1}`], false); }
});

// 17. INDUSTRIAL ENCLOSURE (Control Panel) - NEW
Engine.register({
    type: 'control_panel', label: 'Control Panel', category: 'Industrial', size: { w: 300, h: 400 }, terminals: [],
    render: (ctx, state, tools) => {
        const grd = ctx.createLinearGradient(0, 0, 300, 400); grd.addColorStop(0, "#e2e8f0"); grd.addColorStop(1, "#94a3b8");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.roundRect(0, 0, 300, 400, 4); ctx.fill();
        ctx.strokeStyle = "#475569"; ctx.lineWidth = 2; ctx.strokeRect(10, 10, 280, 380);
        ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(280, 200, 8, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = "#cbd5e1"; ctx.fillRect(278, 192, 4, 16);
        ctx.fillStyle = "rgba(0,0,0,0.05)"; ctx.fillRect(20, 50, 260, 40); ctx.fillRect(20, 150, 260, 40); ctx.fillRect(20, 250, 260, 40);
        tools.text(ctx, 'ENCLOSURE', 150, 380, '#64748b', 12, "bold");
    }
});