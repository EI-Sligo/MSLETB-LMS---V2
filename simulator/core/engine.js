/* core/engine.js - Final Consolidated Engine (All Fixes Applied) */
const ComponentRegistry = {}; 

const Engine = {
    components: [],
    wires: [],
    powerOn: false,
    liveSet: new Set(),
    neutralSet: new Set(),
    flowingWires: new Map(),
    flowingPaths: new Set(),

    register: (def) => { ComponentRegistry[def.type] = def; },

    add: (type, x, y) => {
        if (!ComponentRegistry[type]) return;
        const def = ComponentRegistry[type];
        const comp = {
            id: 'c_' + Date.now() + Math.random().toString(16).slice(2),
            type: type, x: x, y: y, w: def.size.w, h: def.size.h,
            state: { on: false, switchVal: 0, energized: false, lit: false, charge: 20, fault: 'none', label: def.label, inputs: {}, outputs: {} }
        };
        Engine.components.push(comp);
    },

    remove: (id) => {
        Engine.components = Engine.components.filter(c => c.id !== id);
        Engine.wires = Engine.wires.filter(w => w.startComp !== id && w.endComp !== id);
    },

    removeWire: (wireObj) => {
        Engine.wires = Engine.wires.filter(w => w !== wireObj);
    },

    addWire: (id1, term1, id2, term2, size) => {
        let color = '#b45309'; 
        const isNeutral = (t) => t.includes('N') || t.includes('Neg') || t === 'X2';
        const isEarth = (t) => t.includes('E');
        const isDC_Pos = (t) => t.includes('Pos') || t.includes('PV+') || t.includes('Bat+');
        const isDC_Neg = (t) => t.includes('Neg') || t.includes('PV-') || t.includes('Bat-');

        if (size === 'phase_l2') color = '#000000';      
        else if (size === 'phase_l3') color = '#9ca3af'; 
        else if (size === 'neutral') color = '#1d4ed8';  
        else if (size === 'earth') color = '#16a34a';    
        else if (size === 'control_pos') color = '#dc2626'; 
        else if (size === 'control_neg') color = '#1e3a8a'; 
        else {
            if (isEarth(term1) || isEarth(term2)) color = '#16a34a';
            else if (isDC_Neg(term1) || isDC_Neg(term2)) color = '#2563eb'; 
            else if (isDC_Pos(term1) || isDC_Pos(term2)) color = '#dc2626'; 
            else if (isNeutral(term1) || isNeutral(term2)) color = '#1d4ed8';
            else if (term1.includes('L2') || term2.includes('L2')) color = '#000000';
            else if (term1.includes('L3') || term2.includes('L3')) color = '#9ca3af';
        }
        Engine.wires.push({ startComp: id1, startTerm: term1, endComp: id2, endTerm: term2, size: size, color: color });
    },

    isLive: (compId, termId) => Engine.liveSet.has(`${compId}:${termId}`),

    getPotential: (compId, termId) => {
        if (!Engine.liveSet.has(`${compId}:${termId}`)) return 0;
        const comp = Engine.components.find(c => c.id === compId);
        if(!comp) return 0;
        if (['battery_dc', 'pv_panel', 'inverter', 'wind_turbine', 'dc_breaker', 'dc_iso'].includes(comp.type)) return 48; 
        if (termId.includes('Pos') || termId.includes('Neg') || termId.startsWith('I') || termId.startsWith('Q') || termId === 'A1' || termId === 'A2') return 24; 
        return 230;
    },

    checkConnection: (id1, term1, id2, term2) => {
        const start = `${id1}:${term1}`;
        const target = `${id2}:${term2}`;
        if (start === target) return true;
        const adj = new Map();
        const addEdge = (a, b) => {
            if(!adj.has(a)) adj.set(a, []);
            if(!adj.has(b)) adj.set(b, []);
            adj.get(a).push(b);
            adj.get(b).push(a);
        };
        Engine.wires.forEach(w => { addEdge(`${w.startComp}:${w.startTerm}`, `${w.endComp}:${w.endTerm}`); });
        Engine.components.forEach(c => {
            const paths = Engine.getPathsWithFaults(c);
            paths.forEach(p => { addEdge(`${c.id}:${p[0]}`, `${c.id}:${p[1]}`); });
        });
        const queue = [start];
        const visited = new Set();
        visited.add(start);
        while(queue.length > 0) {
            const curr = queue.shift();
            if(curr === target) return true;
            const neighbors = adj.get(curr) || [];
            for(const n of neighbors) { if(!visited.has(n)) { visited.add(n); queue.push(n); } }
        }
        return false;
    },

    getPathsWithFaults: (comp) => {
        const def = ComponentRegistry[comp.type];
        let paths = def.getInternalPaths ? def.getInternalPaths(comp.state) : [];
        const f = comp.state.fault;
        if (f === 'open') return [];
        if (f === 'open_N') paths = paths.filter(p => !p[0].includes('N') && !p[1].includes('N'));
        if (f === 'short_ln' || f === 'earth_le') {
            const terms = def.terminals || [];
            const isL = (id) => ['L','C','SL','Lin','Lout','Pos','L1','L2','L3','X1'].some(k => id.includes(k));
            const isN = (id) => ['N','Nin','Nout','Neg','X2'].some(k => id.includes(k));
            const isE = (id) => ['E','Ein','Eout'].some(k => id.includes(k));
            const lTerms = terms.filter(t => isL(t.id));
            if (f === 'short_ln') {
                const nTerms = terms.filter(t => isN(t.id));
                lTerms.forEach(l => nTerms.forEach(n => paths.push([l.id, n.id])));
            }
            if (f === 'earth_le') {
                const eTerms = terms.filter(t => isE(t.id));
                lTerms.forEach(l => eTerms.forEach(e => paths.push([l.id, e.id])));
            }
        }
        return paths;
    },

    calculate: () => {
        Engine.components.forEach(c => { c.state.energized = false; c.state.lit = false; });
        Engine.liveSet.clear(); Engine.neutralSet.clear();

        const extSources = Engine.components.filter(c => {
            const type = c.type;
            if(type === 'service_head' || type === 'supply_3ph') return Engine.powerOn;
            if(type === 'pv_panel' || type === 'wind_turbine') return true; 
            return false;
        });

        extSources.forEach(src => {
             if(src.type === 'supply_3ph') {
                Engine.liveSet.add(`${src.id}:L1`); Engine.liveSet.add(`${src.id}:L2`); Engine.liveSet.add(`${src.id}:L3`); Engine.neutralSet.add(`${src.id}:N`);
            } else if (src.type === 'pv_panel' || src.type === 'wind_turbine') {
                Engine.liveSet.add(`${src.id}:Pos`); Engine.neutralSet.add(`${src.id}:Neg`);
            } else {
                Engine.liveSet.add(`${src.id}:L`); Engine.neutralSet.add(`${src.id}:N`);
            }
        });

        const propagate = () => {
            let changed = true; let loops = 0;
            while(changed && loops < 100) {
                changed = false;
                Engine.components.forEach(c => {
                    if(c.type === 'inverter') {
                        const hasPV = Engine.liveSet.has(`${c.id}:PV+`);
                        if(hasPV && !c.state.energized) { c.state.energized = true; changed = true; }
                    }
                    if(c.type === 'plc_psu') {
                        if(Engine.liveSet.has(`${c.id}:L`) && Engine.neutralSet.has(`${c.id}:N`)) {
                            if(!Engine.liveSet.has(`${c.id}:Pos`)) { Engine.liveSet.add(`${c.id}:Pos`); changed = true; }
                            if(!Engine.neutralSet.has(`${c.id}:Neg`)) { Engine.neutralSet.add(`${c.id}:Neg`); changed = true; }
                        }
                    }
                    if(c.type === 'contactor_2no' || c.type === 'contactor_3ph') {
                        const a1Live = Engine.liveSet.has(`${c.id}:A1`);
                        const a2Neu = Engine.neutralSet.has(`${c.id}:A2`);
                        const a2Live = Engine.liveSet.has(`${c.id}:A2`);
                        const a1Neu = Engine.neutralSet.has(`${c.id}:A1`);
                        const shouldBeOn = (a1Live && a2Neu) || (a2Live && a1Neu);
                        if(c.state.on !== shouldBeOn) { c.state.on = shouldBeOn; c.state.energized = shouldBeOn; changed = true; }
                    }
                });

                Engine.wires.forEach(w => {
                    const s = `${w.startComp}:${w.startTerm}`; const e = `${w.endComp}:${w.endTerm}`;
                    if(Engine.liveSet.has(s) && !Engine.liveSet.has(e)) { Engine.liveSet.add(e); changed = true; }
                    if(Engine.liveSet.has(e) && !Engine.liveSet.has(s)) { Engine.liveSet.add(s); changed = true; }
                    if(Engine.neutralSet.has(s) && !Engine.neutralSet.has(e)) { Engine.neutralSet.add(e); changed = true; }
                    if(Engine.neutralSet.has(e) && !Engine.neutralSet.has(s)) { Engine.neutralSet.add(s); changed = true; }
                });

                Engine.components.forEach(c => {
                    const paths = Engine.getPathsWithFaults(c);
                    paths.forEach(p => {
                        const t1 = `${c.id}:${p[0]}`; const t2 = `${c.id}:${p[1]}`;
                        if(Engine.liveSet.has(t1) && !Engine.liveSet.has(t2)) { Engine.liveSet.add(t2); changed = true; }
                        if(Engine.liveSet.has(t2) && !Engine.liveSet.has(t1)) { Engine.liveSet.add(t1); changed = true; }
                        if(Engine.neutralSet.has(t1) && !Engine.neutralSet.has(t2)) { Engine.neutralSet.add(t2); changed = true; }
                        if(Engine.neutralSet.has(t2) && !Engine.neutralSet.has(t1)) { Engine.neutralSet.add(t1); changed = true; }
                    });
                });
                loops++;
            }
        };
        propagate();

        let rePropagate = false;
        const chargingBatteries = new Set();
        
        Engine.components.filter(c => c.type.includes('battery')).forEach(bat => {
            let isCharging = false;
            if(bat.type === 'battery_ac') {
                if(Engine.liveSet.has(`${bat.id}:L`) && Engine.neutralSet.has(`${bat.id}:N`)) isCharging = true;
            } else {
                if(Engine.liveSet.has(`${bat.id}:Pos`) || Engine.liveSet.has(`${bat.id}:PosIn`)) isCharging = true;
            }
            if(isCharging) {
                chargingBatteries.add(bat.id);
                bat.state.charge = Math.min(100, bat.state.charge + 0.05);
                bat.state.lit = true;
            } else { 
                bat.state.lit = false;
                if(bat.state.charge > 0) {
                    if(bat.type === 'battery_ac') { Engine.liveSet.add(`${bat.id}:L`); Engine.neutralSet.add(`${bat.id}:N`); }
                    else { Engine.liveSet.add(`${bat.id}:Pos`); Engine.neutralSet.add(`${bat.id}:Neg`); }
                    rePropagate = true;
                }
            }
        });

        Engine.components.filter(c => c.type === 'plc_mini').forEach(plc => {
            const powered = Engine.liveSet.has(`${plc.id}:L`) && Engine.neutralSet.has(`${plc.id}:N`);
            if(powered) {
                for(let i=1; i<=10; i++) { plc.state.inputs[`I${i}`] = Engine.liveSet.has(`${plc.id}:I${i}`); }
                const newOutputs = {};
                ['Q1','Q2','Q3','Q4'].forEach(q => newOutputs[q] = false);
                const program = plc.program || [];
                program.forEach(rung => {
                    let rungPower = true;
                    rung.contacts.forEach(contact => {
                        if(!contact) return; 
                        let val = false;
                        if(contact.addr.startsWith('Q')) { val = plc.state.outputs[contact.addr] || false; } 
                        else { val = plc.state.inputs[contact.addr] || false; }
                        if(contact.type === 'NO' && !val) rungPower = false;
                        if(contact.type === 'NC' && val) rungPower = false;
                    });
                    if(rung.coil && rungPower) { newOutputs[rung.coil.addr] = true; }
                });
                plc.state.outputs = newOutputs;
                rePropagate = true; 
            } else {
                plc.state.inputs = {}; plc.state.outputs = {};
            }
        });

        if(rePropagate) propagate();

        Engine.components.forEach(c => {
            const def = ComponentRegistry[c.type];
            if(def.role === 'load') {
                const hasL = Engine.liveSet.has(`${c.id}:L`) || Engine.liveSet.has(`${c.id}:SL`) || Engine.liveSet.has(`${c.id}:Pos`) || Engine.liveSet.has(`${c.id}:U`) || Engine.liveSet.has(`${c.id}:X1`);
                const hasN = Engine.neutralSet.has(`${c.id}:N`) || Engine.neutralSet.has(`${c.id}:Neg`) || Engine.neutralSet.has(`${c.id}:V`) || Engine.neutralSet.has(`${c.id}:X2`);
                const is3Phase = Engine.liveSet.has(`${c.id}:U`) && Engine.liveSet.has(`${c.id}:V`) && Engine.liveSet.has(`${c.id}:W`);
                if((hasL && hasN) || is3Phase) { c.state.lit = true; }
            }
            if(Engine.powerOn && c.state.fault === 'short_ln' && (Engine.liveSet.has(`${c.id}:L`) || Engine.liveSet.has(`${c.id}:L1`))) {
                Engine.powerOn = false; alert(`💥 TRIP! Short Circuit at ${c.state.label}.`);
                Engine.calculate(); 
            }
        });
    },

    calculateFlow: () => {
        Engine.flowingWires.clear(); Engine.flowingPaths.clear();
        if(!Engine.powerOn) return;
        const sources = [];
        Engine.components.forEach(c => {
            if(c.type === 'service_head') sources.push({ c, t: 'L' });
            if(c.type === 'supply_3ph') { sources.push({c,t:'L1'}); sources.push({c,t:'L2'}); sources.push({c,t:'L3'}); }
            if(c.type === 'pv_panel' || c.type === 'wind_turbine') sources.push({c,t:'Pos'});
            if(c.type.includes('battery') && c.state.charge > 0) {
                 const term = c.type === 'battery_ac' ? 'L' : 'Pos';
                 sources.push({ c, t: term });
            }
        });
        if(sources.length === 0) return;
        const connectionMap = new Map();
        Engine.wires.forEach(w => {
            const t1 = `${w.startComp}:${w.startTerm}`; const t2 = `${w.endComp}:${w.endTerm}`;
            if(!connectionMap.has(t1)) connectionMap.set(t1, []);
            if(!connectionMap.has(t2)) connectionMap.set(t2, []);
            connectionMap.get(t1).push(w); connectionMap.get(t2).push(w);
        });
        const queue = sources.map(s => ({ compId: s.c.id, termId: s.t }));
        const visitedWires = new Set();
        const visitedTerminals = new Set();
        while(queue.length > 0) {
            const current = queue.shift();
            const key = `${current.compId}:${current.termId}`;
            if(visitedTerminals.has(key)) continue;
            visitedTerminals.add(key);
            const attachedWires = connectionMap.get(key) || [];
            attachedWires.forEach(w => {
                if(visitedWires.has(w)) return;
                visitedWires.add(w);
                let otherComp, otherTerm, direction;
                if(w.startComp === current.compId && w.startTerm === current.termId) { otherComp = w.endComp; otherTerm = w.endTerm; direction = 1; } 
                else { otherComp = w.startComp; otherTerm = w.startTerm; direction = -1; }
                Engine.flowingWires.set(w, direction);
                queue.push({ compId: otherComp, termId: otherTerm });
            });
            const comp = Engine.components.find(c => c.id === current.compId);
            if(comp) {
                const paths = Engine.getPathsWithFaults(comp);
                paths.forEach(path => {
                    let dest = null;
                    if(path[0] === current.termId) dest = path[1];
                    else if(path[1] === current.termId) dest = path[0];
                    if(dest) {
                        Engine.flowingPaths.add(`${comp.id}:${current.termId}:${dest}`);
                        queue.push({ compId: comp.id, termId: dest });
                    }
                });
            }
        }
    }
};