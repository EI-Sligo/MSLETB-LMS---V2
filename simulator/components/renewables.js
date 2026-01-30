/* RENEWABLE COMPONENTS - HYBRID SYSTEM & PRO LABELS */

// 1. PV PANEL (High Contrast Labels)
Engine.register({
    type: 'pv_panel',
    label: 'PV Panel',
    category: 'Renewables',
    role: 'source',
    size: { w: 140, h: 210 },
    terminals: [ {id:'Pos', x:40, y:185}, {id:'Neg', x:100, y:185} ],
    getInternalPaths: () => [],
    render: (ctx, state, tools) => {
        const grd = ctx.createLinearGradient(0, 0, 140, 210);
        grd.addColorStop(0, "#1e293b"); grd.addColorStop(1, "#0f172a");
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.roundRect(0, 0, 140, 210, 2); ctx.fill();
        
        ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i=1; i<6; i++) { ctx.moveTo(0, i*35); ctx.lineTo(140, i*35); }
        for(let j=1; j<3; j++) { ctx.moveTo(j*46, 0); ctx.lineTo(j*46, 210); }
        ctx.stroke();

        // Junction Box
        ctx.shadowColor="rgba(0,0,0,0.5)"; ctx.shadowBlur=5;
        tools.plasticRect(ctx, 30, 170, 80, 30, "#000"); ctx.shadowBlur=0;
        
        // Clear Labels
        const pwr = Engine.powerOn ? "430W" : "0W";
        tools.text(ctx, pwr, 70, 178, '#fff', 10, "bold");
        tools.text(ctx, 'DC OUTPUT', 70, 192, '#94a3b8', 8);
        
        tools.text(ctx, '+', 25, 185, '#ef4444', 16, "bold");
        tools.text(ctx, '-', 115, 185, '#3b82f6', 16, "bold");
    }
});

