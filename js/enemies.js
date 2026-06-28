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
};

window.updateEnemies = function() {
    let isVertCorridor = (currentRoomId === 5 || currentRoomId === 6);
    let bLeft = isVertCorridor ? 350 : wallMargin;
    let bRight = isVertCorridor ? canvas.width - 350 : canvas.width - wallMargin;
    let bTop = wallMargin; 
    let bBot = canvas.height - wallMargin;
    
    let minLimitX = bLeft + arenaShrink; 
    let minLimitY = bTop + arenaShrink;
    let centerStairs = { x: canvas.width/2 - 75, y: canvas.height/2 - 75, width: 150, height: 150 };
    let isElfInvuln = (isUltimateActive && player.heroClass === 'Elf' && !elfStealthBroken);

    currentEnemies.forEach((enemy, idx) => {
        if (enemy.attackAnimTimer === undefined) enemy.attackAnimTimer = 0; 
        if (enemy.blockAnimTimer === undefined) enemy.blockAnimTimer = 0; 
        if (enemy.ultiAnimTimer === undefined) enemy.ultiAnimTimer = 0; 
        if (enemy.dashTimer === undefined) { enemy.dashTimer = 180; enemy.isDashing = 0; }
        
        if (enemy.attackAnimTimer > 0) enemy.attackAnimTimer--; 
        if (enemy.blockAnimTimer > 0) enemy.blockAnimTimer--; 
        if (enemy.ultiAnimTimer > 0) enemy.ultiAnimTimer--; 
        enemy.wobble += 0.1; 
        
        // --- CORRECTION : APPLICATION DES DÉGÂTS DU DO T DE BRÛLURE MAGE ---
        if (enemy.isBurning) {
            if (enemy.burnTimer === undefined) enemy.burnTimer = 0;
            enemy.burnTimer--;
            if (enemy.burnTimer % 20 === 0) { // S'applique 3 fois par seconde
                enemy.health -= 12; // Les PV baissent !
                if (typeof window.spawnParticles === 'function') window.spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, '#e67e22', 4);
            }
            if (enemy.burnTimer <= 0) enemy.isBurning = false;
        }

        if (enemy.summonTimer === undefined) enemy.summonTimer = 0;
        if (enemy.type === 'troll') {
            enemy.summonTimer--;
            if (enemy.summonTimer <= 0) {
                window.spawnEnemy('goblin', 2, enemy.x + 20, enemy.y + 20);
                enemy.summonTimer = 300; 
            }
        }
        if (enemy.type === 'mage') {
            enemy.summonTimer--;
            if (enemy.summonTimer <= 0) {
                window.spawnEnemy('skeleton', 1, enemy.x + 20, enemy.y + 20);
                window.spawnEnemy('spider', 1, enemy.x - 20, enemy.y - 20);
                enemy.summonTimer = 400; 
            }
        }

        let minDistToTarget = 9999;
        if (!isElfInvuln) minDistToTarget = Math.hypot(player.x - enemy.x, player.y - enemy.y); 
        
        let dx = 0, dy = 0, dist = minDistToTarget; 
        if (dist !== 9999 && dist > 0) { dx = player.x - enemy.x; dy = player.y - enemy.y; }

        let currentEnemySpeed = enemy.speed; 
        if (enemy.slowTimer > 0 || enemy.isPermanentlySlowed) currentEnemySpeed *= 0.5; 
        
        let dx_mov = 0, dy_mov = 0; 
        if (dist > 0 && dist < 9999) { dx_mov = (dx / dist) * currentEnemySpeed; dy_mov = (dy / dist) * currentEnemySpeed; }

        let repulseX = 0, repulseY = 0;
        currentEnemies.forEach((otherEnemy, otherIdx) => {
            if (idx !== otherIdx) {
                let diffX = enemy.x - otherEnemy.x; let diffY = enemy.y - otherEnemy.y;
                if (Math.abs(diffX) < 60 && Math.abs(diffY) < 60) {
                    let distSq = diffX*diffX + diffY*diffY;
                    let minDistSq = ((enemy.size + otherEnemy.size) * 0.4) ** 2;
                    if (distSq < minDistSq && distSq > 0) {
                        let repDist = Math.sqrt(distSq);
                        repulseX += (diffX / repDist) * 1.5; repulseY += (diffY / repDist) * 1.5;
                    }
                }
            }
        });
        dx_mov += repulseX; dy_mov += repulseY;

        let isBoss = ['troll', 'mage', 'dragon'].includes(enemy.type);

        let oldEx = enemy.x; enemy.x += dx_mov; 
        if (currentRoomId === 8 && !isBoss && window.checkCollision(enemy, centerStairs)) enemy.x = oldEx;
        for (let c = 0; c < currentCrates.length; c++) { let obj = currentCrates[c]; if (!obj.isBroken && window.checkCollision(enemy, obj)) { enemy.x = oldEx; break; } }
        
        let oldEy = enemy.y; enemy.y += dy_mov; 
        if (currentRoomId === 8 && !isBoss && window.checkCollision(enemy, centerStairs)) enemy.y = oldEy;
        for (let c = 0; c < currentCrates.length; c++) { let obj = currentCrates[c]; if (!obj.isBroken && window.checkCollision(enemy, obj)) { enemy.y = oldEy; break; } }

        let eMaxX = bRight - arenaShrink - enemy.size; 
        let eMaxY = bBot - arenaShrink - enemy.size;
        if (enemy.x < minLimitX) enemy.x = minLimitX; if (enemy.y < minLimitY) enemy.y = minLimitY; 
        if (enemy.x > eMaxX) enemy.x = eMaxX; if (enemy.y > eMaxY) enemy.y = eMaxY;

        if (playerInvulnerableTimer <= 0 && !enemy.invulnerable && window.checkCollision(player, enemy)) {
            playerStats.health -= 20; 
            if (typeof window.triggerShake === 'function') window.triggerShake(12, 20); 
            
            for(let b = 0; b < 3; b++) {
                bloodStains.push({ x: player.x + player.size/2 + Math.random() * 20 - 10, y: player.y + player.size/2 + Math.random() * 20 - 10, r: Math.random() * 8 + 4 });
            }
            
            playerInvulnerableTimer = 60; 
            if (typeof window.updateHUD === 'function') window.updateHUD(); 
            if (playerStats.health <= 0 && typeof window.handlePlayerDeath === 'function') window.handlePlayerDeath();
        }
    });

    for (let i = currentEnemies.length - 1; i >= 0; i--) {
        if (currentEnemies[i].health <= 0) {
            let e = currentEnemies[i];
            
            if (player.heroClass === 'Necromancer') { necroKills.push(e.type); }

            if (e.type === 'troll' && currentRoomId === 8 && !worldState.bossDefeated) { 
                worldState.bossDefeated = true; 
                currentItems.push({ id: 'boss_key', type: 'key_skull', x: canvas.width/2 - 10, y: canvas.height/2 + 80, size: 20, collected: false }); 
                if (typeof window.triggerShake === 'function') window.triggerShake(20, 30); 
            }
            
            if (Math.random() < 0.3 && !['troll', 'mage', 'dragon'].includes(e.type)) { 
                currentItems.push({ id: 'coin_en_' + Date.now() + i, type: 'coin', x: e.x + e.size/2, y: e.y + e.size/2, size: 8, collected: false }); 
            }
            
            for(let b = 0; b < 5; b++) {
                bloodStains.push({ x: e.x + e.size/2 + Math.random() * 30 - 15, y: e.y + e.size/2 + Math.random() * 30 - 15, r: Math.random() * 12 + 4 });
            }
            
            playerStats.mana = Math.min(100, playerStats.mana + 5); 
            
            currentEnemies.splice(i, 1);
            if (currentEnemies.length === 0 && currentRoomId !== 999) {
                worldState.clearedRooms[currentRoomId] = true;
            }
            if (typeof window.updateHUD === 'function') window.updateHUD();
        }
    }
};
