/* data/levels.js - Complete, Pre-Wired Scenario Pack */

const createDomesticDB = (mcbs = []) => {
    const boardX = 50; const boardY = 50;
    const board = [
        { type: 'db_board', x: boardX, y: boardY },                                  // 0
        { type: 'service_head', x: boardX - 120, y: boardY + 200, label: 'Mains' }, // 1
        { type: 'earth_bar', x: boardX + 120, y: boardY + 40, label: 'Earth' },     // 2
        { type: 'neutral_bar', x: boardX + 150, y: boardY + 360, label: 'Neutral' },// 3
        { type: 'main_switch_100a', x: boardX + 30, y: boardY + 160, label: 'Main' },// 4
        { type: 'rcd', x: boardX + 120, y: boardY + 160, label: 'RCD' }             // 5
    ];
    let mcbStartX = boardX + 250;
    mcbs.forEach((type, i) => { board.push({ type: type, x: mcbStartX + (i * 45), y: boardY + 160 }); });
    return board;
};

const getStdInternalWires = (mcbCount) => {
    const wires = [
        { startComp: 1, startTerm: 'L', endComp: 4, endTerm: 'Lin', color: '#b45309', size: '16.0' },
        { startComp: 1, startTerm: 'N', endComp: 4, endTerm: 'Nin', color: '#1d4ed8', size: '16.0' },
        { startComp: 1, startTerm: 'E', endComp: 2, endTerm: 'E0', color: '#16a34a', size: '10.0' },
        { startComp: 4, startTerm: 'Lout', endComp: 5, endTerm: 'Lout', color: '#b45309', size: '16.0' },
        { startComp: 4, startTerm: 'Nout', endComp: 5, endTerm: 'Nout', color: '#1d4ed8', size: '16.0' },
        { startComp: 5, startTerm: 'Nin', endComp: 3, endTerm: 'N0', color: '#1d4ed8', size: '10.0' }, 
    ];
    for(let i=0; i<mcbCount; i++) { wires.push({ startComp: 5, startTerm: 'Lin', endComp: 6+i, endTerm: 'Lin', color: '#b45309', size: '10.0' }); }
    return wires;
};

const createIndustrialDB = () => { return [ { type: 'db_3ph', x: 50, y: 50 }, { type: 'supply_3ph', x: -120, y: 150 } ]; };