// 2. HYBRID INVERTER (Fixed Charging & Island Mode)
Engine.register({
    type: 'inverter',
    label: 'Hybrid Inverter',
    category: 'Renewables',
    role: 'switch',
    size: { w: 220, h: 260 },
    terminals: [
        // DC SIDE (Left)
        {id:'PV+', x:30, y:235}, {id:'PV-', x:50, y:235},
        {id:'Bat+', x:80, y:235}, {id:'Bat-', x:100, y:235}, // Fixed: Was duplicate Bat+
        
        // AC SIDE (Right)
        {id:'GridL', x:140, y:235}, {id:'GridN', x:160, y:235},
        {id:'LoadL', x:190, y:235}, {id:'LoadN', x:210, y:235}
    ],
    getInternalPaths: (state) => {
        if(state.energized) return [
            // 1. Grid Tie Mode (PV/Bat <-> Grid)
            ['PV+', 'GridL'], ['PV-', 'GridN'],
            ['Bat+', 'GridL'], ['Bat-', 'GridN'],
            
            // 2. Island Mode (PV/Bat -> EPS Load)
            ['PV+', 'LoadL'], ['PV-', 'LoadN'],
            ['Bat+', 'LoadL'], ['Bat-', 'LoadN'],

            // 3. Charging Mode (PV -> Bat)
            ['PV+', 'Bat+'], ['PV-', 'Bat-'] 
        ];
        return [];
    },
    render: (ctx, state, tools) => {
        const w = 220, h = 260;

        // 1. HEATSINK (Back)
        ctx.fillStyle = "#cbd5e1"; 
        for(let i=10; i<w-10; i+=10) { ctx.fillRect(i, 5, 4, h-10); }

        // 2. CASING
        const grd = ctx.createLinearGradient(0, 0, w, 0);
        grd.addColorStop(0, "#e2e8f0"); grd.addColorStop(0.2, "#ffffff");
        grd.addColorStop(0.8, "#ffffff"); grd.addColorStop(1, "#e2e8f0");
        
        ctx.fillStyle = grd;
        ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.roundRect(0, 0, w, h, 8); ctx.fill();
        ctx.shadowBlur = 0;

        // 3. SCREEN BEZEL
        ctx.fillStyle = "#1e293b"; 
        ctx.beginPath(); ctx.roundRect(40, 35, 140, 85, 6); ctx.fill();
        
        // 4. LCD SCREEN
        const screenGrd = ctx.createLinearGradient(0, 40, 0, 110);
        screenGrd.addColorStop(0, "#334155"); screenGrd.addColorStop(1, "#0f172a");
        ctx.fillStyle = screenGrd;
        ctx.beginPath(); ctx.roundRect(45, 40, 130, 75, 2); ctx.fill();

        // 5. STATUS TEXT
        if(state.energized) {
            ctx.fillStyle = "#4ade80"; 
            ctx.font="bold 12px 'Courier New', monospace"; ctx.textAlign="center";
            ctx.fillText("NORMAL MODE", 110, 65);
            ctx.fillStyle = "#cbd5e1"; ctx.font="10px 'Courier New', monospace"; 
            ctx.fillText("PV:  3.2 kW", 110, 85);
            ctx.fillText("BAT: 98 %", 110, 100);
        } else {
            ctx.fillStyle = "#ef4444"; 
            ctx.font="bold 12px 'Courier New', monospace"; ctx.textAlign="center";
            ctx.fillText("WAITING...", 110, 80);
        }

        // 6. CONNECTION STRIP
        ctx.fillStyle = "#f1f5f9"; 
        ctx.fillRect(10, 175, 200, 50);
        ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth=1; ctx.strokeRect(10, 175, 200, 50);

        // Labels
        ctx.textAlign="center";
        const drawGroup = (txt, x) => { ctx.fillStyle = "#475569"; ctx.font = "bold 9px Arial"; ctx.fillText(txt, x, 188); };
        const drawSub = (txt, x) => { ctx.fillStyle = "#94a3b8"; ctx.font = "8px Arial"; ctx.fillText(txt, x, 200); };

        drawGroup("PV INPUT", 40);  drawSub("DC 500V", 40);
        drawGroup("BATTERY", 90);   drawSub("DC 48V", 90);
        drawGroup("GRID", 150);     drawSub("AC 230V", 150);
        drawGroup("EPS/LOAD", 200); drawSub("AC 230V", 200);

        // Separators
        ctx.strokeStyle = "#e2e8f0"; ctx.beginPath();
        [65, 115, 175].forEach(x => { ctx.moveTo(x, 175); ctx.lineTo(x, 225); });
        ctx.stroke();

        // 7. TERMINALS (Cable Glands)
        const drawGland = (x, label, color) => {
            ctx.fillStyle = "#334155"; ctx.beginPath(); ctx.arc(x, 235, 7, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "#64748b"; ctx.beginPath(); ctx.arc(x, 235, 4, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = color; ctx.font = "bold 10px Arial"; ctx.textAlign = "center";
            ctx.fillText(label, x, 220);
        };

        drawGland(30, "+", "#ef4444");  drawGland(50, "-", "#3b82f6"); 
        drawGland(80, "+", "#dc2626");  drawGland(100, "-", "#2563eb");
        drawGland(140, "L", "#92400e"); drawGland(160, "N", "#2563eb"); 
        drawGland(190, "L", "#92400e"); drawGland(210, "N", "#2563eb"); 
        
        // Warning Sticker
        ctx.save(); ctx.translate(190, 45);
        ctx.fillStyle = "#facc15"; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(10, 8); ctx.lineTo(-10, 8); ctx.fill();
        ctx.fillStyle = "#000"; ctx.font="bold 10px Arial"; ctx.fillText("!", 0, 6);
        ctx.restore();
    }
});

// 3. DC BATTERY (For Hybrid Connection)
Engine.register({
    type: 'battery_dc',
    label: 'DC Battery',
    category: 'Renewables',
    role: 'load', 
    size: { w: 120, h: 160 },
    terminals: [ {id:'Pos', x:30, y:140}, {id:'Neg', x:90, y:140} ],
    getInternalPaths: () => [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 120, 160, "#fff");
        
        // Brand/Header
        ctx.fillStyle = "#cbd5e1"; ctx.fillRect(0, 0, 120, 30);
        tools.text(ctx, 'LITHIUM-ION', 60, 20, '#475569', 10, "bold");

        // Charge Bar
        const level = (state.charge !== undefined) ? state.charge : 50;
        const width = 80;
        ctx.fillStyle = "#e2e8f0"; ctx.fillRect(20, 50, width, 10); // Track
        const col = state.lit ? "#22c55e" : "#f59e0b";
        ctx.fillStyle = col; ctx.fillRect(20, 50, width * (level/100), 10); // Fill

        const status = state.lit ? "CHARGING" : "STANDBY";
        tools.text(ctx, status, 60, 75, col, 9, "bold");
        tools.text(ctx, Math.round(level)+"%", 60, 90, '#1e293b', 14, "bold");

        // Terminals
        tools.text(ctx, 'DC 48V', 60, 125, '#94a3b8', 9);
        tools.text(ctx, '+', 30, 140, '#ef4444', 14, "bold");
        tools.text(ctx, '-', 90, 140, '#3b82f6', 14, "bold");
    }
});

// 4. AC BATTERY (Powerwall Style)
Engine.register({
    type: 'battery_ac',
    label: 'AC Battery',
    category: 'Renewables',
    role: 'load', 
    size: { w: 140, h: 220 },
    terminals: [ {id:'L', x:40, y:205}, {id:'N', x:70, y:205}, {id:'E', x:100, y:205} ],
    getInternalPaths: () => [],
    render: (ctx, state, tools) => {
        ctx.shadowColor="rgba(0,0,0,0.2)"; ctx.shadowBlur=15;
        tools.plasticRect(ctx, 0, 0, 140, 220, "#fff");
        ctx.shadowBlur=0;

        const level = (state.charge !== undefined) ? state.charge : 50; 
        const barHeight = 140 * (level / 100);
        ctx.fillStyle = "#f1f5f9"; ctx.fillRect(130, 40, 6, 140);
        
        const glow = state.lit ? "#22c55e" : "#f59e0b";
        ctx.fillStyle = glow;
        if(state.lit) { ctx.shadowColor="#22c55e"; ctx.shadowBlur=10; }
        ctx.fillRect(130, 40 + (140 - barHeight), 6, barHeight);
        ctx.shadowBlur=0;

        tools.text(ctx, 'AC STORAGE', 70, 30, '#94a3b8', 10, "bold");
        tools.text(ctx, Math.round(level)+"%", 70, 100, '#334155', 14, "bold");
        
        tools.text(ctx, 'L', 40, 190, '#94a3b8', 8);
        tools.text(ctx, 'N', 70, 190, '#94a3b8', 8);
        tools.text(ctx, 'E', 100, 190, '#94a3b8', 8);
    }
});

// 5. EV CHARGER (Clearer Labels)
Engine.register({
    type: 'ev_charger', label: 'EV Charger', category: 'Renewables', role: 'load', size: { w: 120, h: 160 },
    terminals: [ {id:'L', x:30, y:145}, {id:'N', x:60, y:145}, {id:'E', x:90, y:145} ], getInternalPaths: () => [],
    render: (ctx, state, tools) => {
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(10, 40); ctx.bezierCurveTo(10, 0, 110, 0, 110, 40); ctx.lineTo(110, 150); ctx.lineTo(10, 150); ctx.fill(); ctx.strokeStyle="#e2e8f0"; ctx.lineWidth=1; ctx.stroke();
        ctx.fillStyle = "#f1f5f9"; ctx.beginPath(); ctx.arc(60, 60, 35, 0, Math.PI*2); ctx.fill();
        const c = state.lit ? "#22c55e" : "#94a3b8";
        if(state.lit) { ctx.shadowColor=c; ctx.shadowBlur=10; }
        tools.circle(ctx, 60, 60, 10, c); ctx.shadowBlur=0;
        
        tools.text(ctx, 'EV CHARGE', 60, 35, '#64748b', 10, "bold");
        
        ctx.fillStyle = "#1e293b"; ctx.fillRect(25, 135, 70, 20); // Terminal Block
        tools.text(ctx, 'L', 30, 130, '#94a3b8', 8);
        tools.text(ctx, 'N', 60, 130, '#94a3b8', 8);
        tools.text(ctx, 'E', 90, 130, '#94a3b8', 8);
        
        ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 6; ctx.lineCap="round"; ctx.beginPath(); ctx.moveTo(90, 150); ctx.bezierCurveTo(90, 180, 140, 120, 120, 80); ctx.stroke();
    }
});

// 6. GENERATION METER (More Space)
Engine.register({
    type: 'gen_meter', label: 'Gen Meter', category: 'Renewables', role: 'passive', size: { w: 90, h: 140 },
    terminals: [ {id:'Lin', x:25, y:125}, {id:'Nin', x:65, y:125}, {id:'Lout', x:25, y:15}, {id:'Nout', x:65, y:15} ], 
    getInternalPaths: () => [['Lin', 'Lout'], ['Nin', 'Nout']],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 90, 140, "#fff"); 
        ctx.fillStyle = "#e2e8f0"; ctx.fillRect(15, 40, 60, 30);
        tools.text(ctx, '00142', 45, 55, '#000', 12, "monospace"); 
        ctx.fillStyle = "red"; ctx.beginPath(); ctx.arc(45, 85, 3, 0, Math.PI*2); ctx.fill(); 
        tools.text(ctx, 'TOTAL GEN', 45, 30, '#64748b', 8);
        
        ctx.fillStyle = "#64748b"; ctx.font = "8px Arial"; 
        ctx.fillText("LOAD (Top)", 45, 12);
        ctx.fillText("SUPPLY (Bot)", 45, 115);
    }
});

