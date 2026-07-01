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
        
        // --- ANCIENS MOBS ---
        if (type === 'skeleton') { hp = 50; spd = 2; col = '#bdc3c7'; }
        else if (type === 'spider') { size = 30; hp = 1; spd = 7; col = '#8e44ad'; }
        else if (type === 'troll') { size = 80; hp = 1000; spd = 3.5; col = '#117a65'; }
        else if (type === 'mage') { size = 60; hp = 900; spd = 2; col = '#9b59b6'; }
        else if (type === 'dragon') { size = 150; hp = 3000; spd = 1.0; col = '#8b0000'; }
        else if (type === 'deathgod') { size = 70; hp = 1000; spd = 4.5; col = '#2c3e50'; }
        else if (type === 'elysia') { size = 70; hp = 1500; spd = 5.0; col = '#e84393'; }
        else if (type === 'armor') { size = 50; hp = 200; spd = 3.0; col = '#7f8c8d'; }
        
        // --- NOUVEAUX MOBS ---
        else if (type === 'golem') { size = 50; hp = 100; spd = 1.5; col = '#7f8c8d'; }
        else if (type === 'small_golem') { size = 30; hp = 40; spd = 2.5; col = '#bdc3c7'; }
        else if (type === 'orc') { size = 50; hp = 200; spd = 4.2; col = '#2ecc71'; }
        else if (type === 'wolf') { size = 35; hp = 15; spd = 7.5; col = '#95a5a6'; } // One shot et très rapide
        else if (type === 'minotaure') { size = 60; hp = 300; spd = 3.5; col = '#e67e22'; }
        else if (type === 'gargouille') { size = 60; hp = 300; spd = 5.0; col = '#34495e'; }

        if (isArenaMode && arenaWave >= 25 && !['spider', 'wolf', 'dragon', 'deathgod', 'elysia', 'armor'].includes(type)) {
            hp += (arenaWave - 24) * 30;
        }

        // Gargouille Mouvement Fixe (Diagonale vers la gauche)
        let vx = 0, vy = 0;
        if (type === 'gargouille') {
            vx = -3 - Math.random() * 2; // Va vers la gauche obligatoirement
            vy = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2); // Rebond diagonal
        }

        currentEnemies.push({ 
            x: ex, y: ey, vx: vx, vy: vy, size: size, health: hp, maxHealth: hp, speed: spd, color: col, type: type, 
            shootCooldown: Math.random() * 60 + 60, summonTimer: 180, wobble: Math.random() * Math.PI * 2,
            timeAlive: 0, phase: 1, invulnerable: false, isBurning: false, burnTimer: 0,
            slowTimer: 0, isPermanentlySlowed: false, killedBySummon: false, killedByNecro: false,
            attackAnimTimer: 0, blockAnimTimer: 0, ultiAnimTimer: 0, dashTimer: 180, isDashing: 0,
            burstCount: 0, burstTimer: 0, phaseTimer: 0 
        });
    }
};

