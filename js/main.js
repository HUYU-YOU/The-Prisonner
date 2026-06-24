// ============================================================================
// CORE LOOP CONTROLLER, ENGINE TICKS & USER INTERACTION LISTENERS
// ============================================================================

function updatePortrait(heroClass) {
    const portrait = document.getElementById('portrait');
    const imgMap = {
        'Knight': 'assets/card/Knight.png',
        'Elf': 'assets/card/Elf.png',
        'Mage': 'assets/card/Burned.png',
        'Necromancer': 'assets/card/Burned.png'
    };
    if (imgMap[heroClass]) {
        portrait.style.backgroundImage = `url('${imgMap[heroClass]}')`;
    }
}

window.startHeroHold = function(heroClass) {
    isHolding = true; holdCompleted = false;
    holdTimer = setTimeout(() => { holdCompleted = true; startArenaMode(heroClass); }, 10000); 
};

window.endHeroHold = function(heroClass) {
    if (isHolding) {
        clearTimeout(holdTimer); isHolding = false;
        if (!holdCompleted) selectHero(heroClass); 
    }
};

window.selectHero = function(heroClass) {
    if (heroClass === 'Mage') return;

    player.heroClass = heroClass;
    if (heroClass === 'Knight') {
        playerStats.name = "CHEVALIER"; playerStats.weapon = "ÉPÉE LOURDE"; player.speed = 4;
        playerStats.maxHealth = 140; playerStats.health = 140;
    } else if (heroClass === 'Elf') {
        playerStats.name = "KEBRA"; playerStats.weapon = "ARC D'EMERYN"; player.speed = 6;
        playerStats.maxHealth = 100; playerStats.health = 100;
    }
    
    document.getElementById('p-name').innerText = playerStats.name;
    document.getElementById('p-weapon').innerText = playerStats.weapon;
    document.getElementById('menu-screen').style.display = 'none';
    
    updatePortrait(heroClass);
    loadRoom(1); updateHUD(); gameState = "PLAYING";
};

function startArenaMode(heroClass) {
    isArenaMode = true; arenaWave = 1; arenaState = "WAITING"; arenaTimer = 300; 
    player.heroClass = heroClass;
    
    if (heroClass === 'Knight') {
        playerStats.name = "CHEVALIER (ARÈNE)"; playerStats.weapon = "ÉPÉE LOURDE"; player.speed = 4;
        playerStats.maxHealth = 140; playerStats.health = 140;
    } else if (heroClass === 'Elf') {
        playerStats.name = "KEBRA (ARÈNE)"; playerStats.weapon = "ARC D'EMERYN"; player.speed = 6;
        playerStats.maxHealth = 100; playerStats.health = 100;
    } else if (heroClass === 'Mage') {
        playerStats.name = "MAGE BRÛLEUR"; playerStats.weapon = "BOULES DE FEU"; player.speed = 5;
        playerStats.maxHealth = 100; playerStats.health = 100;
    } else if (heroClass === 'Necromancer') {
        playerStats.name = "NÉCROMANCIEN"; playerStats.weapon = "FAUX DES ÂMES"; player.speed = 4.5;
        playerStats.maxHealth = 120; playerStats.health = 120;
    }
    
    document.getElementById('p-name').innerText = playerStats.name;
    document.getElementById('p-weapon').innerText = playerStats.weapon;
    document.getElementById('menu-screen').style.display = 'none';
    
    updatePortrait(heroClass);
    loadRoom(999); updateHUD(); gameState = "PLAYING";
}

window.usePotion = function(color) {
    if (playerStats.inventory.potions[color] > 0) {
        let potionUsed = false;
        if (color === 'green' && playerStats.health < playerStats.maxHealth) {
            playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + (playerStats.maxHealth * 0.2)); potionUsed = true;
        } else if (color === 'red' && playerStats.health < playerStats.maxHealth) {
            playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + (playerStats.maxHealth * 0.5)); potionUsed = true;
        } else if (color === 'blue' && playerStats.mana < 100) {
            playerStats.mana = Math.min(100, playerStats.mana + 20); potionUsed = true;
        } else if (color === 'yellow') {
            playerPoisonTimer = 0; playerSlowTimer = 0; potionUsed = true;
        }
        
        if (potionUsed) {
            playerStats.inventory.potions[color]--; updateHUD();
            spawnParticles(player.x + player.size/2, player.y + player.size/2, '#3498db', 20);
        }
    }
};

