// ============================================================================
// js/enemies.js - IA DES ENNEMIS ET APPARITIONS
// ============================================================================

window.spawnEnemy = function(type, count, baseX = null, baseY = null) {
    for (let i = 0; i < count; i++) {
        let ex = baseX; 
        let ey = baseY;
        
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
        else if (type === 'troll') { size = 80; hp = 1500; spd = 3.5; col = '#117a65'; }
        else if (type === 'mage') { size = 60; hp = 900; spd = 2; col = '#9b59b6'; }
        else if (type === 'dragon') { size = 150; hp = 3000; spd = 1.0; col = '#8b0000'; }
        else if (type === 'deathgod') { size = 70; hp = 1000; spd = 4.5; col = '#2c3e50'; }
        else if (type === 'elysia') { size = 70; hp = 1500; spd = 5.0; col = '#e84393'; }
        else if (type === 'armor') { size = 50; hp = 200; spd = 3.0; col = '#7f8c8d'; }

        if (isArenaMode && arenaWave >= 25 && !['spider', 'dragon', 'deathgod', 'elysia', 'armor'].includes(type)) {
            hp += (arenaWave - 24) * 30;
        }

        currentEnemies.push({ 
            x: ex, y: ey, size: size, health: hp, maxHealth: hp, speed: spd, color: col, type: type, 
            shootCooldown: Math.random() * 60 + 60, summonTimer: 180, wobble: Math.random() * Math.PI * 2,
            timeAlive: 0, phase: 1, invulnerable: false, isBurning: false, burnTicks: 0, burnTimer: 0,
            slowTimer: 0, isPermanentlySlowed: false, killedBySummon: false, killedByNecro: false,
            attackAnimTimer: 0, blockAnimTimer: 0, ultiAnimTimer: 0, dashTimer: 180, isDashing: 0,
            burstCount: 0, burstTimer: 0, phaseTimer: 0 
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

    // ========================================================================
    // --- 1. GESTION DES ENNEMIS ---
    // ========================================================================
    currentEnemies.forEach((enemy, idx) => {
        if (enemy.attackAnimTimer === undefined) enemy.attackAnimTimer = 0; 
        if (enemy.blockAnimTimer === undefined) enemy.blockAnimTimer = 0; 
        if (enemy.ultiAnimTimer === undefined) enemy.ultiAnimTimer = 0; 
        if (enemy.shootCooldown === undefined) enemy.shootCooldown = 60;
        
        if (enemy.attackAnimTimer > 0) enemy.attackAnimTimer--; 
        if (enemy.blockAnimTimer > 0) enemy.blockAnimTimer--; 
        if (enemy.ultiAnimTimer > 0) enemy.ultiAnimTimer--; 
        if (enemy.shootCooldown > 0) enemy.shootCooldown--;
        enemy.wobble += 0.1; 
        
        if (enemy.isBurning) {
            if (enemy.burnTimer === undefined) enemy.burnTimer = 0;
            enemy.burnTimer--;
            if (enemy.burnTimer % 60 === 0) { 
                enemy.health -= 10; 
                if (typeof window.spawnParticles === 'function') window.spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, '#e67e22', 15, true);
            }
            if (enemy.burnTimer <= 0) enemy.isBurning = false;
        }

        let minDistToTarget = 9999;
        if (!isElfInvuln) minDistToTarget = Math.hypot(player.x - enemy.x, player.y - enemy.y); 
        let dx = 0; let dy = 0; let dist = minDistToTarget; 
        if (dist !== 9999 && dist > 0) { dx = player.x - enemy.x; dy = player.y - enemy.y; }
        let angleToPlayer = Math.atan2(dy, dx);

        let currentEnemySpeed = enemy.speed; 
        if (enemy.slowTimer > 0 || enemy.isPermanentlySlowed) currentEnemySpeed *= 0.5; 

        // IA BOSS : MAGE
        if (enemy.type === 'mage') {
            if (enemy.phase === 1 && enemy.health <= enemy.maxHealth / 2) {
                enemy.phase = 2; enemy.maxHealth += 300; enemy.health += 300; enemy.speed = 4.0; 
                if (typeof window.triggerShake === 'function') window.triggerShake(10, 20);
            }
            if (enemy.phase === 2 && dist < 200 && dist > 0) { dx = -dx; dy = -dy; }
            if (enemy.summonTimer === undefined) enemy.summonTimer = 0;
            enemy.summonTimer--;
            if (enemy.summonTimer <= 0) {
                window.spawnEnemy('skeleton', 1, enemy.x + 20, enemy.y + 20); window.spawnEnemy('spider', 1, enemy.x - 20, enemy.y - 20);
                enemy.summonTimer = enemy.phase === 2 ? 250 : 400; 
            }
            if (enemy.phase === 2 && enemy.burstCount > 0) {
                if (enemy.burstTimer <= 0 || enemy.burstTimer === undefined) {
                    enemyProjectiles.push({ x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, vx: Math.cos(angleToPlayer)*7, vy: Math.sin(angleToPlayer)*7, size: 8, type: 'fire_mage', color: '#e67e22', damage: 15 });
                    enemy.burstCount--; enemy.burstTimer = 10; enemy.attackAnimTimer = 15;
                } else { enemy.burstTimer--; }
            }
        }
        
        // IA BOSS : DRAGON
        if (enemy.type === 'dragon') {
            if (enemy.phase === 1 && enemy.health <= enemy.maxHealth / 2) {
                enemy.phase = 2; enemy.summonTimer = 60;
                if (typeof window.triggerShake === 'function') window.triggerShake(15, 30);
            }
            if (enemy.phase === 2) {
                if (enemy.summonTimer === undefined) enemy.summonTimer = 0;
                enemy.summonTimer--;
                let hpRatio = Math.max(0.1, enemy.health / (enemy.maxHealth / 2));
                if (enemy.summonTimer <= 0) {
                    let mx = bLeft + Math.random() * (bRight - bLeft);
                    let my = bTop + Math.random() * (bBot - bTop);
                    if (typeof hazards !== 'undefined') {
                        let fallSpeed = Math.max(20, 90 * hpRatio);
                        hazards.push({ x: mx, y: my, radius: 45, timer: fallSpeed, maxTimer: fallSpeed, damage: 30, isDragon: true });
                    }
                    enemy.summonTimer = Math.max(20, 80 * hpRatio); 
                }
            }
        }

        // IA BOSS : TROLL
        if (enemy.type === 'troll') {
            if (enemy.summonTimer === undefined) enemy.summonTimer = 0;
            enemy.summonTimer--;
            if (enemy.summonTimer <= 0) {
                window.spawnEnemy('goblin', 1, enemy.x + 20, enemy.y + 20); 
                enemy.summonTimer = 180; 
            }
            
            if (enemy.trollDashCooldown === undefined) enemy.trollDashCooldown = 600;
            enemy.trollDashCooldown--;
            if (enemy.trollDashCooldown === 30) { enemy.isTelegraphing = 30; }
            if (enemy.trollDashCooldown <= 0) {
                enemy.isDashing = 15; 
                enemy.trollDashCooldown = (enemy.health <= enemy.maxHealth / 2) ? 180 : 600; 
            }
            
            if (enemy.isTelegraphing > 0) {
                enemy.isTelegraphing--; currentEnemySpeed = -1.5; enemy.wobble += 0.5; 
            } else if (enemy.isDashing > 0) { 
                enemy.isDashing--; currentEnemySpeed *= 3.5; 
            }
        }

        // IA BOSS : DEATH GOD
        if (enemy.type === 'deathgod') {
            if (enemy.phase === 1) {
                if (enemy.summonTimer === undefined) enemy.summonTimer = 0;
                enemy.summonTimer--;
                if (enemy.summonTimer <= 0) { window.spawnEnemy('armor', 1, enemy.x + 30, enemy.y + 30); enemy.summonTimer = 300; } 
                
                if (enemy.shootCooldown <= 0 && !isElfInvuln) { enemy.burstCount = 3; enemy.shootCooldown = 60; }
                if (enemy.burstCount > 0) {
                    if (enemy.burstTimer === undefined || enemy.burstTimer <= 0) {
                        enemyProjectiles.push({ x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, vx: Math.cos(angleToPlayer)*7, vy: Math.sin(angleToPlayer)*7, size: 6, type: 'fire_deathgod', color: '#2c3e50', damage: 15 });
                        enemy.burstCount--; enemy.burstTimer = 5; enemy.attackAnimTimer = 15;
                    } else { enemy.burstTimer--; }
                }

                if (enemy.health <= enemy.maxHealth / 2) {
                    enemy.phase = 2; enemy.x = canvas.width/2 - enemy.size/2; enemy.y = canvas.height/2 - enemy.size/2;
                    enemy.invulnerable = true; enemy.speed = 0; enemy.phaseTimer = 240; enemy.summonTimer = 360; enemy.shootCooldown = 60;
                    if(typeof window.triggerShake === 'function') window.triggerShake(15, 30);
                }
            } else if (enemy.phase === 2) {
                currentEnemySpeed = 0;
                enemy.phaseTimer--;
                if (enemy.phaseTimer <= 0) { enemy.health -= (enemy.maxHealth * 0.05); enemy.phaseTimer = 240; } 
                
                enemy.summonTimer--;
                if (enemy.summonTimer <= 0) { window.spawnEnemy('armor', 1, canvas.width/2 + (Math.random()*200-100), canvas.height/2 + (Math.random()*200-100)); enemy.summonTimer = 360; }
                
                if (enemy.shootCooldown <= 0) {
                    for(let i=0; i<8; i++) {
                        let angle = (Math.PI*2 / 8) * i + enemy.wobble;
                        enemyProjectiles.push({ x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, vx: Math.cos(angle)*5, vy: Math.sin(angle)*5, size: 8, type: 'fire_deathgod', color: '#2c3e50', damage: 15 });
                    }
                    enemy.shootCooldown = 40; enemy.attackAnimTimer = 15;
                }
            }
        }

        // IA ARMURE SANS TÊTE
        if (enemy.type === 'armor') {
            if (enemy.dashTimer === undefined) enemy.dashTimer = 180;
            enemy.dashTimer--;
            if (enemy.dashTimer <= 0) { enemy.isDashing = 15; enemy.dashTimer = 180; }
            if (enemy.isDashing > 0) { enemy.isDashing--; currentEnemySpeed *= 3; }
            
            if (enemy.shootCooldown <= 0 && dist < 400 && !isElfInvuln) {
                enemyProjectiles.push({ x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, vx: Math.cos(angleToPlayer)*8, vy: Math.sin(angleToPlayer)*8, size: 15, type: 'armor_sword', color: '#7f8c8d', damage: playerStats.maxHealth * 0.32, lifeTimer: 0 });
                enemy.shootCooldown = 180; enemy.attackAnimTimer = 20;
            }
        }

        // IA ELYSIA
        if (enemy.type === 'elysia') {
            let hpRatio = Math.max(0.1, enemy.health / enemy.maxHealth); 
            if (enemy.phase === 1) {
                if (enemy.dashTimer === undefined) enemy.dashTimer = 150;
                enemy.dashTimer--;
                if(enemy.dashTimer <= 0) { enemy.isDashing = 20; enemy.dashTimer = 150 * hpRatio; }
                if (enemy.isDashing > 0) { enemy.isDashing--; currentEnemySpeed *= 4; }
                
                if (enemy.shootCooldown <= 0) {
                    for(let i=0; i<8; i++) {
                        let angle = (Math.PI*2 / 8) * i;
                        enemyProjectiles.push({ x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, vx: Math.cos(angle)*6, vy: Math.sin(angle)*6, size: 6, type: 'fire_elysia', color: '#e84393', damage: playerStats.maxHealth * 0.34 });
                    }
                    enemy.shootCooldown = 90 * hpRatio; enemy.attackAnimTimer = 15;
                }
                
                if (enemy.health <= enemy.maxHealth / 2) {
                    enemy.phase = 2; enemy.x = canvas.width/2 - enemy.size/2; enemy.y = canvas.height/2 - enemy.size/2;
                    enemy.invulnerable = true; enemy.speed = 0; enemy.phaseTimer = 300; enemy.summonTimer = 60;
                    if(typeof window.triggerShake === 'function') window.triggerShake(20, 40);
                }
            } else if (enemy.phase === 2) {
                currentEnemySpeed = 0;
                enemy.phaseTimer--;
                if (enemy.phaseTimer <= 0) { enemy.health -= (enemy.maxHealth * 0.05); enemy.phaseTimer = 300; } 
                
                if (enemy.shootCooldown <= 0) {
                    for(let i=0; i<12; i++) {
                        let angle = (Math.PI*2 / 12) * i + enemy.wobble*2;
                        enemyProjectiles.push({ x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, vx: Math.cos(angle)*4, vy: Math.sin(angle)*4, size: 8, type: 'fire_elysia', color: '#e84393', damage: playerStats.maxHealth * 0.34 });
                    }
                    enemy.shootCooldown = 60 * hpRatio; enemy.attackAnimTimer = 10;
                }
                
                enemy.summonTimer--;
                if (enemy.summonTimer <= 0) {
                    let mx = bLeft + Math.random()*(bRight - bLeft);
                    let my = bTop + Math.random()*(bBot - bTop);
                    if (typeof hazards !== 'undefined') hazards.push({ x: mx, y: my, radius: 40, timer: 60, maxTimer: 60, damage: playerStats.maxHealth * 0.34, isElysia: true });
                    enemy.summonTimer = 40 * hpRatio; 
                }
            }
        }

        // --- I.A DE TIR CLASSIQUE ---
        let isRanged = ['skeleton', 'mage', 'dragon', 'spider'].includes(enemy.type);
        if (isRanged && dist < 500 && enemy.shootCooldown <= 0 && !isElfInvuln) {
            let pSpeed = 6, pType = 'bone_skeleton', pColor = '#ecf0f1', pSize = 5, pDmg = 10;
            
            if (enemy.type === 'spider') { pType = 'bat_web'; pColor = '#8e44ad'; pSpeed = 4; pSize = 6; pDmg = 5; }
            else if (enemy.type === 'mage') { pType = 'fire_mage'; pColor = '#e67e22'; pSpeed = 7; pSize = 8; pDmg = 15; }
            else if (enemy.type === 'dragon') { pType = 'fire_dragon'; pColor = '#e74c3c'; pSpeed = 8; pSize = 12; pDmg = 25; }

            let angle = Math.atan2(dy, dx);
            
            if (enemy.type === 'dragon') {
                if (enemy.phase === 1) {
                    enemyProjectiles.push({ x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, vx: Math.cos(angle - 0.2) * pSpeed, vy: Math.sin(angle - 0.2) * pSpeed, size: pSize, type: pType, color: pColor, damage: pDmg });
                    enemyProjectiles.push({ x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, vx: Math.cos(angle) * pSpeed, vy: Math.sin(angle) * pSpeed, size: pSize * 1.2, type: pType, color: pColor, damage: pDmg + 10 });
                    enemyProjectiles.push({ x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, vx: Math.cos(angle + 0.2) * pSpeed, vy: Math.sin(angle + 0.2) * pSpeed, size: pSize, type: pType, color: pColor, damage: pDmg });
                }
            } else if (enemy.type === 'mage' && enemy.phase === 2) {
                enemy.burstCount = 2; enemy.shootCooldown = 40; 
            } else if (enemy.type !== 'dragon') {
                enemyProjectiles.push({ x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, vx: Math.cos(angle) * pSpeed, vy: Math.sin(angle) * pSpeed, size: pSize, type: pType, color: pColor, damage: pDmg });
                enemy.shootCooldown = (enemy.type === 'mage') ? 120 : 150;
                enemy.attackAnimTimer = 30; 
            }
        }
        
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

        let isBoss = ['troll', 'mage', 'dragon', 'deathgod', 'elysia'].includes(enemy.type);

        let oldEx = enemy.x; enemy.x += dx_mov; 
        if (currentRoomId === 8 && !isBoss && window.checkCollision(enemy, centerStairs)) enemy.x = oldEx;
        for (let c = 0; c < currentCrates.length; c++) { let obj = currentCrates[c]; if (!obj.isBroken && window.checkCollision(enemy, obj)) { enemy.x = oldEx; break; } }
        
        let oldEy = enemy.y; enemy.y += dy_mov; 
        if (currentRoomId === 8 && !isBoss && window.checkCollision(enemy, centerStairs)) enemy.y = oldEy;
        for (let c = 0; c < currentCrates.length; c++) { let obj = currentCrates[c]; if (!obj.isBroken && window.checkCollision(enemy, obj)) { enemy.y = oldEy; break; } }

        if (currentRoomId === 8 && !worldState.bossDefeated && isBoss) {
            let sCX = canvas.width / 2; let sCY = canvas.height / 2;
            let dXStair = (enemy.x + enemy.size/2) - sCX; let dYStair = (enemy.y + enemy.size/2) - sCY;
            let distToStairs = Math.hypot(dXStair, dYStair); let minStairDist = 75 + enemy.size/2 + 5; 
            if (distToStairs < minStairDist && distToStairs > 0) {
                let overlap = minStairDist - distToStairs;
                enemy.x += (dXStair / distToStairs) * overlap; enemy.y += (dYStair / distToStairs) * overlap;
            }
        }

        let eMaxX = bRight - arenaShrink - enemy.size; 
        let eMaxY = bBot - arenaShrink - enemy.size;
        if (enemy.x < minLimitX) enemy.x = minLimitX; if (enemy.y < minLimitY) enemy.y = minLimitY; 
        if (enemy.x > eMaxX) enemy.x = eMaxX; if (enemy.y > eMaxY) enemy.y = eMaxY;

        if (playerInvulnerableTimer <= 0 && !enemy.invulnerable && window.checkCollision(player, enemy)) {
            let dmg = 20;
            if (enemy.type === 'armor') dmg = playerStats.maxHealth * 0.32;
            else if (enemy.type === 'elysia') dmg = playerStats.maxHealth * 0.34;
            else if (enemy.type === 'deathgod') dmg = playerStats.maxHealth * 0.25;
            
            playerStats.health -= dmg; 
            if (typeof window.triggerShake === 'function') window.triggerShake(12, 20); 
            enemy.attackAnimTimer = 30;
            
            let randHit = Math.floor(Math.random() * 3) + 1;
            let maxLife = (currentRoomId === 999) ? 1200 : 3600;
            bloodStains.push({
                type: 'hit', imgId: 'bloods_hit_view' + randHit, x: player.x + player.size/2, y: player.y + player.size/2,
                size: player.size * 1.5, rotation: Math.random() * Math.PI * 2, life: maxLife
            });
            
            playerInvulnerableTimer = 60; 
            if (typeof window.updateHUD === 'function') window.updateHUD(); 
            if (playerStats.health <= 0 && typeof window.handlePlayerDeath === 'function') window.handlePlayerDeath();
        }
    });

    // ========================================================================
    // --- 2. GESTION DES INVOCATIONS DU NECROMANCIEN (I.A. ALLIÉE) ---
    // ========================================================================
    if (typeof necroSummons !== 'undefined') {
        for (let i = necroSummons.length - 1; i >= 0; i--) {
            let summon = necroSummons[i];
            if (summon.attackCooldown === undefined) summon.attackCooldown = 0;
            if (summon.attackAnimTimer === undefined) summon.attackAnimTimer = 0;
            
            if (summon.attackCooldown > 0) summon.attackCooldown--;
            if (summon.attackAnimTimer > 0) summon.attackAnimTimer--;
            
            // CIBLAGE DU MONSTRE LE PLUS PROCHE
            let nearestEnemy = null;
            let minDist = 9999;
            currentEnemies.forEach(e => {
                if (!e.invulnerable) {
                    let d = Math.hypot((e.x + e.size/2) - (summon.x + summon.size/2), (e.y + e.size/2) - (summon.y + summon.size/2));
                    if (d < minDist) { minDist = d; nearestEnemy = e; }
                }
            });

            if (nearestEnemy) {
                let dx = (nearestEnemy.x + nearestEnemy.size/2) - (summon.x + summon.size/2);
                let dy = (nearestEnemy.y + nearestEnemy.size/2) - (summon.y + summon.size/2);
                let angle = Math.atan2(dy, dx);
                summon.faceAngle = angle;

                // DÉPLACEMENT
                if (minDist > 150) {
                    summon.x += Math.cos(angle) * summon.speed;
                    summon.y += Math.sin(angle) * summon.speed;
                }

                // ATTAQUE
                if (summon.attackCooldown <= 0 && minDist < 350) {
                    if (summon.type === 'fusion') {
                        projectiles.push({ x: summon.x + summon.size/2, y: summon.y + summon.size/2, vx: Math.cos(angle)*8, vy: Math.sin(angle)*8, size: 12, hitTargets: [], angle: angle, type: 'fire_necromancien' });
                        summon.attackCooldown = 45;
                    } else {
                        projectiles.push({ x: summon.x + summon.size/2, y: summon.y + summon.size/2, vx: Math.cos(angle)*6, vy: Math.sin(angle)*6, size: 6, hitTargets: [], angle: angle, type: 'fire_necromancien' });
                        summon.attackCooldown = 60;
                    }
                    summon.attackAnimTimer = 20;
                }
            }
        }
    }

    // ========================================================================
    // --- 3. MORT DES ENNEMIS ET SANG ---
    // ========================================================================
    for (let i = currentEnemies.length - 1; i >= 0; i--) {
        if (currentEnemies[i].health <= 0) {
            let e = currentEnemies[i];
            
            // Le Nécromancien capture l'âme
            if (player.heroClass === 'Necromancer') { necroKills.push(e.type); }

            if (['troll', 'deathgod', 'elysia'].includes(e.type) && currentRoomId === 8 && !worldState.bossDefeated) { 
                worldState.bossDefeated = true; 
                currentItems.push({ id: 'boss_key', type: 'key_skull', x: canvas.width/2 - 10, y: canvas.height/2 + 80, size: 20, collected: false }); 
                if (typeof window.triggerShake === 'function') window.triggerShake(20, 30); 
            }
            
            if (Math.random() < 0.3 && !['troll', 'mage', 'dragon', 'deathgod', 'elysia', 'armor'].includes(e.type)) { 
                currentItems.push({ id: 'coin_en_' + Date.now() + i, type: 'coin', x: e.x + e.size/2, y: e.y + e.size/2, size: 8, collected: false }); 
            }
            
            let killNum = Math.floor(Math.random() * 3) + 1;
            let imgPrefix = e.type === 'skeleton' ? 'skeleton_kill_view' : 'bloods_kill_view';
            let maxLife = (currentRoomId === 999) ? 1200 : 3600;
            let killSize = e.type === 'skeleton' ? (e.size * 2.5) / 3 : e.size * 2.5; 
            
            bloodStains.push({
                type: 'kill', imgId: imgPrefix + killNum, x: e.x + e.size/2, y: e.y + e.size/2,
                size: killSize, rotation: Math.random() * Math.PI * 2, life: maxLife
            });
            
            playerStats.mana = Math.min(100, playerStats.mana + 5); 
            
            currentEnemies.splice(i, 1);
            if (currentEnemies.length === 0 && currentRoomId !== 999) {
                worldState.clearedRooms[currentRoomId] = true;
            }
            if (typeof window.updateHUD === 'function') window.updateHUD();
        }
    }
};
