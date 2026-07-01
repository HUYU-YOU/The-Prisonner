// ============================================================================
// js/main.js - MOTEUR PRINCIPAL ET BOUCLE DE JEU
// ============================================================================

document.addEventListener('contextmenu', event => event.preventDefault());

window.update = function() {
    if (typeof arenaShrink === 'undefined') arenaShrink = 0;
    if (typeof waveStartDelay === 'undefined') waveStartDelay = 0;

    if (gameState === "MENU") {
        if (keys['space']) {
            if (typeof spaceHoldTimer === 'undefined') spaceHoldTimer = 0;
            spaceHoldTimer++;
            if (spaceHoldTimer >= 300) { 
                spaceHoldTimer = 0; 
                keys['space'] = false; 
                if (typeof startArenaMode === 'function') startArenaMode('Necromancer'); 
            }
        } else { spaceHoldTimer = 0; }
        requestAnimationFrame(window.update); return;
    }
    
    if (gameState === "PAUSED" || (gameState !== "PLAYING" && gameState !== "GAMEOVER")) { 
        requestAnimationFrame(window.update); return; 
    }
    
    if (gameState === "GAMEOVER") { 
        if (typeof renderGameView === 'function') renderGameView(); 
        requestAnimationFrame(window.update); return; 
    }
    
    // --- GESTION DU MODE ARÈNE ET RÉTRÉCISSEMENT ---
    if (currentRoomId === 999) {
        if (waveStartDelay > 0) waveStartDelay--;
        
        // La map se rétrécit UNIQUEMENT si un troll est présent
        let hasTroll = typeof currentEnemies !== 'undefined' && currentEnemies.some(e => e.type === 'troll');
        
        if (hasTroll && arenaState === "PLAYING" && arenaShrink < 150) { 
            arenaShrink += 0.3; 
        } else if (!hasTroll && arenaShrink > 0) {
            arenaShrink -= 0.5; // S'agrandit quand le boss meurt
            if (arenaShrink < 0) arenaShrink = 0;
        }

        if (arenaState === "WAITING") {
            if (typeof arenaTimer === 'undefined') arenaTimer = 0;
            arenaTimer--;
            
            if (arenaTimer <= 0) {
                arenaState = "PLAYING";
                
                if (arenaWave > 0 && arenaWave % 5 === 0) {
                    currentItems.push({ id: 'pot_g_'+arenaWave, type: 'potion_green', x: canvas.width/2, y: canvas.height/2, size: 15, collected: false });
                    if (typeof spawnParticles === 'function') spawnParticles(canvas.width/2, canvas.height/2, '#2ecc71', 15);
                }

                if (arenaWave === 10) { spawnEnemy('troll', 1); }
                else if (arenaWave === 20) { spawnEnemy('mage', 1); }
                else if (arenaWave === 30) { spawnEnemy('dragon', 1); }
                else if (arenaWave === 35) { spawnEnemy('troll', 1); spawnEnemy('mage', 1); spawnEnemy('goblin', 3); }
                else if (arenaWave === 40) { spawnEnemy('deathgod', 1); }
                else if (arenaWave === 45) { spawnEnemy('mage', 1); spawnEnemy('dragon', 1); spawnEnemy('skeleton', 3); }
                else if (arenaWave === 50) { spawnEnemy('elysia', 1); }
                else {
                    let countGoblin = 3 + Math.floor(arenaWave * 1.2);
                    spawnEnemy('goblin', countGoblin);
                    if (arenaWave >= 3) spawnEnemy('skeleton', Math.floor(arenaWave / 3) + 1);
                    if (arenaWave >= 15) spawnEnemy('spider', 2);
                }
                arenaWave++;
            }
        } else if (arenaState === "PLAYING") {
            if (currentEnemies.length === 0) {
                arenaState = "WAITING";
                arenaTimer = 300; 
                // CORRECTION FREEZE : On vide proprement le tableau des météores
                if (typeof hazards !== 'undefined') hazards.length = 0; 
                if (typeof updateHUD === 'function') updateHUD();
            }
        }
    }

    if (!worldState.openedDoors) worldState.openedDoors = {};
    if (!worldState.droppedItems) worldState.droppedItems = {};
    
    // --- CORRECTION DES PORTES ET OBJETS DISPARUS ---
    let roomChanged = false;
    let doorToPass = null;
    
    for (let i = 0; i < currentDoors.length; i++) {
        let door = currentDoors[i];
        
        if (currentRoomId === 8 && !worldState.bossDefeated && door.face === 'south') {
            if (checkCollision(player, door)) { player.y = door.y - player.size - 5; }
            continue;
        }
        
        if (!doorToPass && checkCollision(player, door)) {
            if (door.locked) {
                if (playerStats.inventory.keys.gold > 0) {
                    playerStats.inventory.keys.gold--; 
                    door.locked = false; 
                    worldState.unlockedDoors[door.id] = true;
                    if (typeof updateHUD === 'function') updateHUD();
                    if (door.dest !== null) doorToPass = door;
                } else {
                    if (door.face === 'north') player.y = door.y + door.height;
                    else if (door.face === 'south') player.y = door.y - player.size;
                    else if (door.face === 'east') player.x = door.x - player.size;
                    else if (door.face === 'west') player.x = door.x + door.width;
                }
            } else if (door.dest !== null) {
                doorToPass = door;
            }
        }
    }

    if (doorToPass) {
        // Sauvegarde des items de la pièce qu'on quitte
        worldState.droppedItems[currentRoomId] = JSON.parse(JSON.stringify(currentItems));
        worldState.openedDoors[doorToPass.id] = true;

        let returnFace = 'south';
        if (doorToPass.face === 'north') returnFace = 'south';
        else if (doorToPass.face === 'south') returnFace = 'north';
        else if (doorToPass.face === 'east') returnFace = 'west';
        else if (doorToPass.face === 'west') returnFace = 'east';

        if (typeof saveRoomState === 'function') saveRoomState();
        if (typeof loadRoom === 'function') loadRoom(doorToPass.dest, doorToPass.face);

        // Récupération des items de la pièce dans laquelle on entre
        if (worldState.droppedItems[doorToPass.dest]) {
            let loaded = JSON.parse(JSON.stringify(worldState.droppedItems[doorToPass.dest]));
            currentItems.length = 0;
            loaded.forEach(item => currentItems.push(item));
        }

        // Ouvre la porte dans notre dos
        if (typeof currentDoors !== 'undefined') {
            currentDoors.forEach(d => {
                if (d.face === returnFace) {
                    worldState.openedDoors[d.id] = true;
                    d.locked = false;
                }
            });
        }

        player.x = doorToPass.spawnX;
        player.y = doorToPass.spawnY;
        requestAnimationFrame(window.update);
        return;
    }
    
    // --- CONTRÔLES ULTIME ---
    if ((keys['space'] || keys['0'] || keys['control']) && playerStats.mana >= 100) {
        if (typeof activateUltimate === 'function') activateUltimate(); 
        keys['space'] = false; keys['0'] = false; keys['control'] = false; 
    }
    
    if (leftClickHeld) {
        leftClickHoldTime++;
        if (leftClickHoldTime >= 180 && playerStats.mana >= 100) { 
            if (typeof activateUltimate === 'function') activateUltimate(); 
            leftClickHeld = false; 
        }
    }
    
    // --- TIMERS ET HUD ---
    if (player.dashCooldown === undefined) player.dashCooldown = 0;
    if (player.dashCooldown > 0) player.dashCooldown--;
    if (attackCooldown > 0) attackCooldown--;
    if (player.heroClass === 'Knight' && attackCooldown < 25) isAttacking = false;

    if (isUltimateActive) {
        ultimateTimer--;
        if (ultimateTimer <= 0) isUltimateActive = false;
        if (player.heroClass === 'Knight' && ultimateTimer % 60 === 0) {
            playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + (playerStats.maxHealth * 0.1));
            if (typeof updateHUD === 'function') updateHUD(); 
        }
    }
    
    if (playerPoisonTimer > 0) {
        playerPoisonTimer--;
        if (playerPoisonTimer % 60 === 0 && playerStats.health > 1) {
            playerStats.health -= 5; if (playerStats.health < 1) playerStats.health = 1;
            if (typeof updateHUD === 'function') updateHUD(); 
        }
    }
    
    if (playerSlowTimer > 0) playerSlowTimer--;
    if (playerInvulnerableTimer > 0) playerInvulnerableTimer--;
    let manaBar = document.getElementById('mana-bar');
    if (playerStats.mana >= 100) { if (manaBar) manaBar.style.opacity = Math.floor(Date.now() / 250) % 2 === 0 ? "1" : "0.3"; } else { if (manaBar) manaBar.style.opacity = "1"; }
    
    // --- DÉPLACEMENTS ---
    let currentSpeedPlayer = playerSlowTimer > 0 ? player.speed / 2 : player.speed;
    let centerStairs = { x: canvas.width/2 - 75, y: canvas.height/2 - 75, width: 150, height: 150 };
    let dx_mov = 0; let dy_mov = 0;
    
    if (player.dashTimer > 0) {
        player.dashTimer--; dx_mov = player.dashVx; dy_mov = player.dashVy;
    } else {
        if (keys['q'] || keys['a'] || keys['arrowleft'])  dx_mov -= currentSpeedPlayer;
        if (keys['d'] || keys['arrowright'])              dx_mov += currentSpeedPlayer;
        if (keys['z'] || keys['w'] || keys['arrowup'])    dy_mov -= currentSpeedPlayer;
        if (keys['s'] || keys['arrowdown'])               dy_mov += currentSpeedPlayer;
    }
    
    let oldPx = player.x; player.x += dx_mov;
    if (currentRoomId === 8 && checkCollision(player, centerStairs) && (!worldState.bossDefeated || playerStats.inventory.keys.skull <= 0)) { player.x = oldPx; player.dashTimer = 0; } 
    for (let i = 0; i < currentCrates.length; i++) {
        let obj = currentCrates[i];
        if (!obj.isBroken && checkCollision(player, obj)) { player.x = oldPx; player.dashTimer = 0; break; }
    }
    
    let oldPy = player.y; player.y += dy_mov;
    if (currentRoomId === 8 && checkCollision(player, centerStairs) && (!worldState.bossDefeated || playerStats.inventory.keys.skull <= 0)) { player.y = oldPy; player.dashTimer = 0; } 
    for (let i = 0; i < currentCrates.length; i++) {
        let obj = currentCrates[i];
        if (!obj.isBroken && checkCollision(player, obj)) { player.y = oldPy; player.dashTimer = 0; break; }
    }
    
    let isVertCorridor = (currentRoomId === 5 || currentRoomId === 6);
    let bLeft = isVertCorridor ? 350 : wallMargin;
    let bRight = isVertCorridor ? canvas.width - 350 : canvas.width - wallMargin;
    let bTop = wallMargin;
    let bBot = canvas.height - wallMargin;

    let minLimitX = bLeft + arenaShrink; 
    let minLimitY = bTop + arenaShrink;
    let maxLimitX = bRight - arenaShrink - player.size;
    let maxLimitY = bBot - arenaShrink - player.size;
    if (player.x < minLimitX) player.x = minLimitX; if (player.y < minLimitY) player.y = minLimitY;
    if (player.x > maxLimitX) player.x = maxLimitX; if (player.y > maxLimitY) player.y = maxLimitY;
    
    if (currentRoomId === 1 && typeof bookshelf !== 'undefined' && player.x + player.size > bookshelf.x && player.y + player.size > bookshelf.y && player.y < bookshelf.y + bookshelf.height) {
        player.x = bookshelf.x - player.size;
    }
    if (player.dashTimer <= 0) {
        player.faceAngle = Math.atan2(mouse.y - (player.y + player.size / 2), mouse.x - (player.x + player.size / 2));
    }
    
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.03; 
        if (p.life <= 0) particles.splice(i, 1);
    }
    
    // --- GESTION DU FONDU DU SANG ---
    for (let i = bloodStains.length - 1; i >= 0; i--) {
        let b = bloodStains[i];
        if (b.life === undefined) b.life = (currentRoomId === 999) ? 1200 : 3600; 
        b.life--;
        if (b.life < 300) { b.opacity = b.life / 300; } else { b.opacity = 1.0; }
        if (b.life <= 0) bloodStains.splice(i, 1);
    }

    if (typeof updateItemsAndCrates === 'function') updateItemsAndCrates();
    if (typeof updateEnemies === 'function') updateEnemies();
    if (typeof updateProjectiles === 'function') updateProjectiles();

    if (currentRoomId === 8 && worldState && worldState.bossDefeated) {
        let triggerStairs = { x: canvas.width/2 - 45, y: canvas.height/2 - 45, width: 90, height: 90 };
        if (checkCollision(player, triggerStairs)) {
            if (playerStats.inventory.keys.skull > 0) {
                playerStats.inventory.keys.skull--; 
                setTimeout(() => { alert("FÉLICITATIONS !\n\nLa suite de l'aventure arrive très bientôt..."); window.location.reload(); }, 100); 
                return;
            }
        }
    }
    if (typeof renderGameView === 'function') renderGameView(); 
    requestAnimationFrame(window.update);
};
window.update();
