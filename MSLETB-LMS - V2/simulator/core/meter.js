/* core/meter.js - Authentic MFT Logic */
const Meter = {
    mode: 'off', 
    voltageSetting: 500, // For Megger (250, 500, 1000)
    
    probes: {
        red: { x: 50, y: 300, compId: null, termId: null },
        black: { x: 100, y: 300, compId: null, termId: null }
    },

    setMode: (m) => {
        if(Meter.mode === 'megger' && m === 'megger') {
            // Cycle Voltage
            if(Meter.voltageSetting === 250) Meter.voltageSetting = 500;
            else if(Meter.voltageSetting === 500) Meter.voltageSetting = 1000;
            else Meter.voltageSetting = 250;
        } else {
            Meter.mode = m;
        }
        
        // Update UI Buttons
        document.querySelectorAll('.meter-controls button').forEach(b => b.classList.remove('active'));
        if(m === 'volts') document.getElementById('btn-meter-v').classList.add('active');
        if(m === 'ohms') document.getElementById('btn-meter-o').classList.add('active');
        if(m === 'off') document.getElementById('btn-meter-off').classList.add('active');
        if(m === 'megger') {
            const btn = document.getElementById('btn-meter-m');
            if(btn) {
                btn.classList.add('active');
                btn.innerHTML = `MΩ <span style="font-size:10px">${Meter.voltageSetting}V</span>`;
            }
        }
        
        Meter.updateDisplay();
    },

    updateDisplay: () => {
        const el = document.getElementById('meter-display');
        if(!el) return;

        if(Meter.mode === 'off') { el.innerText = "---"; return; }

        const p1 = Meter.probes.red;
        const p2 = Meter.probes.black;
        
        // Disconnected?
        if(!p1.compId || !p2.compId) {
            if(Meter.mode === 'ohms') el.innerText = "OL";
            else if(Meter.mode === 'megger') el.innerText = `> ${Meter.voltageSetting * 2 - 1} MΩ`;
            else el.innerText = "0.00 V";
            return;
        }

        // 1. VOLTS
        if(Meter.mode === 'volts') {
            if(!Engine.powerOn) { el.innerText = "0 V"; return; }
            const v1 = Engine.getPotential(p1.compId, p1.termId);
            const v2 = Engine.getPotential(p2.compId, p2.termId);
            const diff = Math.abs(v1 - v2);
            if(diff > 0) {
                // Jitter
                el.innerText = (diff - 1 + Math.random() * 2).toFixed(0) + " V";
            } else {
                el.innerText = "0 V";
            }
        } 
        // 2. RESISTANCE (Ohms / Megger)
        else {
            // Safety Check: Cannot measure resistance on live circuit
            if(Engine.powerOn) {
                el.innerText = "ERR:LIVE";
                return;
            }

            const connected = Engine.checkConnection(p1.compId, p1.termId, p2.compId, p2.termId);

            if(Meter.mode === 'ohms') {
                if(connected) {
                    el.innerText = (0.05 + Math.random() * 0.10).toFixed(2) + " Ω";
                } else {
                    el.innerText = "OL";
                }
            }
            else if(Meter.mode === 'megger') {
                if(connected) {
                    // Dead Short detected
                    el.innerText = "0.00 MΩ";
                } else {
                    // Clear Line (High Resistance)
                    el.innerText = `> ${Meter.voltageSetting === 1000 ? 1999 : 999} MΩ`;
                }
            }
        }
    }
};