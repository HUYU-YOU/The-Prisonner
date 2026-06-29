// ============================================================================
// js/renderer.js - MOTEUR DE RENDU VISUEL ET EFFETS
// ============================================================================

window.triggerShake = function(intensity, duration) { 
    shakeIntensity = intensity; 
    shakeTimer = duration; 
};

window.spawnParticles = function(x, y, color, count, isGlow = false) {
    for (let i = 0; i < count; i++) {
        let angle = Math.random() * Math.PI * 2; 
        let speed = Math.random() * 5 + 2;
        particles.push({ 
            x: x, y: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, 
            life: 1.0, color: color, size: Math.random() * 5 + 3, glow: isGlow 
        });
    }
};

window.getDirectionName = function(angle) {
    let deg = angle * (180 / Math.PI);
    if (deg < 0) deg += 360;

    if (deg >= 337.5 || deg < 22.5) return 'east';
    if (deg >= 22.5 && deg < 67.5) return 'southeast';
    if (deg >= 67.5 && deg < 112.5) return 'south';
    if (deg >= 112.5 && deg < 157.5) return 'southwest';
    if (deg >= 157.5 && deg < 202.5) return 'west';
    if (deg >= 202.5 && deg < 247.5) return 'northwest';
    if (deg >= 247.5 && deg < 292.5) return 'north';
    if (deg >= 292.5 && deg < 337.5) return 'northeast';
    return 'south';
};

window.getAsset = function(name) {
    if (!name) return null;
    return assetsManager.images[name] || 
           assetsManager.images[name.toLowerCase()] || 
           assetsManager.images[name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()];
};

