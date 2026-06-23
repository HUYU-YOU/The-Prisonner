// ============================================================================
// VISUAL EFFECTS ENGINE, LIGHTING, HUD REFRESH & CANVAS GRAPHICS LAYER
// ============================================================================

function triggerShake(intensity, duration) {
    shakeIntensity = intensity;
    shakeTimer = duration;
}

function spawnParticles(x, y, color, count, isGlow = false) {
    for (let i = 0; i < count; i++) {
        let angle = Math.random() * Math.PI * 2;
        let speed = Math.random() * 5 + 2;
        particles.push({
            x: x, y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0, 
            color: color,
            size: Math.random() * 5 + 3,
            glow: isGlow
        });
    }
}

function updateHUD() {
    let healthPercent = (playerStats.health / playerStats.maxHealth) * 100;
    document.getElementById('health-bar').style.width = healthPercent + "%";
    document.getElementById('mana-bar').style.width = playerStats.mana + "%";
    document.getElementById('key-gold').innerText = playerStats.inventory.keys.gold;
    document.getElementById('key-skull').innerText = playerStats.inventory.keys.skull;
    document.getElementById('key-orb').innerText = playerStats.inventory.keys.orb;
    document.getElementById('p-green').innerText = playerStats.inventory.potions.green;
    document.getElementById('p-yellow').innerText = playerStats.inventory.potions.yellow;
    document.getElementById('p-blue').innerText = playerStats.inventory.potions.blue;
    document.getElementById('p-red').innerText = playerStats.inventory.potions.red;
}

function renderGameView() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save(); 
    
    if (shakeTimer > 0) {
        let dx = (Math.random() - 0.5) * shakeIntensity * 2;
        let dy = (Math.random() - 0.5) * shakeIntensity * 2;
        ctx.translate(dx, dy);
        shakeTimer--; shakeIntensity *= 0.9; 
    }
    
    // SOL
    let imageSol = assetsManager.images['sol_base'];
    ctx.fillStyle = '#2c251f'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (imageSol && imageSol.complete && imageSol.naturalWidth > 0) {
        let pattern = ctx.createPattern(imageSol, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // MURS
    let wallL = assetsManager.images['wall_left'];
    if (wallL && wallL.complete) {
        ctx.drawImage(wallL, 0, 0, wallMargin, canvas.height);
    } else {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, wallMargin, canvas.height);
    }
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, wallMargin); 
    ctx.fillRect(0, canvas.height - wallMargin, canvas.width, wallMargin); 
    ctx.fillRect(canvas.width - wallMargin, 0, wallMargin, canvas.height); 

    // ARÈNE ZONE ROUGE
    if (currentRoomId === 999) { 
        ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 6;
        let x = wallMargin + arenaShrink, y = wallMargin + arenaShrink;
        let w = canvas.width - (wallMargin + arenaShrink) * 2, h = canvas.height - (wallMargin + arenaShrink) * 2;
        ctx.strokeRect(x, y, w, h);
    }

    // SANG, PORTES, RAMASSABLES, ENNEMIS, PROJECTILES, JOUEUR
    // (J'ai abrégé pour la lisibilité, garde le reste de ton code original ici)
    // ... [INSÈRE ICI TOUT TON CODE DE DESSIN ORIGINAL] ...
    
    // PARTICULES
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.05; 
        if (p.life <= 0) particles.splice(i, 1);
        else { ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill(); }
    }
    ctx.globalAlpha = 1.0; 

    // HUD TEXTES / BOSS
    if (currentRoomId === 999) {
        let boss = currentEnemies.find(e => ['troll', 'mage', 'dragon'].includes(e.type));
        if (boss) {
            ctx.fillStyle = 'rgba(15, 5, 5, 0.9)'; ctx.fillRect(canvas.width / 2 - 300, 70, 600, 30);
            ctx.fillStyle = '#e74c3c'; ctx.fillRect(canvas.width / 2 - 298, 72, 596 * (boss.health / boss.maxHealth), 26);
        }
    }

    ctx.restore(); 
}
