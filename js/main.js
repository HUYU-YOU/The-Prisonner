// ============================================================================
// js/main.js - MOTEUR PRINCIPAL ET BOUCLE DE JEU
// ============================================================================

document.addEventListener('contextmenu', event => event.preventDefault());

// AJOUT : Clic Droit pour le Dash / Rush du Chevalier
document.addEventListener('mousedown', event => {
    if (event.button === 2 && playerStats.health > 0 && gameState === "PLAYING") {
        event.preventDefault();
        if (player.dashCooldown <= 0) {
            player.dashTimer = (player.heroClass === 'Knight') ? 30 : 15; 
            let dx = mouse.x - (player.x + player.size/2);
            let dy = mouse.y - (player.y + player.size/2);
            let dist = Math.hypot(dx, dy);
            let speed = (player.heroClass === 'Knight') ? 12 : 15; 
            if (dist > 0) {
                player.dashVx = (dx/dist) * speed;
                player.dashVy = (dy/dist) * speed;
            } else {
                player.dashVx = speed; player.dashVy = 0;
            }
            player.dashCooldown = (player.heroClass === 'Knight') ? 60 : 90;
        }
    }
});

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
                if (typeof window.startArenaMode === 'function') window.startArenaMode('Necromancer'); 
            }
        } else { spaceHoldTimer = 0; }
        requestAnimationFrame(window.update); return;
    }
    
    if (gameState === "PAUSED" || (gameState !== "PLAYING" && gameState !== "GAMEOVER")) { 
        requestAnimationFrame(window.update); return; 
    }
    
    if (gameState === "GAMEOVER") { 
        if (typeof window.renderGameView === 'function') window.renderGameView(); 
        requestAnimationFrame(window.update); return; 
    }

    if (!worldState.openedDoors) worldState.openedDoors = {};
    if (!worldState.droppedItems) worldState.droppedItems = {};
    if (!worldState.unlockedDoors) worldState.unlockedDoors = {};
    
    let roomChanged = false;
    let doorToPass = null;
    
    if (typeof currentDoors !== 'undefined') {
        for (let i = 0; i < currentDoors.length; i++) {
            let door = currentDoors[i];
            
            if (currentRoomId === 8 && !worldState.bossDefeated && door.face === 'south') {
                if (typeof window.checkCollision === 'function' && window.checkCollision(player, door)) { player.y = door.y - player.size - 5; }
                continue;
            }
            
            if (!doorToPass && typeof window.checkCollision === 'function' && window.checkCollision(player, door)) {
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
    }

    if (doorToPass) {
        worldState.droppedItems[currentRoomId] = currentItems.map(item => ({...item}));
        worldState.openedDoors[doorToPass.id] = true;

        let returnFace = 'south';
        if (doorToPass.face === 'north') returnFace = 'south';
        else if (doorToPass.face === 'south') returnFace = 'north';
        else if (doorToPass.face === 'east') returnFace = 'west';
        else if (doorToPass.face === 'west') returnFace = 'east';

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
    if (player.heroClass === 'Knight' && typeof attackCooldown !== 'undefined' && attackCooldown < 25) isAttacking = false;

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
    if (currentRoomId === 8 && typeof window.checkCollision === 'function' && window.checkCollision(player, centerStairs) && (!worldState.bossDefeated || playerStats.inventory.keys.skull <= 0)) { player.x = oldPx; player.dashTimer = 0; } 
    
    if (typeof currentObstacles !== 'undefined') {
        for (let i = 0; i < currentObstacles.length; i++) {
            let obs = currentObstacles[i];
            if (typeof window.checkCollision === 'function' && window.checkCollision(player, obs)) {
                if (obs.type === 'water') {
                    alert("DIRECTION NIVEAU 3 ! (Prochainement...)");
                    player.y += 20; break;
                } else if (obs.type === 'hole') {
                    // Ignorer le trou si on Dash
                    if (player.dashTimer <= 0) { player.x = oldPx; player.dashTimer = 0; break; }
                } else {
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
    if (currentRoomId === 8 && typeof window.checkCollision === 'function' && window.checkCollision(player, centerStairs) && (!worldState.bossDefeated || playerStats.inventory.keys.skull <= 0)) { player.y = oldPy; player.dashTimer = 0; } 
    
    if (typeof currentObstacles !== 'undefined') {
        for (let i = 0; i < currentObstacles.length; i++) {
            let obs = currentObstacles[i];
            if (typeof window.checkCollision === 'function' && window.checkCollision(player, obs)) {
                if (obs.type === 'hole') {
                    if (player.dashTimer <= 0) { player.y = oldPy; player.dashTimer = 0; break; }
                } else if (obs.type !== 'water') {
                    player.y = oldPy; player.dashTimer = 0; break;
                }
            }
        }
    }
    
    if (typeof currentCrates !== 'undefined') {
        for (let i = 0; i < currentCrates.length; i++) {
            let obj = currentCrates[i];
            if (!obj.isBroken && typeof window.checkCollision === 'function' && window.checkCollision(player, obj)) { player.y = oldPy; player.dashTimer = 0; break; }
        }
    }
    
    let isVertCorridor = (currentRoomId === 5 || currentRoomId === 6 || currentRoomId === 111 || currentRoomId === 112 || currentRoomId === 113);
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
    
    if (typeof particles !== 'undefined') {
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.03; 
            if (p.life <= 0) particles.splice(i, 1);
        }
    }
    
    if (typeof bloodStains !== 'undefined') {
        for (let i = bloodStains.length - 1; i >= 0; i--) {
            let b = bloodStains[i];
            if (b.life === undefined) b.life = (currentRoomId === 999) ? 1200 : 3600; 
            b.life--;
            if (b.life < 300) { b.opacity = b.life / 300; } else { b.opacity = 1.0; }
            if (b.life <= 0) bloodStains.splice(i, 1);
        }
    }

    if (typeof window.updateItemsAndCrates === 'function') window.updateItemsAndCrates();
    if (typeof window.updateEnemies === 'function') window.updateEnemies();
    if (typeof window.updateProjectiles === 'function') window.updateProjectiles();

    if (currentRoomId === 8 && worldState && worldState.bossDefeated) {
        let triggerStairs = { x: canvas.width/2 - 40, y: canvas.height/2 - 40, width: 80, height: 80 };
        
        let isColliding = player.x < triggerStairs.x + triggerStairs.width &&
                          player.x + player.size > triggerStairs.x &&
                          player.y < triggerStairs.y + triggerStairs.height &&
                          player.y + player.size > triggerStairs.y;
                          
        if (isColliding && playerStats.inventory.keys.skull > 0) {
            playerStats.inventory.keys.skull--; 
            
            if (typeof window.saveRoomState === 'function') window.saveRoomState();
            if (typeof window.loadRoom === 'function') window.loadRoom(101, 'south');
            
            player.x = canvas.width / 2 - player.size / 2;
            player.y = canvas.height - wallMargin - 150; 
            player.dashTimer = 0; 
            
            if (typeof window.updateHUD === 'function') window.updateHUD(); 
            
            return requestAnimationFrame(window.update);
        }
    }
    
    if (typeof window.renderGameView === 'function') window.renderGameView(); 
    requestAnimationFrame(window.update);
};
window.update();