// 7. CHANGEOVER SWITCH (Clean Labels)
Engine.register({
    type: 'changeover_switch', label: 'Changeover', category: 'Renewables', role: 'switch', hasSwitch: true, states: 3, size: { w: 90, h: 140 },
    terminals: [
        {id:'L_out', x:30, y:15}, {id:'N_out', x:60, y:15},
        {id:'L_grid', x:15, y:125}, {id:'N_grid', x:30, y:125}, 
        {id:'L_gen', x:60, y:125}, {id:'N_gen', x:75, y:125}
    ],
    getInternalPaths: (state) => {
        const val = state.switchVal || 0;
        if(val === 0) return [['L_grid', 'L_out'], ['N_grid', 'N_out']];
        if(val === 2) return [['L_gen', 'L_out'], ['N_gen', 'N_out']];
        return [];
    },
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 90, 140, "#fff"); tools.plasticRect(ctx, 20, 45, 50, 50, "#f1f5f9");
        ctx.save(); ctx.translate(45, 70); const val = state.switchVal || 0;
        let rot = -0.5; if(val === 1) rot = 0; if(val === 2) rot = 0.5;
        ctx.rotate(rot); ctx.fillStyle="#1e293b"; ctx.beginPath(); ctx.roundRect(-8, -20, 16, 40, 2); ctx.fill(); ctx.restore();
        
        tools.text(ctx, 'I - 0 - II', 45, 35, '#000', 10, "bold");
        
        // Simplified Labels
        ctx.fillStyle = "#334155"; ctx.font = "bold 8px Arial"; ctx.textAlign="center";
        ctx.fillText("LOAD", 45, 10);
        ctx.fillText("GRID", 22, 115);
        ctx.fillText("GEN", 67, 115);
    }
});

