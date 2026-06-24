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
        shakeTimer--; 
        shakeIntensity *= 0.9; 
    }
    
    // --- 1. SOL ET MURS ---
    let imageSol = assetsManager.images['sol_base'];
    ctx.fillStyle = '#2c251f'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (imageSol && imageSol.complete && imageSol.naturalWidth > 0) {
        let pattern = ctx.createPattern(imageSol, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.strokeStyle = '#3d342c'; ctx.lineWidth = 1;
        for(let i = 0; i < canvas.width; i += 60) {
            for(let j = 0; j < canvas.height; j += 60) ctx.strokeRect(i, j, 60, 60);
        }
    }

    let wallL = assetsManager.images['left_wall'];
    if (wallL && wallL.complete && wallL.naturalWidth > 0) { ctx.drawImage(wallL, 0, 0, wallMargin, canvas.height); }
    let wallR = assetsManager.images['right_wall'];
    if (wallR && wallR.complete && wallR.naturalWidth > 0) { ctx.drawImage(wallR, canvas.width - wallMargin, 0, wallMargin, canvas.height); }
    let wallT = assetsManager.images['back_wall'];
    if (wallT && wallT.complete && wallT.naturalWidth > 0) { ctx.drawImage(wallT, 0, 0, canvas.width, wallMargin); }
    let wallB = assetsManager.images['front_wall'];
    if (wallB && wallB.complete && wallB.naturalWidth > 0) { ctx.drawImage(wallB, 0, canvas.height - wallMargin, canvas.width, wallMargin); }

    // --- 2. SANG (Tout en bas pour marcher dessus) ---
    bloodStains.forEach(blood => {
        ctx.fillStyle = 'rgba(100, 0, 0, 0.7)'; 
        ctx.beginPath(); ctx.arc(blood.x + 10, blood.y + 10, blood.r, 0, Math.PI * 2); ctx.fill();
    });

    // --- 3. ARÈNE ET ÉLÉMENTS DÉCORATIFS ---
    if (currentRoomId === 999) { 
        ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 6;
        let x = wallMargin + arenaShrink; let y = wallMargin + arenaShrink;
        let w = canvas.width - (wallMargin + arenaShrink) * 2; let h = canvas.height - (wallMargin + arenaShrink) * 2;
        ctx.strokeRect(x, y, w, h);
    }

    if (currentRoomId === 8 && worldState && worldState.bossDefeated) {
        let sImg = assetsManager.images['stairs_down'];
        let sx = canvas.width/2 - 40, sy = canvas.height/2 - 40, sw = 80, sh = 80;
        if (sImg && sImg.complete && sImg.naturalWidth > 0) {
            ctx.drawImage(sImg, sx, sy, sw, sh);
        } else {
            ctx.fillStyle = '#111'; ctx.fillRect(sx, sy, sw, sh);
            ctx.strokeStyle = '#555'; ctx.strokeRect(sx+10, sy+10, sw-20, sh-20);
        }
    }

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

    // --- 4. PORTES ET RAMASSABLES ---
    currentDoors.forEach(door => {
        let doorImg = null;
        let isOpen = (worldState && worldState.openedDoors && worldState.openedDoors[door.id]) || false;
        let stateStr = '_close'; 
        if (isOpen) { stateStr = '_open'; } else if (door.requiresKey && door.locked) { stateStr = '_key'; }
        
        if (door.face === 'north') doorImg = assetsManager.images['back_door' + stateStr];
        else if (door.face === 'south') doorImg = assetsManager.images['front_door' + stateStr];
        else if (door.face === 'west') doorImg = assetsManager.images['left_door' + stateStr];
        else if (door.face === 'east') doorImg = assetsManager.images['right_door' + stateStr];

        if (doorImg && doorImg.complete && doorImg.naturalWidth > 0) {
            ctx.drawImage(doorImg, door.x, door.y, door.width, door.height);
        } else {
            ctx.fillStyle = isOpen ? '#1a110c' : '#3e2a1d'; ctx.fillRect(door.x, door.y, door.width, door.height);
            ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
            if(door.face === 'north' || door.face === 'south') { ctx.strokeRect(door.x + 10, door.y, door.width - 20, door.height); } 
            else { ctx.strokeRect(door.x, door.y + 10, door.width, door.height - 20); }
        }
    });

    currentItems.forEach(item => {
        if (!item.collected) {
            let floatY = Math.sin(Date.now() / 200) * 3;
            ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.5)'; 
            if (item.type === 'key') {
                ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(item.x, item.y + floatY, 8, 0, Math.PI * 2); ctx.fill(); 
                ctx.fillRect(item.x + 6, item.y - 3 + floatY, 18, 6); ctx.fillRect(item.x + 18, item.y + 3 + floatY, 3, 6); 
            } else if (item.type === 'potion_green') {
                ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.arc(item.x, item.y + 6 + floatY, 10, 0, Math.PI * 2); ctx.fill(); 
                ctx.fillRect(item.x - 5, item.y - 4 + floatY, 10, 12); ctx.fillStyle = '#e67e22'; ctx.fillRect(item.x - 4, item.y - 8 + floatY, 8, 4);
            } else if (item.type === 'key_skull') {
                ctx.fillStyle = '#ecf0f1'; ctx.beginPath(); ctx.arc(item.x, item.y + floatY, 10, 0, Math.PI * 2); ctx.fill(); 
                ctx.fillStyle = '#bdc3c7'; ctx.fillRect(item.x - 3, item.y + 10 + floatY, 6, 15); 
                ctx.fillStyle = '#2c3e50'; ctx.fillRect(item.x - 2, item.y + 2 + floatY, 4, 4); 
            }
            ctx.restore();
        }
    });

    // --- 5. DANGERS ET INVOCATIONS ---
    hazards.forEach(h => {
        ctx.fillStyle = 'rgba(192, 57, 43, 0.3)'; ctx.beginPath(); ctx.arc(h.x, h.y, h.radius, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(192, 57, 43, 0.8)'; ctx.beginPath(); ctx.arc(h.x, h.y, h.radius * (1 - h.timer/h.maxTimer), 0, Math.PI*2); ctx.fill();
    });

    if (typeof necroSummons !== 'undefined') {
        necroSummons.forEach(s => {
            ctx.save(); ctx.translate(s.x + s.size/2, s.y + s.size/2);
            if (s.type === 'fusion') {
                if (s.invulnerableTimer && s.invulnerableTimer > 0) {
                    ctx.shadowBlur = 20; ctx.shadowColor = '#f1c40f'; ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 4;
                    ctx.beginPath(); ctx.arc(0, 0, s.size/2 + 8, 0, Math.PI*2); ctx.stroke();
                }
                ctx.fillStyle = '#8e44ad'; ctx.fillRect(-s.size/2, -s.size/2, s.size, s.size);
                ctx.fillStyle = '#1abc9c'; ctx.beginPath(); ctx.arc(0, 0, s.size/4, 0, Math.PI*2); ctx.fill();
            } else {
                ctx.fillStyle = 'rgba(44, 62, 80, 0.7)'; ctx.beginPath(); ctx.arc(0, 0, s.size/2, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#8e44ad'; ctx.beginPath(); ctx.arc(-s.size/4, -s.size/4, 4, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(s.size/4, -s.size/4, 4, 0, Math.PI*2); ctx.fill();
            }
            ctx.shadowBlur = 0; ctx.restore();
            
            ctx.fillStyle = '#111'; ctx.fillRect(s.x, s.y - 10, s.size, 4);
            ctx.fillStyle = '#8e44ad'; ctx.fillRect(s.x, s.y - 10, s.size * (s.health / s.maxHealth), 4);
        });
    }

    // ========================================================================
    // --- 6. ENNEMIS (VUE TOUPIE DYNAMIQUE + EFFETS "JUICE") ---
    // ========================================================================
    currentEnemies.forEach(enemy => {
        ctx.save();
        ctx.translate(enemy.x + enemy.size/2, enemy.y + enemy.size/2);
        
        // --- ROTATION VERS LE JOUEUR ---
        let dx = (player.x + player.size/2) - (enemy.x + enemy.size/2);
        let dy = (player.y + player.size/2) - (enemy.y + enemy.size/2);
        let angleToPlayer = Math.atan2(dy, dx);
        
        // --- ANIMATION (Wobble & Respiration) ---
        let rot = angleToPlayer + Math.sin(enemy.wobble) * 0.15; // Léger tremblement
        let scalePulse = 1 + Math.sin(enemy.wobble * 2) * 0.05;  // Respiration
        
        ctx.rotate(rot);
        ctx.scale(scalePulse, scalePulse);

        // --- EFFETS VISUELS (Ombres & Auras) ---
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;

        if (enemy.type === 'troll') { ctx.shadowColor = '#27ae60'; ctx.shadowBlur = 20; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }
        else if (enemy.type === 'mage') { ctx.shadowColor = '#9b59b6'; ctx.shadowBlur = 20; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }
        else if (enemy.type === 'dragon') { ctx.shadowColor = '#e74c3c'; ctx.shadowBlur = 25; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }

        // --- SÉLECTION DU SKIN ---
        let skinName = '';
        if (enemy.type === 'goblin') skinName = 'goblin_top_view';
        else if (enemy.type === 'skeleton') skinName = 'squelette_top_view';
        else if (enemy.type === 'spider') skinName = 'spider_top_view';
        else if (enemy.type === 'troll') skinName = 'troll_top_view_';
        else if (enemy.type === 'mage') skinName = 'mage_top_view';
        else if (enemy.type === 'dragon') skinName = 'drake_top_view';

        let img = assetsManager.images[skinName];

        if (img && img.complete && img.naturalWidth > 0) {
            // Agrandissement pour bien voir les détails
            let displaySize = enemy.size * 2.5; 
            
            // ⚠️ ATTENTION ORIENTATION ! ⚠️
            // Si les monstres marchent en crabe, c'est que le dessin regarde vers le HAUT.
            // Si c'est le cas, je doit enlèver les '//' au début de la ligne en dessous :
            // ctx.rotate(Math.PI / 2);
            
            ctx.drawImage(img, -displaySize/2, -displaySize/2, displaySize, displaySize);
        } else {
            // DESSIN GÉOMÉTRIQUE DE SECOURS (Si image non chargée)
            ctx.shadowColor = 'transparent'; // On enlève l'ombre pour le secours
            if (enemy.type === 'dragon') {
                ctx.fillStyle = enemy.phase === 2 ? '#e67e22' : '#8b0000'; ctx.beginPath(); ctx.arc(0, 0, enemy.size/2, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(15, -15, 8, 0, Math.PI*2); ctx.arc(15, 15, 8, 0, Math.PI*2); ctx.fill(); 
            } else if(enemy.type === 'spider') {
                ctx.fillStyle = '#2c3e50'; for(let l=0; l<4; l++) { ctx.fillRect(-enemy.size/4 + l*5, -enemy.size, 2, enemy.size*2); }
                ctx.beginPath(); ctx.arc(0, 0, enemy.size/2, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.arc(5, -3, 2, 0, Math.PI*2); ctx.arc(5, 3, 2, 0, Math.PI*2); ctx.fill();
            } else if (enemy.type === 'skeleton') {
                ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-enemy.size/2, -enemy.size/2, enemy.size, enemy.size);
                ctx.fillStyle = '#2c3e50'; ctx.fillRect(5, -6, 6, 6); ctx.fillRect(5, 2, 6, 6);
            } else {
                ctx.fillStyle = enemy.type === 'mage' ? '#8e44ad' : '#27ae60'; ctx.fillRect(-enemy.size/2, -enemy.size/2, enemy.size, enemy.size);
                ctx.fillStyle = '#111'; ctx.fillRect(5, -8, 8, 8); ctx.fillRect(5, 2, 8, 8);
            }
        }
        
        ctx.shadowColor = 'transparent'; // Désactive l'ombre pour la suite
        ctx.shadowBlur = 0;

        if (enemy.isBurning) {
            ctx.fillStyle = 'rgba(230, 126, 34, 0.5)';
            ctx.beginPath(); ctx.arc(0, 0, enemy.size/2 + Math.random()*5, 0, Math.PI*2); ctx.fill();
        }
        
        if (enemy.slowTimer > 0 || enemy.isPermanentlySlowed) {
            ctx.strokeStyle = '#8e44ad'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(0, 0, enemy.size/2 + 6, 0, Math.PI*2); ctx.stroke();
        }
        
        ctx.restore(); 
        
        // --- BARRES DE VIE (Affichées bien droites !) ---
        if (!['troll', 'mage', 'dragon'].includes(enemy.type)) {
            ctx.fillStyle = '#111'; ctx.fillRect(enemy.x, enemy.y - 12, enemy.size, 4);
            ctx.fillStyle = '#e74c3c'; ctx.fillRect(enemy.x, enemy.y - 12, enemy.size * (enemy.health / enemy.maxHealth), 4);
        } else {
            let bossName = enemy.type === 'troll' ? "Troll Corrompu" : (enemy.type === 'mage' ? "Mage Exilé" : "Dragon Maudit");
            ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center'; 
            ctx.fillText(bossName, enemy.x + enemy.size/2, enemy.y - 25); 
            let barWidth = 100;
            ctx.fillStyle = '#111'; ctx.fillRect(enemy.x + enemy.size/2 - barWidth/2, enemy.y - 15, barWidth, 8);
            ctx.fillStyle = '#e74c3c'; ctx.fillRect(enemy.x + enemy.size/2 - barWidth/2 + 1, enemy.y - 14, (barWidth-2) * (Math.max(0, enemy.health) / enemy.maxHealth), 6);
            ctx.textAlign = 'left';
        }
    });

    // --- 7. PROJECTILES ---
    projectiles.forEach(p => { 
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
        ctx.shadowColor = p.isNecro ? '#8e44ad' : (p.isFire ? '#e67e22' : '#ecf0f1'); ctx.shadowBlur = 10;
        if (p.isNecro) { ctx.fillStyle = '#8e44ad'; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.arc(-2, 0, p.size-2, 0, Math.PI*2); ctx.fill();
        } else if (p.isFire) { ctx.fillStyle = '#e67e22'; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(-2, 0, p.size-2, 0, Math.PI*2); ctx.fill();
        } else { ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-8, -1, 16, 2); ctx.fillStyle = '#ecf0f1'; ctx.beginPath(); ctx.moveTo(8, -3); ctx.lineTo(14, 0); ctx.lineTo(8, 3); ctx.fill(); ctx.fillStyle = '#34495e'; ctx.beginPath(); ctx.moveTo(-8, -3); ctx.lineTo(-12, -3); ctx.lineTo(-8, 0); ctx.lineTo(-12, 3); ctx.lineTo(-8, 3); ctx.fill(); }
        ctx.restore();
    });
    
    enemyProjectiles.forEach(p => { 
        ctx.save();
        ctx.shadowColor = p.color; ctx.shadowBlur = 10;
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); 
        ctx.restore();
    });

    // --- 8. JOUEUR ---
    let drawPlayer = true;
    if (playerInvulnerableTimer > 0 && Math.floor(playerInvulnerableTimer / 5) % 2 === 0) drawPlayer = false; 

    if (drawPlayer) {
        let isElfInvuln = (isUltimateActive && player.heroClass === 'Elf' && !elfStealthBroken);
        ctx.globalAlpha = isElfInvuln ? 0.4 : 1.0;
        
        let isMoving = (keys['z'] || keys['w'] || keys['s'] || keys['q'] || keys['a'] || keys['d'] || keys['arrowup'] || keys['arrowdown'] || keys['arrowleft'] || keys['arrowright']);
        let bobbingY = isMoving ? Math.sin(Date.now() / 80) * 4 : Math.sin(Date.now() / 300) * 1.5;
        let tilt = isMoving ? Math.sin(Date.now() / 120) * 0.1 : 0;
        
        ctx.save(); 
        ctx.translate(player.x + player.size / 2, player.y + player.size / 2 + bobbingY); 
        
        ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 5; ctx.shadowOffsetY = 5;

        if (player.heroClass === 'Elf') {
            ctx.rotate(tilt); 
            let angle = player.faceAngle; let skin = 'Elf_front'; 
            if (angle > -Math.PI/4 && angle <= Math.PI/4) skin = 'Elf_est';             
            else if (angle > Math.PI/4 && angle <= 3*Math.PI/4) skin = 'Elf_front';     
            else if (angle > -3*Math.PI/4 && angle <= -Math.PI/4) skin = 'Elf_back';    
            else skin = 'Elf_west';                                                     

            let img = assetsManager.images[skin];
            let displaySize = player.size * 2.0; 
            
            if (img && img.complete && img.naturalWidth > 0) { ctx.drawImage(img, -displaySize/2, -displaySize/2, displaySize, displaySize);
            } else {
                ctx.rotate(player.faceAngle); ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.arc(0, 0, player.size/2, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#27ae60'; ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(15, 0); ctx.lineTo(-10, 10); ctx.fill();
                ctx.strokeStyle = '#8e44ad'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(10, 0, 20, -Math.PI/2, Math.PI/2); ctx.stroke();
            }
        } else {
            ctx.rotate(player.faceAngle + tilt);
            ctx.fillStyle = playerPoisonTimer > 0 ? '#27ae60' : (player.heroClass === 'Mage' ? '#e67e22' : (player.heroClass === 'Necromancer' ? '#34495e' : '#95a5a6'));
            ctx.beginPath(); ctx.arc(0, 0, player.size/2, 0, Math.PI*2); ctx.fill();
            
            if (player.heroClass === 'Necromancer') {
                ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(15, 0); ctx.lineTo(-10, 10); ctx.fill();
                ctx.strokeStyle = '#8e44ad'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(5, 0, 15, -Math.PI/2, Math.PI/2); ctx.stroke();
            } else if (player.heroClass === 'Knight') {
                ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-15, -15, 30, 30); ctx.fillStyle = '#2c3e50'; ctx.fillRect(0, -10, 5, 20); 
                ctx.save();
                if(isAttacking) { ctx.translate(15, 15); ctx.rotate(Math.PI/4); } else { ctx.translate(5, 20); }
                ctx.fillStyle = '#f1c40f'; ctx.fillRect(0, -4, 10, 8); ctx.fillStyle = '#ecf0f1'; ctx.fillRect(10, -2, 35, 4); 
                ctx.restore();
                if (isAttacking) { ctx.strokeStyle = 'rgba(236, 240, 241, 0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, player.size + 15, -Math.PI/3, Math.PI/3); ctx.stroke(); }
            }
        }
        ctx.restore(); ctx.globalAlpha = 1.0; 
    }

    // --- 9. PARTICULES ---
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.05; 
        if (p.life <= 0) particles.splice(i, 1);
        else { 
            ctx.globalAlpha = p.life; 
            if (p.glow) { ctx.save(); ctx.shadowColor = p.color; ctx.shadowBlur = 10; }
            ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill(); 
            if (p.glow) ctx.restore();
        }
    }
    ctx.globalAlpha = 1.0; 

    // --- 10. UI (ARÈNE) ---
    if (currentRoomId === 999) {
        ctx.fillStyle = '#ecf0f1'; ctx.font = 'bold 28px Arial'; ctx.textAlign = 'center';
        let displayWave = arenaState === "WAITING" ? arenaWave : arenaWave - 1;
        if (arenaState === "WAITING" && arenaTimer > 0) ctx.fillText("VAGUE " + displayWave + " DANS " + Math.ceil(arenaTimer/60) + "S", canvas.width/2, wallMargin + 40);
        else if (displayWave > 0) ctx.fillText("VAGUE " + displayWave, canvas.width/2, wallMargin + 40);
        ctx.textAlign = 'left';
    }

    ctx.restore(); 
}