window.renderGameView = function() {
    if (!ctx) return;
    
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    ctx.save(); 
    
    if (shakeTimer > 0) {
        let dx = (Math.random() - 0.5) * shakeIntensity * 2; 
        let dy = (Math.random() - 0.5) * shakeIntensity * 2;
        ctx.translate(dx, dy); 
        shakeTimer--; 
        shakeIntensity *= 0.9; 
    }
    
    let imageSol = assetsManager.images['sol_base'];
    ctx.fillStyle = '#2c251f'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (imageSol && imageSol.complete && imageSol.naturalWidth > 0) { 
        ctx.fillStyle = ctx.createPattern(imageSol, 'repeat'); 
        ctx.fillRect(0, 0, canvas.width, canvas.height); 
    } else { 
        ctx.strokeStyle = '#3d342c'; ctx.lineWidth = 1; 
        for(let i = 0; i < canvas.width; i += 60) { 
            for(let j = 0; j < canvas.height; j += 60) { ctx.strokeRect(i, j, 60, 60); }
        } 
    }

    let isVertCorridor = (currentRoomId === 5 || currentRoomId === 6);
    if (isVertCorridor) {
        ctx.fillStyle = '#0a0a0a'; 
        ctx.fillRect(0, 0, 350 - wallMargin, canvas.height); 
        ctx.fillRect(canvas.width - 350 + wallMargin, 0, 350, canvas.height); 
        
        ctx.strokeStyle = '#3d342c'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(350 - wallMargin, 0); ctx.lineTo(350 - wallMargin, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(canvas.width - 350 + wallMargin, 0); ctx.lineTo(canvas.width - 350 + wallMargin, canvas.height); ctx.stroke();
    }
    
    let wallL = assetsManager.images['left_wall']; if (wallL && wallL.complete) ctx.drawImage(wallL, isVertCorridor ? 350 - wallMargin : 0, 0, wallMargin, canvas.height);
    let wallR = assetsManager.images['right_wall']; if (wallR && wallR.complete) ctx.drawImage(wallR, isVertCorridor ? canvas.width - 350 : canvas.width - wallMargin, 0, wallMargin, canvas.height);
    let wallT = assetsManager.images['back_wall']; if (wallT && wallT.complete) ctx.drawImage(wallT, 0, 0, canvas.width, wallMargin);
    let wallB = assetsManager.images['front_wall']; if (wallB && wallB.complete) ctx.drawImage(wallB, 0, canvas.height - wallMargin, canvas.width, wallMargin);
    
    bloodStains.forEach(blood => { 
        ctx.save();
        let alpha = 1.0;
        if (blood.life !== undefined && blood.life < 300) { alpha = Math.max(0, blood.life / 300); }
        ctx.globalAlpha = alpha;
        
        ctx.translate(blood.x, blood.y);
        if (blood.rotation) ctx.rotate(blood.rotation);
        
        let bImg = window.getAsset(blood.imgId);
        if (bImg && bImg.complete && bImg.naturalWidth > 0) {
            let s = blood.size || 40;
            ctx.drawImage(bImg, -s/2, -s/2, s, s);
        } else {
            ctx.fillStyle = blood.type === 'kill' ? '#500000' : '#8a0303'; 
            ctx.beginPath(); ctx.arc(0, 0, (blood.size || 30) / 2, 0, Math.PI * 2); ctx.fill(); 
        }
        ctx.restore();
    });
    ctx.globalAlpha = 1.0;

    if (currentRoomId === 999) { 
        ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 6; 
        ctx.strokeRect(wallMargin + arenaShrink, wallMargin + arenaShrink, canvas.width - (wallMargin + arenaShrink) * 2, canvas.height - (wallMargin + arenaShrink) * 2);
    }

    if (currentRoomId === 8) {
        let sImg = assetsManager.images['stairs_down']; let sx = canvas.width/2 - 75, sy = canvas.height/2 - 75, sw = 150, sh = 150; 
        ctx.save();
        if (sImg && sImg.complete && sImg.naturalWidth > 0) {
            ctx.drawImage(sImg, sx, sy, sw, sh); 
            if (!worldState.bossDefeated) { ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fillRect(sx, sy, sw, sh); }
        } else {
            ctx.fillStyle = '#111'; ctx.fillRect(sx, sy, sw, sh); ctx.strokeStyle = '#555'; ctx.lineWidth = 6; ctx.strokeRect(sx, sy, sw, sh);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center';
            if (!worldState.bossDefeated) { ctx.fillText("ESCALIER", sx + sw/2, sy + sh/2 - 10); ctx.fillStyle = '#e74c3c'; ctx.fillText("BLOQUÉ !", sx + sw/2, sy + sh/2 + 20); } 
            else { ctx.fillStyle = '#f1c40f'; ctx.fillText("SORTIE ICI", sx + sw/2, sy + sh/2 + 5); }
            ctx.textAlign = 'left';
        }
        if (worldState.bossDefeated) { ctx.shadowColor = '#f1c40f'; ctx.shadowBlur = 30; ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 4; ctx.strokeRect(sx, sy, sw, sh); }
        ctx.restore();
    }

    if (currentRoomId === 1) {
        let benchX = 400; let benchY = canvas.height - wallMargin - 60; let imgBench = assetsManager.images['bench'];
        if (imgBench && imgBench.complete && imgBench.naturalWidth > 0) { ctx.drawImage(imgBench, benchX, benchY, 200, 80); } 
        if (typeof bookshelf !== 'undefined') {
            let imgBiblio = assetsManager.images['bibliotheque'];
            if (imgBiblio && imgBiblio.complete && imgBiblio.naturalWidth > 0) { ctx.drawImage(imgBiblio, bookshelf.x, bookshelf.y, bookshelf.width, bookshelf.height); } 
        }
    }

    if (typeof currentCrates !== 'undefined') {
        currentCrates.forEach(crate => {
            let imgName = ''; 
            if (crate.type === 'barrel') imgName = crate.isBroken ? 'crate2' : 'crate1'; 
            else if (crate.type === 'box') imgName = crate.isBroken ? 'crate4' : 'crate3'; 
            else if (crate.type === 'chest') imgName = crate.isBroken ? 'chest2' : 'chest1';
            
            let img = assetsManager.images[imgName]; ctx.save(); ctx.translate(crate.x + crate.size/2, crate.y + crate.size/2);
            if (!crate.isBroken && crate.health < 30 && crate.type !== 'chest') { ctx.rotate(Math.sin(Date.now() / 20) * 0.1); }
            
            if (img && img.complete && img.naturalWidth > 0) { ctx.drawImage(img, -crate.size/2, -crate.size/2, crate.size, crate.size); } 
            else { 
                ctx.fillStyle = crate.isBroken ? '#5c4033' : '#8B4513'; 
                if (crate.type === 'chest') ctx.fillStyle = crate.isBroken ? '#7f8c8d' : '#f1c40f'; 
                ctx.fillRect(-crate.size/2, -crate.size/2, crate.size, crate.size); 
            }
            ctx.restore();
        });
    }

    currentDoors.forEach(door => {
        let doorImg = null; let isOpen = (worldState && worldState.openedDoors && worldState.openedDoors[door.id]) || false; let stateStr = '_close'; 
        
        if (isOpen) { stateStr = '_open'; } 
        else if (door.requiresKey && door.locked) { stateStr = '_key'; }
        if (currentRoomId === 8 && !worldState.bossDefeated && door.face === 'south') { stateStr = '_close'; }
        
        if (door.face === 'north') doorImg = assetsManager.images['back_door' + stateStr]; 
        else if (door.face === 'south') doorImg = assetsManager.images['front_door' + stateStr]; 
        else if (door.face === 'west') doorImg = assetsManager.images['left_door' + stateStr]; 
        else if (door.face === 'east') doorImg = assetsManager.images['right_door' + stateStr];
        
        if (doorImg && doorImg.complete && doorImg.naturalWidth > 0) { ctx.drawImage(doorImg, door.x, door.y, door.width, door.height); } 
        else { ctx.fillStyle = isOpen ? '#1a110c' : '#3e2a1d'; ctx.fillRect(door.x, door.y, door.width, door.height); }
    });

    currentItems.forEach(item => {
        if (!item.collected) {
            let floatY = Math.sin(Date.now() / 200) * 3; 
            ctx.save(); ctx.translate(item.x, item.y + floatY); 
            
            let scaleX = 1; let assetName = null;
            if (item.type === 'key') assetName = 'gold_key';
            else if (item.type === 'key_skull') assetName = 'skeleton_key';
            else if (item.type === 'key_orb') assetName = 'portal_key';
            else if (item.type === 'potion_green') assetName = 'potion1';
            else if (item.type === 'potion_yellow') assetName = 'potion2';
            else if (item.type === 'potion_blue') assetName = 'potion3';
            else if (item.type === 'potion_red') assetName = 'potion4';
            else if (item.type === 'coin') { assetName = 'gold_coin'; scaleX = Math.abs(Math.cos(Date.now() / 200)); }
            
            ctx.scale(scaleX, 1); ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.5)'; 

            let itemImg = window.getAsset(assetName);
            
            if (itemImg && itemImg.complete && itemImg.naturalWidth > 0) {
                let displaySize = item.size * 2.5; 
                
                // --- AJUSTEMENT DES TAILLES DES ITEMS ---
                if (assetName === 'gold_coin') {
                    displaySize = item.size * 3.5; 
                } else if (assetName && assetName.includes('key')) {
                    displaySize = item.size * 1.2; 
                }
                
                ctx.drawImage(itemImg, -displaySize/2, -displaySize/2, displaySize, displaySize);
            } else {
                if (item.type === 'coin') { ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(0, 0, item.size, 0, Math.PI*2); ctx.fill(); } 
                else if (item.type.includes('potion')) { ctx.fillStyle = item.type === 'potion_green' ? '#2ecc71' : '#e74c3c'; ctx.beginPath(); ctx.arc(0, 6, 10, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-5, -4, 10, 12); } 
                else { ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(6, -3, 18, 6); }
            }
            ctx.restore();
        }
    });

    if (typeof hazards !== 'undefined') {
        hazards.forEach(h => { 
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; ctx.beginPath(); ctx.arc(h.x, h.y, h.radius, 0, Math.PI*2); ctx.fill(); 
            let fallH = (h.timer / h.maxTimer) * 150; ctx.fillStyle = 'rgba(192, 57, 43, 0.9)'; ctx.beginPath(); ctx.arc(h.x, h.y - fallH, h.radius * (1 - (h.timer/h.maxTimer)*0.5), 0, Math.PI*2); ctx.fill(); 
            ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(h.x, h.y, h.radius, 0, Math.PI*2); ctx.stroke(); 
        });
    }

    if (typeof necroSummons !== 'undefined') {
        necroSummons.forEach(s => {
            ctx.save(); ctx.translate(s.x + s.size/2, s.y + s.size/2);
            if (s.type === 'fusion') { ctx.fillStyle = '#8e44ad'; ctx.fillRect(-s.size/2, -s.size/2, s.size, s.size); ctx.fillStyle = '#1abc9c'; ctx.beginPath(); ctx.arc(0, 0, s.size/4, 0, Math.PI*2); ctx.fill(); } 
            else { ctx.fillStyle = 'rgba(44, 62, 80, 0.7)'; ctx.beginPath(); ctx.arc(0, 0, s.size/2, 0, Math.PI*2); ctx.fill(); }
            ctx.restore(); 
        });
    }

    currentEnemies.forEach(enemy => {
        ctx.save(); ctx.translate(enemy.x + enemy.size/2, enemy.y + enemy.size/2);
        let dx = (player.x + player.size/2) - (enemy.x + enemy.size/2); let dy = (player.y + player.size/2) - (enemy.y + enemy.size/2);
        let angleToPlayer = Math.atan2(dy, dx); 
        let dir = window.getDirectionName(angleToPlayer);
        let prefix = enemy.type.charAt(0).toUpperCase() + enemy.type.slice(1);
        let action = 'view'; let skinName = '';

        if (enemy.blockAnimTimer > 0) { action = 'block'; skinName = `${prefix}_${dir}_${action}`; } 
        else if (enemy.attackAnimTimer > 0) {
            action = 'attack'; let t = enemy.attackAnimTimer;
            if (prefix === 'Skeleton' || prefix === 'Mage') { if (t > 15) skinName = `${prefix}_${dir}_attack1`; else skinName = `${prefix}_${dir}_attack2`; } 
            else if (prefix === 'Dragon') { if (t > 20) skinName = `${prefix}_${dir}_attack1`; else if (t > 10) skinName = `${prefix}_${dir}_attack2`; else skinName = `${prefix}_${dir}_attack3`; } 
            else { skinName = `${prefix}_${dir}_${action}`; }
        } else { skinName = `${prefix}_${dir}_${action}`; }

        let img = window.getAsset(skinName); let is8Dir = true;
        if (!img || !img.complete || img.naturalWidth === 0) { skinName = `${prefix}_${dir}_view`; img = window.getAsset(skinName); }
        if (!img || !img.complete || img.naturalWidth === 0) { 
            is8Dir = false; let fallbackName = ''; let lowPrefix = prefix.toLowerCase();
            if (lowPrefix === 'goblin') { if (enemy.blockAnimTimer > 0) fallbackName = 'goblin_top_block'; else if (enemy.attackAnimTimer > 0) fallbackName = 'goblin_top_attack'; else fallbackName = 'goblin_top_view'; } 
            else if (lowPrefix === 'skeleton') { if (enemy.attackAnimTimer > 0) fallbackName = 'Skeleton_top_attack'; else fallbackName = 'Skeleton_top_view'; } 
            else if (lowPrefix === 'spider') fallbackName = 'spider_top_view'; else if (lowPrefix === 'troll') fallbackName = 'troll_top_view'; else if (lowPrefix === 'mage') fallbackName = 'Burned_top_view'; else if (lowPrefix === 'dragon') fallbackName = 'drake_top_view';
            img = window.getAsset(fallbackName); 
        }

        let wobble = Math.sin(enemy.wobble) * 0.15; let scalePulse = 1 + Math.sin(enemy.wobble * 2) * 0.05;  
        if (is8Dir) { ctx.rotate(wobble); } else { ctx.rotate(angleToPlayer - (Math.PI / 2) + wobble); }
        ctx.scale(scalePulse, scalePulse); 
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 4;
        if (enemy.type === 'troll') { ctx.shadowColor = '#27ae60'; ctx.shadowBlur = 20; } 
        else if (enemy.type === 'mage') { ctx.shadowColor = '#9b59b6'; ctx.shadowBlur = 20; } 
        else if (enemy.type === 'dragon') { ctx.shadowColor = '#e74c3c'; ctx.shadowBlur = 25; }
        
        if (img && img.complete && img.naturalWidth > 0) {
            let displaySize = enemy.size * 2.5; 
            if ((enemy.type === 'mage' || enemy.type === 'spider') && !is8Dir) { 
                ctx.save(); ctx.beginPath(); ctx.arc(0, 0, displaySize/2.2, 0, Math.PI*2); ctx.clip(); ctx.drawImage(img, -displaySize/2, -displaySize/2, displaySize, displaySize); ctx.restore(); 
            } else { ctx.drawImage(img, -displaySize/2, -displaySize/2, displaySize, displaySize); }
        } else { ctx.shadowColor = 'transparent'; ctx.fillStyle = '#e74c3c'; ctx.fillRect(-enemy.size/2, -enemy.size/2, enemy.size, enemy.size); }
        
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
        if (enemy.ultiAnimTimer > 0) { 
            ctx.save(); ctx.globalCompositeOperation = 'screen'; let imgUlt = window.getAsset('Ulti_fire_mage'); 
            if (imgUlt && imgUlt.complete && imgUlt.naturalWidth > 0) { let expSize = enemy.size * 3.5; ctx.globalAlpha = enemy.ultiAnimTimer / 30; ctx.drawImage(imgUlt, -expSize/2, -expSize/2, expSize, expSize); } 
            ctx.restore(); 
        }
        
        if (enemy.isBurning) { ctx.fillStyle = 'rgba(230, 126, 34, 0.5)'; ctx.beginPath(); ctx.arc(0, 0, enemy.size/2 + Math.random()*5, 0, Math.PI*2); ctx.fill(); }
        if (enemy.slowTimer > 0 || enemy.isPermanentlySlowed) { ctx.strokeStyle = '#8e44ad'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, enemy.size/2 + 6, 0, Math.PI*2); ctx.stroke(); }
        ctx.restore(); 
        
        if (!['troll', 'mage', 'dragon', 'deathgod', 'elysia'].includes(enemy.type)) { 
            ctx.fillStyle = '#111'; ctx.fillRect(enemy.x, enemy.y - 12, enemy.size, 4); 
            ctx.fillStyle = '#e74c3c'; ctx.fillRect(enemy.x, enemy.y - 12, enemy.size * (enemy.health / enemy.maxHealth), 4); 
        } 
    });

    let boss = currentEnemies.find(e => ['troll', 'mage', 'dragon', 'deathgod', 'elysia'].includes(e.type));
    if (boss) {
        let bossName = "BOSS";
        if (boss.type === 'troll') bossName = "TROLL CORROMPU";
        else if (boss.type === 'mage') bossName = "MAGE EXILÉ";
        else if (boss.type === 'dragon') bossName = "DRAGON MAUDIT";
        else if (boss.type === 'deathgod') bossName = "DEATH GOD";
        else if (boss.type === 'elysia') bossName = "ELYSIA";
        
        let isPhase2 = boss.phase === 2 || (boss.health <= boss.maxHealth / 2); 
        let barWidth = 600; let bx = canvas.width/2 - barWidth/2;
        
        ctx.fillStyle = '#111'; ctx.fillRect(bx, 30, barWidth, 24); 
        ctx.fillStyle = isPhase2 ? '#8e44ad' : '#e74c3c'; ctx.fillRect(bx + 2, 32, (barWidth - 4) * (Math.max(0, boss.health) / boss.maxHealth), 20);
        ctx.fillStyle = isPhase2 ? '#8e44ad' : '#f1c40f'; ctx.font = 'bold 22px Arial'; ctx.textAlign = 'center'; ctx.fillText(bossName + (boss.invulnerable ? " (INTRAITABLE)" : (isPhase2 ? " (ENRAGÉ)" : "")), canvas.width/2, 22); ctx.textAlign = 'left';
    }

    projectiles.forEach(p => { 
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.fillStyle = '#ecf0f1'; ctx.fillRect(-8, -1, 16, 2); ctx.restore();
    });
    
    enemyProjectiles.forEach(p => { 
        ctx.save(); ctx.translate(p.x, p.y); let pAngle = Math.atan2(p.vy, p.vx); 
        
        if (p.type === 'armor_sword') {
            // Dessin basique rotatif pour l'épée boomerang en attendant l'asset !
            ctx.rotate(Date.now() / 100); ctx.fillStyle = p.color; ctx.fillRect(-15, -4, 30, 8); 
        }
        else if (p.type === 'bone') { 
            ctx.rotate(pAngle); ctx.fillStyle = '#ecf0f1'; let l = p.size * 1.5; let w = p.size * 0.3; let r = p.size * 0.6; ctx.fillRect(-l, -w, l * 2, w * 2); ctx.beginPath(); ctx.arc(-l, -w*1.2, r, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(-l, w*1.2, r, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(l, -w*1.2, r, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(l, w*1.2, r, 0, Math.PI*2); ctx.fill(); 
        } 
        else if (p.type === 'bat_web') { 
            ctx.rotate(pAngle); ctx.fillStyle = 'rgba(142, 68, 173, 0.8)'; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(0, -8); ctx.lineTo(-4, -4); ctx.lineTo(-8, -8); ctx.lineTo(-4, 0); ctx.lineTo(-8, 8); ctx.lineTo(-4, 4); ctx.lineTo(0, 8); ctx.closePath(); ctx.fill(); 
        } 
        else if (p.type === 'fire') { 
            let fireImg = window.getAsset('Attack_fire_mage'); 
            if (fireImg && fireImg.complete && fireImg.naturalWidth > 0) { ctx.rotate(pAngle + Math.PI / 2); ctx.globalCompositeOperation = 'screen'; let dSize = p.size * 5.0; ctx.drawImage(fireImg, -dSize/2, -dSize/2, dSize, dSize); } 
            else { ctx.rotate(pAngle); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill(); } 
        } 
        else { 
            ctx.rotate(pAngle); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill(); 
        }
        ctx.restore();
    });

    let drawPlayer = true;
    if (playerInvulnerableTimer > 0 && Math.floor(playerInvulnerableTimer / 5) % 2 === 0) drawPlayer = false; 
    
    if (drawPlayer) {
        let isElfInvuln = (isUltimateActive && player.heroClass === 'Elf' && !elfStealthBroken);
        if (player.dashTimer > 0) ctx.globalAlpha = 0.5; 
        else if (isElfInvuln) ctx.globalAlpha = 0.4; 
        else ctx.globalAlpha = 1.0;
        
        let isMoving = (keys['z'] || keys['w'] || keys['s'] || keys['q'] || keys['a'] || keys['d'] || keys['arrowup'] || keys['arrowdown'] || keys['arrowleft'] || keys['arrowright']);
        let bobbingY = isMoving ? Math.sin(Date.now() / 80) * 4 : Math.sin(Date.now() / 300) * 1.5;
        let tilt = isMoving ? Math.sin(Date.now() / 120) * 0.1 : 0;
        if (player.dashTimer > 0) tilt = Math.PI / 8; 
        
        ctx.save(); ctx.translate(player.x + player.size / 2, player.y + player.size / 2 + bobbingY); 

        let dirP = window.getDirectionName(player.faceAngle);
        let prefixP = player.heroClass ? player.heroClass : 'Knight';
        
        if (prefixP === 'Mage') { prefixP = 'Burned'; } 
        else { prefixP = prefixP.charAt(0).toUpperCase() + prefixP.slice(1).toLowerCase(); }
        
        let actionP = 'view';
        if ((typeof isAttacking !== 'undefined' && isAttacking) || attackCooldown > 0) {
            actionP = 'attack';
            let midTime = prefixP === 'Knight' ? 20 : 15;
            if (attackCooldown > midTime) actionP = 'attack1'; else actionP = 'attack2';
        }
        
        let skinNameP = `${prefixP}_${dirP}_${actionP}`;
        let pImg = window.getAsset(skinNameP);
        let is8DirP = true;

        if (!pImg || !pImg.complete || pImg.naturalWidth === 0) { pImg = window.getAsset(`${prefixP}_${dirP}_view`); }
        if (!pImg || !pImg.complete || pImg.naturalWidth === 0) {
            is8DirP = false;
            if (player.heroClass === 'Elf') {
                let angle = player.faceAngle; let pSkinNameFallback = 'Elf_front'; 
                if (angle > -Math.PI/4 && angle <= Math.PI/4) pSkinNameFallback = 'Elf_est'; 
                else if (angle > Math.PI/4 && angle <= 3*Math.PI/4) pSkinNameFallback = 'Elf_front'; 
                else if (angle > -3*Math.PI/4 && angle <= -Math.PI/4) pSkinNameFallback = 'Elf_back'; 
                else pSkinNameFallback = 'Elf_west';                                                      
                pImg = window.getAsset(pSkinNameFallback); is8DirP = true; 
            } else if (player.heroClass === 'Mage') { pImg = window.getAsset('Burned_top_view'); }
        }

        if (is8DirP) { ctx.rotate(tilt); } 
        else { if (player.heroClass === 'Mage') ctx.rotate(player.faceAngle + tilt + (Math.PI / 2)); else ctx.rotate(player.faceAngle + tilt); }

        if (pImg && pImg.complete && pImg.naturalWidth > 0) {
            let displaySize = player.size * 2.5; 
            if (player.heroClass === 'Elf' && !is8DirP) displaySize = player.size * 6.0;
            if (player.heroClass === 'Mage' && !is8DirP) displaySize = player.size * 3.5;
            ctx.drawImage(pImg, -displaySize/2, -displaySize/2, displaySize, displaySize);
        } else {
            if (prefixP === 'Knight') {
                ctx.fillStyle = '#95a5a6'; ctx.beginPath(); ctx.arc(0, 0, player.size/2, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#2c3e50'; ctx.fillRect(-5, -10, 10, 20);
                ctx.save();
                if (attackCooldown > 0) {
                    let progress = (40 - attackCooldown) / 40; let swipeAngle = -Math.PI / 2 + progress * (Math.PI * 1.3); ctx.rotate(swipeAngle);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 40, -Math.PI / 2, swipeAngle); ctx.stroke();
                } else { ctx.translate(5, 12); }
                ctx.fillStyle = '#f1c40f'; ctx.fillRect(0, -3, 6, 6); ctx.fillStyle = '#ecf0f1'; ctx.fillRect(6, -2, 28, 4); ctx.restore();
            } else { ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.arc(0, 0, player.size/2, 0, Math.PI*2); ctx.fill(); }
        }
        ctx.restore(); ctx.globalAlpha = 1.0; 
    }
    
    if (playerStats.inventory.coins !== undefined) {
        let coinImg = window.getAsset('gold_coin');
        if (coinImg && coinImg.complete && coinImg.naturalWidth > 0) { ctx.drawImage(coinImg, wallMargin + 15, 20, 30, 30); } 
        else { ctx.fillStyle = '#f39c12'; ctx.beginPath(); ctx.arc(wallMargin + 30, 35, 16, 0, Math.PI*2); ctx.fill(); }
        ctx.fillStyle = '#fff'; ctx.font = 'bold 24px Arial'; ctx.textAlign = 'left'; ctx.fillText("x " + playerStats.inventory.coins, wallMargin + 55, 43);
    }
    
    particles.forEach(p => { 
        ctx.globalAlpha = Math.max(0, p.life); if (p.glow) { ctx.save(); ctx.shadowColor = p.color; ctx.shadowBlur = 10; } 
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill(); if (p.glow) ctx.restore(); 
    });
    ctx.globalAlpha = 1.0; 
    
    ctx.save();
    let gradient = ctx.createRadialGradient(player.x + player.size/2, player.y + player.size/2, 100, player.x + player.size/2, player.y + player.size/2, canvas.width * 0.7);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.restore();
    
    if (currentRoomId === 999) {
        ctx.fillStyle = '#ecf0f1'; ctx.font = 'bold 28px Arial'; ctx.textAlign = 'center';
        let displayWave = arenaState === "WAITING" ? arenaWave : arenaWave - 1;
        if (arenaState === "WAITING" && arenaTimer > 0) { ctx.fillText("VAGUE " + displayWave + " DANS " + Math.ceil(arenaTimer/60) + "S", canvas.width/2, wallMargin + 40); } 
        else if (displayWave > 0) { ctx.fillText("VAGUE " + displayWave, canvas.width/2, wallMargin + 40); }
        ctx.textAlign = 'left';
    }
    ctx.restore(); 
};
