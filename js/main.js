// ============================================================================
// js/main.js - MOTEUR PRINCIPAL ET BOUCLE DE JEU
// ============================================================================

document.addEventListener('contextmenu', event => event.preventDefault());

window.update = function() {
    try {
        window.currentEnemies = window.currentEnemies || [];
        window.currentItems = window.currentItems || [];
        window.currentCrates = window.currentCrates || [];
        window.currentDoors = window.currentDoors || [];
        window.projectiles = window.projectiles || [];
        window.enemyProjectiles = window.enemyProjectiles || [];
        window.particles = window.particles || [];
        window.bloodStains = window.bloodStains || [];
        window.hazards = window.hazards || [];
        if (typeof window.necroSummons === 'undefined') window.necroSummons = [];
        if (typeof window.necroKills === 'undefined') window.necroKills = [];
        
        window.arenaShrink = window.arenaShrink || 0;
        window.waveStartDelay = window.waveStartDelay || 0;

        if (gameState === "MENU") {
            if (keys['space']) {
                window.spaceHoldTimer = window.spaceHoldTimer || 0;
                window.spaceHoldTimer++;
                if (window.spaceHoldTimer >= 300) { 
                    window.spaceHoldTimer = 0; 
                    keys['space'] = false; 
                    if (typeof window.startArenaMode === 'function') window.startArenaMode('Necromancer'); 
                }
            } else { window.spaceHoldTimer = 0; }
            requestAnimationFrame(window.update); return;
        }
        
        if (gameState === "PAUSED" || (gameState !== "PLAYING" && gameState !== "GAMEOVER")) { 
            requestAnimationFrame(window.update); return; 
        }
        
        if (gameState === "GAMEOVER") { 
            if (typeof window.renderGameView === 'function') window.renderGameView(); 
            requestAnimationFrame(window.update); return; 
        }
        
        if (currentRoomId === 999) {
            if (window.waveStartDelay > 0) window.waveStartDelay--;
            
            let hasTroll = window.currentEnemies.some(e => e.type === 'troll');
            
            if (hasTroll && arenaState === "PLAYING" && window.arenaShrink < 150) { 
                window.arenaShrink += 0.3; 
            } else if (!hasTroll && window.arenaShrink > 0) {
                window.arenaShrink -= 0.5; 
                if (window.arenaShrink < 0) window.arenaShrink = 0;
            }

            if (arenaState === "WAITING") {
                window.arenaTimer = window.arenaTimer || 0;
                window.arenaTimer--;
                
                if (window.arenaTimer <= 0) {
                    arenaState = "PLAYING";
                    
                    if (arenaWave > 0 && arenaWave % 5 === 0) {
                        window.currentItems.push({ id: 'pot_g_'+arenaWave, type: 'potion_green', x: canvas.width/2, y: canvas.height/2, size: 15, collected: false });
                        if (typeof window.spawnParticles === 'function') window.spawnParticles(canvas.width/2, canvas.height/2, '#2ecc71', 15);
                    }

                    if (arenaWave === 10) { window.spawnEnemy('troll', 1); }
                    else if (arenaWave === 20) { window.spawnEnemy('mage', 1); window.spawnEnemy('orc', 2); }
                    else if (arenaWave === 30) { window.spawnEnemy('dragon', 1); window.spawnEnemy('gargouille', 1); }
                    else if (arenaWave === 35) { window.spawnEnemy('troll', 1); window.spawnEnemy('mage', 1); window.spawnEnemy('minotaure', 2); }
                    else if (arenaWave === 40) { window.spawnEnemy('deathgod', 1); window.spawnEnemy('gargouille', 2); }
                    else if (arenaWave === 45) { window.spawnEnemy('mage', 1); window.spawnEnemy('dragon', 1); window.spawnEnemy('gargouille', 3); }
                    else if (arenaWave === 50) { window.spawnEnemy('elysia', 1); window.spawnEnemy('minotaure', 2); window.spawnEnemy('gargouille', 1); }
                    else {
                        let totalToSpawn = 3 + Math.floor(arenaWave * 1.2);
                        if (arenaWave >= 15) { totalToSpawn = Math.min(totalToSpawn, 20); }
                        
                        let spawnCounts = {};
                        for (let i = 0; i < totalToSpawn; i++) {
                            let type = '';
                            let r = Math.random(); 
                            if (arenaWave < 10) { type = r < 0.7 ? 'goblin' : 'skeleton'; } 
                            else if (arenaWave < 15) {
                                if (r < 0.6) type = 'goblin'; else if (r < 0.9) type = 'skeleton'; else type = 'spider';
                            } 
                            else if (arenaWave <= 27) {
                                let progress = (arenaWave - 15) / 12; 
                                if (r < 0.6) type = Math.random() < progress ? 'orc' : 'goblin';
                                else if (r < 0.9) type = Math.random() < progress ? 'golem' : 'skeleton';
                                else type = Math.random() < progress ? 'wolf' : 'spider';
                            } 
                            else if (arenaWave <= 40) {
                                let progress = (arenaWave - 27) / 13; 
                                if (r < 0.6) type = Math.random() < progress ? 'minotaure' : 'orc';
                                else if (r < 0.9) type = Math.random() < progress ? 'gargouille' : 'golem';
                                else type = 'wolf'; 
                            } 
                            else {
                                if (r < 0.6) type = 'minotaure'; else if (r < 0.9) type = 'gargouille'; else type = 'wolf';
                            }
                            spawnCounts[type] = (spawnCounts[type] || 0) + 1;
                        }
                        for (let mobType in spawnCounts) { window.spawnEnemy(mobType, spawnCounts[mobType]); }
                    }
                    arenaWave++;
                }
            } else if (arenaState === "PLAYING") {
                if (window.currentEnemies.length === 0) {
                    arenaState = "WAITING";
                    window.arenaTimer = 300; 
                    window.hazards.length = 0;
                    if (typeof window.updateHUD === 'function') window.updateHUD();
                }
            }
        }

        if (!worldState.openedDoors) worldState.openedDoors = {};
        if (!worldState.droppedItems) worldState.droppedItems = {};
        
        let doorToPass = null;
        
        for (let i = 0; i < window.currentDoors.length; i++) {
            let door = window.currentDoors[i];
            
            if (currentRoomId === 8 && !worldState.bossDefeated && door.face === 'south') {
                if (window.checkCollision(player, door)) { player.y = door.y - player.size - 5; }
                continue;
            }
            
            if (!doorToPass && window.checkCollision(player, door)) {
                if (door.locked) {
                    if (playerStats.inventory.keys.gold > 0) {
                        playerStats.inventory.keys.gold--; 
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

        if (doorToPass) {
            worldState.droppedItems[currentRoomId] = window.currentItems.map(item => ({...item}));
            worldState.openedDoors[doorToPass.id] = true;

            let returnFace = 'south';
            if (doorToPass.face === 'north') returnFace = 'south';
            else if (doorToPass.face === 'south') returnFace = 'north';
            else if (doorToPass.face === 'east') returnFace = 'west';
            else if (doorToPass.face === 'west') returnFace = 'east';

            if (typeof window.saveRoomState === 'function') window.saveRoomState();
            if (typeof window.loadRoom === 'function') window.loadRoom(doorToPass.dest, doorToPass.face);

            if (worldState.droppedItems[doorToPass.dest]) {
                window.currentItems.splice(0, window.currentItems.length, ...worldState.droppedItems[doorToPass.dest]);
            }

            window.currentDoors.forEach(d => {
                if (d.face === returnFace) {
                    worldState.openedDoors[d.id] = true;
                    d.locked = false;
                }
            });

            player.x = doorToPass.spawnX;
            player.y = doorToPass.spawnY;
            requestAnimationFrame(window.update);
            return;
        }
        
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
        
        if (player.dashCooldown === undefined) player.dashCooldown = 0;
        if (player.dashCooldown > 0) player.dashCooldown--;
        if (typeof attackCooldown !== 'undefined' && attackCooldown > 0) attackCooldown--;
        if (player.heroClass === 'Knight' && typeof attackCooldown !== 'undefined' && attackCooldown < 25) isAttacking = false;

        if (typeof isUltimateActive !== 'undefined' && isUltimateActive) {
            ultimateTimer--;
            if (ultimateTimer <= 0) isUltimateActive = false;
            if (player.heroClass === 'Knight' && ultimateTimer % 60 === 0) {
                playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + (playerStats.maxHealth * 0.1));
                if (typeof window.updateHUD === 'function') window.updateHUD(); 
            }
        }
        
        if (typeof playerPoisonTimer !== 'undefined' && playerPoisonTimer > 0) {
            playerPoisonTimer--;
            if (playerPoisonTimer % 60 === 0 && playerStats.health > 1) {
                playerStats.health -= 5; if (playerStats.health < 1) playerStats.health = 1;
                if (typeof window.updateHUD === 'function') window.updateHUD(); 
            }
        }
        
        if (typeof playerSlowTimer !== 'undefined' && playerSlowTimer > 0) playerSlowTimer--;
        if (typeof playerInvulnerableTimer !== 'undefined' && playerInvulnerableTimer > 0) playerInvulnerableTimer--;
        
        let manaBar = document.getElementById('mana-bar');
        if (playerStats.mana >= 100) { if (manaBar) manaBar.style.opacity = Math.floor(Date.now() / 250) % 2 === 0 ? "1" : "0.3"; } else { if (manaBar) manaBar.style.opacity = "1"; }
        
        let currentSpeedPlayer = (typeof playerSlowTimer !== 'undefined' && playerSlowTimer > 0) ? player.speed / 2 : player.speed;
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
        if (currentRoomId === 8 && window.checkCollision(player, centerStairs) && (!worldState.bossDefeated || playerStats.inventory.keys.skull <= 0)) { player.x = oldPx; player.dashTimer = 0; } 
        
        if (typeof window.currentObstacles !== 'undefined') {
            for (let i = 0; i < window.currentObstacles.length; i++) {
                let obs = window.currentObstacles[i];
                if (window.checkCollision(player, obs)) {
                    if (obs.type === 'water') {
                        alert("DIRECTION NIVEAU 3 ! (Prochainement...)");
                        player.y += 20; 
                        break;
                    } else {
                        player.x = oldPx; player.dashTimer = 0; break;
                    }
                }
            }
        }
        
        for (let i = 0; i < window.currentCrates.length; i++) {
            let obj = window.currentCrates[i];
            if (!obj.isBroken && window.checkCollision(player, obj)) { player.x = oldPx; player.dashTimer = 0; break; }
        }
        
        let oldPy = player.y; player.y += dy_mov;
        if (currentRoomId === 8 && window.checkCollision(player, centerStairs) && (!worldState.bossDefeated || playerStats.inventory.keys.skull <= 0)) { player.y = oldPy; player.dashTimer = 0; } 
        
        if (typeof window.currentObstacles !== 'undefined') {
            for (let i = 0; i < window.currentObstacles.length; i++) {
                let obs = window.currentObstacles[i];
                if (window.checkCollision(player, obs)) {
                    if (obs.type !== 'water') {
                        player.y = oldPy; player.dashTimer = 0; break;
                    }
                }
            }
        }
        
        for (let i = 0; i < window.currentCrates.length; i++) {
            let obj = window.currentCrates[i];
            if (!obj.isBroken && window.checkCollision(player, obj)) { player.y = oldPy; player.dashTimer = 0; break; }
        }
        
        let isVertCorridor = (currentRoomId === 5 || currentRoomId === 6);
        let bLeft = isVertCorridor ? 350 : wallMargin;
        let bRight = isVertCorridor ? canvas.width - 350 : canvas.width - wallMargin;
        let bTop = wallMargin;
        let bBot = canvas.height - wallMargin;

        let minLimitX = bLeft + window.arenaShrink; 
        let minLimitY = bTop + window.arenaShrink;
        let maxLimitX = bRight - window.arenaShrink - player.size;
        let maxLimitY = bBot - window.arenaShrink - player.size;
        if (player.x < minLimitX) player.x = minLimitX; if (player.y < minLimitY) player.y = minLimitY;
        if (player.x > maxLimitX) player.x = maxLimitX; if (player.y > maxLimitY) player.y = maxLimitY;
        
        if (currentRoomId === 1 && typeof bookshelf !== 'undefined' && player.x + player.size > bookshelf.x && player.y + player.size > bookshelf.y && player.y < bookshelf.y + bookshelf.height) {
            player.x = bookshelf.x - player.size;
        }
        if (player.dashTimer <= 0) {
            player.faceAngle = Math.atan2(mouse.y - (player.y + player.size / 2), mouse.x - (player.x + player.size / 2));
        }
        
        for (let i = window.particles.length - 1; i >= 0; i--) {
            let p = window.particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.03; 
            if (p.life <= 0) window.particles.splice(i, 1);
        }
        
        for (let i = window.bloodStains.length - 1; i >= 0; i--) {
            let b = window.bloodStains[i];
            if (b.life === undefined) b.life = (currentRoomId === 999) ? 1200 : 3600; 
            b.life--;
            if (b.life < 300) { b.opacity = b.life / 300; } else { b.opacity = 1.0; }
            if (b.life <= 0) window.bloodStains.splice(i, 1);
        }

        if (typeof window.updateItemsAndCrates === 'function') window.updateItemsAndCrates();
        if (typeof window.updateEnemies === 'function') window.updateEnemies();
        if (typeof window.updateProjectiles === 'function') window.updateProjectiles();

        if (currentRoomId === 8 && worldState && worldState.bossDefeated) {
            let triggerStairs = { x: canvas.width/2 - 45, y: canvas.height/2 - 45, width: 90, height: 90 };
            if (window.checkCollision(player, triggerStairs)) {
                if (playerStats.inventory.keys.skull > 0) {
                    playerStats.inventory.keys.skull--; 
                    alert("VOUS AVEZ DÉBLOQUÉ LE NIVEAU 2 !");
                    if (typeof window.loadRoom === 'function') window.loadRoom(101, 'south');
                    return;
                }
            }
        }
        if (typeof window.renderGameView === 'function') window.renderGameView(); 
        requestAnimationFrame(window.update);

    } catch (e) {
        console.error("ERREUR CRITIQUE DANS UPDATE :", e);
        if (ctx) {
            ctx.fillStyle = '#b33939'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px monospace';
            ctx.fillText("⚠️ CRASH DU JEU ⚠️", 20, 40);
            ctx.font = '16px monospace';
            ctx.fillText("Prends un screen de ce message :", 20, 80);
            ctx.fillStyle = '#f1c40f';
            ctx.fillText(e.message, 20, 110);
            ctx.fillStyle = '#ffffff';
            let stackLines = e.stack ? e.stack.split('\n') : [];
            for (let i = 0; i < Math.min(stackLines.length, 15); i++) {
                ctx.fillText(stackLines[i], 20, 140 + i * 20);
            }
        }
    }
};
window.update();