window.updateEnemies = function() {
    let shrink = typeof arenaShrink !== 'undefined' ? arenaShrink : 0;
    
    let isVertCorridor = (currentRoomId === 5 || currentRoomId === 6);
    let bLeft = isVertCorridor ? 350 : wallMargin;
    let bRight = isVertCorridor ? canvas.width - 350 : canvas.width - wallMargin;
    let bTop = wallMargin; 
    let bBot = canvas.height - wallMargin;

    let minLimitX = bLeft + shrink; 
    let minLimitY = bTop + shrink;
    
    let centerStairs = { x: canvas.width/2 - 75, y: canvas.height/2 - 75, width: 150, height: 150 };
    
    let fusionAggro = null;
    if (typeof necroSummons !== 'undefined') {
        fusionAggro = necroSummons.find(s => s.type === 'fusion');
    }
    
    let targetObj = fusionAggro ? fusionAggro : player;
    let isElfInvuln = (isUltimateActive && player.heroClass === 'Elf' && !elfStealthBroken);
    if (fusionAggro) isElfInvuln = false; 

    currentEnemies.forEach((enemy, idx) => {
        let eMaxX = bRight - shrink - enemy.size; 
        let eMaxY = bBot - shrink - enemy.size;

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
        if (!isElfInvuln) minDistToTarget = Math.hypot((targetObj.x + targetObj.size/2) - (enemy.x + enemy.size/2), (targetObj.y + targetObj.size/2) - (enemy.y + enemy.size/2)); 
        
        let dx = 0; let dy = 0; let dist = minDistToTarget; 
        if (dist !== 9999 && dist > 0) { dx = targetObj.x - enemy.x; dy = targetObj.y - enemy.y; }
        let angleToPlayer = Math.atan2(dy, dx);
        enemy.faceAngleTarget = angleToPlayer;

        let currentEnemySpeed = enemy.speed; 
        if (enemy.slowTimer > 0 || enemy.isPermanentlySlowed) currentEnemySpeed *= 0.5; 

        // --- I.A DES BOSS ET NOUVEAUX MOBS ---
        if (enemy.type === 'mage') {
            if (enemy.phase === 1 && enemy.health <= enemy.maxHealth / 2) {
                enemy.phase = 2; enemy.maxHealth += 300; enemy.health += 300; enemy.speed = 4.0; 
            }
            if (enemy.phase === 2 && dist < 200 && dist > 0) { dx = -dx; dy = -dy; }
            if (enemy.summonTimer === undefined) enemy.summonTimer = 0;
            enemy.summonTimer--;
            if (enemy.summonTimer <= 0) {
                if (typeof window.spawnEnemy === 'function') { window.spawnEnemy('skeleton', 1, enemy.x + 20, enemy.y + 20); window.spawnEnemy('spider', 1, enemy.x - 20, enemy.y - 20); }
                enemy.summonTimer = enemy.phase === 2 ? 250 : 400; 
            }
            if (enemy.phase === 2 && enemy.burstCount > 0) {
                if (enemy.burstTimer <= 0 || enemy.burstTimer === undefined) {
                    enemyProjectiles.push({ x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, vx: Math.cos(angleToPlayer)*7, vy: Math.sin(angleToPlayer)*7, size: 8, type: 'fire_mage_corompue', color: '#e67e22', damage: 15 });
                    enemy.burstCount--; enemy.burstTimer = 10; enemy.attackAnimTimer = 15;
                } else { enemy.burstTimer--; }
            }
        }
        
        if (enemy.type === 'dragon') {
            if (enemy.phase === 1 && enemy.health <= enemy.maxHealth / 2) {
                enemy.phase = 2; 
            }
            if (enemy.summonTimer === undefined) enemy.summonTimer = 60;
            enemy.summonTimer--;
            let isPhase2 = (enemy.phase === 2);
            let hpRatio = Math.max(0.1, enemy.health / enemy.maxHealth);
            
            let spawnRate = isPhase2 ? Math.max(10, 40 * hpRatio) : 70;
            
            if (enemy.summonTimer <= 0) {
                let mx = bLeft + Math.random() * (bRight - bLeft);
                let my = bTop + Math.random() * (bBot - bTop);
                if (typeof hazards !== 'undefined') {
                    let fallSpeed = isPhase2 ? Math.max(15, 40 * hpRatio) : 50; 
                    hazards.push({ x: mx, y: my, radius: 45, timer: fallSpeed, maxTimer: fallSpeed, damage: 30, isDragon: true });
                }
                enemy.summonTimer = spawnRate; 
            }
            
            if (enemy.shootCooldown <= 0 && !isElfInvuln) {
                let pSpeed = 8;
                for(let k = -2; k <= 2; k++) {
                    let spreadAngle = angleToPlayer + (k * 0.2);
                    enemyProjectiles.push({ x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, vx: Math.cos(spreadAngle) * pSpeed, vy: Math.sin(spreadAngle) * pSpeed, size: 12, type: 'fire_dragon', color: '#e74c3c', damage: 25 });
                }
                enemy.shootCooldown = 60; 
                enemy.attackAnimTimer = 30; 
            }
        }

        if (enemy.type === 'troll') {
            if (enemy.summonTimer === undefined) enemy.summonTimer = 0;
            enemy.summonTimer--;
            if (enemy.summonTimer <= 0) {
                if (typeof window.spawnEnemy === 'function') window.spawnEnemy('goblin', 1, enemy.x + 20, enemy.y + 20); 
                enemy.summonTimer = 180; 
            }
            
            if (enemy.trollDashCooldown === undefined) enemy.trollDashCooldown = 600;
            enemy.trollDashCooldown--;
            if (enemy.trollDashCooldown === 30) { enemy.isTelegraphing = 30; }
            if (enemy.trollDashCooldown <= 0) {
                enemy.isDashing = 10; 
                enemy.trollDashCooldown = (enemy.health <= enemy.maxHealth / 2) ? 180 : 600; 
            }
            if (enemy.isTelegraphing > 0) {
                enemy.isTelegraphing--; currentEnemySpeed = -1.5; enemy.wobble += 0.5; 
            } else if (enemy.isDashing > 0) { 
                enemy.isDashing--; currentEnemySpeed *= 3.5; 
            }
        }

        // Le Minotaure fait des petits dashs agressifs
        if (enemy.type === 'minotaure') {
            if (enemy.trollDashCooldown === undefined) enemy.trollDashCooldown = 240;
            enemy.trollDashCooldown--;
            if (enemy.trollDashCooldown === 20) { enemy.isTelegraphing = 20; }
            if (enemy.trollDashCooldown <= 0) {
                enemy.isDashing = 10; 
                enemy.trollDashCooldown = 240; 
            }
            if (enemy.isTelegraphing > 0) {
                enemy.isTelegraphing--; currentEnemySpeed = -1.0; enemy.wobble += 0.5; 
            } else if (enemy.isDashing > 0) { 
                enemy.isDashing--; currentEnemySpeed *= 4.0; 
            }
        }

        if (enemy.type === 'deathgod') {
            if (enemy.phase === 1) {
                if (enemy.summonTimer === undefined) enemy.summonTimer = 0;
                enemy.summonTimer--;
                if (enemy.summonTimer <= 0) { if (typeof window.spawnEnemy === 'function') window.spawnEnemy('armor', 1, enemy.x + 30, enemy.y + 30); enemy.summonTimer = 300; } 
                
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
                }
            } else if (enemy.phase === 2) {
                currentEnemySpeed = 0;
                enemy.phaseTimer--;
                if (enemy.phaseTimer <= 0) { enemy.health -= (enemy.maxHealth * 0.05); enemy.phaseTimer = 240; } 
                
                enemy.summonTimer--;
                if (enemy.summonTimer <= 0) { if (typeof window.spawnEnemy === 'function') window.spawnEnemy('armor', 1, canvas.width/2 + (Math.random()*200-100), canvas.height/2 + (Math.random()*200-100)); enemy.summonTimer = 360; }
                
                if (enemy.shootCooldown <= 0) {
                    for(let i=0; i<8; i++) {
                        let angle = (Math.PI*2 / 8) * i + enemy.wobble;
                        enemyProjectiles.push({ x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, vx: Math.cos(angle)*5, vy: Math.sin(angle)*5, size: 8, type: 'fire_deathgod', color: '#2c3e50', damage: 15 });
                    }
                    enemy.shootCooldown = 40; enemy.attackAnimTimer = 15;
                }
            }
        }

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

        // TIRS A DISTANCE (INCLUS GOLEM ET GARGOUILLE)
        let isRanged = ['skeleton', 'mage', 'deathgod', 'elysia', 'armor', 'spider', 'golem', 'small_golem', 'gargouille'].includes(enemy.type);
        
        if (isRanged && dist < 600 && enemy.shootCooldown <= 0 && !isElfInvuln) {
            let pSpeed = 6, pType = 'bone_skeleton', pColor = '#ecf0f1', pSize = 7.5, pDmg = 10;
            if (enemy.type === 'spider') { pType = 'bat_web'; pColor = '#8e44ad'; pSpeed = 4; pSize = 9; pDmg = 5; }
            else if (enemy.type === 'mage') { pType = 'fire_mage_corompue'; pColor = '#e67e22'; pSpeed = 7; pSize = 12; pDmg = 15; }
            else if (enemy.type === 'deathgod') { pType = 'fire_deathgod'; pColor = '#2c3e50'; pSpeed = 7; pSize = 12; pDmg = 15; }
            else if (enemy.type === 'elysia') { pType = 'fire_elysia'; pColor = '#e84393'; pSpeed = 7; pSize = 12; pDmg = 15; }
            else if (enemy.type === 'armor') { pType = 'armor_sword'; pColor = '#7f8c8d'; pSpeed = 8; pSize = 15; pDmg = 35; }
            // Nouveaux Tirs
            else if (enemy.type === 'golem' || enemy.type === 'small_golem') { pType = 'rock_golem'; pColor = '#7f8c8d'; pSpeed = 5; pSize = 10; pDmg = 25; }
            else if (enemy.type === 'gargouille') { pType = 'rock_gargouille'; pColor = '#34495e'; pSpeed = 6; pSize = 12; pDmg = 25; }

            if (enemy.type !== 'dragon') {
                if (enemy.type === 'mage' && enemy.phase === 2) {
                    enemy.burstCount = 2; enemy.shootCooldown = 40; 
                } else {
                    enemyProjectiles.push({ x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, vx: Math.cos(angleToPlayer) * pSpeed, vy: Math.sin(angleToPlayer) * pSpeed, size: pSize, type: pType, color: pColor, damage: pDmg });
                    enemy.shootCooldown = (enemy.type === 'mage') ? 120 : 150;
                }
                enemy.attackAnimTimer = 30; 
            }
        }
        
        let stopDist = (isRanged && fusionAggro) ? 250 : 0;
        let dx_mov = 0, dy_mov = 0; 
        
        // MOUVEMENT NORMAL vs GARGOUILLE
        if (enemy.type === 'gargouille') {
            dx_mov = enemy.vx;
            dy_mov = enemy.vy;
            
            // Rebond Y
            if (enemy.y <= minLimitY) { enemy.y = minLimitY; enemy.vy *= -1; enemy.vy += (Math.random() - 0.5); }
            if (enemy.y >= eMaxY) { enemy.y = eMaxY; enemy.vy *= -1; enemy.vy += (Math.random() - 0.5); }
            
            // Wrap X (Réapparait à droite quand elle sort à gauche)
            if (enemy.x < minLimitX - enemy.size * 2) {
                enemy.x = eMaxX + enemy.size; 
                enemy.y = minLimitY + Math.random() * (eMaxY - minLimitY);
            }
        } 
        else if (dist > stopDist && dist < 9999) { 
            dx_mov = (dx / dist) * currentEnemySpeed; dy_mov = (dy / dist) * currentEnemySpeed; 
        }

        let repulseX = 0, repulseY = 0;
        currentEnemies.forEach((otherEnemy, otherIdx) => {
            if (idx !== otherIdx && enemy.type !== 'gargouille') { // La gargouille vole au dessus de tout
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
        let oldEy = enemy.y; enemy.y += dy_mov; 
        if (currentRoomId === 8 && !isBoss && window.checkCollision(enemy, centerStairs)) enemy.y = oldEy;

        // Limites de collision standard (Sauf pour la gargouille qui se wrap)
        if (enemy.type !== 'gargouille') {
            if (enemy.x < minLimitX) enemy.x = minLimitX; 
            if (enemy.y < minLimitY) enemy.y = minLimitY; 
            if (enemy.x > eMaxX) enemy.x = eMaxX; 
            if (enemy.y > eMaxY) enemy.y = eMaxY;
        }

        // --- COLLISIONS AVEC JOUEUR OU FUSION ---
        if (!enemy.invulnerable) {
            if (fusionAggro && window.checkCollision(fusionAggro, enemy)) {
                if (enemy.attackAnimTimer <= 0) {
                    let dmg = 25;
                    if (enemy.type === 'wolf') dmg = 40;
                    if (enemy.type === 'armor') dmg = fusionAggro.maxHealth * 0.32;
                    else if (enemy.type === 'elysia') dmg = fusionAggro.maxHealth * 0.34;
                    else if (enemy.type === 'deathgod') dmg = fusionAggro.maxHealth * 0.25;
                    
                    fusionAggro.health -= dmg; 
                    enemy.attackAnimTimer = 30;
                }
            } 
            else if (!fusionAggro && playerInvulnerableTimer <= 0 && window.checkCollision(player, enemy)) {
                let dmg = 25;
                if (enemy.type === 'wolf') dmg = 40;
                if (enemy.type === 'armor') dmg = playerStats.maxHealth * 0.32;
                else if (enemy.type === 'elysia') dmg = playerStats.maxHealth * 0.34;
                else if (enemy.type === 'deathgod') dmg = playerStats.maxHealth * 0.25;
                
                playerStats.health -= dmg; 
                enemy.attackAnimTimer = 30;
                
                let randHit = Math.floor(Math.random() * 3) + 1;
                let maxLife = (currentRoomId === 999) ? 1200 : 3600;
                let bSize = player.size * 1.5;
                if (player.heroClass === 'Elf') bSize /= 2;
                
                bloodStains.push({ type: 'hit', imgId: 'bloods_hit_view' + randHit, x: player.x + player.size/2, y: player.y + player.size/2, size: bSize, rotation: Math.random() * Math.PI * 2, life: maxLife });
                
                playerInvulnerableTimer = 60; 
                if (typeof window.updateHUD === 'function') window.updateHUD(); 
                if (playerStats.health <= 0 && typeof window.handlePlayerDeath === 'function') window.handlePlayerDeath();
            }
        }
    });

    // --- I.A FUSION ET ÂMES ---
    if (typeof necroSummons !== 'undefined') {
        for (let i = 0; i < necroSummons.length; i++) {
            let summon = necroSummons[i]; let repX = 0, repY = 0;
            for (let j = 0; j < necroSummons.length; j++) {
                if (i !== j) {
                    let other = necroSummons[j];
                    let diffX = summon.x - other.x; let diffY = summon.y - other.y;
                    if (Math.abs(diffX) < 50 && Math.abs(diffY) < 50) {
                        let distSq = diffX*diffX + diffY*diffY; let minDistSq = ((summon.size + other.size) * 0.4) ** 2;
                        if (distSq < minDistSq && distSq > 0) {
                            let repDist = Math.sqrt(distSq); repX += (diffX / repDist) * 2.0; repY += (diffY / repDist) * 2.0;
                        }
                    }
                }
            }
            summon.x += repX; summon.y += repY;
        }

        for (let i = necroSummons.length - 1; i >= 0; i--) {
            let summon = necroSummons[i];
            if (summon.attackCooldown === undefined) summon.attackCooldown = 0;
            if (summon.attackAnimTimer === undefined) summon.attackAnimTimer = 0;
            if (summon.attackCooldown > 0) summon.attackCooldown--;
            if (summon.attackAnimTimer > 0) summon.attackAnimTimer--;
            
            let nearestEnemy = null; let minDist = 9999;
            currentEnemies.forEach(e => {
                if (!e.invulnerable) {
                    let d = Math.hypot((e.x + e.size/2) - (summon.x + summon.size/2), (e.y + e.size/2) - (summon.y + summon.size/2));
                    if (d < minDist) { minDist = d; nearestEnemy = e; }
                }
            });

            let isTargetingPlayer = false;
            if (!nearestEnemy) {
                nearestEnemy = player;
                minDist = Math.hypot((player.x + player.size/2) - (summon.x + summon.size/2), (player.y + player.size/2) - (summon.y + summon.size/2));
                isTargetingPlayer = true;
            }

            if (nearestEnemy) {
                let dx = (nearestEnemy.x + nearestEnemy.size/2) - (summon.x + summon.size/2);
                let dy = (nearestEnemy.y + nearestEnemy.size/2) - (summon.y + summon.size/2);
                let angle = Math.atan2(dy, dx);
                summon.faceAngle = angle;

                let stopDistance = 30;
                if (!isTargetingPlayer) {
                    stopDistance = summon.type === 'fusion' ? 150 : 30; 
                } else {
                    stopDistance = 80; 
                }

                if (minDist > stopDistance) {
                    summon.x += Math.cos(angle) * summon.speed; summon.y += Math.sin(angle) * summon.speed;
                }

                if (summon.attackCooldown <= 0 && !isTargetingPlayer) { 
                    if (summon.type === 'fusion') {
                        summon.damage = 40; 
                        if (minDist < 350 && minDist > 100) { 
                            projectiles.push({ x: summon.x + summon.size/2, y: summon.y + summon.size/2, vx: Math.cos(angle)*10, vy: Math.sin(angle)*10, size: 12, hitTargets: [], angle: angle, type: 'fire_fusion', pierce: true });
                            summon.attackCooldown = 45; summon.attackAnimTimer = 20;
                        } else if (minDist <= 100) { 
                            let hitBox = { x: summon.x - 50, y: summon.y - 50, width: summon.size + 100, height: summon.size + 100 };
                            currentEnemies.forEach(e => {
                                if (!e.invulnerable && window.checkCollision(hitBox, e)) {
                                    e.health -= summon.damage; 
                                    let hitNum = Math.floor(Math.random() * 3) + 1;
                                    let bSize = e.size * 1.5;
                                    if (['elf', 'troll', 'dragon', 'goblin', 'wolf', 'small_golem'].includes(e.type.toLowerCase())) bSize /= 2;
                                    bloodStains.push({ type: 'hit', imgId: 'bloods_hit_view' + hitNum, x: e.x + e.size/2, y: e.y + e.size/2, size: bSize, rotation: Math.random() * Math.PI * 2, life: 1200 });
                                }
                            });
                            summon.attackCooldown = 30; summon.attackAnimTimer = 20;
                        }
                    } else if (summon.type === 'soul') {
                        if (minDist < 50) { 
                            nearestEnemy.health -= summon.damage; summon.attackCooldown = 60; summon.attackAnimTimer = 20;
                            let hitNum = Math.floor(Math.random() * 3) + 1;
                            let bSize = nearestEnemy.size * 1.5;
                            if (['elf', 'troll', 'dragon', 'goblin', 'wolf', 'small_golem'].includes(nearestEnemy.type.toLowerCase())) bSize /= 2;
                            bloodStains.push({ type: 'hit', imgId: 'bloods_hit_view' + hitNum, x: nearestEnemy.x + nearestEnemy.size/2, y: nearestEnemy.y + nearestEnemy.size/2, size: bSize, rotation: Math.random() * Math.PI * 2, life: 1200 });
                        }
                    }
                }
            }
            if (summon.health <= 0) { necroSummons.splice(i, 1); }
        }
    }

    // --- MORT DES ENNEMIS ---
    for (let i = currentEnemies.length - 1; i >= 0; i--) {
        if (currentEnemies[i].health <= 0) {
            let e = currentEnemies[i];
            
            if (player.heroClass === 'Necromancer') { necroKills.push(e.type); }

            if (['troll', 'deathgod', 'elysia'].includes(e.type) && currentRoomId === 8 && !worldState.bossDefeated) { 
                worldState.bossDefeated = true; 
                if (typeof hazards !== 'undefined') hazards.length = 0; 
                currentItems.push({ id: 'boss_key', type: 'key_skull', x: e.x + e.size/2 - 10, y: e.y + e.size/2 - 10, size: 20, collected: false }); 
            }
            
            // DIVISION DU GOLEM EN 2 SMALL_GOLEM !
            if (e.type === 'golem') {
                if (typeof window.spawnEnemy === 'function') { window.spawnEnemy('small_golem', 2, e.x, e.y); }
            }
            
            if (Math.random() < 0.3 && !['troll', 'mage', 'dragon', 'deathgod', 'elysia', 'armor'].includes(e.type)) { 
                currentItems.push({ id: 'coin_en_' + Date.now() + i, type: 'coin', x: e.x + e.size/2, y: e.y + e.size/2, size: 8, collected: false }); 
            }
            
            let killNum = Math.floor(Math.random() * 3) + 1;
            let imgPrefix = e.type === 'skeleton' ? 'skeleton_kill_view' : 'bloods_kill_view';
            let maxLife = (currentRoomId === 999) ? 1200 : 3600;
            
            let killSize = e.size * 3.75; 
            if (['elf', 'troll', 'dragon', 'goblin', 'wolf', 'small_golem'].includes(e.type.toLowerCase())) killSize /= 2;
            if (e.type === 'skeleton') killSize = (e.size * 3.75) / 3;
            
            bloodStains.push({ type: 'kill', imgId: imgPrefix + killNum, x: e.x + e.size/2, y: e.y + e.size/2, size: killSize, rotation: Math.random() * Math.PI * 2, life: maxLife });
            
            playerStats.mana = Math.min(100, playerStats.mana + 5); 
            
            currentEnemies.splice(i, 1);
            if (currentEnemies.length === 0 && currentRoomId !== 999) {
                worldState.clearedRooms[currentRoomId] = true;
                if (typeof hazards !== 'undefined') hazards.length = 0; 
            }
            if (typeof window.updateHUD === 'function') window.updateHUD();
        }
    }
};
