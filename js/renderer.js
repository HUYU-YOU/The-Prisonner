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
    
    // Application du Screen Shake
    if (shakeTimer > 0) {
        let dx = (Math.random() - 0.5) * shakeIntensity * 2;
        let dy = (Math.random() - 0.5) * shakeIntensity * 2;
        ctx.translate(dx, dy);
        shakeTimer--; 
        shakeIntensity *= 0.9; 
    }
    

 // SOL
    let imageSol = assetsManager.images['sol_base'];
    
    // On dessine le fond de base quoiqu'il arrive
    ctx.fillStyle = '#2c251f'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (imageSol && imageSol.complete && imageSol.naturalWidth > 0) {
        let pattern = ctx.createPattern(imageSol, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        // Grille de secours uniquement si l'image n'est pas chargée
        ctx.strokeStyle = '#3d342c';
        ctx.lineWidth = 1;
        for(let i = 0; i < canvas.width; i += 60) {
            for(let j = 0; j < canvas.height; j += 60) {
                ctx.strokeRect(i, j, 60, 60);
            }
        }
    }

// ==========================================
    // MURS
    // ==========================================
    let wallL = assetsManager.images['wall_left'];

    if (wallL) {
        ctx.drawImage(wallL, 0, 0, wallMargin, canvas.height);
    }


    
// ARÈNE ZONE ROUGE
if (currentRoomId === 999) { 
    ctx.strokeStyle = '#c0392b'; 
    ctx.lineWidth = 6;
    let x = wallMargin + arenaShrink;
    let y = wallMargin + arenaShrink;
    let w = canvas.width - (wallMargin + arenaShrink) * 2;
    let h = canvas.height - (wallMargin + arenaShrink) * 2;
    
    ctx.strokeRect(x, y, w, h);
    
    // ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; 
    // ctx.fillRect(x, y, w, h);           
}

    // SANG
    bloodStains.forEach(blood => {
        ctx.fillStyle = 'rgba(100, 0, 0, 0.8)'; 
        ctx.beginPath(); ctx.arc(blood.x + 10, blood.y + 10, blood.r, 0, Math.PI * 2); ctx.fill();
    });

    // ÉLÉMENTS DÉCORATIFS SALLE 1
    if (currentRoomId === 1) {
        let benchX = 400; let benchY = canvas.height - wallMargin - 30;
        ctx.fillStyle = '#3e2a1d'; ctx.fillRect(benchX, benchY, 200, 20); 
        ctx.fillStyle = '#111'; ctx.fillRect(benchX - 10, benchY - 10, 10, 30); ctx.fillRect(benchX + 200, benchY - 10, 10, 30); 
        ctx.fillStyle = '#4a2f26'; ctx.fillRect(bookshelf.x, bookshelf.y, bookshelf.width, bookshelf.height);
        ctx.fillStyle = '#2a1a15'; 
        ctx.fillRect(bookshelf.x + 5, bookshelf.y + 30, bookshelf.width - 5, 4); 
        ctx.fillRect(bookshelf.x + 5, bookshelf.y + 70, bookshelf.width - 5, 4); 
        ctx.fillRect(bookshelf.x + 5, bookshelf.y + 110, bookshelf.width - 5, 4);
        ctx.fillStyle = '#8c1c1c'; ctx.fillRect(bookshelf.x + 10, bookshelf.y + 10, 8, 20);
        ctx.fillStyle = '#29547d'; ctx.fillRect(bookshelf.x + 20, bookshelf.y + 50, 10, 20);
    }

    // PORTES
    currentDoors.forEach(door => {
        ctx.fillStyle = '#3e2a1d'; ctx.fillRect(door.x, door.y, door.width, door.height);
        ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
        if(door.face === 'north' || door.face === 'south') { ctx.strokeRect(door.x + 10, door.y, door.width - 20, door.height); } 
        else { ctx.strokeRect(door.x, door.y + 10, door.width, door.height - 20); }

        if (door.requiresKey && door.locked) {
            let lockX = door.x + door.width / 2; let lockY = door.y + door.height / 2;
            if (door.face === 'north') lockY += 15;
            ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(lockX, lockY, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(lockX, lockY + 2, 4, 0, Math.PI * 2); ctx.fill();
        }
    });

    // RAMASSABLES
    currentItems.forEach(item => {
        if (!item.collected) {
            let floatY = Math.sin(Date.now() / 200) * 3;
            if (item.type === 'key') {
                ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(item.x, item.y + floatY, 8, 0, Math.PI * 2); ctx.fill(); 
                ctx.fillRect(item.x + 6, item.y - 3 + floatY, 18, 6); ctx.fillRect(item.x + 18, item.y + 3 + floatY, 3, 6); 
            } else if (item.type === 'potion_green') {
                ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.arc(item.x, item.y + 6 + floatY, 10, 0, Math.PI * 2); ctx.fill(); 
                ctx.fillRect(item.x - 5, item.y - 4 + floatY, 10, 12); ctx.fillStyle = '#e67e22'; ctx.fillRect(item.x - 4, item.y - 8 + floatY, 8, 4);
            }
        }
    });

    // DANGERS
    hazards.forEach(h => {
        ctx.fillStyle = 'rgba(192, 57, 43, 0.3)';
        ctx.beginPath(); ctx.arc(h.x, h.y, h.radius, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(192, 57, 43, 0.8)';
        ctx.beginPath(); ctx.arc(h.x, h.y, h.radius * (1 - h.timer/h.maxTimer), 0, Math.PI*2); ctx.fill();
    });

    // ENNEMIS
    currentEnemies.forEach(enemy => {
        ctx.save();
        ctx.translate(enemy.x + enemy.size/2, enemy.y + enemy.size/2);
        let rot = Math.sin(enemy.wobble) * 0.1; ctx.rotate(rot);

        if (enemy.type === 'dragon') {
            ctx.fillStyle = enemy.phase === 2 ? '#e67e22' : '#8b0000'; 
            ctx.beginPath(); ctx.arc(0, 0, enemy.size/2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#111'; 
            ctx.beginPath(); ctx.arc(-40, -20, 20, 0, Math.PI*2); ctx.arc(40, -20, 20, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#f1c40f'; 
            ctx.fillRect(-25, -15, 6, 2); ctx.fillRect(20, -15, 6, 2);
        } else if(enemy.type === 'spider') {
            ctx.fillStyle = '#2c3e50'; 
            for(let l=0; l<4; l++) { ctx.fillRect(-enemy.size, -enemy.size/4 + l*5, enemy.size*2, 2); }
            ctx.beginPath(); ctx.arc(0, 0, enemy.size/2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.arc(-3, -5, 2, 0, Math.PI*2); ctx.arc(3, -5, 2, 0, Math.PI*2); ctx.fill();
        } else if (enemy.type === 'skeleton') {
            ctx.fillStyle = '#bdc3c7';
            ctx.fillRect(-enemy.size/2, -enemy.size/2, enemy.size, enemy.size);
            ctx.fillStyle = '#2c3e50'; ctx.fillRect(-enemy.size/4, -enemy.size/4, 6, 6); ctx.fillRect(enemy.size/8, -enemy.size/4, 6, 6);
        } else {
            ctx.fillStyle = enemy.type === 'mage' ? '#8e44ad' : '#27ae60'; 
            ctx.fillRect(-enemy.size/2, -enemy.size/2, enemy.size, enemy.size);
            ctx.fillStyle = '#111'; ctx.fillRect(-enemy.size/4, -enemy.size/4, enemy.size/5, enemy.size/5); ctx.fillRect(enemy.size/8, -enemy.size/4, enemy.size/5, enemy.size/5);
            if(enemy.type === 'mage') {
                ctx.fillStyle = '#9b59b6'; ctx.beginPath(); ctx.moveTo(-enemy.size/2, -enemy.size/2); ctx.lineTo(enemy.size/2, -enemy.size/2); ctx.lineTo(0, -enemy.size); ctx.fill();
            }
        }
        if (enemy.isBurning) {
            ctx.fillStyle = '#e67e22';
            ctx.beginPath(); ctx.arc(0, 0, enemy.size/2 + Math.random()*5, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
        if (!['troll', 'mage', 'dragon'].includes(enemy.type)) {
            ctx.fillStyle = '#111'; ctx.fillRect(enemy.x, enemy.y - 12, enemy.size, 4);
            ctx.fillStyle = '#e74c3c'; ctx.fillRect(enemy.x, enemy.y - 12, enemy.size * (enemy.health / enemy.maxHealth), 4);
        }
    });

    // PROJECTILES
    projectiles.forEach(p => { 
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
        if (p.isFire) {
            ctx.fillStyle = '#e67e22'; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(-2, 0, p.size-2, 0, Math.PI*2); ctx.fill();
        } else {
            ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-8, -1, 16, 2); 
            ctx.fillStyle = '#ecf0f1'; ctx.beginPath(); ctx.moveTo(8, -3); ctx.lineTo(14, 0); ctx.lineTo(8, 3); ctx.fill(); 
            ctx.fillStyle = '#34495e'; ctx.beginPath(); ctx.moveTo(-8, -3); ctx.lineTo(-12, -3); ctx.lineTo(-8, 0); ctx.lineTo(-12, 3); ctx.lineTo(-8, 3); ctx.fill(); 
        }
        ctx.restore();
    });
    
    enemyProjectiles.forEach(p => { 
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); 
    });

    // JOUEUR
    let drawPlayer = true;
    if (playerInvulnerableTimer > 0 && Math.floor(playerInvulnerableTimer / 5) % 2 === 0) drawPlayer = false; 

    if (drawPlayer) {
        let isElfInvuln = (isUltimateActive && player.heroClass === 'Elf' && !elfStealthBroken);
        ctx.globalAlpha = isElfInvuln ? 0.4 : 1.0;
        ctx.save(); ctx.translate(player.x + player.size / 2, player.y + player.size / 2); ctx.rotate(player.faceAngle);
        
        ctx.fillStyle = playerPoisonTimer > 0 ? '#27ae60' : (player.heroClass === 'Elf' ? '#2ecc71' : (player.heroClass === 'Mage' ? '#e67e22' : '#95a5a6'));
        ctx.beginPath(); ctx.arc(0, 0, player.size/2, 0, Math.PI*2); ctx.fill();
        
        if (player.heroClass === 'Elf') {
            ctx.fillStyle = '#27ae60'; ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(15, 0); ctx.lineTo(-10, 10); ctx.fill();
            ctx.strokeStyle = '#8e44ad'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(10, 0, 20, -Math.PI/2, Math.PI/2); ctx.stroke();
        } else if (player.heroClass === 'Knight') {
            ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-15, -15, 30, 30); ctx.fillStyle = '#2c3e50'; ctx.fillRect(0, -10, 5, 20); 
            ctx.save();
            if(isAttacking) { ctx.translate(15, 15); ctx.rotate(Math.PI/4); } else { ctx.translate(5, 20); }
            ctx.fillStyle = '#f1c40f'; ctx.fillRect(0, -4, 10, 8); ctx.fillStyle = '#ecf0f1'; ctx.fillRect(10, -2, 35, 4); 
            ctx.restore();
            if (isAttacking) { ctx.strokeStyle = 'rgba(236, 240, 241, 0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, player.size + 15, -Math.PI/3, Math.PI/3); ctx.stroke(); }
        }
        ctx.restore(); ctx.globalAlpha = 1.0; 
    }

    // UI FINALE ET TEXTES
    ctx.restore(); 
}