window.addEventListener('keydown', (e) => { let k = e.key.toLowerCase(); if(k === ' ') k = 'space'; keys[k] = true; });
window.addEventListener('keyup', (e) => { let k = e.key.toLowerCase(); if(k === ' ') k = 'space'; keys[k] = false; });
window.addEventListener('mouseup', () => { leftClickHeld = false; });

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouse.x = (e.clientX - rect.left) * scaleX;
    mouse.y = (e.clientY - rect.top) * scaleY;
});

canvas.addEventListener('mousedown', (e) => {
    if (gameState !== "PLAYING") return;
    leftClickHeld = true; leftClickHoldTime = 0;
    if (attackCooldown > 0) return;

    let dx = mouse.x - (player.x + player.size / 2);
    let dy = mouse.y - (player.y + player.size / 2);
    let angle = Math.atan2(dy, dx);
    player.faceAngle = angle; 
    
    let now = Date.now();
    if (now - lastClickTime < 300 && playerStats.mana >= 100) { activateUltimate(); return; }
    lastClickTime = now;

    if (player.heroClass === 'Elf') {
        if (isUltimateActive) {
            elfStealthBroken = true; let spread = 0.15;
            projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle - spread) * 12, vy: Math.sin(angle - spread) * 12, size: 5, hitTargets: [], angle: angle - spread, isFire: false });
            projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle + spread) * 12, vy: Math.sin(angle + spread) * 12, size: 5, hitTargets: [], angle: angle + spread, isFire: false });
            attackCooldown = 15;
        } else {
            projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle) * 12, vy: Math.sin(angle) * 12, size: 5, hitTargets: [], angle: angle, isFire: false });
            attackCooldown = 30;
        }
    } else if (player.heroClass === 'Mage') {
        projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle) * 10, vy: Math.sin(angle) * 10, size: 8, hitTargets: [], angle: angle, isFire: true });
        attackCooldown = 35;
    } else if (player.heroClass === 'Necromancer') {
        projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle) * 10, vy: Math.sin(angle) * 10, size: 6, hitTargets: [], angle: angle, isFire: false, isNecro: true });
        attackCooldown = 15;
    } else if (player.heroClass === 'Knight') {
        isAttacking = true; attackCooldown = 40;
        let hitBox = { x: player.x + player.size / 2 + Math.cos(angle) * 60 - 60, y: player.y + player.size / 2 + Math.sin(angle) * 60 - 60, size: 120 };
        currentEnemies.forEach(enemy => { 
            if (checkCollision(hitBox, enemy)) {
                if (!enemy.invulnerable) {
                    if (enemy.type === 'goblin' && Math.random() < 0.10) {
                        enemy.blockAnimTimer = 20; 
                        spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, '#bdc3c7', 15);
                    } else {
                        enemy.health -= 50;
                        spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, enemy.color, 15); triggerShake(5, 8); 
                    }
                }
            } 
        });
    }
});

