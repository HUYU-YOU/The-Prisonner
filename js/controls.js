// ============================================================================
// js/controls.js - GESTION DES TOUCHES ET SOURIS
// ============================================================================

document.addEventListener('contextmenu', event => event.preventDefault());

window.addEventListener('keydown', (e) => { 
    let k = e.key.toLowerCase(); 
    if(k === ' ') k = 'space'; 
    keys[k] = true; 
    
    if (k === 'shift') { if (typeof window.triggerDash === 'function') window.triggerDash(); }
    if (k === 'escape' || k === 'p' || k === 'm') { if (typeof window.togglePause === 'function') window.togglePause(); }
    
    if (k === '1' || k === '&') { if (typeof window.usePotion === 'function') window.usePotion('green'); } 
    if (k === '2' || k === 'é') { if (typeof window.usePotion === 'function') window.usePotion('red'); }
    if (k === '3' || k === '"') { if (typeof window.usePotion === 'function') window.usePotion('blue'); } 
    
    // --- RACCOURCI DEBUG : TOUCHE '4' POUR TP NIVEAU 4 ---
    if (k === '4') {
        console.log("DEBUG: TP Forcé vers le Niveau 4 (Salle 301)");
        if (typeof window.loadRoom === 'function') {
            window.loadRoom(301, 'south');
            if (typeof gameState !== 'undefined') gameState = "PLAYING";
        }
    } else if (k === "'") { 
        // L'apostrophe gère la potion jaune normalement
        if (typeof window.usePotion === 'function') window.usePotion('yellow'); 
    }
});

window.addEventListener('keyup', (e) => { 
    let k = e.key.toLowerCase(); 
    if(k === ' ') k = 'space'; 
    keys[k] = false; 
});

window.addEventListener('mouseup', () => { leftClickHeld = false; });

if (typeof canvas !== 'undefined' && canvas) {
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect(); 
        const scaleX = canvas.width / rect.width; 
        const scaleY = canvas.height / rect.height;
        if (typeof mouse !== 'undefined') {
            mouse.x = (e.clientX - rect.left) * scaleX; 
            mouse.y = (e.clientY - rect.top) * scaleY;
        }
    });

    canvas.addEventListener('mousedown', (e) => {
        if (typeof gameState !== 'undefined' && gameState !== "PLAYING") return;
        
        if (e.button === 2) { if (typeof window.triggerDash === 'function') window.triggerDash(); return; } 
        if (e.button !== 0) return; 

        if (typeof leftClickHeld !== 'undefined') leftClickHeld = true; 
        if (typeof leftClickHoldTime !== 'undefined') leftClickHoldTime = 0;
        if (typeof attackCooldown !== 'undefined' && attackCooldown > 0) return;

        if (typeof player !== 'undefined' && typeof mouse !== 'undefined') {
            let dx = mouse.x - (player.x + player.size / 2); 
            let dy = mouse.y - (player.y + player.size / 2);
            player.faceAngle = Math.atan2(dy, dx); 
        }
        
        let now = Date.now(); 
        if (typeof lastClickTime !== 'undefined' && typeof playerStats !== 'undefined') {
            if (now - lastClickTime < 300 && playerStats.mana >= 100) { 
                if (typeof window.activateUltimate === 'function') window.activateUltimate(); 
                return; 
            }
            lastClickTime = now;
        }

        if (typeof window.handlePlayerAttack === 'function') window.handlePlayerAttack();
    });
}
