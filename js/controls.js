// ============================================================================
// js/controls.js - GESTION DES TOUCHES ET SOURIS
// ============================================================================

document.addEventListener('contextmenu', event => event.preventDefault());

window.addEventListener('keydown', (e) => { 
    let k = e.key.toLowerCase(); if(k === ' ') k = 'space'; keys[k] = true; 
    
    if (k === 'shift') { if (typeof window.triggerDash === 'function') window.triggerDash(); }

window.addEventListener('keydown', (e) => { 
    let k = e.key.toLowerCase(); if(k === ' ') k = 'space'; keys[k] = true; 
    
    if (k === 'shift') { if (typeof window.triggerDash === 'function') window.triggerDash(); }
    if (k === 'escape' || k === 'p' || k === 'm') { if (typeof window.togglePause === 'function') window.togglePause(); }
    
    if (k === '1' || k === '&') { if (typeof window.usePotion === 'function') window.usePotion('green'); } 
    if (k === '2' || k === 'é') { if (typeof window.usePotion === 'function') window.usePotion('red'); }
    if (k === '3' || k === '"') { if (typeof window.usePotion === 'function') window.usePotion('blue'); } 
    if (k === '4' || k === "'") { if (typeof window.usePotion === 'function') window.usePotion('yellow'); }
});

window.addEventListener('keyup', (e) => { 
    let k = e.key.toLowerCase(); if(k === ' ') k = 'space'; keys[k] = false; 
});

window.addEventListener('mouseup', () => { leftClickHeld = false; });

if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect(); 
        const scaleX = canvas.width / rect.width; 
        const scaleY = canvas.height / rect.height;
        mouse.x = (e.clientX - rect.left) * scaleX; 
        mouse.y = (e.clientY - rect.top) * scaleY;
    });

    canvas.addEventListener('mousedown', (e) => {
        if (gameState !== "PLAYING") return;
        
        if (e.button === 2) { if (typeof window.triggerDash === 'function') window.triggerDash(); return; } 
        if (e.button !== 0) return; 

        leftClickHeld = true; leftClickHoldTime = 0;
        if (attackCooldown > 0) return;

        let dx = mouse.x - (player.x + player.size / 2); 
        let dy = mouse.y - (player.y + player.size / 2);
        player.faceAngle = Math.atan2(dy, dx); 
        
        let now = Date.now(); 
        if (now - lastClickTime < 300 && playerStats.mana >= 100) { 
            if (typeof window.activateUltimate === 'function') window.activateUltimate(); 
            return; 
        }
        lastClickTime = now;

        // L'action d'attaque sera gérée dans combat.js
        if (typeof window.handlePlayerAttack === 'function') window.handlePlayerAttack();
    });
}
