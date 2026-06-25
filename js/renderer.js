// ============================================================================
// VISUAL EFFECTS ENGINE, LIGHTING, HUD REFRESH & CANVAS GRAPHICS LAYER
// ============================================================================

function triggerShake(intensity, duration) { shakeIntensity = intensity; shakeTimer = duration; }

function spawnParticles(x, y, color, count, isGlow = false) {
    for (let i = 0; i < count; i++) {
        let angle = Math.random() * Math.PI * 2; let speed = Math.random() * 5 + 2;
        particles.push({ x: x, y: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1.0, color: color, size: Math.random() * 5 + 3, glow: isGlow });
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
    ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.save(); 
    
    if (shakeTimer > 0) {
        let dx = (Math.random() - 0.5) * shakeIntensity * 2; let dy = (Math.random() - 0.5) * shakeIntensity * 2;
        ctx.translate(dx, dy); shakeTimer--; shakeIntensity *= 0.9; 
    }
    
    let imageSol = assetsManager.images['sol_base'];
    ctx.fillStyle = '#2c251f'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (imageSol && imageSol.complete && imageSol.naturalWidth > 0) { ctx.fillStyle = ctx.createPattern(imageSol, 'repeat'); ctx.fillRect(0, 0, canvas.width, canvas.height); } 
    else { ctx.strokeStyle = '#3d342c'; ctx.lineWidth = 1; for(let i = 0; i < canvas.width; i += 60) { for(let j = 0; j < canvas.height; j += 60) ctx.strokeRect(i, j, 60, 60); } }

    // --- COULOIRS (MURS NOIRS DYNAMIQUES) ---
    let bTop = (currentRoomId === 2 || currentRoomId === 3) ? 250 : wallMargin;
    let bBot = (currentRoomId === 2 || currentRoomId === 3) ? 550 : canvas.height - wallMargin;

    if (currentRoomId === 2 || currentRoomId === 3) {
        ctx.fillStyle = '#0a0a0a'; 
        ctx.fillRect(0, 0, canvas.width, bTop - wallMargin); 
        ctx.fillRect(0, bBot + wallMargin, canvas.width, canvas.height - bBot - wallMargin); 
        
        ctx.strokeStyle = '#3d342c'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(0, bTop - wallMargin); ctx.lineTo(canvas.width, bTop - wallMargin); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, bBot + wallMargin); ctx.lineTo(canvas.width, bBot + wallMargin); ctx.stroke();
    }

    let wallL = assetsManager.images['left_wall']; if (wallL && wallL.complete) { ctx.drawImage(wallL, 0, 0, wallMargin, canvas.height); }
    let wallR = assetsManager.images['right_wall']; if (wallR && wallR.complete) { ctx.drawImage(wallR, canvas.width - wallMargin, 0, wallMargin, canvas.height); }
    let wallT = assetsManager.images['back_wall']; if (wallT && wallT.complete) { ctx.drawImage(wallT, 0, bTop - wallMargin, canvas.width, wallMargin); }
    let wallB = assetsManager.images['front_wall']; if (wallB && wallB.complete) { ctx.drawImage(wallB, 0, bBot, canvas.width, wallMargin); }

    bloodStains.forEach(blood => { ctx.fillStyle = 'rgba(100, 0, 0, 0.7)'; ctx.beginPath(); ctx.arc(blood.x + 10, blood.y + 10, blood.r, 0, Math.PI * 2); ctx.fill(); });

    if (currentRoomId === 999) { 
        ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 6; ctx.strokeRect(wallMargin + arenaShrink, wallMargin + arenaShrink, canvas.width - (wallMargin + arenaShrink) * 2, canvas.height - (wallMargin + arenaShrink) * 2);
    }

    if (currentRoomId === 8) {
        let sImg = assetsManager.images['stairs_down']; let sx = canvas.width/2 - 75, sy = canvas.height/2 - 75, sw = 150, sh = 150; 
        ctx.save();
        if (sImg && sImg.complete && sImg.naturalWidth > 0) {
            ctx.drawImage(sImg, sx, sy, sw, sh); if (!worldState.bossDefeated) { ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fillRect(sx, sy, sw, sh); }
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
        let benchX = 400; let benchY = canvas.height - wallMargin - 30; ctx.fillStyle = '#3e2a1d'; ctx.fillRect(benchX, benchY, 200, 20); ctx.fillStyle = '#111'; ctx.fillRect(benchX - 10, benchY - 10, 10, 30); ctx.fillRect(benchX + 200, benchY - 10, 10, 30); ctx.fillStyle = '#4a2f26'; ctx.fillRect(bookshelf.x, bookshelf.y, bookshelf.width, bookshelf.height); ctx.fillStyle = '#2a1a15'; ctx.fillRect(bookshelf.x + 5, bookshelf.y + 30, bookshelf.width - 5, 4); ctx.fillRect(bookshelf.x + 5, bookshelf.y + 70, bookshelf.width - 5, 4); ctx.fillRect(bookshelf.x + 5, bookshelf.y + 110, bookshelf.width - 5, 4); ctx.fillStyle = '#8c1c1c'; ctx.fillRect(bookshelf.x + 10, bookshelf.y + 10, 8, 20); ctx.fillStyle = '#29547d'; ctx.fillRect(bookshelf.x + 20, bookshelf.y + 50, 10, 20);
    }

    currentDoors.forEach(door => {
        let doorImg = null; let isOpen = (worldState && worldState.openedDoors && worldState.openedDoors[door.id]) || false; let stateStr = '_close'; 
        if (isOpen) { stateStr = '_open'; } else if (door.requiresKey && door.locked) { stateStr = '_key'; }
        if (currentRoomId === 8 && !worldState.bossDefeated && door.face === 'south') { stateStr = '_close'; }

        if (door.face === 'north') doorImg = assetsManager.images['back_door' + stateStr]; else if (door.face === 'south') doorImg = assetsManager.images['front_door' + stateStr]; else if (door.face === 'west') doorImg = assetsManager.images['left_door' + stateStr]; else if (door.face === 'east') doorImg = assetsManager.images['right_door' + stateStr];

        if (doorImg && doorImg.complete && doorImg.naturalWidth > 0) { ctx.drawImage(doorImg, door.x, door.y, door.width, door.height); if (currentRoomId === 8 && !worldState.bossDefeated && door.face === 'south') { ctx.fillStyle = 'rgba(192, 57, 43, 0.4)'; ctx.fillRect(door.x, door.y, door.width, door.height); } } 
        else { ctx.fillStyle = isOpen ? '#1a110c' : '#3e2a1d'; ctx.fillRect(door.x, door.y, door.width, door.height); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; if(door.face === 'north' || door.face === 'south') { ctx.strokeRect(door.x + 10, door.y, door.width - 20, door.height); } else { ctx.strokeRect(door.x, door.y + 10, door.width, door.height - 20); } }
    });

    currentItems.forEach(item => {
        if (!item.collected) {
            let floatY = Math.sin(Date.now() / 200) * 3; ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.5)'; 
            if (item.type === 'key') { ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(item.x, item.y + floatY, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(item.x + 6, item.y - 3 + floatY, 18, 6); ctx.fillRect(item.x + 18, item.y + 3 + floatY, 3, 6); } 
            else if (item.type === 'potion_green') { ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.arc(item.x, item.y + 6 + floatY, 10, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(item.x - 5, item.y - 4 + floatY, 10, 12); ctx.fillStyle = '#e67e22'; ctx.fillRect(item.x - 4, item.y - 8 + floatY, 8, 4); } 
            else if (item.type === 'key_skull') { ctx.fillStyle = '#ecf0f1'; ctx.beginPath(); ctx.arc(item.x, item.y + floatY, 10, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#bdc3c7'; ctx.fillRect(item.x - 3, item.y + 10 + floatY, 6, 15); ctx.fillStyle = '#2c3e50'; ctx.fillRect(item.x - 2, item.y + 2 + floatY, 4, 4); } 
            else if (item.type === 'coin') {
                // Rendu 3D de la Pièce d'or
                ctx.translate(item.x, item.y + floatY);
                let scaleX = Math.abs(Math.cos(Date.now() / 200)); ctx.scale(scaleX, 1);
                ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(0, 0, item.size, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#f39c12'; ctx.beginPath(); ctx.arc(0, 0, item.size*0.6, 0, Math.PI*2); ctx.fill();
            }
            ctx.restore();
        }
    });

    hazards.forEach(h => { ctx.fillStyle = 'rgba(192, 57, 43, 0.3)'; ctx.beginPath(); ctx.arc(h.x, h.y, h.radius, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = 'rgba(192, 57, 43, 0.8)'; ctx.beginPath(); ctx.arc(h.x, h.y, h.radius * (1 - h.timer/h.maxTimer), 0, Math.PI*2); ctx.fill(); });

    if (typeof necroSummons !== 'undefined') {
        necroSummons.forEach(s => {
            ctx.save(); ctx.translate(s.x + s.size/2, s.y + s.size/2);
            if (s.type === 'fusion') { if (s.invulnerableTimer && s.invulnerableTimer > 0) { ctx.shadowBlur = 20; ctx.shadowColor = '#f1c40f'; ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, s.size/2 + 8, 0, Math.PI*2); ctx.stroke(); } ctx.fillStyle = '#8e44ad'; ctx.fillRect(-s.size/2, -s.size/2, s.size, s.size); ctx.fillStyle = '#1abc9c'; ctx.beginPath(); ctx.arc(0, 0, s.size/4, 0, Math.PI*2); ctx.fill(); } 
            else { ctx.fillStyle = 'rgba(44, 62, 80, 0.7)'; ctx.beginPath(); ctx.arc(0, 0, s.size/2, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#8e44ad'; ctx.beginPath(); ctx.arc(-s.size/4, -s.size/4, 4, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(s.size/4, -s.size/4, 4, 0, Math.PI*2); ctx.fill(); }
            ctx.shadowBlur = 0; ctx.restore(); ctx.fillStyle = '#111'; ctx.fillRect(s.x, s.y - 10, s.size, 4); ctx.fillStyle = '#8e44ad'; ctx.fillRect(s.x, s.y - 10, s.size * (s.health / s.maxHealth), 4);
        });
    }

    currentEnemies.forEach(enemy => {
        ctx.save(); ctx.translate(enemy.x + enemy.size/2, enemy.y + enemy.size/2);
        let dx = (player.x + player.size/2) - (enemy.x + enemy.size/2); let dy = (player.y + player.size/2) - (enemy.y + enemy.size/2);
        let angleToPlayer = Math.atan2(dy, dx) - (Math.PI / 2); 
        let rot = angleToPlayer + Math.sin(enemy.wobble) * 0.15; let scalePulse = 1 + Math.sin(enemy.wobble * 2) * 0.05;  
        ctx.rotate(rot); ctx.scale(scalePulse, scalePulse); ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 4;

        if (enemy.type === 'troll') { ctx.shadowColor = '#27ae60'; ctx.shadowBlur = 20; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; } else if (enemy.type === 'mage') { ctx.shadowColor = '#9b59b6'; ctx.shadowBlur = 20; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; } else if (enemy.type === 'dragon') { ctx.shadowColor = '#e74c3c'; ctx.shadowBlur = 25; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; }

        let skinName = '';
        if (enemy.type === 'goblin') { if (enemy.blockAnimTimer > 0) skinName = 'goblin_top_block'; else if (enemy.attackAnimTimer > 0) skinName = 'goblin_top_attack'; else skinName = 'goblin_top_view'; } else if (enemy.type === 'skeleton') { if (enemy.attackAnimTimer > 0) skinName = 'Skeleton_top_attack'; else skinName = 'Skeleton_top_view'; } else if (enemy.type === 'spider') skinName = 'spider_top_view'; else if (enemy.type === 'troll') skinName = 'troll_top_view'; else if (enemy.type === 'mage') skinName = 'Burned_top_view'; else if (enemy.type === 'dragon') skinName = 'drake_top_view';

        let img = assetsManager.images[skinName];
        if (!img || !img.complete || img.naturalWidth === 0) { let fallbackName = ''; if (enemy.type === 'goblin') fallbackName = 'goblin_top_view'; else if (enemy.type === 'skeleton') fallbackName = 'Skeleton_top_view'; else fallbackName = skinName; img = assetsManager.images[fallbackName]; }

        if (img && img.complete && img.naturalWidth > 0) {
            let displaySize = enemy.size * 2.5; 
            if (enemy.type === 'mage' || enemy.type === 'spider') { ctx.save(); ctx.beginPath(); ctx.arc(0, 0, displaySize/2.2, 0, Math.PI*2); ctx.clip(); ctx.drawImage(img, -displaySize/2, -displaySize/2, displaySize, displaySize); ctx.restore(); } else { ctx.drawImage(img, -displaySize/2, -displaySize/2, displaySize, displaySize); }
        } else { ctx.shadowColor = 'transparent'; ctx.fillStyle = '#e74c3c'; ctx.fillRect(-enemy.size/2, -enemy.size/2, enemy.size, enemy.size); }
        
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
        
        if (enemy.ultiAnimTimer > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; let imgUlt = assetsManager.images['Ulti_fire_mage']; if (imgUlt && imgUlt.complete && imgUlt.naturalWidth > 0) { let progress = 1 - (enemy.ultiAnimTimer / 30); let expSize = enemy.size * 2 + (enemy.size * 4 * progress); ctx.globalAlpha = enemy.ultiAnimTimer / 30; ctx.rotate(progress * Math.PI); ctx.drawImage(imgUlt, -expSize/2, -expSize/2, expSize, expSize); } ctx.restore(); }
        if (enemy.isBurning) { ctx.fillStyle = 'rgba(230, 126, 34, 0.5)'; ctx.beginPath(); ctx.arc(0, 0, enemy.size/2 + Math.random()*5, 0, Math.PI*2); ctx.fill(); }
        if (enemy.slowTimer > 0 || enemy.isPermanentlySlowed) { ctx.strokeStyle = '#8e44ad'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, enemy.size/2 + 6, 0, Math.PI*2); ctx.stroke(); }
        ctx.restore(); 
        
        if (!['troll', 'mage', 'dragon'].includes(enemy.type)) { ctx.fillStyle = '#111'; ctx.fillRect(enemy.x, enemy.y - 12, enemy.size, 4); ctx.fillStyle = '#e74c3c'; ctx.fillRect(enemy.x, enemy.y - 12, enemy.size * (enemy.health / enemy.maxHealth), 4); } else if (currentRoomId !== 8) { let bossName = enemy.type === 'troll' ? "Troll Corrompu" : (enemy.type === 'mage' ? "Mage Exilé" : "Dragon Maudit"); ctx.fillStyle = '#f1c40f'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center'; ctx.fillText(bossName, enemy.x + enemy.size/2, enemy.y - 25); let barWidth = 100; ctx.fillStyle = '#111'; ctx.fillRect(enemy.x + enemy.size/2 - barWidth/2, enemy.y - 15, barWidth, 8); ctx.fillStyle = '#e74c3c'; ctx.fillRect(enemy.x + enemy.size/2 - barWidth/2 + 1, enemy.y - 14, (barWidth-2) * (Math.max(0, enemy.health) / enemy.maxHealth), 6); ctx.textAlign = 'left'; }
    });

    let boss = currentEnemies.find(e => ['troll', 'mage', 'dragon'].includes(e.type));
    if (boss && currentRoomId === 8 && !worldState.bossDefeated) {
        let bossName = boss.type === 'troll' ? "TROLL CORROMPU" : (boss.type === 'mage' ? "MAGE EXILÉ" : "DRAGON MAUDIT"); let isPhase2 = boss.health <= boss.maxHealth / 2; let barWidth = 600; let barHeight = 24; let bx = canvas.width/2 - barWidth/2; let by = 30; 
        ctx.fillStyle = '#111'; ctx.fillRect(bx, by, barWidth, barHeight); ctx.fillStyle = isPhase2 ? '#8e44ad' : '#e74c3c'; let hpPercent = Math.max(0, boss.health) / boss.maxHealth; ctx.fillRect(bx + 2, by + 2, (barWidth - 4) * hpPercent, barHeight - 4); ctx.fillStyle = isPhase2 ? '#8e44ad' : '#f1c40f'; ctx.font = 'bold 22px Arial'; ctx.textAlign = 'center'; ctx.fillText(bossName + (isPhase2 ? " (ENRAGÉ)" : ""), canvas.width/2, by - 8); ctx.textAlign = 'left';
    }

    projectiles.forEach(p => { 
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.shadowColor = p.isNecro ? '#8e44ad' : (p.isFire ? '#e67e22' : '#ecf0f1'); ctx.shadowBlur = 10;
        if (p.isNecro) { ctx.fillStyle = '#8e44ad'; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.arc(-2, 0, p.size-2, 0, Math.PI*2); ctx.fill(); } 
        else if (p.isFire) { let imgFire = assetsManager.images['Attack_fire_mage']; if (imgFire && imgFire.complete && imgFire.naturalWidth > 0) { ctx.globalCompositeOperation = 'screen'; ctx.rotate(Math.PI / 2); let pSize = p.size * 5; ctx.drawImage(imgFire, -pSize/2, -pSize/2, pSize, pSize); } else { ctx.fillStyle = '#e67e22'; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(-2, 0, p.size-2, 0, Math.PI*2); ctx.fill(); } } 
        else { ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-8, -1, 16, 2); ctx.fillStyle = '#ecf0f1'; ctx.beginPath(); ctx.moveTo(8, -3); ctx.lineTo(14, 0); ctx.lineTo(8, 3); ctx.fill(); ctx.fillStyle = '#34495e'; ctx.beginPath(); ctx.moveTo(-8, -3); ctx.lineTo(-12, -3); ctx.lineTo(-8, 0); ctx.lineTo(-12, 3); ctx.lineTo(-8, 3); ctx.fill(); }
        ctx.restore();
    });
    
    enemyProjectiles.forEach(p => { 
        ctx.save(); ctx.translate(p.x, p.y); let pAngle = Math.atan2(p.vy, p.vx); ctx.shadowColor = p.color; ctx.shadowBlur = 10;
        if (p.type === 'bone') { ctx.rotate(pAngle); ctx.fillStyle = '#ecf0f1'; let l = p.size * 2.5; let w = p.size * 0.4; ctx.fillRect(-l, -w, l * 2, w * 2); ctx.beginPath(); ctx.arc(-l, -w*1.5, w*1.5, 0, Math.PI*2); ctx.arc(-l, w*1.5, w*1.5, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(l, -w*1.5, w*1.5, 0, Math.PI*2); ctx.arc(l, w*1.5, w*1.5, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-l + 2, -w/2, l*2 - 4, w); } 
        else if (p.type === 'bat_web') { ctx.rotate(pAngle); ctx.fillStyle = 'rgba(142, 68, 173, 0.8)'; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(0, -8); ctx.lineTo(-4, -4); ctx.lineTo(-8, -8); ctx.lineTo(-4, 0); ctx.lineTo(-8, 8); ctx.lineTo(-4, 4); ctx.lineTo(0, 8); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#ecf0f1'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0, -8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-8, -8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-8, 8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0, 8); ctx.stroke(); } 
        else if (p.type === 'fire') { let fireImg = assetsManager.images['Attack_fire_mage']; if (fireImg && fireImg.complete && fireImg.naturalWidth > 0) { ctx.rotate(pAngle + Math.PI / 2); ctx.globalCompositeOperation = 'screen'; let dSize = p.size * 5.0; ctx.drawImage(fireImg, -dSize/2, -dSize/2, dSize, dSize); } else { ctx.rotate(pAngle); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill(); } } 
        else { ctx.rotate(pAngle); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
    });

    let drawPlayer = true;
    if (playerInvulnerableTimer > 0 && Math.floor(playerInvulnerableTimer / 5) % 2 === 0) drawPlayer = false; 

    if (drawPlayer) {
        let isElfInvuln = (isUltimateActive && player.heroClass === 'Elf' && !elfStealthBroken);
        if (player.dashTimer > 0) ctx.globalAlpha = 0.5; // Ombre pendant le Dash !
        else if (isElfInvuln) ctx.globalAlpha = 0.4;
        else ctx.globalAlpha = 1.0;
        
        let isMoving = (keys['z'] || keys['w'] || keys['s'] || keys['q'] || keys['a'] || keys['d'] || keys['arrowup'] || keys['arrowdown'] || keys['arrowleft'] || keys['arrowright'] || player.dashTimer > 0);
        let bobbingY = isMoving ? Math.sin(Date.now() / 80) * 4 : Math.sin(Date.now() / 300) * 1.5;
        let tilt = isMoving ? Math.sin(Date.now() / 120) * 0.1 : 0;
        
        if (player.dashTimer > 0) tilt = Math.PI / 8; // On penche le héros pendant le dash !

        ctx.save(); ctx.translate(player.x + player.size / 2, player.y + player.size / 2 + bobbingY); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 5; ctx.shadowOffsetY = 5;

        if (player.dashTimer > 0) { ctx.fillStyle = 'rgba(236, 240, 241, 0.4)'; ctx.beginPath(); ctx.arc(-player.dashVx*2, -player.dashVy*2, player.size/2, 0, Math.PI*2); ctx.fill(); }

        if (player.heroClass === 'Elf') {
            ctx.rotate(tilt); let angle = player.faceAngle; let skin = 'Elf_front'; 
            if (angle > -Math.PI/4 && angle <= Math.PI/4) skin = 'Elf_est'; else if (angle > Math.PI/4 && angle <= 3*Math.PI/4) skin = 'Elf_front'; else if (angle > -3*Math.PI/4 && angle <= -Math.PI/4) skin = 'Elf_back'; else skin = 'Elf_west';                                                     
            let img = assetsManager.images[skin]; let displaySize = player.size * 6.0; 
            if (img && img.complete && img.naturalWidth > 0) { ctx.drawImage(img, -displaySize/2, -displaySize/2, displaySize, displaySize); } else { ctx.rotate(player.faceAngle); ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.arc(0, 0, player.size/2, 0, Math.PI*2); ctx.fill(); }
        } else if (player.heroClass === 'Mage') {
            ctx.rotate(player.faceAngle + tilt - (Math.PI / 2)); let imgMage = assetsManager.images['Burned_top_view']; let displaySize = player.size * 3.5; 
            if (imgMage && imgMage.complete && imgMage.naturalWidth > 0) { ctx.save(); ctx.beginPath(); ctx.arc(0, 0, displaySize/2.2, 0, Math.PI*2); ctx.clip(); ctx.drawImage(imgMage, -displaySize/2, -displaySize/2, displaySize, displaySize); ctx.restore(); } 
            else { ctx.rotate(Math.PI / 2); ctx.fillStyle = playerPoisonTimer > 0 ? '#27ae60' : '#e67e22'; ctx.beginPath(); ctx.arc(0, 0, player.size/2, 0, Math.PI*2); ctx.fill(); }
        } else {
            ctx.rotate(player.faceAngle + tilt); ctx.fillStyle = playerPoisonTimer > 0 ? '#27ae60' : (player.heroClass === 'Necromancer' ? '#34495e' : '#95a5a6'); ctx.beginPath(); ctx.arc(0, 0, player.size/2, 0, Math.PI*2); ctx.fill();
            if (player.heroClass === 'Necromancer') { ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(15, 0); ctx.lineTo(-10, 10); ctx.fill(); ctx.strokeStyle = '#8e44ad'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(5, 0, 15, -Math.PI/2, Math.PI/2); ctx.stroke(); } 
            else if (player.heroClass === 'Knight') { ctx.fillStyle = '#bdc3c7'; ctx.fillRect(-15, -15, 30, 30); ctx.fillStyle = '#2c3e50'; ctx.fillRect(0, -10, 5, 20); ctx.save(); if(isAttacking) { ctx.translate(15, 15); ctx.rotate(Math.PI/4); } else { ctx.translate(5, 20); } ctx.fillStyle = '#f1c40f'; ctx.fillRect(0, -4, 10, 8); ctx.fillStyle = '#ecf0f1'; ctx.fillRect(10, -2, 35, 4); ctx.restore(); if (isAttacking) { ctx.strokeStyle = 'rgba(236, 240, 241, 0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, player.size + 15, -Math.PI/3, Math.PI/3); ctx.stroke(); } }
        }
        ctx.restore(); ctx.globalAlpha = 1.0; 
    }

    particles.forEach(p => { ctx.globalAlpha = p.life; if (p.glow) { ctx.save(); ctx.shadowColor = p.color; ctx.shadowBlur = 10; } ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill(); if (p.glow) ctx.restore(); });
    ctx.globalAlpha = 1.0; 

    // --- COMPTEUR DE PIÈCES DIRECTEMENT SUR LE CANVAS ---
    if (playerStats.inventory.coins !== undefined) {
        ctx.fillStyle = '#f39c12'; ctx.beginPath(); ctx.arc(wallMargin + 30, 35, 16, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(wallMargin + 30, 35, 10, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 24px Arial'; ctx.textAlign = 'left';
        ctx.fillText("x " + playerStats.inventory.coins, wallMargin + 60, 43);
    }

    // ========================================================================
    // --- L'EFFET DE BROUILLARD (VIGNETTE DE LUMIÈRE) ---
    // ========================================================================
    ctx.save();
    let gradient = ctx.createRadialGradient(
        player.x + player.size/2, player.y + player.size/2, 100, 
        player.x + player.size/2, player.y + player.size/2, canvas.width * 0.7 
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');       // Lumière totale au centre
    gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.4)');   // Pénombre
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');     // Noirceur dense dans les coins

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height); // L'ombre couvre tout l'écran
    ctx.restore();

    if (currentRoomId === 999) {
        ctx.fillStyle = '#ecf0f1'; ctx.font = 'bold 28px Arial'; ctx.textAlign = 'center';
        let displayWave = arenaState === "WAITING" ? arenaWave : arenaWave - 1;
        if (arenaState === "WAITING" && arenaTimer > 0) ctx.fillText("VAGUE " + displayWave + " DANS " + Math.ceil(arenaTimer/60) + "S", canvas.width/2, wallMargin + 40);
        else if (displayWave > 0) ctx.fillText("VAGUE " + displayWave, canvas.width/2, wallMargin + 40);
        ctx.textAlign = 'left';
    }

    ctx.restore(); 
}