window.LEVELS = {
    1: {
        title: "Test 1: Continuity (Radial)",
        desc: "Verify R1+R2 continuity.",
        comps: [ ...createDomesticDB(['mcb_b20']), { type: 'socket', x: 650, y: 100, label: 'Socket 1' }, { type: 'socket', x: 800, y: 100, label: 'Socket 2' } ],
        wires: [ ...getStdInternalWires(1), { startComp: 6, startTerm: 'Lout', endComp: 7, endTerm: 'L', color: '#b45309', size: '2.5' }, { startComp: 3, startTerm: 'N1', endComp: 7, endTerm: 'N', color: '#1d4ed8', size: '2.5' }, { startComp: 2, startTerm: 'E1', endComp: 7, endTerm: 'E', color: '#16a34a', size: '2.5' }, { startComp: 7, startTerm: 'L', endComp: 8, endTerm: 'L', color: '#b45309', size: '2.5' }, { startComp: 7, startTerm: 'N', endComp: 8, endTerm: 'N', color: '#1d4ed8', size: '2.5' }, { startComp: 7, startTerm: 'E', endComp: 8, endTerm: 'E', color: '#16a34a', size: '2.5' } ]
    },
    2: {
        title: "Test 2: Ring Circuit Continuity",
        desc: "Verify Ring Final Circuit.",
        comps: [ ...createDomesticDB(['mcb_b32']), { type: 'socket', x: 650, y: 50, label: 'Kitchen' }, { type: 'socket', x: 800, y: 50, label: 'Dining' }, { type: 'socket', x: 725, y: 200, label: 'Lounge' } ],
        wires: [ ...getStdInternalWires(1), { startComp: 6, startTerm: 'Lout', endComp: 7, endTerm: 'L', color: '#b45309', size: '2.5' }, { startComp: 3, startTerm: 'N1', endComp: 7, endTerm: 'N', color: '#1d4ed8', size: '2.5' }, { startComp: 2, startTerm: 'E1', endComp: 7, endTerm: 'E', color: '#16a34a', size: '2.5' }, { startComp: 7, startTerm: 'L', endComp: 8, endTerm: 'L', color: '#b45309', size: '2.5' }, { startComp: 7, startTerm: 'N', endComp: 8, endTerm: 'N', color: '#1d4ed8', size: '2.5' }, { startComp: 7, startTerm: 'E', endComp: 8, endTerm: 'E', color: '#16a34a', size: '2.5' }, { startComp: 8, startTerm: 'L', endComp: 9, endTerm: 'L', color: '#b45309', size: '2.5' }, { startComp: 8, startTerm: 'N', endComp: 9, endTerm: 'N', color: '#1d4ed8', size: '2.5' }, { startComp: 8, startTerm: 'E', endComp: 9, endTerm: 'E', color: '#16a34a', size: '2.5' }, { startComp: 9, startTerm: 'L', endComp: 6, endTerm: 'Lout', color: '#b45309', size: '2.5' }, { startComp: 9, startTerm: 'N', endComp: 3, endTerm: 'N2', color: '#1d4ed8', size: '2.5' }, { startComp: 9, startTerm: 'E', endComp: 2, endTerm: 'E2', color: '#16a34a', size: '2.5' } ]
    },
    3: {
        title: "Test 3: Insulation Resistance",
        desc: "Global IR Test.",
        comps: [ ...createDomesticDB(['mcb_b6', 'mcb_b20']), { type: 'sw_1way', x: 650, y: 50, label: 'Light Sw' }, { type: 'lamp', x: 800, y: 50, label: 'Lamp' }, { type: 'socket', x: 650, y: 200, label: 'Socket' } ],
        wires: [ ...getStdInternalWires(2), { startComp: 6, startTerm: 'Lout', endComp: 8, endTerm: 'C', color: '#b45309', size: '1.5' }, { startComp: 8, startTerm: 'L1', endComp: 9, endTerm: 'L', color: '#b45309', size: '1.5' }, { startComp: 3, startTerm: 'N1', endComp: 9, endTerm: 'N', color: '#1d4ed8', size: '1.5' }, { startComp: 2, startTerm: 'E1', endComp: 9, endTerm: 'E', color: '#16a34a', size: '1.5' }, { startComp: 2, startTerm: 'E2', endComp: 8, endTerm: 'E', color: '#16a34a', size: '1.5' }, { startComp: 7, startTerm: 'Lout', endComp: 10, endTerm: 'L', color: '#b45309', size: '2.5' }, { startComp: 3, startTerm: 'N2', endComp: 10, endTerm: 'N', color: '#1d4ed8', size: '2.5' }, { startComp: 2, startTerm: 'E3', endComp: 10, endTerm: 'E', color: '#16a34a', size: '2.5' } ]
    },
    4: {
        title: "Test 4: Polarity Check",
        desc: "Ensure switch is on Live.",
        comps: [ ...createDomesticDB(['mcb_b6']), { type: 'sw_1way', x: 650, y: 150, label: 'Switch' }, { type: 'lamp', x: 800, y: 150, label: 'Light' } ],
        wires: [ ...getStdInternalWires(1), { startComp: 6, startTerm: 'Lout', endComp: 7, endTerm: 'C', color: '#b45309', size: '1.5' }, { startComp: 7, startTerm: 'L1', endComp: 8, endTerm: 'L', color: '#b45309', size: '1.5' }, { startComp: 3, startTerm: 'N1', endComp: 8, endTerm: 'N', color: '#1d4ed8', size: '1.5' }, { startComp: 2, startTerm: 'E1', endComp: 8, endTerm: 'E', color: '#16a34a', size: '1.5' }, { startComp: 2, startTerm: 'E2', endComp: 7, endTerm: 'E', color: '#16a34a', size: '1.5' } ]
    },
    5: {
        title: "Test 5: Fault Finding",
        desc: "Find the Short Circuit.",
        comps: [ ...createDomesticDB(['mcb_b20', 'mcb_b16']), { type: 'socket', x: 650, y: 50, label: 'Healthy' }, { type: 'fcu', x: 650, y: 200, label: 'Faulty Spur', state: { on:true, fault: 'earth_le' } } ],
        wires: [ ...getStdInternalWires(2), { startComp: 6, startTerm: 'Lout', endComp: 8, endTerm: 'L', color: '#b45309', size: '2.5' }, { startComp: 3, startTerm: 'N1', endComp: 8, endTerm: 'N', color: '#1d4ed8', size: '2.5' }, { startComp: 2, startTerm: 'E1', endComp: 8, endTerm: 'E', color: '#16a34a', size: '2.5' }, { startComp: 7, startTerm: 'Lout', endComp: 9, endTerm: 'Lin', color: '#b45309', size: '2.5' }, { startComp: 3, startTerm: 'N2', endComp: 9, endTerm: 'Nin', color: '#1d4ed8', size: '2.5' }, { startComp: 2, startTerm: 'E2', endComp: 9, endTerm: 'Ein', color: '#16a34a', size: '2.5' } ]
    },
    13: {
        title: "13. Battery Storage (Island)",
        desc: "Off-Grid Battery System with DC Protection.",
        comps: [ { type: 'pv_panel', x: 50, y: 50 }, { type: 'inverter', x: 250, y: 50 }, { type: 'battery_dc', x: 250, y: 350, label: 'Battery' }, { type: 'dc_breaker', x: 250, y: 480, label: 'DC Fuse' }, { type: 'socket', x: 550, y: 150, label: 'Load' }, { type: 'earth_bar', x: 550, y: 300, label: 'Earth Rod' } ],
        wires: [ { startComp: 0, startTerm: 'Pos', endComp: 1, endTerm: 'PV+', color: '#dc2626', size: '4.0' }, { startComp: 0, startTerm: 'Neg', endComp: 1, endTerm: 'PV-', color: '#2563eb', size: '4.0' }, { startComp: 2, startTerm: 'Pos', endComp: 3, endTerm: 'PosIn', color: '#dc2626', size: '6.0' }, { startComp: 3, startTerm: 'PosOut', endComp: 1, endTerm: 'Bat+', color: '#dc2626', size: '6.0' }, { startComp: 2, startTerm: 'Neg', endComp: 3, endTerm: 'NegIn', color: '#2563eb', size: '6.0' }, { startComp: 3, startTerm: 'NegOut', endComp: 1, endTerm: 'Bat-', color: '#2563eb', size: '6.0' }, { startComp: 1, startTerm: 'LoadL', endComp: 4, endTerm: 'L', color: '#b45309', size: '2.5' }, { startComp: 1, startTerm: 'LoadN', endComp: 4, endTerm: 'N', color: '#1d4ed8', size: '2.5' }, { startComp: 5, startTerm: 'E0', endComp: 4, endTerm: 'E', color: '#16a34a', size: '2.5' } ]
    },
    14: {
        title: "14. PLC Basic Logic",
        desc: "Wire PLC Inputs & Outputs. Program: I1 -> Q1.",
        comps: [ { type: 'plc_psu', x: 50, y: 50 }, { type: 'plc_mini', x: 150, y: 50 }, { type: 'btn_start', x: 150, y: 300, label: 'Btn I1' }, { type: 'pilot_green', x: 250, y: 300, label: 'Light Q1' } ],
        wires: [ { startComp: 0, startTerm: 'Pos', endComp: 1, endTerm: 'L', color: '#dc2626', size: '1.5' }, { startComp: 0, startTerm: 'Neg', endComp: 1, endTerm: 'N', color: '#1e3a8a', size: '1.5' }, { startComp: 0, startTerm: 'Pos', endComp: 2, endTerm: '13', color: '#dc2626', size: '1.0' }, { startComp: 2, startTerm: '14', endComp: 1, endTerm: 'I1', color: '#dc2626', size: '1.0' }, { startComp: 0, startTerm: 'Pos', endComp: 1, endTerm: 'Q1_in', color: '#dc2626', size: '1.0' }, { startComp: 1, startTerm: 'Q1_out', endComp: 3, endTerm: 'X1', color: '#dc2626', size: '1.0' }, { startComp: 3, startTerm: 'X2', endComp: 0, endTerm: 'Neg', color: '#1e3a8a', size: '1.0' } ],
        program: [ { contacts: [{type:'NO', addr:'I1'}], coil: {addr:'Q1'} } ]
    },
    15: {
        title: "15. PLC Motor Latch",
        desc: "PLC Latching Circuit. Start(I1) OR Q1(Latch) AND Stop(I2) -> Q1.",
        comps: [ { type: 'plc_psu', x: 20, y: 50 }, { type: 'plc_mini', x: 100, y: 50 }, { type: 'btn_start', x: 100, y: 300, label: 'Start (I1)' }, { type: 'btn_stop', x: 200, y: 300, label: 'Stop (I2)' }, { type: 'contactor_2no', x: 350, y: 300, label: 'Coil Q1' }, { type: 'pilot_green', x: 450, y: 300, label: 'Run' } ],
        wires: [ { startComp: 0, startTerm: 'Pos', endComp: 1, endTerm: 'L', color: '#dc2626', size: '1.5' }, { startComp: 0, startTerm: 'Neg', endComp: 1, endTerm: 'N', color: '#1e3a8a', size: '1.5' }, { startComp: 0, startTerm: 'Pos', endComp: 2, endTerm: '13', color: '#dc2626', size: '1.0' }, { startComp: 2, startTerm: '14', endComp: 1, endTerm: 'I1', color: '#dc2626', size: '1.0' }, { startComp: 0, startTerm: 'Pos', endComp: 3, endTerm: '11', color: '#dc2626', size: '1.0' }, { startComp: 3, startTerm: '12', endComp: 1, endTerm: 'I2', color: '#dc2626', size: '1.0' }, { startComp: 0, startTerm: 'Pos', endComp: 1, endTerm: 'Q1_in', color: '#dc2626', size: '1.0' }, { startComp: 1, startTerm: 'Q1_out', endComp: 4, endTerm: 'A1', color: '#dc2626', size: '1.0' }, { startComp: 4, startTerm: 'A2', endComp: 0, endTerm: 'Neg', color: '#1e3a8a', size: '1.0' } ]
    }
};