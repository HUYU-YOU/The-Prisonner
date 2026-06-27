// ============================================================================
// js/main.js - MOTEUR PRINCIPAL ET BOUCLE DE JEU
// ============================================================================

// Désactive le menu Clic Droit normal du navigateur pour utiliser le Dash !
document.addEventListener('contextmenu', event => event.preventDefault());

window.update = function() {
    // --- GESTION DU MENU ---
    if (gameState === "MENU") {
        if (keys['space']) {
            if (typeof spaceHoldTimer === 'undefined') spaceHoldTimer = 0;
            spaceHoldTimer++;
            if (spaceHoldTimer >= 300) { 
                spaceHoldTimer = 0; 
                keys['space'] = false; 
                if (typeof window.startArenaMode === 'function') {
                    window.startArenaMode('Necromancer');
                } 
            }
        } else { 
            spaceHoldTimer = 0; 
        }
        requestAnimationFrame(window.update); 
        return;
    }
    
    // --- ÉTATS DE PAUSE OU FIN DE JEU ---
    if (gameState === "PAUSED") { 
        requestAnimationFrame(window.update); 
        return; 
    }
    if (gameState !== "PLAYING" && gameState !== "GAMEOVER") { 
        requestAnimationFrame(window.update); 
        return; 
    }
    if (gameState === "GAMEOVER") { 
        if (typeof window.renderGameView === 'function') window.renderGameView(); 
        requestAnimationFrame(window.update); 
        return; 
    }
    
    // --- GESTION DU MODE ARÈNE (VAGUES) ---
    if (currentRoomId === 999) {
        if (waveStartDelay > 0) waveStartDelay--;
        
        // Rétrécissement de l'arène à partir de la vague 10
        if (arenaWave >= 10 && arenaShrink < 150) { 
            arenaShrink += 0.1; 
        }
        
        if (arenaState === "WAITING") {
            arenaTimer--;
            if (arenaTimer <= 0) {
                arenaState = "PLAYING";
                
                // Génération des ennemis selon le numéro de la vague
                let countGoblin = 3 + Math.floor(arenaWave * 1.2);
                if (typeof window.spawnEnemy === 'function') {
                    window.spawnEnemy('goblin', countGoblin);
                    if (arenaWave >= 3) window.spawnEnemy('skeleton', Math.floor(arenaWave / 3) + 1);
                    if (arenaWave % 5 === 0) window.spawnEnemy('troll', 1 + Math.floor(arenaWave / 20));
                    if (arenaWave >= 8 && arenaWave % 3 === 0) window.spawnEnemy('mage', 1);
                    if (arenaWave % 10 === 0) window.spawnEnemy('dragon', 1);
                }
                arenaWave++;
            }
        } else if (arenaState === "PLAYING") {
            if (currentEnemies.length === 0) {
                arenaState = "WAITING";
                arenaTimer = 180; // 3 secondes d'attente avant la prochaine vague
                
                // Petit soin à la fin de chaque vague
                playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + 15);
                if (typeof window.updateHUD === 'function') window.updateHUD();
            }
        }
    }

    // --- CHANGEMENT DE SALLE & PORTES ---
    if (!worldState.openedDoors) worldState.openedDoors = {};
    let roomChanged = false;
    
    currentDoors.forEach(door => {
        // Bloquer la porte sud du boss si pas encore vaincu
        if (currentRoomId === 8 && !worldState.bossDefeated && door.face === 'south') {
            if (window.checkCollision(player, door)) { 
                player.y = door.y - player.size - 5; 
            } 
            return;
        }
        
        if (!roomChanged && window.checkCollision(player, door)) { 
            if (door.locked) {
                if (playerStats.inventory.keys.gold > 0) {
                    playerStats.inventory.keys.gold--; 
                    door.locked = false; 
                    worldState.unlockedDoors[door.id] = true; 
                    
                    if (typeof window.updateHUD === 'function') window.updateHUD();
                    if (typeof window.spawnParticles === 'function') window.spawnParticles(door.x + door.width/2, door.y + door.height/2, '#f1c40f', 30);
                    
                    if (door.dest !== null) { 
                        worldState.openedDoors[door.id] = true; 
                        if (typeof window.saveRoomState === 'function') window.saveRoomState(); 
                        if (typeof window.loadRoom === 'function') window.loadRoom(door.dest, door.face); 
                        player.x = door.spawnX; 
                        player.y = door.spawnY; 
                        roomChanged = true; 
                    }
                } else {
                    // Repousser le joueur s'il n'a pas la clé
                    if (door.face === 'north') player.y = door.y + door.height; 
                    else if (door.face === 'south') player.y = door.y - player.size;
                    else if (door.face === 'east') player.x = door.x - player.size; 
                    else if (door.face === 'west') player.x = door.x + door.width;
                }
            } else if (door.dest !== null) { 
                worldState.openedDoors[door.id] = true; 
                if (typeof window.saveRoomState === 'function') window.saveRoomState(); 
                if (typeof window.loadRoom === 'function') window.loadRoom(door.dest, door.face); 
                player.x = door.spawnX; 
                player.y = door.spawnY; 
                roomChanged = true; 
            } 
        }
    });
    
    if (roomChanged) { 
        requestAnimationFrame(window.update); 
        return; 
    }
    
    // --- GESTION DES RECHARGES ET EFFETS ---
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
    
    // Gestion des cooldowns d'attaque du joueur
    if (attackCooldown > 0) attackCooldown--;
    if (player.heroClass === 'Knight' && attackCooldown < 25) isAttacking = false;
    
    if (player.dashCooldown === undefined) player.dashCooldown = 0;
    if (player.dashCooldown > 0) player.dashCooldown--;
    
    // Compétence ultime active
    if (isUltimateActive) {
        ultimateTimer--;
        if (ultimateTimer <= 0) isUltimateActive = false;
        if (player.heroClass === 'Knight' && ultimateTimer % 60 === 0) {
            playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + (playerStats.maxHealth * 0.1));
            if (typeof window.updateHUD === 'function') window.updateHUD(); 
            if (typeof window.spawnParticles === 'function') window.spawnParticles(player.x + player.size/2, player.y + player.size/2, '#2ecc71', 10);
        }
    }
    
    // Gestion du poison
    if (playerPoisonTimer > 0) {
        playerPoisonTimer--;
        if (playerPoisonTimer % 60 === 0 && playerStats.health > 1) {
            playerStats.health -= 5; 
            if (playerStats.health < 1) playerStats.health = 1;
            if (typeof window.updateHUD === 'function') window.updateHUD(); 
            if (typeof window.spawnParticles === 'function') window.spawnParticles(player.x + player.size/2, player.y + player.size/2, '#8e44ad', 5);
        }
    }
    
    if (playerSlowTimer > 0) playerSlowTimer--;
    if (playerInvulnerableTimer > 0) playerInvulnerableTimer--;
    
    // Animation visuelle de la barre de Mana chargée
    let manaBar = document.getElementById('mana-bar');
    if (playerStats.mana >= 100) { 
        if (manaBar) manaBar.style.opacity = Math.floor(Date.now() / 250) % 2 === 0 ? "1" : "0.3"; 
    } else { 
        if (manaBar) manaBar.style.opacity = "1"; 
    }
    
    // --- DÉPLACEMENTS DU JOUEUR ---
    let currentSpeedPlayer = playerSlowTimer > 0 ? player.speed / 2 : player.speed;
    let centerStairs = { x: canvas.width/2 - 75, y: canvas.height/2 - 75, width: 150, height: 150 };
    let dx_mov = 0; 
    let dy_mov = 0;
    
    if (player.dashTimer > 0) {
        player.dashTimer--; 
        dx_mov = player.dashVx; 
        dy_mov = player.dashVy;
    } else {
        if (keys['q'] || keys['a'] || keys['arrowleft'])  dx_mov -= currentSpeedPlayer;
        if (keys['d'] || keys['arrowright'])              dx_mov += currentSpeedPlayer;
        if (keys['z'] || keys['w'] || keys['arrowup'])    dy_mov -= currentSpeedPlayer;
        if (keys['s'] || keys['arrowdown'])               dy_mov += currentSpeedPlayer;
    }
    
    // Mouvement X + Collisions
    let oldPx = player.x; 
    player.x += dx_mov;
    
    if (currentRoomId === 8 && window.checkCollision(player, centerStairs) && (!worldState.bossDefeated || playerStats.inventory.keys.skull <= 0)) { 
        player.x = oldPx; player.dashTimer = 0; 
    } 
    for (let i = 0; i < currentCrates.length; i++) {
        let obj = currentCrates[i];
        if ((!obj.isBroken || obj.type === 'chest') && window.checkCollision(player, obj)) { 
            player.x = oldPx; player.dashTimer = 0; break; 
        }
    }
    
    // Mouvement Y + Collisions
    let oldPy = player.y; 
    player.y += dy_mov;
    
    if (currentRoomId === 8 && window.checkCollision(player, centerStairs) && (!worldState.bossDefeated || playerStats.inventory.keys.skull <= 0)) { 
        player.y = oldPy; player.dashTimer = 0; 
    } 
    for (let i = 0; i < currentCrates.length; i++) {
        let obj = currentCrates[i];
        if ((!obj.isBroken || obj.type === 'chest') && window.checkCollision(player, obj)) { 
            player.y = oldPy; player.dashTimer = 0; break; 
        }
    }
    
    // Limites de la pièce (Murs)
    let isVertCorridor = (currentRoomId === 5 || currentRoomId === 6);
    let bLeft = isVertCorridor ? 350 : wallMargin;
    let bRight = isVertCorridor ? canvas.width - 350 : canvas.width - wallMargin;
    let bTop = wallMargin;
    let bBot = canvas.height - wallMargin;

    let minLimitX = bLeft + arenaShrink; 
    let minLimitY = bTop + arenaShrink;
    let maxLimitX = bRight - arenaShrink - player.size;
    let maxLimitY = bBot - arenaShrink - player.size;
    
    if (player.x < minLimitX) player.x = minLimitX; 
    if (player.y < minLimitY) player.y = minLimitY;
    if (player.x > maxLimitX) player.x = maxLimitX; 
    if (player.y > maxLimitY) player.y = maxLimitY;
    
    // Collision spécifique avec la Bibliothèque de la salle 1
    if (currentRoomId === 1 && typeof bookshelf !== 'undefined' && player.x + player.size > bookshelf.x && player.y + player.size > bookshelf.y && player.y < bookshelf.y + bookshelf.height) {
        player.x = bookshelf.x - player.size;
    }
    
    // Orientation du regard du joueur vers la souris
    if (player.dashTimer <= 0) {
        player.faceAngle = Math.atan2(mouse.y - (player.y + player.size / 2), mouse.x - (player.x + player.size / 2));
    }
    
    // --- APPELS DES SYSTÈMES SECONDAIRES ---
    if (typeof window.updateItemsAndCrates === 'function') window.updateItemsAndCrates();
    if (typeof window.updateEnemies === 'function') window.updateEnemies();
    if (typeof window.updateProjectiles === 'function') window.updateProjectiles();

    // --- FIN DU DONJON (STAIRS TRIGGER) ---
    if (currentRoomId === 8 && worldState && worldState.bossDefeated) {
        let triggerStairs = { x: canvas.width/2 - 45, y: canvas.height/2 - 45, width: 90, height: 90 };
        if (window.checkCollision(player, triggerStairs)) {
            if (playerStats.inventory.keys.skull > 0) {
                playerStats.inventory.keys.skull--; 
                setTimeout(() => { 
                    alert("FÉLICITATIONS !\n\nLa suite de l'aventure arrive très bientôt..."); 
                    window.location.reload(); 
                }, 100); 
                return;
            }
        }
    }
    
    // Affichage graphique final
    if (typeof window.renderGameView === 'function') window.renderGameView(); 
    requestAnimationFrame(window.update);
};

// Lancement automatique du cycle du moteur
window.update();