// 8. DC ISOLATOR
Engine.register({
    type: 'dc_iso', label: 'DC Isolator', role: 'switch', hasSwitch: true, size: { w: 90, h: 130 },
    terminals: [ {id:'InPos', x:20, y:15}, {id:'InNeg', x:70, y:15}, {id:'OutPos', x:20, y:115}, {id:'OutNeg', x:70, y:115} ],
    getInternalPaths: (state) => state.on ? [['InPos', 'OutPos'], ['InNeg', 'OutNeg']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 90, 130, "#e5e7eb"); 
        ctx.fillStyle = "#facc15"; ctx.fillRect(15, 35, 60, 60); ctx.strokeStyle = "#000"; ctx.strokeRect(15, 35, 60, 60);
        ctx.save(); ctx.translate(45, 65); if(state.on) ctx.rotate(Math.PI/2);
        ctx.shadowColor="rgba(0,0,0,0.3)"; ctx.shadowBlur=5; ctx.fillStyle="#ef4444"; ctx.beginPath(); ctx.roundRect(-8, -25, 16, 50, 4); ctx.fill(); ctx.beginPath(); ctx.arc(0,0,12,0,Math.PI*2); ctx.fill(); ctx.restore();
        
        tools.text(ctx, 'DC 1000V', 45, 105, '#000', 8);
        tools.text(ctx, '+', 10, 30, '#ef4444', 10, 'bold'); tools.text(ctx, '-', 80, 30, '#2563eb', 10, 'bold');
        tools.text(ctx, '+', 10, 110, '#ef4444', 10, 'bold'); tools.text(ctx, '-', 80, 110, '#2563eb', 10, 'bold');
    }
});

