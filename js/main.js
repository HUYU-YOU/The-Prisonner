// ============================================================================
// js/main.js - LE CHEF D'ORCHESTRE (Boucle de jeu principale)
// ============================================================================

window.update = function() {
    
    // --- 1. MENUS ET PAUSES ---
    if (gameState === "MENU") {
        if (keys['space']) { 
            spaceHoldTimer++; 
            if (spaceHoldTimer >= 300) { 
                spaceHoldTimer = 0; keys['space'] = false; 
                if (typeof window.startArenaMode === 'function') window.startArenaMode('Necromancer'); 
            } 
        } else { spaceHoldTimer = 0; }
        requestAnimationFrame(window.update); 
        return;
    }

    if (gameState === "PAUSED") { requestAnimationFrame(window.update); return; }
    if (gameState !== "PLAYING" && gameState !== "GAMEOVER") { requestAnimationFrame(window.update); return; }
    
    if (gameState === "GAMEOVER") { 
        if(typeof window.renderGameView === 'function') window.renderGameView(); 
        requestAnimationFrame(window.update); 
        return; 
    }

    // --- 2. GESTION DE L'ARÈNE ---
    if (currentRoomId === 999 && waveStartDelay > 0) waveStartDelay--;
    if (!worldState.openedDoors) worldState.openedDoors = {};

    // --- 3. COLLISIONS DES PORTES ET TRANSITIONS ---
    let roomChanged = false;
    currentDoors.forEach(door => {
        if (currentRoomId === 8 && !worldState.bossDefeated && door.face === 'south') { 
            if (window.checkCollision(player, door)) { player.y = door.y - player.size - 5; } 
            return; 
        }

        if (!roomChanged && window.checkCollision(player, door)) { 
            if (door.locked) {
                if (playerStats.inventory.keys.gold > 0) {
                    playerStats.inventory.keys.gold--; 
                    door.locked = false; 
                    worldState.unlockedDoors[door.id] = true; 
                    
                    if(typeof window.updateHUD === 'function') window.updateHUD(); 
                    if(typeof window.spawnParticles === 'function') window.spawnParticles(door.x + door.width/2, door.y + door.height/2, '#f1c40f', 30);
                    
                    if (door.dest !== null) { 
                        worldState.openedDoors[door.id] = true; 
                        if (door.id) { let p = door.id.split('_'); if (p.length === 3) worldState.openedDoors['door_'+p[2]+'_'+p[1]] = true; } 
                        if(typeof window.saveRoomState === 'function') window.saveRoomState(); 
                        if(typeof window.loadRoom === 'function') window.loadRoom(door.dest, door.face); 
                        player.x = door.spawnX; player.y = door.spawnY; 
                        roomChanged = true; 
                    }
                } else {
                    if (door.face === 'north') player.y = door.y + door.height; 
                    else if (door.face === 'south') player.y = door.y - player.size; 
                    else if (door.face === 'east') player.x = door.x - player.size; 
                    else if (door.face === 'west') player.x = door.x + door.width;
                }
            } else if (door.dest !== null) { 
                worldState.openedDoors[door.id] = true; 
                if (door.id) { let p = door.id.split('_'); if (p.length === 3) worldState.openedDoors['door_'+p[2]+'_'+p[1]] = true; }
                
                if(typeof window.saveRoomState === 'function') window.saveRoomState(); 
                if(typeof window.loadRoom === 'function') window.loadRoom(door.dest, door.face); 
                player.x = door.spawnX; player.y = door.spawnY; 
                roomChanged = true; 
            } 
        }
    });
    
    if (roomChanged) { requestAnimationFrame(window.update); return; }

    // --- 4. ULTIMATES ET COOLDOWNS DU JOUEUR ---
    if ((keys['space'] || keys['0'] || keys['control']) && playerStats.mana >= 100) { 
        if (typeof window.activateUltimate === 'function') window.activateUltimate(); 
        keys['space'] = false; keys['0'] = false; keys['control'] = false; 
    }
    
    if (leftClickHeld) { 
        leftClickHoldTime++; 
        if (leftClickHoldTime >= 180 && playerStats.mana >= 100) { 
            if (typeof window.activateUltimate === 'function') window.activateUltimate(); 
            leftClickHeld = false; 
        } 
    }

    if (player.dashCooldown > 0) player.dashCooldown--;

    if (isUltimateActive) {
        ultimateTimer--; 
        if (ultimateTimer <= 0) isUltimateActive = false;
        if (player.heroClass === 'Knight' && ultimateTimer % 60 === 0) { 
            playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + (playerStats.maxHealth * 0.1)); 
            if(typeof window.updateHUD === 'function') window.updateHUD(); 
            if(typeof window.spawnParticles === 'function') window.spawnParticles(player.x + player.size/2, player.y + player.size/2, '#2ecc71', 10); 
        }
    }
    
    if (playerPoisonTimer > 0) { 
        playerPoisonTimer--; 
        if (playerPoisonTimer % 60 === 0 && playerStats.health > 1) { 
            playerStats.health -= 5; 
            if (playerStats.health < 1) playerStats.health = 1; 
            if(typeof window.updateHUD === 'function') window.updateHUD(); 
            if(typeof window.spawnParticles === 'function') window.spawnParticles(player.x + player.size/2, player.y + player.size/2, '#8e44ad', 5); 
        } 
    }
    if (playerSlowTimer > 0) playerSlowTimer--; 
    if (playerInvulnerableTimer > 0) playerInvulnerableTimer--;

    let manaBar = document.getElementById('mana-bar');
    if (manaBar) manaBar.style.opacity = (playerStats.mana >= 100 && Math.floor(Date.now() / 250) % 2 === 0) ? "0.3" : "1";

    if (attackCooldown > 0) attackCooldown--; 
    if (player.heroClass === 'Knight' && attackCooldown < 25) isAttacking = false;

    // --- 5. LOGIQUE DES VAGUES EN MODE ARÈNE ---
    if (currentRoomId === 999) {
        if (arenaState === "ACTIVE" && currentEnemies.length === 0) { arenaState = "WAITING"; arenaTimer = 300; }
        if (arenaState === "WAITING" && waveStartDelay <= 0) {
            arenaTimer--;
            if (arenaTimer <= 0) {
                if (arenaWave % 5 === 0) currentItems.push({ id: 'potion_arena_' + arenaWave, type: 'potion_green', x: canvas.width/2 - 7.5, y: canvas.height/2 - 7.5, size: 15, collected: false });
                
                if (arenaWave === 10) { if(typeof window.spawnEnemy === 'function') window.spawnEnemy('troll', 1); } 
                else if (arenaWave === 20) { if(typeof window.spawnEnemy === 'function') window.spawnEnemy('mage', 1); } 
                else if (arenaWave === 30) { if(typeof window.spawnEnemy === 'function') window.spawnEnemy('dragon', 1); }
                else {
                    if (arenaWave < 5) { if(typeof window.spawnEnemy === 'function') window.spawnEnemy('goblin', arenaWave * 2); } 
                    else if (arenaWave < 15) { if(typeof window.spawnEnemy === 'function') { window.spawnEnemy('goblin', 5); window.spawnEnemy('skeleton', arenaWave - 4); } } 
                    else { 
                        let numGoblins = 5; let numSkeletons = 10; let numSpiders = 0; let extra = arenaWave - 14; 
                        for (let i = 1; i <= extra; i++) { let cycle = i % 3; if (cycle === 1) numSkeletons++; else if (cycle === 2) numSpiders++; else numGoblins++; } 
                        if(typeof window.spawnEnemy === 'function') { window.spawnEnemy('goblin', numGoblins); window.spawnEnemy('skeleton', numSkeletons); if (numSpiders > 0) window.spawnEnemy('spider', numSpiders); } 
                    }
                }
                waveStartDelay = 60; arenaState = "ACTIVE"; arenaWave++; 
            }
        }
    }

    // --- 6. DÉPLACEMENT DU JOUEUR ---
    let currentSpeedPlayer = playerSlowTimer > 0 ? player.speed / 2 : player.speed;
    let centerStairs = { x: canvas.width/2 - 75, y: canvas.height/2 - 75, width: 150, height: 150 };
    
    let dx_mov = 0; let dy_mov = 0;
    if (player.dashTimer > 0) { 
        player.dashTimer--; dx_mov = player.dashVx; dy_mov = player.dashVy; 
        if (player.dashTimer % 3 === 0) { if (typeof window.spawnParticles === 'function') window.spawnParticles(player.x + player.size/2, player.y + player.size/2, '#95a5a6', 2); } 
    } else {
        if (keys['q'] || keys['a'] || keys['arrowleft']) dx_mov -= currentSpeedPlayer; 
        if (keys['d'] || keys['arrowright']) dx_mov += currentSpeedPlayer;
        if (keys['z'] || keys['w'] || keys['arrowup']) dy_mov -= currentSpeedPlayer; 
        if (keys['s'] || keys['arrowdown']) dy_mov += currentSpeedPlayer;
    }

    let oldPx = player.x; player.x += dx_mov;
    if (currentRoomId === 8 && window.checkCollision(player, centerStairs) && (!worldState.bossDefeated || playerStats.inventory.keys.skull <= 0)) { player.x = oldPx; player.dashTimer = 0; } 
    for (let i = 0; i < currentCrates.length; i++) { 
        if (!currentCrates[i].isBroken && window.checkCollision(player, currentCrates[i])) { player.x = oldPx; player.dashTimer = 0; break; } 
    } 

    let oldPy = player.y; player.y += dy_mov;
    if (currentRoomId === 8 && window.checkCollision(player, centerStairs) && (!worldState.bossDefeated || playerStats.inventory.keys.skull <= 0)) { player.y = oldPy; player.dashTimer = 0; } 
    for (let i = 0; i < currentCrates.length; i++) { 
        if (!currentCrates[i].isBroken && window.checkCollision(player, currentCrates[i])) { player.y = oldPy; player.dashTimer = 0; break; } 
    }

    let bTop = (currentRoomId === 2 || currentRoomId === 3) ? 250 : wallMargin; 
    let bBot = (currentRoomId === 2 || currentRoomId === 3) ? 550 : canvas.height - wallMargin;
    let minLimitX = wallMargin + arenaShrink; let minLimitY = bTop + arenaShrink;
    let maxLimitX = canvas.width - wallMargin - arenaShrink - player.size; let maxLimitY = bBot - arenaShrink - player.size;

    if (player.x < minLimitX) player.x = minLimitX; if (player.y < minLimitY) player.y = minLimitY;
    if (player.x > maxLimitX) player.x = maxLimitX; if (player.y > maxLimitY) player.y = maxLimitY;

    if (currentRoomId === 1 && typeof bookshelf !== 'undefined' && player.x + player.size > bookshelf.x && player.y + player.size > bookshelf.y && player.y < bookshelf.y + bookshelf.height) { player.x = bookshelf.x - player.size; }
    if (player.dashTimer <= 0) player.faceAngle = Math.atan2(mouse.y - (player.y + player.size / 2), mouse.x - (player.x + player.size / 2));

    // --- 7. DÉLÉGATION DU TRAVAIL AUX AUTRES FICHIERS ---
    if (typeof window.updateItemsAndCrates === 'function') window.updateItemsAndCrates();
    if (typeof window.updateEnemies === 'function') window.updateEnemies();
    if (typeof window.updateProjectiles === 'function') window.updateProjectiles();

    // Tir des ennemis (Ajout rapide pour les squelettes)
    enemyProjectiles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) { enemyProjectiles.splice(i, 1); return; }
        if (playerInvulnerableTimer <= 0 && window.checkCollision({x: p.x - p.size, y: p.y - p.size, width: p.size*2, height: p.size*2}, player)) {
            playerStats.health -= p.damage || 20; 
            if (typeof window.triggerShake === 'function') window.triggerShake(10, 15);
            if (typeof window.spawnParticles === 'function') window.spawnParticles(player.x, player.y, '#e74c3c', 20);
            playerInvulnerableTimer = 30;
            if (typeof window.updateHUD === 'function') window.updateHUD();
            if (playerStats.health <= 0 && typeof window.handlePlayerDeath === 'function') window.handlePlayerDeath();
            enemyProjectiles.splice(i, 1);
        }
    });

    // --- 8. CONDITION DE VICTOIRE (BOSS) ---
    if (currentRoomId === 8 && worldState && worldState.bossDefeated) {
        let triggerStairs = { x: canvas.width/2 - 45, y: canvas.height/2 - 45, width: 90, height: 90 };
        if (window.checkCollision(player, triggerStairs)) {
            if (playerStats.inventory.keys.skull > 0) {
                playerStats.inventory.keys.skull--; 
                setTimeout(() => { alert("FÉLICITATIONS !\n\nLa suite de l'aventure arrive très bientôt..."); window.location.reload(); }, 100); 
                return;
            }
        }
    }

    // --- 9. DESSIN DE L'ÉCRAN ---
    if (typeof window.renderGameView === 'function') window.renderGameView(); 
    
    // Rappel de la boucle au prochain rafraîchissement d'écran (60 FPS)
    requestAnimationFrame(window.update);
};

// ============================================================================
// DÉMARRAGE DU JEU (Met le contact de la voiture !)
// ============================================================================
window.update();
