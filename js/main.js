window.update = function() {
    try {
        if (typeof arenaShrink === 'undefined') arenaShrink = 0;
        if (typeof waveStartDelay === 'undefined') waveStartDelay = 0;

        if (gameState === "MENU") {
            if (keys['space']) {
                if (typeof spaceHoldTimer === 'undefined') spaceHoldTimer = 0;
                spaceHoldTimer++;
                if (spaceHoldTimer >= 300) { 
                    spaceHoldTimer = 0; 
                    keys['space'] = false; 
                    if (typeof window.startArenaMode === 'function') window.startArenaMode('Necromancer'); 
                }
            } else { spaceHoldTimer = 0; }
            requestAnimationFrame(window.update); return;
        }
        
        if (gameState === "WAITING_MOVE") {
            if (keys['z'] || keys['w'] || keys['s'] || keys['q'] || keys['a'] || keys['d'] || keys['arrowup'] || keys['arrowdown'] || keys['arrowleft'] || keys['arrowright']) {
                gameState = "PLAYING";
            } else {
                if (typeof currentRoomId !== 'undefined' && currentRoomId == 301) {
                    if (typeof window.renderLevel4 === 'function') window.renderLevel4();
                } else if (typeof currentRoomId !== 'undefined' && currentRoomId >= 401 && currentRoomId < 500) {
                    if (typeof window.renderLevel5 === 'function') window.renderLevel5();
                } else {
                    if (typeof window.renderGameView === 'function') window.renderGameView();
                }
                requestAnimationFrame(window.update);
                return;
            }
        }

        if (gameState === "PAUSED" || gameState === "CINEMATIC" || (gameState !== "PLAYING" && gameState !== "GAMEOVER")) { 
            requestAnimationFrame(window.update); return; 
        }

        if (gameState === "GAMEOVER") { 
            if (typeof window.renderGameView === 'function') window.renderGameView(); 
            requestAnimationFrame(window.update); return; 
        }

        if (typeof currentRoomId !== 'undefined' && currentRoomId == 301) {
            if (typeof window.updateLevel4 === 'function') {
                window.updateLevel4();
                requestAnimationFrame(window.update); 
                return; 
            }
        }

        if (typeof currentRoomId !== 'undefined' && currentRoomId >= 401 && currentRoomId < 500) {
            if (typeof window.updateLevel5 === 'function') {
                window.updateLevel5();
                requestAnimationFrame(window.update); 
                return; 
            }
        }

        if (typeof window.activeDialogue !== 'undefined' && window.activeDialogue) {
            if (keys['space'] || keys['enter']) {
                window.activeDialogue.onConfirm();
                window.activeDialogue = null;
                keys['space'] = false; keys['enter'] = false;
            } else if (keys['escape']) {
                window.activeDialogue.onCancel();
                window.activeDialogue = null;
                keys['escape'] = false;
            }
            if (typeof window.renderGameView === 'function') window.renderGameView(); 
            requestAnimationFrame(window.update);
            return;
        }

        if (!worldState.openedDoors) worldState.openedDoors = {};
        if (!worldState.droppedItems) worldState.droppedItems = {};
        if (!worldState.unlockedDoors) worldState.unlockedDoors = {};
        if (typeof worldState.level2Unlocked === 'undefined') worldState.level2Unlocked = false;

        if (currentRoomId >= 200 && currentRoomId < 900 && currentRoomId != 301 && currentRoomId != 302) {
            if (typeof worldState.oxygen === 'undefined') worldState.oxygen = 18000; 
            worldState.oxygen--;
            if (worldState.oxygen <= 0) {
                playerStats.health = 0;
                if (typeof window.updateHUD === 'function') window.updateHUD();
                if (typeof window.handlePlayerDeath === 'function') window.handlePlayerDeath();
            }
        }
        
        if (typeof window.playerRedPotionActive !== 'undefined' && window.playerRedPotionActive) {
            if (playerStats.health < playerStats.maxHealth) {
                playerStats.health += 1; 
                if (playerStats.health >= playerStats.maxHealth) {
                    playerStats.health = playerStats.maxHealth;
                    window.playerRedPotionActive = false;
                }
                if (Date.now() % 5 === 0 && typeof window.updateHUD === 'function') window.updateHUD();
            } else {
                window.playerRedPotionActive = false;
            }
        }

        if (currentRoomId == 999) {
            let relativeWave = ((arenaWave - 1) % 50) + 1;
            let isBossWave = [10, 20, 30, 40, 45, 50].includes(relativeWave);

            if (arenaState === "PLAYING" && isBossWave && currentEnemies && currentEnemies.length > 0) {
                if (arenaShrink < 150) arenaShrink += 0.25; 
            } else {
                if (arenaShrink > 0) arenaShrink -= 3; 
                if (arenaShrink < 0) arenaShrink = 0;
            }

            if (typeof arenaState !== 'undefined' && arenaState === "WAITING") {
                arenaTimer--;
                if (arenaTimer <= 0) {
                    arenaState = "PLAYING";
                    window.arenaQueue = [];

                    if (relativeWave === 10) window.arenaQueue = ['troll'];
                    else if (relativeWave === 20) window.arenaQueue = ['mage'];
                    else if (relativeWave === 30) window.arenaQueue = ['dragon'];
                    else if (relativeWave === 40) window.arenaQueue = ['deathgod'];
                    else if (relativeWave === 45) window.arenaQueue = ['mage', 'dragon'];
                    else if (relativeWave === 50) window.arenaQueue = ['elysia'];
                    else {
                        let total = 5 + Math.floor(relativeWave * 1.5);
                        let pool = [];
                        if (relativeWave >= 1 && relativeWave <= 9) pool = ['goblin', 'skeleton'];
                        else if (relativeWave >= 11 && relativeWave <= 14) pool = ['goblin', 'skeleton', 'spider'];
                        else if (relativeWave >= 15 && relativeWave <= 19) pool = ['orc', 'skeleton', 'spider'];
                        else if (relativeWave >= 21 && relativeWave <= 29) pool = ['orc', 'golem', 'spider'];
                        else if (relativeWave >= 31 && relativeWave <= 34) pool = ['minotaure', 'golem', 'spider'];
                        else if (relativeWave >= 35 && relativeWave <= 39) pool = ['minotaure', 'gargouille', 'spider'];
                        else if (relativeWave >= 41 && relativeWave <= 44) pool = ['minotaure'];
                        else if (relativeWave >= 46 && relativeWave <= 49) pool = ['minotaure', 'gargouille'];

                        for (let i = 0; i < total; i++) window.arenaQueue.push(pool[Math.floor(Math.random() * pool.length)]);
                    }
                }
            } 
            else if (typeof arenaState !== 'undefined' && arenaState === "PLAYING") {
                if (window.arenaQueue && window.arenaQueue.length > 0 && currentEnemies && currentEnemies.length < 15) {
                    if (Math.random() < 0.08) { 
                        let t = window.arenaQueue.shift();
                        if (typeof window.spawnEnemy === 'function') window.spawnEnemy(t, 1);
                    }
                } else if ((!window.arenaQueue || window.arenaQueue.length === 0) && (!currentEnemies || currentEnemies.length === 0)) {
                    if (arenaState !== "DOOR_OPEN") {
                        let isBeforeBoss = [9, 19, 29, 39, 44, 49].includes(relativeWave); 
                        let keyType = isBeforeBoss ? 'key_skull' : 'key';
                        currentItems.push({ id: 'arena_key_'+arenaWave, type: keyType, x: canvas.width/2 - 10, y: canvas.height/2 - 10, size: 20, collected: false });
                        
                        if (arenaWave % 5 === 0) {
                            let potions = ['potion_green', 'potion_red', 'potion_blue', 'potion_yellow'];
                            let pType = potions[Math.floor(Math.random() * potions.length)];
                            currentItems.push({ id: 'arena_potion_'+arenaWave, type: pType, x: canvas.width/2 + 25, y: canvas.height/2 + 25, size: 15, collected: false });
                        }

                        currentDoors.push({ x: canvas.width/2 - 75, y: 0, width: 150, height: wallMargin + 15, face: 'north', id: 'door_arena_next', requiresKey: true, locked: true, requiresKeySkull: isBeforeBoss, dest: 999, spawnX: canvas.width/2 - 20, spawnY: canvas.height - wallMargin - 60 });
                        arenaState = "DOOR_OPEN"; 
                    }
                }
            }
        }

        let roomChanged = false;
        let doorToPass = null;
        
        if (typeof currentDoors !== 'undefined') {
            for (let i = 0; i < currentDoors.length; i++) {
                let door = currentDoors[i];
                
                if (currentRoomId == 8 && !worldState.bossDefeated && door.face === 'south') {
                    if (typeof window.checkCollision === 'function' && window.checkCollision(player, door)) { player.y = door.y - player.size - 5; }
                    continue;
                }
                
                if (!doorToPass && typeof window.checkCollision === 'function' && window.checkCollision(player, door)) {
                    if (door.locked) {
                        let hasKey = false;
                        if (door.requiresKeySkull && playerStats.inventory.keys.skull > 0) {
                            playerStats.inventory.keys.skull--; hasKey = true;
                        } else if (!door.requiresKeySkull && playerStats.inventory.keys.gold > 0) {
                            playerStats.inventory.keys.gold--; hasKey = true;
                        }
                        
                        if (hasKey) {
                            door.locked = false; 
                            worldState.unlockedDoors[door.id] = true;
                            if (typeof window.updateHUD === 'function') window.updateHUD();
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
        }

        // --- CORRECTION 1 : ON ANNULE LE TP AUTO DE LA PORTE NORD ---
        if (doorToPass && currentRoomId == 302 && doorToPass.dest == 401) {
            doorToPass = null; 
        }

        if (doorToPass) {
            worldState.droppedItems[currentRoomId] = currentItems.map(item => ({...item}));
            worldState.openedDoors[doorToPass.id] = true;

            let returnFace = 'south';
            if (doorToPass.face === 'north') returnFace = 'south';
            else if (doorToPass.face === 'south') returnFace = 'north';
            else if (doorToPass.face === 'east') returnFace = 'west';
            else if (doorToPass.face === 'west') returnFace = 'east';

            if (currentRoomId == 999) {
                arenaWave++; 
                arenaState = "WAITING";
                arenaTimer = 180;
                
                let nextRelWave = ((arenaWave - 1) % 50) + 1;
                if ([10, 20, 30, 40, 45, 50].includes(nextRelWave)) {
                    worldState.arenaFloor = 'floor6';
                } else {
                    let randomFloors = ['floor7', 'floor8', 'floor9', 'floor10', 'floor11', 'floor12', 'floor13', 'floor14', 'floor15', 'floor16', 'floor17', 'floor18', 'floor19', 'floor20'];
                    worldState.arenaFloor = randomFloors[Math.floor(Math.random() * randomFloors.length)];
                }
            }

            let executeRoomTransition = function() {
                if (typeof window.saveRoomState === 'function') window.saveRoomState();
                if (typeof window.loadRoom === 'function') window.loadRoom(doorToPass.dest, doorToPass.face);

                if (worldState.droppedItems[doorToPass.dest]) {
                    currentItems.splice(0, currentItems.length, ...worldState.droppedItems[doorToPass.dest]);
                }

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
            };

            if (doorToPass.dest == 301) {
                let pPrefix = player.heroClass ? player.heroClass.toLowerCase() : 'knight';
                if (pPrefix === 'mage') pPrefix = 'burned';
                window.playCinematic(pPrefix + '3.mp4', executeRoomTransition);
            } else {
                executeRoomTransition();
            }
            return;
        }
        
        if ((keys['space'] || keys['0'] || keys['control']) && playerStats.mana >= 100) {
            if (typeof window.activateUltimate === 'function') window.activateUltimate(); 
            keys['space'] = false; keys['0'] = false; keys['control'] = false; 
        }
        
        if (typeof leftClickHeld !== 'undefined' && leftClickHeld) {
            if (typeof leftClickHoldTime === 'undefined') leftClickHoldTime = 0;
            leftClickHoldTime++;
            if (leftClickHoldTime >= 180 && playerStats.mana >= 100) { 
                if (typeof window.activateUltimate === 'function') window.activateUltimate(); 
                leftClickHeld = false; 
            }
        }
        
        if (player.dashCooldown === undefined) player.dashCooldown = 0;
        if (player.dashCooldown > 0) player.dashCooldown--;
        if (typeof attackCooldown !== 'undefined' && attackCooldown > 0) attackCooldown--;
        if (player.heroClass === 'Knight' && typeof attackCooldown !== 'undefined' && attackCooldown < 15) isAttacking = false;

        if (typeof isUltimateActive !== 'undefined' && isUltimateActive) {
            if (typeof ultimateTimer !== 'undefined') {
                ultimateTimer--;
                if (ultimateTimer <= 0) isUltimateActive = false;
                if (player.heroClass === 'Knight' && ultimateTimer % 60 === 0) {
                    playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + (playerStats.maxHealth * 0.1));
                    if (typeof window.updateHUD === 'function') window.updateHUD(); 
                }
            }
        }
        
        if (typeof playerPoisonTimer !== 'undefined' && playerPoisonTimer > 0) {
            playerPoisonTimer--;
            if (playerPoisonTimer % 60 === 0 && playerStats.health > 1) {
                playerStats.health -= 5; if (playerStats.health < 1) playerStats.health = 1;
                if (typeof window.updateHUD === 'function') window.updateHUD(); 
            }
        }
        
        if (typeof window.playerSlowTimer !== 'undefined' && window.playerSlowTimer > 0) window.playerSlowTimer--;
        if (typeof playerInvulnerableTimer !== 'undefined' && playerInvulnerableTimer > 0) playerInvulnerableTimer--;
        
        let manaBar = document.getElementById('mana-bar');
        if (playerStats.mana >= 100) { if (manaBar) manaBar.style.opacity = Math.floor(Date.now() / 250) % 2 === 0 ? "1" : "0.3"; } else { if (manaBar) manaBar.style.opacity = "1"; }
        
        let currentSpeedPlayer = (typeof window.playerSlowTimer !== 'undefined' && window.playerSlowTimer > 0) ? player.speed / 2 : player.speed;
        if (currentRoomId >= 200 && currentRoomId < 900 && currentRoomId != 301 && currentRoomId != 302) currentSpeedPlayer *= 0.65;
        
        let centerStairs = { x: canvas.width/2 - 75, y: canvas.height/2 - 75, width: 150, height: 150 };
        
        let dx_mov = 0; let dy_mov = 0;
        let insideHole = false;
        
        if (typeof currentObstacles !== 'undefined') {
            for (let obs of currentObstacles) {
                if (obs.type === 'hole' && typeof window.checkCollision === 'function' && window.checkCollision(player, obs)) { 
                    if (player.dashTimer <= 0) { insideHole = true; }
                    break; 
                }
            }
        }

        if (player.dashTimer > 0 || insideHole) {
            if (insideHole && player.dashTimer <= 0) { player.dashTimer = 2; }
            player.dashTimer--; 
            
            if (player.dashVx === 0 && player.dashVy === 0 && insideHole) {
                player.dashVx = Math.cos(player.faceAngle) * player.speed * 2;
                player.dashVy = Math.sin(player.faceAngle) * player.speed * 2;
            }
            dx_mov = player.dashVx; dy_mov = player.dashVy;
        } else {
            if (keys['q'] || keys['a'] || keys['arrowleft'])  dx_mov -= currentSpeedPlayer;
            if (keys['d'] || keys['arrowright'])              dx_mov += currentSpeedPlayer;
            if (keys['z'] || keys['w'] || keys['arrowup'])    dy_mov -= currentSpeedPlayer;
            if (keys['s'] || keys['arrowdown'])               dy_mov += currentSpeedPlayer;
        }
        
        let oldPx = player.x; player.x += dx_mov;
        if (currentRoomId == 8 && typeof window.checkCollision === 'function' && window.checkCollision(player, centerStairs) && (!worldState.bossDefeated || (!worldState.level2Unlocked && playerStats.inventory.keys.skull <= 0))) { player.x = oldPx; player.dashTimer = 0; } 
        
        if (typeof currentObstacles !== 'undefined' && player.dashTimer <= 0 && !insideHole) {
            for (let i = 0; i < currentObstacles.length; i++) {
                let obs = currentObstacles[i];
                if (typeof window.checkCollision === 'function' && window.checkCollision(player, obs)) {
                    if (obs.type === 'water_trigger') {
                        if (currentRoomId == 114) {
                            keys = {}; player.dashTimer = 0; player.x = oldPx;
                            if (!window.activeDialogue) {
                                window.activeDialogue = {
                                    text: "L'eau est sombre et glaciale...\nPlonger dans les abysses ?\n\n[ESPACE] Plonger   -   [ECHAP] Reculer",
                                    onConfirm: function() {
                                        worldState.oxygen = 18000;
                                        
                                        let pPrefix = player.heroClass ? player.heroClass.toLowerCase() : 'knight';
                                        if (pPrefix === 'mage') pPrefix = 'burned';
                                        
                                        window.playCinematic(pPrefix + '2.mp4', function() {
                                            if (typeof window.saveRoomState === 'function') window.saveRoomState();
                                            if (typeof window.loadRoom === 'function') window.loadRoom(201, 'south');
                                            player.x = canvas.width / 2 - player.size / 2;
                                            player.y = canvas.height - wallMargin - 150;
                                        });
                                    },
                                    onCancel: function() { 
                                        let cx = canvas.width / 2; let cy = canvas.height / 2;
                                        let angleOut = Math.atan2((player.y + player.size/2) - cy, (player.x + player.size/2) - cx);
                                        player.x += Math.cos(angleOut) * 80; player.y += Math.sin(angleOut) * 80; 
                                    }
                                };
                            }
                        }
                        break;
                    } else if (obs.type !== 'water_visual') {
                        player.x = oldPx; player.dashTimer = 0; break;
                    }
                }
            }
        }
        
        if (typeof currentCrates !== 'undefined') {
            for (let i = 0; i < currentCrates.length; i++) {
                let obj = currentCrates[i];
                if (!obj.isBroken && typeof window.checkCollision === 'function' && window.checkCollision(player, obj)) { player.x = oldPx; player.dashTimer = 0; break; }
            }
        }
        
        let oldPy = player.y; player.y += dy_mov;
        if (currentRoomId == 8 && typeof window.checkCollision === 'function' && window.checkCollision(player, centerStairs) && (!worldState.bossDefeated || (!worldState.level2Unlocked && playerStats.inventory.keys.skull <= 0))) { player.y = oldPy; player.dashTimer = 0; } 
        
        if (typeof currentObstacles !== 'undefined' && player.dashTimer <= 0 && !insideHole) {
            for (let i = 0; i < currentObstacles.length; i++) {
                let obs = currentObstacles[i];
                if (typeof window.checkCollision === 'function' && window.checkCollision(player, obs)) {
                    if (obs.type === 'water_trigger') {
                        if (currentRoomId == 114) {
                            keys = {}; player.dashTimer = 0; player.y = oldPy;
                            if (!window.activeDialogue) {
                                window.activeDialogue = {
                                    text: "L'eau est sombre et glaciale...\nPlonger dans les abysses ?\n\n[ESPACE] Plonger   -   [ECHAP] Reculer",
                                    onConfirm: function() {
                                        worldState.oxygen = 18000;

                                        let pPrefix = player.heroClass ? player.heroClass.toLowerCase() : 'knight';
                                        if (pPrefix === 'mage') pPrefix = 'burned';
                                        
                                        window.playCinematic(pPrefix + '2.mp4', function() {
                                            if (typeof window.saveRoomState === 'function') window.saveRoomState();
                                            if (typeof window.loadRoom === 'function') window.loadRoom(201, 'south');
                                            player.x = canvas.width / 2 - player.size / 2;
                                            player.y = canvas.height - wallMargin - 150;
                                        });
                                    },
                                    onCancel: function() { 
                                        let cx = canvas.width / 2; let cy = canvas.height / 2;
                                        let angleOut = Math.atan2((player.y + player.size/2) - cy, (player.x + player.size/2) - cx);
                                        player.x += Math.cos(angleOut) * 80; player.y += Math.sin(angleOut) * 80; 
                                    }
                                };
                            }
                        }
                        break;
                    } else if (obs.type !== 'water_visual') {
                        player.y = oldPy; player.dashTimer = 0; break;
                    }
                }
            }
        }
        
        let isVertCorridor = (currentRoomId == 5 || currentRoomId == 6 || currentRoomId == 111 || currentRoomId == 112 || currentRoomId == 113 || currentRoomId == 205 || currentRoomId == 206);
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
        
        if (currentRoomId == 1 && typeof bookshelf !== 'undefined' && player.x + player.size > bookshelf.x && player.y + player.size > bookshelf.y && player.y < bookshelf.y + bookshelf.height) {
            player.x = bookshelf.x - player.size;
        }
        
        if (player.dashTimer <= 0 && typeof mouse !== 'undefined' && mouse.x !== undefined) {
            let targetAngle = Math.atan2(mouse.y - (player.y + player.size / 2), mouse.x - (player.x + player.size / 2));
            if (!isNaN(targetAngle)) {
                let diff = targetAngle - player.faceAngle;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                player.faceAngle += diff * 0.25; 
            }
        }
        
        if (typeof particles !== 'undefined') {
            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.03; 
                if (p.life <= 0) particles.splice(i, 1);
            }
        }
        
        if (typeof bloodStains !== 'undefined') {
            for (let i = bloodStains.length - 1; i >= 0; i--) {
                let b = bloodStains[i];
                if (b.life === undefined) b.life = (currentRoomId == 999) ? 1200 : 3600; 
                b.life--;
                if (b.life < 300) { b.opacity = b.life / 300; } else { b.opacity = 1.0; }
                if (b.life <= 0) bloodStains.splice(i, 1);
            }
        }

        if (typeof window.updateItemsAndCrates === 'function') window.updateItemsAndCrates();
        if (typeof window.updateEnemies === 'function') window.updateEnemies();
        if (typeof window.updateProjectiles === 'function') window.updateProjectiles();

        // --- CORRECTION 2 : VÉRIFICATION INTELLIGENTE DU BOSS ---
        // On ignore les entités mortes, les âmes, et tes familiers persistants (isFriendly/isSummon)
        let hasAliveHostile = false;
        if (typeof currentEnemies !== 'undefined') {
            for (let i = 0; i < currentEnemies.length; i++) {
                let e = currentEnemies[i];
                if (e && (e.health === undefined || e.health > 0) && !e.isFriendly && !e.isSummon && e.type !== 'soul' && e.type !== 'particle') {
                    hasAliveHostile = true;
                    break;
                }
            }
        }

        if ((currentRoomId == 8 || currentRoomId == 208 || currentRoomId == 302) && !hasAliveHostile) {
            if (worldState && !worldState.bossDefeated) {
                worldState.bossDefeated = true;
                if (typeof currentDoors !== 'undefined') {
                    currentDoors.forEach(d => { d.locked = false; });
                }
            }
        }

        if (currentRoomId == 8 && worldState && worldState.bossDefeated) {
            let triggerStairs = { x: canvas.width/2 - 40, y: canvas.height/2 - 40, width: 80, height: 80 };
            let isColliding = player.x < triggerStairs.x + triggerStairs.width && player.x + player.size > triggerStairs.x && player.y < triggerStairs.y + triggerStairs.height && player.y + player.size > triggerStairs.y;
                              
            if (isColliding && (worldState.level2Unlocked || playerStats.inventory.keys.skull > 0)) {
                if (!worldState.level2Unlocked) {
                    playerStats.inventory.keys.skull--; 
                    worldState.level2Unlocked = true;
                }
                if (typeof window.saveRoomState === 'function') window.saveRoomState();
                if (typeof window.loadRoom === 'function') window.loadRoom(101, 'south');
                player.x = canvas.width / 2 - player.size / 2;
                player.y = canvas.height / 2 + 100;
                player.dashTimer = 0; 
                if (typeof window.updateHUD === 'function') window.updateHUD(); 
                return requestAnimationFrame(window.update);
            }
        }

        if (currentRoomId == 101) {
            let triggerStairs = { x: canvas.width/2 - 40, y: canvas.height/2 - 40, width: 80, height: 80 };
            let isColliding = player.x < triggerStairs.x + triggerStairs.width && player.x + player.size > triggerStairs.x && player.y < triggerStairs.y + triggerStairs.height && player.y + player.size > triggerStairs.y;
                              
            if (isColliding) {
                if (typeof window.saveRoomState === 'function') window.saveRoomState();
                if (typeof window.loadRoom === 'function') window.loadRoom(8, 'north');
                player.x = canvas.width / 2 - player.size / 2;
                player.y = canvas.height / 2 + 100;
                player.dashTimer = 0; 
                if (typeof window.updateHUD === 'function') window.updateHUD(); 
                return requestAnimationFrame(window.update);
            }
        }

        // --- CORRECTION 3 : ZONE GIGANTESQUE INFRATABLE POUR LA SALLE 302 ---
        if (currentRoomId == 302 && worldState && worldState.bossDefeated) {
            // La zone prend maintenant toute la largeur et toute la moitié Nord de l'écran. 
            // Dès que tu marches vers le haut, Bam.
            let zoneMargin = typeof wallMargin !== 'undefined' ? wallMargin : 50;
            let triggerLabyrinthe = { 
                x: zoneMargin, 
                y: zoneMargin, 
                width: canvas.width - (zoneMargin * 2), 
                height: canvas.height / 2 
            };
            
            let isColliding = player.x < triggerLabyrinthe.x + triggerLabyrinthe.width && 
                              player.x + player.size > triggerLabyrinthe.x && 
                              player.y < triggerLabyrinthe.y + triggerLabyrinthe.height && 
                              player.y + player.size > triggerLabyrinthe.y;
            
            if (isColliding && !window.activeDialogue) {
                keys = {}; 
                window.activeDialogue = {
                    text: "Un pouvoir ancien émane de cette salle...\nVoulez-vous descendre dans le Labyrinthe ?\n\n[ESPACE] Descendre   -   [ECHAP] Rester",
                    onConfirm: function() {
                        if (typeof window.saveRoomState === 'function') window.saveRoomState();
                        if (typeof window.loadRoom === 'function') window.loadRoom(401, 'south'); 
                        player.x = canvas.width / 2 - player.size / 2;
                        player.y = canvas.height - zoneMargin - 150;
                    },
                    onCancel: function() { 
                        // Te repousse prudemment dans la moitié Sud si tu annules
                        player.y = (canvas.height / 2) + 50; 
                    }
                };
            }
        }
        
        if (typeof window.renderGameView === 'function') window.renderGameView(); 
        requestAnimationFrame(window.update);
        
    } catch (err) {
        console.error("CRASH FATAL DANS LA BOUCLE:", err);
        if (ctx) {
            ctx.setTransform(1, 0, 0, 1, 0, 0); 
            ctx.fillStyle = 'rgba(0,0,0,0.8)'; 
            ctx.fillRect(0,0, canvas.width, canvas.height);
            ctx.fillStyle = '#e74c3c'; 
            ctx.font = 'bold 24px Arial'; 
            ctx.textAlign = 'center';
            ctx.fillText("CRASH DU JEU : Regarde la console (F12)", canvas.width/2, canvas.height/2);
            ctx.fillStyle = '#fff'; 
            ctx.font = '16px Arial';
            ctx.fillText(err.message, canvas.width/2, canvas.height/2 + 40);
        }
        requestAnimationFrame(window.update);
    }
};
// C'EST CETTE LIGNE QUI DÉMARRE TOUT LE JEU !
window.update();
