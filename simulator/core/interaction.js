/* core/interaction.js - Fixed: Crash & Wire Hit Detection */
const Interaction = {
    inputType: 'mouse', // 'mouse' or 'touch'
    mode: 'interact',   // 'interact', 'wire', 'move'
    
    // State
    selectedComp: null,
    draggingProbe: null,
    isDragging: false,
    isPanning: false,
    wireStart: null,
    
    // Coords
    lastPanPos: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 },
    lastPointerPos: { x: 0, y: 0 },
    lastClickTime: 0, // Fixed: Added missing state variable
    
    // Touch & Helpers
    longPressTimer: null,
    cableSize: '2.5',

    init: (canvas) => {
        // Fix: Use global reference if 'this.canvas' context is lost
        const el = canvas || document.getElementById('simCanvas');
        el.addEventListener('pointerdown', Interaction.handlePointerDown);
        window.addEventListener('pointermove', Interaction.handlePointerMove);
        window.addEventListener('pointerup', Interaction.handlePointerUp);
        window.addEventListener('pointercancel', Interaction.handlePointerUp);
        el.addEventListener('wheel', Interaction.handleWheel, { passive: false });
        el.addEventListener('contextmenu', e => e.preventDefault()); // Block Browser Menu
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') Interaction.cancelAction();
            if (e.key === 'Delete' || e.key === 'Backspace') Interaction.deleteSelected();
        });
    },

    setInputType: (type) => { Interaction.inputType = type; },

    // --- MAIN HANDLERS ---

    handlePointerDown: (e) => {
        // e.preventDefault(); // Optional: Sometimes blocks focus, use carefully
        document.getElementById('simCanvas').setPointerCapture(e.pointerId);
        const { x, y } = Interaction.getPos(e);
        Interaction.lastPointerPos = { x, y };

        if (Interaction.inputType === 'touch' && !e.isPrimary) { Interaction.cancelAction(); return; }
        
        // Panning (Middle Click/Space)
        if (e.button === 1 || (e.button === 0 && e.getModifierState && e.getModifierState("Space"))) {
            Interaction.startPan(e.clientX, e.clientY);
            return;
        }

        // Right Click - Delete Logic
        if (e.button === 2 && Interaction.inputType === 'mouse') {
            if (Interaction.wireStart) Interaction.cancelAction();
            else Interaction.tryDeleteAt(x, y);
            return;
        }

        // Long Press (Touch)
        if (Interaction.inputType === 'touch') {
            Interaction.longPressTimer = setTimeout(() => {
                Interaction.longPressTimer = null;
                if (Interaction.wireStart) Interaction.cancelAction();
                else Interaction.tryDeleteAt(x, y);
                if (navigator.vibrate) navigator.vibrate(50);
            }, 600);
        }

        // Left Click
        if (e.button === 0) {
            Interaction.calculateHover(x, y);
            Interaction.handleTapDown(x, y);
        }
    },

    handlePointerMove: (e) => {
        // e.preventDefault(); 
        if (Interaction.isPanning) { Interaction.updatePan(e.clientX, e.clientY); return; }
        
        if (Interaction.longPressTimer && (Math.abs(e.movementX) > 2 || Math.abs(e.movementY) > 2)) {
            clearTimeout(Interaction.longPressTimer); Interaction.longPressTimer = null;
        }
        
        const { x, y } = Interaction.getPos(e);
        Interaction.lastPointerPos = { x, y };
        Interaction.handleHoverMove(x, y);
    },

    handlePointerUp: (e) => {
        // e.preventDefault();
        if(Interaction.longPressTimer) clearTimeout(Interaction.longPressTimer);
        Interaction.handleTapUp();
        Interaction.endPan();
        const el = document.getElementById('simCanvas');
        if(el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    },

    handleWheel: (e) => {
        e.preventDefault();
        Interaction.zoom(e.clientX, e.clientY, -e.deltaY * 0.001);
    },

    // --- MODE-SPECIFIC LOGIC ---

    handleTapDown: (x, y) => {
        // 1. Probes
        const hitProbe = ['red', 'black'].find(c => {
            const p = Meter.probes[c];
            return (Math.hypot(x - p.x, y - p.y) < 30);
        });
        if (hitProbe) { Interaction.draggingProbe = hitProbe; return; }

        // 2. Wire Mode
        if (Interaction.mode === 'wire') {
            // Tap to delete wire in wire mode
            const hitWire = Engine.wires.find(w => Interaction.isPointOnWire(x, y, w));
            if(hitWire) { Engine.removeWire(hitWire); return; }

            // Start Wiring
            if (Renderer.hoveredTerm) {
                Interaction.startWiring(Renderer.hoveredTerm.comp, Renderer.hoveredTerm.term.id, Renderer.hoveredTerm.x, Renderer.hoveredTerm.y);
            }
            return; 
        }

        // 3. Component Interaction
        const comps = [...Engine.components].reverse();
        const clicked = comps.find(c => x > c.x && x < c.x + c.w && y > c.y && y < c.y + c.h);

        if (clicked) {
            if (Interaction.mode === 'move') {
                Interaction.selectedComp = clicked;
                Interaction.isDragging = true;
                Interaction.dragOffset = { x: x - clicked.x, y: y - clicked.y };
                return;
            }
            if (Interaction.mode === 'interact') {
                const now = Date.now();
                if (now - Interaction.lastClickTime < 300) {
                    if (clicked.type === 'plc_mini' && window.openPLCModal) window.openPLCModal(clicked);
                    else if (window.App && App.openPropertyModal) App.openPropertyModal(clicked);
                    return;
                }
                Interaction.lastClickTime = now;
                const def = ComponentRegistry[clicked.type];
                if (def.hasSwitch) {
                    if (def.states) {
                        clicked.state.switchVal = (clicked.state.switchVal + 1) % def.states;
                        clicked.state.on = clicked.state.switchVal > 0;
                    } else { clicked.state.on = !clicked.state.on; }
                }
            }
        }
    },

    handleHoverMove: (x, y) => {
        if (Interaction.draggingProbe) {
            const p = Meter.probes[Interaction.draggingProbe];
            p.x = x; p.y = y; p.compId = null; p.termId = null;
            Engine.components.forEach(c => {
                const def = ComponentRegistry[c.type];
                if (def.terminals) {
                    def.terminals.forEach(t => {
                        if (Math.hypot(x - (c.x + t.x), y - (c.y + t.y)) < 25) {
                            p.x = c.x + t.x; p.y = c.y + t.y; p.compId = c.id; p.termId = t.id;
                        }
                    });
                }
            });
            return;
        }

        if (Interaction.isDragging && Interaction.selectedComp && Interaction.mode === 'move') {
            Interaction.selectedComp.x = Math.round((x - Interaction.dragOffset.x) / 10) * 10;
            Interaction.selectedComp.y = Math.round((y - Interaction.dragOffset.y) / 10) * 10;
            return;
        }

        if (Interaction.mode === 'wire') {
            Interaction.calculateHover(x, y);
        } else {
            Renderer.hoveredTerm = null;
        }
    },

    handleTapUp: () => {
        if (Interaction.mode === 'wire' && Interaction.wireStart && Renderer.hoveredTerm) {
            const ht = Renderer.hoveredTerm;
            if (Interaction.wireStart.comp.id !== ht.comp.id) {
                Engine.addWire(Interaction.wireStart.comp.id, Interaction.wireStart.term, ht.comp.id, ht.term.id, Interaction.cableSize);
                Interaction.cancelAction();
            }
        }
        Interaction.isDragging = false;
        Interaction.draggingProbe = null;
    },

    // --- HIT DETECTION & CALCULATIONS ---

    calculateHover: (x, y) => {
        Renderer.hoveredTerm = null;
        const snapDist = Interaction.inputType === 'touch' ? 40 : 25; 
        let closestDist = snapDist;
        
        Engine.components.forEach(c => {
            const def = ComponentRegistry[c.type];
            if (def.terminals) {
                def.terminals.forEach(t => {
                    const dist = Math.hypot(x - (c.x + t.x), y - (c.y + t.y));
                    if (dist < closestDist) {
                        closestDist = dist;
                        // FIX: Ensure ghostWire exists before setting properties to prevent crash
                        if (Interaction.wireStart && Renderer.ghostWire) { 
                            Renderer.ghostWire.x2 = c.x + t.x; 
                            Renderer.ghostWire.y2 = c.y + t.y; 
                        }
                        Renderer.hoveredTerm = { comp: c, term: t, x: c.x + t.x, y: c.y + t.y };
                    }
                });
            }
        });

        // Update ghost wire to mouse position if not snapped
        if (Interaction.wireStart && !Renderer.hoveredTerm) {
            // FIX: Create ghostWire if it doesn't exist (Safety check)
            if(!Renderer.ghostWire) {
                Renderer.ghostWire = { x1: Interaction.wireStart.x, y1: Interaction.wireStart.y, x2: x, y2: y };
            } else {
                Renderer.ghostWire.x2 = x; 
                Renderer.ghostWire.y2 = y;
            }
        }
    },

    startWiring: (comp, termId, tx, ty) => {
        if (!Interaction.wireStart) {
            Interaction.wireStart = { comp, term: termId, x: tx, y: ty };
            // Initialize Ghost Wire immediately
            Renderer.ghostWire = { x1: tx, y1: ty, x2: tx, y2: ty };
        } else {
            if (Interaction.wireStart.comp.id !== comp.id) {
                Engine.addWire(Interaction.wireStart.comp.id, Interaction.wireStart.term, comp.id, termId, Interaction.cableSize);
            }
            Interaction.cancelAction();
        }
    },

    // NEW: Accurate Bezier Curve Hit Detection
    isPointOnWire: (x, y, w) => {
        const p1 = Renderer.getTerminalPos(w.startComp, w.startTerm);
        const p2 = Renderer.getTerminalPos(w.endComp, w.endTerm);
        if (!p1 || !p2) return false;
        
        // Bezier Control Points (Matches Renderer.js visualization: +50 dip)
        const cp1 = { x: p1.x, y: p1.y + 50 };
        const cp2 = { x: p2.x, y: p2.y + 50 };
        
        // Sample points along the curve
        const samples = 15;
        const threshold = 15; // Hit radius
        
        for (let i = 0; i <= samples; i++) {
            const t = i / samples;
            const invT = 1 - t;
            
            // Cubic Bezier Formula
            const bx = (invT ** 3) * p1.x + 3 * (invT ** 2) * t * cp1.x + 3 * invT * (t ** 2) * cp2.x + (t ** 3) * p2.x;
            const by = (invT ** 3) * p1.y + 3 * (invT ** 2) * t * cp1.y + 3 * invT * (t ** 2) * cp2.y + (t ** 3) * p2.y;
            
            if (Math.hypot(x - bx, y - by) < threshold) return true;
        }
        return false;
    },

    tryDeleteAt: (x, y) => {
        // 1. Check Wires first
        const hitWire = Engine.wires.find(w => Interaction.isPointOnWire(x, y, w));
        if (hitWire) { Engine.removeWire(hitWire); return; }
        
        // 2. Check Components
        const comps = [...Engine.components].reverse();
        const clicked = comps.find(c => x > c.x && x < c.x + c.w && y > c.y && y < c.y + c.h);
        if (clicked && confirm(`Delete ${clicked.state.label}?`)) { Engine.remove(clicked.id); }
    },

    // View Controls
    getPos: (e) => {
        const rect = document.getElementById('simCanvas').getBoundingClientRect();
        // Handle CSS scaling
        const cssX = e.clientX - rect.left; 
        const cssY = e.clientY - rect.top;
        return Renderer.screenToWorld(cssX, cssY);
    },
    
    cancelAction: () => { 
        Interaction.wireStart = null; 
        Renderer.ghostWire = null; // Clear the ghost wire
        Interaction.isPanning = false; 
        Interaction.selectedComp = null; 
        Interaction.isDragging = false; 
    },
    
    startPan: (sx, sy) => { Interaction.isPanning = true; Interaction.lastPanPos = { x: sx, y: sy }; document.body.style.cursor = "grabbing"; },
    updatePan: (sx, sy) => { if (!Interaction.isPanning) return; const dx = sx - Interaction.lastPanPos.x; const dy = sy - Interaction.lastPanPos.y; Renderer.camera.x += dx; Renderer.camera.y += dy; Interaction.lastPanPos = { x: sx, y: sy }; },
    endPan: () => { Interaction.isPanning = false; document.body.style.cursor = "default"; },
    zoom: (screenX, screenY, delta) => {
        const rect = document.getElementById('simCanvas').getBoundingClientRect();
        const mouseX = screenX - rect.left; const mouseY = screenY - rect.top;
        const worldPosBefore = Renderer.screenToWorld(mouseX, mouseY);
        const newZoom = Math.min(Math.max(0.1, Renderer.camera.zoom + delta), 5);
        Renderer.camera.zoom = newZoom;
        const newWorldX = worldPosBefore.x * newZoom + Renderer.camera.x;
        const newWorldY = worldPosBefore.y * newZoom + Renderer.camera.y;
        Renderer.camera.x += (mouseX - newWorldX); Renderer.camera.y += (mouseY - newWorldY);
    },
    deleteSelected: () => { if(Interaction.selectedComp && confirm(`Delete ${Interaction.selectedComp.state.label}?`)) { Engine.remove(Interaction.selectedComp.id); Interaction.selectedComp = null; } }
};