function update() {
    if (gameState === "MENU") {
        if (keys['space']) {
            if (typeof spaceHoldTimer === 'undefined') spaceHoldTimer = 0;
            spaceHoldTimer++;
            if (spaceHoldTimer >= 300) { spaceHoldTimer = 0; keys['space'] = false; startArenaMode('Necromancer'); }
        } else { spaceHoldTimer = 0; }
        requestAnimationFrame(update); return;
    }

    if (gameState !== "PLAYING" && gameState !== "GAMEOVER") { requestAnimationFrame(update); return; }
    if (gameState === "GAMEOVER") { renderGameView(); requestAnimationFrame(update); return; }

    if (currentRoomId === 999 && waveStartDelay > 0) waveStartDelay--;

    if (!worldState.openedDoors) worldState.openedDoors = {};

    let roomChanged = false;
    currentDoors.forEach(door => {
        if (!roomChanged && checkCollision(player, door)) { 
            if (door.locked) {
                if (playerStats.inventory.keys.gold > 0) {
                    playerStats.inventory.keys.gold--; 
                    door.locked = false; 
                    worldState.unlockedDoors[door.id] = true; 
                    updateHUD();
                    spawnParticles(door.x + door.width/2, door.y + door.height/2, '#f1c40f', 30);
                    
                    if (door.dest !== null) { 
                        worldState.openedDoors[door.id] = true;
                        if (door.id) { let p = door.id.split('_'); if (p.length === 3) worldState.openedDoors['door_'+p[2]+'_'+p[1]] = true; }
                        saveRoomState(); loadRoom(door.dest); player.x = door.spawnX; player.y = door.spawnY; roomChanged = true; 
                    }
                } else {
                    if (door.face === 'north') player.y = door.y + door.height; else if (door.face === 'south') player.y = door.y - player.size;
                    else if (door.face === 'east') player.x = door.x - player.size; else if (door.face === 'west') player.x = door.x + door.width;
                }
            } else if (door.dest !== null) { 
                worldState.openedDoors[door.id] = true;
                if (door.id) { let p = door.id.split('_'); if (p.length === 3) worldState.openedDoors['door_'+p[2]+'_'+p[1]] = true; }
                saveRoomState(); loadRoom(door.dest); player.x = door.spawnX; player.y = door.spawnY; roomChanged = true; 
            } 
        }
    });
    if (roomChanged) { requestAnimationFrame(update); return; }

    if ((keys['space'] || keys['0'] || keys['control']) && playerStats.mana >= 100) {
        activateUltimate(); keys['space'] = false; keys['0'] = false; keys['control'] = false; 
    }
    if (leftClickHeld) {
        leftClickHoldTime++;
        if (leftClickHoldTime >= 180 && playerStats.mana >= 100) { activateUltimate(); leftClickHeld = false; }
    }
    if (isUltimateActive) {
        ultimateTimer--;
        if (ultimateTimer <= 0) isUltimateActive = false;
        if (player.heroClass === 'Knight' && ultimateTimer % 60 === 0) {
            playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + (playerStats.maxHealth * 0.1));
            updateHUD(); spawnParticles(player.x + player.size/2, player.y + player.size/2, '#2ecc71', 10);
        }
    }
    if (playerPoisonTimer > 0) {
        playerPoisonTimer--;
        if (playerPoisonTimer % 60 === 0 && playerStats.health > 1) {
            playerStats.health -= 5; if (playerStats.health < 1) playerStats.health = 1;
            updateHUD(); spawnParticles(player.x + player.size/2, player.y + player.size/2, '#8e44ad', 5);
        }
    }
    if (playerSlowTimer > 0) playerSlowTimer--;
    if (playerInvulnerableTimer > 0) playerInvulnerableTimer--;

    let manaBar = document.getElementById('mana-bar');
    if (playerStats.mana >= 100) manaBar.style.opacity = Math.floor(Date.now() / 250) % 2 === 0 ? "1" : "0.3"; else manaBar.style.opacity = "1";

    if (currentRoomId === 999) {
        if (arenaWave === 11 && arenaState === "ACTIVE") {
            if (arenaShrink < 250) { arenaShrink += (250 / 1800); }
        } else if (arenaWave > 11 || (arenaWave === 11 && arenaState === "WAITING")) { arenaShrink = 0; }

        if (arenaState === "ACTIVE" && currentEnemies.length === 0) { arenaState = "WAITING"; arenaTimer = 300; }
        
        if (arenaState === "WAITING") {
            arenaTimer--;
            if (arenaTimer <= 0) {
                if (arenaWave % 5 === 0) {
                    currentItems.push({ id: 'potion_arena_' + arenaWave, type: 'potion_green', x: canvas.width/2 - 7.5, y: canvas.height/2 - 7.5, size: 15, collected: false });
                }

                if (arenaWave === 10) spawnEnemy('troll', 1); 
                else if (arenaWave === 20) spawnEnemy('mage', 1); 
                else if (arenaWave === 30) spawnEnemy('dragon', 1);
                else {
                    if (arenaWave < 5) { spawnEnemy('goblin', arenaWave * 2); } 
                    else if (arenaWave < 15) { spawnEnemy('goblin', 5); spawnEnemy('skeleton', arenaWave - 4); } 
                    else {
                        let numGoblins = 5; let numSkeletons = 10; let numSpiders = 0;
                        let extra = arenaWave - 14; 
                        for (let i = 1; i <= extra; i++) {
                            let cycle = i % 3;
                            if (cycle === 1) numSkeletons++; else if (cycle === 2) numSpiders++; else numGoblins++;
                        }
                        spawnEnemy('goblin', numGoblins);
                        spawnEnemy('skeleton', numSkeletons);
                        if (numSpiders > 0) spawnEnemy('spider', numSpiders);
                    }
                }
                waveStartDelay = 60; 
                arenaWave++; arenaState = "ACTIVE";
            }
        }
    }

    let currentSpeedPlayer = playerSlowTimer > 0 ? player.speed / 2 : player.speed;
    if (keys['z'] || keys['w'] || keys['arrowup'])    player.y -= currentSpeedPlayer;
    if (keys['s'] || keys['arrowdown'])               player.y += currentSpeedPlayer;
    if (keys['q'] || keys['a'] || keys['arrowleft'])  player.x -= currentSpeedPlayer;
    if (keys['d'] || keys['arrowright'])              player.x += currentSpeedPlayer;

    let minLimitX = wallMargin + arenaShrink; let minLimitY = wallMargin + arenaShrink;
    let maxLimitX = canvas.width - wallMargin - arenaShrink - player.size;
    let maxLimitY = canvas.height - wallMargin - arenaShrink - player.size;

    if (player.x < minLimitX) player.x = minLimitX; if (player.y < minLimitY) player.y = minLimitY;
    if (player.x > maxLimitX) player.x = maxLimitX; if (player.y > maxLimitY) player.y = maxLimitY;

    if (currentRoomId === 1 && player.x + player.size > bookshelf.x && player.y + player.size > bookshelf.y && player.y < bookshelf.y + bookshelf.height) {
        player.x = bookshelf.x - player.size;
    }

    player.faceAngle = Math.atan2(mouse.y - (player.y + player.size / 2), mouse.x - (player.x + player.size / 2));

    currentItems.forEach(item => {
        if (!item.collected && checkCollision(player, item)) {
            item.collected = true; worldState.collectedItems[item.id] = true; 
            if (item.type === 'key') playerStats.inventory.keys.gold++;
            else if (item.type === 'potion_green') playerStats.inventory.potions.green++;
            else if (item.type === 'key_skull') playerStats.inventory.keys.skull++; 
            updateHUD(); spawnParticles(item.x, item.y, '#f1c40f', 15);
        }
    });

    if (attackCooldown > 0) attackCooldown--;
    if (player.heroClass === 'Knight' && attackCooldown < 25) isAttacking = false;

    let isElfInvuln = (isUltimateActive && player.heroClass === 'Elf' && !elfStealthBroken);
    
    for (let i = necroSummons.length - 1; i >= 0; i--) {
        let s = necroSummons[i];
        if (s.invulnerableTimer && s.invulnerableTimer > 0) s.invulnerableTimer--; 

        let closestEnemy = null; let minDist = 9999;
        currentEnemies.forEach(e => {
            if (e.phase === 2 && e.type === 'dragon') return; 
            let dist = Math.hypot((e.x + e.size/2) - (s.x + s.size/2), (e.y + e.size/2) - (s.y + s.size/2));
            if (dist < minDist) { minDist = dist; closestEnemy = e; }
        });

        if (closestEnemy && minDist < 1000) {
            let dx = (closestEnemy.x + closestEnemy.size/2) - (s.x + s.size/2);
            let dy = (closestEnemy.y + closestEnemy.size/2) - (s.y + s.size/2);
            let angle = Math.atan2(dy, dx);
            s.x += Math.cos(angle) * s.speed; s.y += Math.sin(angle) * s.speed;
            
            if (minDist < (s.size + closestEnemy.size) / 2 + 10) {
                if (s.attackCooldown === undefined) s.attackCooldown = 0;
                if (s.attackCooldown <= 0) {
                    if (closestEnemy.type === 'goblin' && Math.random() < 0.10) {
                        closestEnemy.blockAnimTimer = 20; 
                        spawnParticles(closestEnemy.x + closestEnemy.size/2, closestEnemy.y + closestEnemy.size/2, '#bdc3c7', 15);
                    } else {
                        if (closestEnemy.type === 'skeleton') closestEnemy.attackAnimTimer = 15;
                        closestEnemy.health -= s.damage; 
                        if (closestEnemy.health <= 0) closestEnemy.killedBySummon = true;
                    }
                    s.attackCooldown = 30;
                }
            }
        } else {
             let dx = (player.x + player.size/2) - (s.x + s.size/2); 
             let dy = (player.y + player.size/2) - (s.y + s.size/2);
             if (Math.hypot(dx, dy) > 100) {
                 let angle = Math.atan2(dy, dx);
                 s.x += Math.cos(angle) * s.speed; s.y += Math.sin(angle) * s.speed;
             }
        }
        if (s.attackCooldown > 0) s.attackCooldown--;
        if (s.health <= 0) { spawnParticles(s.x + s.size/2, s.y + s.size/2, '#2c3e50', 15); necroSummons.splice(i, 1); }
    }
    
    for (let i = 0; i < necroSummons.length; i++) {
        for (let j = i + 1; j < necroSummons.length; j++) {
            let s1 = necroSummons[i]; let s2 = necroSummons[j];
            let dx = (s1.x + s1.size/2) - (s2.x + s2.size/2); 
            let dy = (s1.y + s1.size/2) - (s2.y + s2.size/2);
            let dist = Math.hypot(dx, dy); let minDist = (s1.size + s2.size) / 2 + 5; 
            if (dist < minDist) {
                if (dist === 0) { dx = Math.random()-0.5; dy = Math.random()-0.5; dist = Math.hypot(dx, dy); }
                let overlap = minDist - dist;
                s1.x += (dx / dist) * (overlap / 2); s1.y += (dy / dist) * (overlap / 2);
                s2.x -= (dx / dist) * (overlap / 2); s2.y -= (dy / dist) * (overlap / 2);
            }
        }
    }

    currentEnemies.forEach((enemy) => {
        if (enemy.attackAnimTimer === undefined) enemy.attackAnimTimer = 0;
        if (enemy.blockAnimTimer === undefined) enemy.blockAnimTimer = 0;
        if (enemy.attackAnimTimer > 0) enemy.attackAnimTimer--;
        if (enemy.blockAnimTimer > 0) enemy.blockAnimTimer--;

        enemy.wobble += 0.1; 
        
        let eMaxX = canvas.width - wallMargin - arenaShrink - enemy.size;
        let eMaxY = canvas.height - wallMargin - arenaShrink - enemy.size;
        if (enemy.x < minLimitX) enemy.x = minLimitX; if (enemy.y < minLimitY) enemy.y = minLimitY;
        if (enemy.x > eMaxX) enemy.x = eMaxX; if (enemy.y > eMaxY) enemy.y = eMaxY;

        if (currentRoomId === 999 && waveStartDelay > 0) return; 

        if (enemy.isBurning && enemy.burnTicks > 0) {
            enemy.burnTimer--;
            if (enemy.burnTimer <= 0) {
                enemy.health -= 10; enemy.burnTicks--; enemy.burnTimer = 60;
                spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, '#e67e22', 5);
            }
            if (enemy.burnTicks <= 0) enemy.isBurning = false;
        }

        let targetX = player.x; let targetY = player.y; let targetEntity = player; let minDistToTarget = 9999;

        if (necroSummons.length > 0) {
            necroSummons.forEach(s => {
                let sDist = Math.hypot((s.x + s.size/2) - (enemy.x + enemy.size/2), (s.y + s.size/2) - (enemy.y + enemy.size/2));
                if (sDist < minDistToTarget) { minDistToTarget = sDist; targetX = s.x; targetY = s.y; targetEntity = s; }
            });
        }
        
        if (targetEntity === player && !isElfInvuln) minDistToTarget = Math.hypot(targetX - enemy.x, targetY - enemy.y);
        else if (targetEntity === player && isElfInvuln) minDistToTarget = 9999; 

        let dx = 0, dy = 0, dist = minDistToTarget;
        if (dist !== 9999) { dx = targetX - enemy.x; dy = targetY - enemy.y; }

        let currentEnemySpeed = enemy.speed;
        if (enemy.isPermanentlySlowed || enemy.slowTimer > 0) { 
            currentEnemySpeed *= 0.5; 
            if (enemy.slowTimer > 0) enemy.slowTimer--;
        } 

        if (enemy.type === 'goblin') {
            if (dist > 0 && dist < 9999) { enemy.x += (dx / dist) * currentEnemySpeed; enemy.y += (dy / dist) * currentEnemySpeed; }
        } else if (enemy.type === 'spider' || enemy.type === 'skeleton') {
            if (enemy.type === 'spider') {
                if (dist > 100 && dist < 9999) { enemy.x += (dx / dist) * currentEnemySpeed; enemy.y += (dy / dist) * currentEnemySpeed; }
            } else { 
                if (dist > 300 && dist < 9999) { enemy.x += (dx / dist) * currentEnemySpeed; enemy.y += (dy / dist) * currentEnemySpeed; }
                else if (dist < 200) { enemy.x -= (dx / dist) * currentEnemySpeed; enemy.y -= (dy / dist) * currentEnemySpeed; }
            }
            if (enemy.shootCooldown > 0) enemy.shootCooldown--;
            if (enemy.shootCooldown <= 0 && dist < 600) {
                // --- PROJECTILES OS ET TOILES DE CHAUVE-SOURIS ---
                let pSize = enemy.type === 'spider' ? 12 : 8; 
                let pSpeed = enemy.type === 'spider' ? 8 : 6; 
                let pType = enemy.type === 'spider' ? 'bat_web' : 'bone';
                let pColor = enemy.type === 'spider' ? '#8e44ad' : '#ecf0f1';
                
                enemyProjectiles.push({ x: enemy.x+enemy.size/2, y: enemy.y+enemy.size/2, vx: (dx/dist)*pSpeed, vy: (dy/dist)*pSpeed, size: pSize, color: pColor, damage: 20, type: pType, angle: Math.atan2(dy, dx) });
                enemy.shootCooldown = 120;
                
                if (enemy.type === 'skeleton') enemy.attackAnimTimer = 25; 
            }
        } else if (enemy.type === 'troll') {
            if (dist > 0 && dist < 9999) { enemy.x += (dx / dist) * currentEnemySpeed; enemy.y += (dy / dist) * currentEnemySpeed; }
            enemy.summonTimer--;
            if (enemy.summonTimer <= 0) {
                spawnEnemy('goblin', 1, enemy.x, enemy.y); enemy.summonTimer = 180; spawnParticles(enemy.x+enemy.size/2, enemy.y+enemy.size/2, '#27ae60', 20);
            }
        } else if (enemy.type === 'mage') {
            if (dist > 300 && dist < 9999) { enemy.x += (dx / dist) * currentEnemySpeed; enemy.y += (dy / dist) * currentEnemySpeed; }
            else if (dist < 200) { enemy.x -= (dx / dist) * currentEnemySpeed; enemy.y -= (dy / dist) * currentEnemySpeed; }
            enemy.timeAlive++; 
            if (enemy.shootCooldown > 0) enemy.shootCooldown--;
            if (enemy.shootCooldown <= 0 && dist < 800) {
                enemyProjectiles.push({ x: enemy.x+enemy.size/2, y: enemy.y+enemy.size/2, vx: (dx/dist)*6, vy: (dy/dist)*6, size: 10, color: '#9b59b6', damage: 40, type: 'normal', angle: Math.atan2(dy, dx) });
                enemy.shootCooldown = Math.max(30, 90 - (enemy.timeAlive / 20)); 
            }
            enemy.summonTimer--;
            if (enemy.summonTimer <= 0) {
                spawnEnemy('skeleton', 1, enemy.x+50, enemy.y); spawnEnemy('spider', 1, enemy.x-50, enemy.y);
                enemy.summonTimer = 180; spawnParticles(enemy.x+enemy.size/2, enemy.y+enemy.size/2, '#9b59b6', 20);
            }
        } else if (enemy.type === 'dragon') {
            if (enemy.phase2Timer === undefined) enemy.phase2Timer = 1800; 
            if (enemy.phase === 1) {
                if (dist > 150 && dist < 9999) { enemy.x += (dx / dist) * currentEnemySpeed; enemy.y += (dy / dist) * currentEnemySpeed; }
                if (enemy.shootCooldown > 0) enemy.shootCooldown--;
                if (enemy.shootCooldown <= 0 && dist < 500) {
                    let baseAngle = Math.atan2(dy, dx);
                    for(let a = -Math.PI/4; a <= Math.PI/4 + 0.01; a += Math.PI/8) {
                        let fireAngle = baseAngle + a;
                        enemyProjectiles.push({ x: enemy.x+enemy.size/2, y: enemy.y+enemy.size/2, vx: Math.cos(fireAngle)*7, vy: Math.sin(fireAngle)*7, size: 14, color: '#e67e22', damage: playerStats.maxHealth * 0.20, type: 'fire', angle: fireAngle });
                    }
                    enemy.shootCooldown = 90;
                }
                if (enemy.health <= enemy.maxHealth / 2) {
                    enemy.phase = 2; enemy.invulnerable = true;
                    spawnParticles(enemy.x+enemy.size/2, enemy.y+enemy.size/2, '#c0392b', 100); triggerShake(20, 40);
                }
            } else if (enemy.phase === 2) {
                enemy.phase2Timer--; enemy.health = (enemy.phase2Timer / 1800) * (enemy.maxHealth / 2); 
                let rate = enemy.phase2Timer < 600 ? 0.12 : 0.04; 
                if (Math.random() < rate) {
                    hazards.push({ x: wallMargin + arenaShrink + Math.random() * (canvas.width - wallMargin*2 - arenaShrink*2), y: wallMargin + arenaShrink + Math.random() * (canvas.height - wallMargin*2 - arenaShrink*2), radius: 70, timer: 60, maxTimer: 60, damage: 40 });
                }
                if (enemy.shootCooldown > 0) enemy.shootCooldown--;
                if (enemy.shootCooldown <= 0 && dist < 9999) {
                    enemyProjectiles.push({ x: enemy.x+enemy.size/2, y: enemy.y+enemy.size/2, vx: (dx/dist)*8, vy: (dy/dist)*8, size: 12, color: '#c0392b', damage: 30, type: 'fire', angle: Math.atan2(dy, dx) });
                    enemy.shootCooldown = enemy.phase2Timer < 600 ? 15 : 40;
                }
                if (enemy.phase2Timer <= 0) enemy.health = 0; 
            }
        }

        if (targetEntity === player) {
            if (playerInvulnerableTimer <= 0 && !isElfInvuln && !enemy.invulnerable && checkCollision(player, enemy)) {
                if (enemy.type === 'goblin' || enemy.type === 'skeleton') enemy.attackAnimTimer = 15; 
                playerStats.health -= (enemy.type === 'troll' ? 50 : (enemy.type === 'dragon' ? 0 : 20)); 
                triggerShake(12, 20); spawnParticles(player.x + player.size/2, player.y + player.size/2, '#e74c3c', 25);
                playerInvulnerableTimer = 60; updateHUD();
                if (playerStats.health <= 0) handlePlayerDeath();
            }
        } else {
            if (!enemy.invulnerable && checkCollision({x: targetEntity.x, y: targetEntity.y, width: targetEntity.size, height: targetEntity.size}, enemy)) {
                if (enemy.attackCooldown === undefined) enemy.attackCooldown = 0;
                if (enemy.attackCooldown <= 0) {
                    if (enemy.type === 'goblin' || enemy.type === 'skeleton') enemy.attackAnimTimer = 15; 
                    if (!targetEntity.invulnerableTimer || targetEntity.invulnerableTimer <= 0) {
                        targetEntity.health -= (enemy.type === 'troll' ? 30 : 10);
                        spawnParticles(targetEntity.x + targetEntity.size/2, targetEntity.y + targetEntity.size/2, '#e74c3c', 10);
                    }
                    enemy.attackCooldown = 60;
                }
            }
        }
        if (enemy.attackCooldown > 0) enemy.attackCooldown--;
    });

    for (let i = 0; i < currentEnemies.length; i++) {
        for (let j = i + 1; j < currentEnemies.length; j++) {
            let e1 = currentEnemies[i]; let e2 = currentEnemies[j];
            let dx = (e1.x + e1.size/2) - (e2.x + e2.size/2); 
            let dy = (e1.y + e1.size/2) - (e2.y + e2.size/2);
            let dist = Math.hypot(dx, dy); let minDist = (e1.size + e2.size) / 2; 
            if (dist < minDist) {
                if (dist === 0) { dx = Math.random()-0.5; dy = Math.random()-0.5; dist = Math.hypot(dx, dy); }
                let overlap = minDist - dist;
                e1.x += (dx / dist) * (overlap / 2); e1.y += (dy / dist) * (overlap / 2);
                e2.x -= (dx / dist) * (overlap / 2); e2.y -= (dy / dist) * (overlap / 2);
            }
        }
    }

    for (let i = hazards.length - 1; i >= 0; i--) {
        let h = hazards[i]; h.timer--;
        if(h.timer <= 0) {
            if(Math.hypot((player.x+player.size/2) - h.x, (player.y+player.size/2) - h.y) < h.radius + player.size/2) {
                if (playerInvulnerableTimer <= 0 && !isElfInvuln) {
                    playerStats.health -= h.damage; triggerShake(15, 20); playerInvulnerableTimer = 60; updateHUD();
                    if (playerStats.health <= 0) handlePlayerDeath();
                }
            }
            spawnParticles(h.x, h.y, '#e74c3c', 30); triggerShake(8, 10); hazards.splice(i, 1);
        }
    }

    for (let i = currentEnemies.length - 1; i >= 0; i--) {
        if (currentEnemies[i].health <= 0) {
            let e = currentEnemies[i];
            
            if (e.type === 'troll' && currentRoomId === 8 && !worldState.bossDefeated) {
                worldState.bossDefeated = true; 
                currentItems.push({ id: 'boss_key', type: 'key_skull', x: canvas.width/2 - 10, y: canvas.height/2 + 60, size: 20, collected: false });
                triggerShake(20, 30);
            }

            if (player.heroClass === 'Necromancer' || e.killedBySummon || e.killedByNecro) {
                necroKills.push(e.type);
            }

            if (!worldState.bloodStains[currentRoomId]) worldState.bloodStains[currentRoomId] = [];
            for(let b = 0; b < 5; b++) worldState.bloodStains[currentRoomId].push({ x: e.x + Math.random() * 30 - 15, y: e.y + Math.random() * 30 - 15, r: Math.random() * 12 + 4 });
            playerStats.mana = Math.min(100, playerStats.mana + 5); 
            spawnParticles(e.x + e.size/2, e.y + e.size/2, '#c0392b', 30);
            currentEnemies.splice(i, 1);
            if (currentEnemies.length === 0 && currentRoomId !== 999) worldState.clearedRooms[currentRoomId] = true;
            updateHUD();
        }
    }

    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < wallMargin || p.y < wallMargin || p.x > canvas.width - wallMargin || p.y > canvas.height - wallMargin) { projectiles.splice(i, 1); continue; }
        
        let projectileHit = false;

        for (let j = 0; j < currentEnemies.length; j++) {
            let enemy = currentEnemies[j];
            if (p.hitTargets && p.hitTargets.includes(enemy)) continue;
            let arrowHitbox = { x: p.x - p.size, y: p.y - p.size, size: p.size * 2 };
            
            if (checkCollision(arrowHitbox, enemy)) {
                if (!enemy.invulnerable) {
                    let isBlocked = false;
                    
                    if (enemy.type === 'goblin' && Math.random() < 0.10) {
                        isBlocked = true;
                        enemy.blockAnimTimer = 20; 
                        spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, '#bdc3c7', 15);
                    }
                    
                    if (!isBlocked) {
                        let dmg = 0;
                        if (player.heroClass === 'Elf') dmg = 60;
                        else if (player.heroClass === 'Mage') dmg = 30;
                        else if (p.isNecro) { dmg = 10; enemy.isPermanentlySlowed = true; } 
                        
                        enemy.health -= dmg;
                        
                        if (player.heroClass === 'Mage') { enemy.isBurning = true; enemy.burnTicks = 5; enemy.burnTimer = 60; }
                        if (enemy.health <= 0 && p.isNecro) enemy.killedByNecro = true; 
                    }
                }
                spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, enemy.color, 10);
                
                let isPiercingElf = (player.heroClass === 'Elf' && isUltimateActive);
                if (isPiercingElf || player.heroClass === 'Mage') {
                    if (!p.hitTargets) p.hitTargets = []; p.hitTargets.push(enemy); 
                } else { 
                    if (!enemy.invulnerable && enemy.type === 'goblin' && enemy.blockAnimTimer > 0) {
                        projectileHit = true; break; 
                    } else if (!enemy.invulnerable) {
                        projectileHit = true; break; 
                    }
                } 
            }
        }
        if (projectileHit) projectiles.splice(i, 1); 
    }

    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        let p = enemyProjectiles[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < wallMargin || p.y < wallMargin || p.x > canvas.width - wallMargin || p.y > canvas.height - wallMargin) { enemyProjectiles.splice(i, 1); continue; }
        let arrowHitbox = { x: p.x - p.size, y: p.y - p.size, size: p.size * 2 };
        
        let hitSummonIndex = -1;
        for(let j=0; j<necroSummons.length; j++) { 
             let sHitbox = {x: necroSummons[j].x, y: necroSummons[j].y, size: necroSummons[j].size};
             if(checkCollision(arrowHitbox, sHitbox)) { hitSummonIndex = j; break; } 
        }
        
        if (hitSummonIndex !== -1) {
            let s = necroSummons[hitSummonIndex];
            if (!s.invulnerableTimer || s.invulnerableTimer <= 0) {
                s.health -= p.damage;
            }
            spawnParticles(p.x, p.y, p.color, 15); enemyProjectiles.splice(i, 1);
        } else if (playerInvulnerableTimer <= 0 && !isElfInvuln && checkCollision(arrowHitbox, player)) {
            playerStats.health -= p.damage; triggerShake(10, 15);
            spawnParticles(player.x + player.size/2, player.y + player.size/2, '#e74c3c', 25);
            if (p.type === 'bat_web' || p.type === 'poison') { playerPoisonTimer = 300; playerSlowTimer = 180; } 
            playerInvulnerableTimer = 60; enemyProjectiles.splice(i, 1); updateHUD();
            if (playerStats.health <= 0) handlePlayerDeath();
        }
    }

    if (currentRoomId === 8 && worldState && worldState.bossDefeated) {
        let stairsRect = { x: canvas.width/2 - 40, y: canvas.height/2 - 40, width: 80, height: 80 };
        if (checkCollision(player, stairsRect)) {
            if (playerStats.inventory.keys.skull > 0) {
                playerStats.inventory.keys.skull--; 
                setTimeout(() => {
                    alert("FÉLICITATIONS !\n\nVous avez vaincu le Troll Corrompu et trouvé la sortie du donjon.\n\nMerci d'avoir joué !\nLa suite de l'aventure arrive très bientôt...");
                    window.location.reload(); 
                }, 100);
                return;
            } else {
                let dx = (player.x + player.size/2) - (canvas.width/2);
                let dy = (player.y + player.size/2) - (canvas.height/2);
                let dist = Math.hypot(dx, dy);
                if(dist === 0) { dx = 1; dy = 0; dist = 1; }
                player.x += (dx/dist) * 3;
                player.y += (dy/dist) * 3;
            }
        }
    }

    renderGameView();
    requestAnimationFrame(update);
}

update();
