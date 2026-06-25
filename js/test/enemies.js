// ============================================================================
// js/enemies.js - IA DES ENNEMIS ET APPARITIONS
// ============================================================================

window.spawnEnemy = function(type, count, baseX = null, baseY = null) {
    for (let i = 0; i < count; i++) {
        let ex = baseX; let ey = baseY;
        
        if (ex === null || ey === null) {
            let minSpawnX = wallMargin + arenaShrink;
            let maxSpawnX = canvas.width - wallMargin - arenaShrink - 40;
            let minSpawnY = wallMargin + arenaShrink;
            let maxSpawnY = canvas.height - wallMargin - arenaShrink - 40;

            if (arenaWave >= 41) {
                let side = Math.floor(Math.random() * 4);
                if (side === 0) { ex = minSpawnX; ey = minSpawnY + Math.random() * (maxSpawnY - minSpawnY); }
                else if (side === 1) { ex = maxSpawnX; ey = minSpawnY + Math.random() * (maxSpawnY - minSpawnY); } 
                else if (side === 2) { ex = minSpawnX + Math.random() * (maxSpawnX - minSpawnX); ey = minSpawnY; } 
                else { ex = minSpawnX + Math.random() * (maxSpawnX - minSpawnX); ey = maxSpawnY; } 
            } else {
                let side = Math.floor(Math.random() * 2);
                if (side === 0) { ex = minSpawnX; ey = minSpawnY + Math.random() * (maxSpawnY - minSpawnY); } 
                else { ex = maxSpawnX; ey = minSpawnY + Math.random() * (maxSpawnY - minSpawnY); } 
            }
        }
        
        let size = 40, hp = 90, spd = 3.5, col = '#27ae60';
        if (type === 'skeleton') { hp = 50; spd = 2; col = '#bdc3c7'; }
        else if (type === 'spider') { size = 30; hp = 1; spd = 7; col = '#8e44ad'; }
        else if (type === 'troll') { size = 80; hp = 900; spd = 2.5; col = '#117a65'; }
        else if (type === 'mage') { size = 60; hp = 900; spd = 2; col = '#9b59b6'; }
        else if (type === 'dragon') { size = 150; hp = 3000; spd = 1.0; col = '#8b0000'; }

        if (isArenaMode && arenaWave >= 25 && type !== 'spider' && type !== 'dragon') {
            hp += (arenaWave - 24) * 30;
        }

        currentEnemies.push({ 
            x: ex, y: ey, size: size, health: hp, maxHealth: hp, 
            speed: spd, color: col, type: type, shootCooldown: 0, summonTimer: 180,
            wobble: Math.random() * Math.PI * 2,
            timeAlive: 0, phase: 1, invulnerable: false,
            isBurning: false, burnTicks: 0, burnTimer: 0,
            slowTimer: 0, isPermanentlySlowed: false, 
            killedBySummon: false, killedByNecro: false,
            attackAnimTimer: 0, blockAnimTimer: 0, ultiAnimTimer: 0, dashTimer: 180, isDashing: 0
        });
    }
    window.spawnEnemy = function(type, count, baseX = null, baseY = null) {
    for (let i = 0; i < count; i++) {
        let ex = baseX, ey = baseY;
        if (ex === null || ey === null) {
            let isVertCorridor = (currentRoomId === 5 || currentRoomId === 6);
            let bLeft = isVertCorridor ? 350 : wallMargin;
            let bRight = isVertCorridor ? canvas.width - 350 : canvas.width - wallMargin;
            let minSpawnX = bLeft + arenaShrink, maxSpawnX = bRight - arenaShrink - 40;
            let minSpawnY = wallMargin + arenaShrink, maxSpawnY = canvas.height - wallMargin - arenaShrink - 40;
            ex = minSpawnX + Math.random() * (maxSpawnX - minSpawnX);
            ey = minSpawnY + Math.random() * (maxSpawnY - minSpawnY);
        }
        
        let size = 40, hp = 90, spd = 3.5, col = '#27ae60';
        if (type === 'skeleton') { hp = 50; spd = 2; col = '#bdc3c7'; }
        else if (type === 'spider') { size = 30; hp = 1; spd = 7; col = '#8e44ad'; }
        else if (type === 'troll') { size = 80; hp = 900; spd = 2.5; col = '#117a65'; }
        else if (type === 'mage') { size = 60; hp = 900; spd = 2; col = '#9b59b6'; }
        else if (type === 'dragon') { size = 150; hp = 3000; spd = 1.0; col = '#8b0000'; }

        if (isArenaMode && arenaWave >= 25 && type !== 'spider' && type !== 'dragon') hp += (arenaWave - 24) * 30;

        currentEnemies.push({ 
            x: ex, y: ey, size: size, health: hp, maxHealth: hp, speed: spd, color: col, type: type, 
            shootCooldown: 0, summonTimer: 300, wobble: Math.random() * Math.PI * 2,
            phase: 1, invulnerable: false, isBurning: false, burnTicks: 0, burnTimer: 0,
            attackAnimTimer: 0, blockAnimTimer: 0, ultiAnimTimer: 0, dashTimer: 180, isDashing: 0
        });
    }
};

window.updateEnemies = function() {
    currentEnemies.forEach((enemy) => {
        // --- LOGIQUE BOSS TROLL ---
        if (enemy.type === 'troll') {
            if (enemy.health < enemy.maxHealth / 2) {
                enemy.speed = 5.5; // Accélère en phase 2
                if (Math.random() < 0.01) { /* Dash Troll */ enemy.isDashing = 30; enemy.dashVx = (player.x - enemy.x) * 0.1; enemy.dashVy = (player.y - enemy.y) * 0.1; }
            }
        }
        // --- LOGIQUE BOSS MAGE ---
        if (enemy.type === 'mage') {
            enemy.summonTimer--;
            if (enemy.summonTimer <= 0) { spawnEnemy('skeleton', 2, enemy.x, enemy.y); enemy.summonTimer = 400; }
            if (enemy.health < enemy.maxHealth / 2) enemy.shootCooldown -= 1; // Attaque 2x plus vite
            if (enemy.shootCooldown <= 0) {
                let ang = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                enemyProjectiles.push({ type: 'fire', x: enemy.x, y: enemy.y, vx: Math.cos(ang)*8, vy: Math.sin(ang)*8, size: 12, damage: 25, color: '#e74c3c' });
                enemy.shootCooldown = 60;
            }
        }
        // --- LOGIQUE BOSS DRAGON ---
        if (enemy.type === 'dragon') {
            if (enemy.health < enemy.maxHealth / 2 && enemy.phase === 1) {
                enemy.phase = 2; enemy.invulnerable = true;
                setTimeout(() => { enemy.invulnerable = false; }, 30000);
            }
            if (enemy.invulnerable) {
                if (Math.random() < 0.05) hazards.push({ x: player.x, y: player.y, radius: 50, timer: 60, maxTimer: 60, damage: 30 });
            } else {
                if (Math.random() < 0.02) { // 5 boules de feu
                    for(let i=-2; i<=2; i++) {
                        let ang = Math.atan2(player.y - enemy.y, player.x - enemy.x) + (i * 0.2);
                        enemyProjectiles.push({ type: 'fire', x: enemy.x, y: enemy.y, vx: Math.cos(ang)*7, vy: Math.sin(ang)*7, size: 15, damage: 20, color: '#e74c3c' });
                    }
                }
            }
        }
        // Déplacement générique
        let dx = player.x - enemy.x, dy = player.y - enemy.y, dist = Math.hypot(dx, dy);
        if (dist > 0 && enemy.isDashing <= 0) { enemy.x += (dx/dist) * enemy.speed; enemy.y += (dy/dist) * enemy.speed; }
        else if (enemy.isDashing > 0) { enemy.x += enemy.dashVx; enemy.y += enemy.dashVy; enemy.isDashing--; }
    });
};

window.updateEnemies = function() {
    let bTop = (currentRoomId === 2 || currentRoomId === 3) ? 250 : wallMargin; 
    let bBot = (currentRoomId === 2 || currentRoomId === 3) ? 550 : canvas.height - wallMargin;
    let minLimitX = wallMargin + arenaShrink; 
    let minLimitY = bTop + arenaShrink;
    let centerStairs = { x: canvas.width/2 - 75, y: canvas.height/2 - 75, width: 150, height: 150 };
    let isElfInvuln = (isUltimateActive && player.heroClass === 'Elf' && !elfStealthBroken);

    currentEnemies.forEach((enemy) => {
        if (enemy.attackAnimTimer === undefined) enemy.attackAnimTimer = 0; 
        if (enemy.blockAnimTimer === undefined) enemy.blockAnimTimer = 0; 
        if (enemy.ultiAnimTimer === undefined) enemy.ultiAnimTimer = 0; 
        if (enemy.dashTimer === undefined) { enemy.dashTimer = 180; enemy.isDashing = 0; }
        
        if (enemy.attackAnimTimer > 0) enemy.attackAnimTimer--; 
        if (enemy.blockAnimTimer > 0) enemy.blockAnimTimer--; 
        if (enemy.ultiAnimTimer > 0) enemy.ultiAnimTimer--; 
        enemy.wobble += 0.1; 

        let minDistToTarget = 9999;
        if (!isElfInvuln) minDistToTarget = Math.hypot(player.x - enemy.x, player.y - enemy.y); 
        
        let dx = 0, dy = 0, dist = minDistToTarget; 
        if (dist !== 9999 && dist > 0) { dx = player.x - enemy.x; dy = player.y - enemy.y; }

        let currentEnemySpeed = enemy.speed; 
        if (enemy.slowTimer > 0 || enemy.isPermanentlySlowed) currentEnemySpeed *= 0.5; 
        
        let dx_mov = 0, dy_mov = 0; 
        if (dist > 0 && dist < 9999) { dx_mov = (dx / dist) * currentEnemySpeed; dy_mov = (dy / dist) * currentEnemySpeed; }

        let oldEx = enemy.x; enemy.x += dx_mov; 
        if (currentRoomId === 8 && window.checkCollision(enemy, centerStairs)) enemy.x = oldEx;
        for (let c = 0; c < currentCrates.length; c++) { let obj = currentCrates[c]; if (!obj.isBroken && window.checkCollision(enemy, obj)) { enemy.x = oldEx; break; } }
        
        let oldEy = enemy.y; enemy.y += dy_mov; 
        if (currentRoomId === 8 && window.checkCollision(enemy, centerStairs)) enemy.y = oldEy;
        for (let c = 0; c < currentCrates.length; c++) { let obj = currentCrates[c]; if (!obj.isBroken && window.checkCollision(enemy, obj)) { enemy.y = oldEy; break; } }

        let eMaxX = canvas.width - wallMargin - arenaShrink - enemy.size; 
        let eMaxY = bBot - arenaShrink - enemy.size;
        if (enemy.x < minLimitX) enemy.x = minLimitX; if (enemy.y < minLimitY) enemy.y = minLimitY; 
        if (enemy.x > eMaxX) enemy.x = eMaxX; if (enemy.y > eMaxY) enemy.y = eMaxY;

        // Dégâts au Joueur
        if (playerInvulnerableTimer <= 0 && !enemy.invulnerable && window.checkCollision(player, enemy)) {
            playerStats.health -= 20; 
            if (typeof window.triggerShake === 'function') window.triggerShake(12, 20); 
            if (typeof window.spawnParticles === 'function') window.spawnParticles(player.x + player.size/2, player.y + player.size/2, '#e74c3c', 25);
            playerInvulnerableTimer = 60; 
            if (typeof window.updateHUD === 'function') window.updateHUD(); 
            if (playerStats.health <= 0 && typeof window.handlePlayerDeath === 'function') window.handlePlayerDeath();
        }
    });

    for (let i = currentEnemies.length - 1; i >= 0; i--) {
        if (currentEnemies[i].health <= 0) {
            let e = currentEnemies[i];
            
            // LA COLLECTE D'ÂMES !
            if (player.heroClass === 'Necromancer') {
                necroKills.push(e.type); 
            }

            if (e.type === 'troll' && currentRoomId === 8 && !worldState.bossDefeated) { 
                worldState.bossDefeated = true; 
                currentItems.push({ id: 'boss_key', type: 'key_skull', x: canvas.width/2 - 10, y: canvas.height/2 + 80, size: 20, collected: false }); 
                if (typeof window.triggerShake === 'function') window.triggerShake(20, 30); 
            }
            
            if (Math.random() < 0.3 && !['troll', 'mage', 'dragon'].includes(e.type)) { 
                currentItems.push({ id: 'coin_en_' + Date.now() + i, type: 'coin', x: e.x + e.size/2, y: e.y + e.size/2, size: 8, collected: false }); 
            }
            
            playerStats.mana = Math.min(100, playerStats.mana + 5); 
            if (typeof window.spawnParticles === 'function') window.spawnParticles(e.x + e.size/2, e.y + e.size/2, '#c0392b', 30); 
            
            currentEnemies.splice(i, 1);
            if (currentEnemies.length === 0 && currentRoomId !== 999) {
                worldState.clearedRooms[currentRoomId] = true;
            }
            if (typeof window.updateHUD === 'function') window.updateHUD();
        }
    }
};