// 9. SMART METER (Bi-Dir)
Engine.register({
    type: 'smart_meter', label: 'Smart Meter', category: 'Renewables', role: 'passive', size: { w: 60, h: 140 },
    terminals: [ {id:'Lin', x:15, y:15}, {id:'Lout', x:15, y:125}, {id:'Nin', x:45, y:15}, {id:'Nout', x:45, y:125} ], getInternalPaths: () => [['Lin', 'Lout'], ['Nin', 'Nout']],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 60, 140, "#fff"); ctx.fillStyle = "#e2e8f0"; ctx.fillRect(5, 40, 50, 30);
        tools.text(ctx, '0.42', 30, 55, '#000', 10, "monospace"); 
        ctx.fillStyle = "#2563eb"; ctx.fillRect(0, 30, 60, 5); tools.text(ctx, 'Bi-Dir', 30, 85, '#64748b', 8);
        
        ctx.fillStyle = "#64748b"; ctx.font = "8px Arial"; 
        ctx.fillText("SUPPLY", 30, 12);
        ctx.fillText("LOAD", 30, 115);
    }
});

// 10. WIND TURBINE
Engine.register({
    type: 'wind_turbine', label: 'Wind Gen', category: 'Renewables', role: 'source', size: { w: 120, h: 160 },
    terminals: [ {id:'Pos', x:40, y:145}, {id:'Neg', x:80, y:145} ], getInternalPaths: () => [],
    render: (ctx, state, tools) => {
        ctx.fillStyle = "#94a3b8"; ctx.fillRect(55, 60, 10, 80); ctx.fillStyle = "#64748b"; ctx.fillRect(30, 140, 60, 20);
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(60, 60, 20, 15, 0, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle = "#cbd5e1"; ctx.stroke();
        ctx.save(); ctx.translate(60, 60); if(Engine.powerOn) ctx.rotate((Date.now()/300) % (Math.PI*2)); 
        ctx.fillStyle = "#f1f5f9"; ctx.strokeStyle = "#cbd5e1"; for(let i=0; i<3; i++) { ctx.rotate((Math.PI*2)/3); ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(15, -10, 0, -70); ctx.quadraticCurveTo(-15, -10, 0, 0); ctx.fill(); ctx.stroke(); } ctx.restore();
        tools.text(ctx, 'DC OUT', 60, 150, '#fff', 8);
    }
});

// 11. FIREMAN'S SWITCH
Engine.register({
    type: 'fireman_switch', label: 'Fireman Sw', category: 'Renewables', role: 'switch', hasSwitch: true, size: { w: 90, h: 120 },
    terminals: [ {id:'Lin', x:25, y:15}, {id:'Nin', x:65, y:15}, {id:'Lout', x:25, y:105}, {id:'Nout', x:65, y:105} ],
    getInternalPaths: (state) => state.on ? [['Lin', 'Lout'], ['Nin', 'Nout']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 90, 120, "#e2e8f0"); ctx.fillStyle = "#b91c1c"; ctx.beginPath(); ctx.roundRect(35, 30, 20, 60, 2); ctx.fill();
        ctx.save(); ctx.translate(45, 90); if(state.on) ctx.rotate(-0.8); else ctx.rotate(0);
        ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.roundRect(-5, -50, 10, 60, 5); ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2); ctx.fill(); ctx.restore();
        tools.text(ctx, 'PV STOP', 45, 20, '#b91c1c', 10, "bold");
    }
});

// 12. DC BATTERY BREAKER
Engine.register({
    type: 'dc_breaker', label: 'Bat Fuse', category: 'Renewables', role: 'switch', hasSwitch: true, size: { w: 80, h: 120 },
    terminals: [ {id:'PosIn', x:25, y:15}, {id:'NegIn', x:55, y:15}, {id:'PosOut', x:25, y:105}, {id:'NegOut', x:55, y:105} ],
    getInternalPaths: (state) => state.on ? [['PosIn', 'PosOut'], ['NegIn', 'NegOut']] : [],
    render: (ctx, state, tools) => {
        tools.plasticRect(ctx, 0, 0, 80, 120, "#fff"); ctx.fillStyle = "#e2e8f0"; ctx.fillRect(15, 35, 50, 50);
        tools.toggle(ctx, 20, 40, 40, 40, state.on, "#000"); tools.text(ctx, 'DC 125A', 40, 95, '#ef4444', 10, "bold"); tools.text(ctx, 'BATTERY', 40, 25, '#64748b', 8);
    }
});