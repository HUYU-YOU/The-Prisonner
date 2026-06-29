// ============================================================================
// js/combat.js - GESTION DES ATTAQUES, PROJECTILES ET DESTRUCTIONS
// ============================================================================

window.handlePlayerAttack = function() {
    let dx = mouse.x - (player.x + player.size / 2); 
    let dy = mouse.y - (player.y + player.size / 2);
    let angle = Math.atan2(dy, dx); 
    
    if (player.heroClass === 'Elf') {
        if (isUltimateActive) {
            elfStealthBroken = true; 
            let spread = 0.15;
            projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle - spread) * 12, vy: Math.sin(angle - spread) * 12, size: 5, hitTargets: [], angle: angle - spread, isFire: false });
            projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle + spread) * 12, vy: Math.sin(angle + spread) * 12, size: 5, hitTargets: [], angle: angle + spread, isFire: false });
            attackCooldown = 15;
        } else { 
            projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle) * 12, vy: Math.sin(angle) * 12, size: 5, hitTargets: [], angle: angle, isFire: false }); 
            attackCooldown = 30; 
        }
    } 
    else if (player.heroClass === 'Mage') {
        projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle) * 10, vy: Math.sin(angle) * 10, size: 8, hitTargets: [], angle: angle, isFire: true }); 
        attackCooldown = 35;
    } 
    else if (player.heroClass === 'Necromancer') {
        projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle) * 10, vy: Math.sin(angle) * 10, size: 6, hitTargets: [], angle: angle, isFire: false, isNecro: true }); 
        attackCooldown = 15;
    } 
    else if (player.heroClass === 'Knight') {
        isAttacking = true; 
        attackCooldown = 40;
        let hitBox = { x: player.x + player.size / 2 + Math.cos(angle) * 60 - 60, y: player.y + player.size / 2 + Math.sin(angle) * 60 - 60, size: 120 };
        
        currentEnemies.forEach(enemy => { 
            if (window.checkCollision(hitBox, enemy)) {
                if (!enemy.invulnerable) {
                    if (enemy.type === 'goblin' && Math.random() < 0.15) { 
                        enemy.blockAnimTimer = 45; 
                    } else { 
                        enemy.health -= 50; 
                        
                        // --- GÉNÉRATION DU SANG EN IMAGE (Coup au Corps-à-Corps) ---
                        let hitNum = Math.floor(Math.random() * 3) + 1;
                        bloodStains.push({
                            type: 'hit',
                            imgId: 'bloods_hit_view' + hitNum,
                            x: enemy.x + enemy.size/2,
                            y: enemy.y + enemy.size/2,
                            size: enemy.size * 1.5,
                            rotation: Math.random() * Math.PI * 2,
                            life: 3600
                        });
                        
                        if (typeof window.triggerShake === 'function') {
                            window.triggerShake(5, 8); 
                        }
                    }
                }
            } 
        });
        
        for (let i = 0; i < currentCrates.length; i++) {
            let obj = currentCrates[i]; 
            if (!obj.isBroken && window.checkCollision(hitBox, obj)) { obj.health -= 50; }
        }
    }
};

window.updateProjectiles = function() {
    let isVertCorridor = (currentRoomId === 5 || currentRoomId === 6);
    let bLeft = isVertCorridor ? 350 : wallMargin;
    let bRight = isVertCorridor ? canvas.width - 350 : canvas.width - wallMargin;
    let bTop = wallMargin; 
    let bBot = canvas.height - wallMargin;
    let centerStairs = { x: canvas.width/2 - 75, y: canvas.height/2 - 75, width: 150, height: 150 };

    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i]; 
        p.x += p.vx; 
        p.y += p.vy;
        
        if (currentRoomId === 8 && window.checkCollision({x: p.x - p.size, y: p.y - p.size, width: p.size*2, height: p.size*2}, centerStairs)) { 
            projectiles.splice(i, 1); continue; 
        }
        if (p.x < bLeft || p.y < bTop || p.x > bRight || p.y > bBot) { 
            projectiles.splice(i, 1); continue; 
        }
        
        let projectileHit = false; 
        let arrowHitbox = { x: p.x - p.size, y: p.y - p.size, size: p.size * 2 };

        for (let c = 0; c < currentCrates.length; c++) {
            let obj = currentCrates[c];
            if (!obj.isBroken && window.checkCollision(arrowHitbox, obj)) { obj.health -= 50; projectileHit = true; break; }
        }

        for (let j = 0; j < currentEnemies.length; j++) {
            let enemy = currentEnemies[j];
            if (p.hitTargets && p.hitTargets.includes(enemy)) continue;
            
            if (!projectileHit && window.checkCollision(arrowHitbox, enemy)) {
                if (!enemy.invulnerable) {
                    let isBlocked = false;
                    if (enemy.type === 'goblin' && Math.random() < 0.15) { 
                        isBlocked = true; enemy.blockAnimTimer = 45; 
                    }
                    if (!isBlocked) { 
                        let dmg = 30; if (player.heroClass === 'Elf') dmg = 60; enemy.health -= dmg; 
                    }
                }
                
                // --- GÉNÉRATION DU SANG EN IMAGE (Coup par Projectile / Magie) ---
                let hitNum = Math.floor(Math.random() * 3) + 1;
                bloodStains.push({
                    type: 'hit',
                    imgId: 'bloods_hit_view' + hitNum,
                    x: enemy.x + enemy.size/2,
                    y: enemy.y + enemy.size/2,
                    size: enemy.size * 1.5,
                    rotation: Math.random() * Math.PI * 2,
                    life: 3600
                });
                
                let isPiercingElf = (player.heroClass === 'Elf' && isUltimateActive);
                if (isPiercingElf || player.heroClass === 'Mage') { 
                    if (!p.hitTargets) p.hitTargets = []; p.hitTargets.push(enemy); 
                } else { 
                    projectileHit = true; break; 
                } 
            }
        }
        if (projectileHit) projectiles.splice(i, 1); 
    }

    let isElfInvuln = (isUltimateActive && player.heroClass === 'Elf' && !elfStealthBroken);

    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        let ep = enemyProjectiles[i];
        ep.x += ep.vx; ep.y += ep.vy;
        
        let epHitbox = { x: ep.x - ep.size, y: ep.y - ep.size, size: ep.size * 2 };
        
        if (ep.x < bLeft || ep.y < bTop || ep.x > bRight || ep.y > bBot) { 
            enemyProjectiles.splice(i, 1); continue; 
        }
        if (currentRoomId === 8 && window.checkCollision(epHitbox, centerStairs)) { 
            enemyProjectiles.splice(i, 1); continue; 
        }

        if (!isElfInvuln && playerInvulnerableTimer <= 0 && window.checkCollision(player, epHitbox)) {
            playerStats.health -= ep.damage || 15;
            if (ep.type === 'bat_web') { playerSlowTimer = 120; } 
            
            if (typeof window.triggerShake === 'function') window.triggerShake(8, 15);
            
            // --- SANG GÉNÉRÉ SUR LE JOUEUR (Dégâts Reçus) ---
            let hitNum = Math.floor(Math.random() * 3) + 1;
            bloodStains.push({
                type: 'hit',
                imgId: 'bloods_hit_view' + hitNum,
                x: player.x + player.size/2,
                y: player.y + player.size/2,
                size: player.size * 1.5,
                rotation: Math.random() * Math.PI * 2,
                life: 3600
            });
            
            playerInvulnerableTimer = 45;
            if (typeof window.updateHUD === 'function') window.updateHUD();
            if (playerStats.health <= 0 && typeof window.handlePlayerDeath === 'function') window.handlePlayerDeath();
            
            enemyProjectiles.splice(i, 1);
        }
    }
};

window.updateItemsAndCrates = function() {
    for (let i = currentItems.length - 1; i >= 0; i--) {
        let item = currentItems[i];
        if (window.checkCollision(player, item)) {
            worldState.collectedItems[item.id] = true; 
            
            // --- RAMASSAGE DE TOUS LES NOUVEAUX ITEMS ---
            if (item.type === 'key') playerStats.inventory.keys.gold++; 
            else if (item.type === 'key_skull') playerStats.inventory.keys.skull++; 
            else if (item.type === 'key_orb') playerStats.inventory.keys.orb++; 
            else if (item.type === 'potion_green') playerStats.inventory.potions.green++; 
            else if (item.type === 'potion_yellow') playerStats.inventory.potions.yellow++; 
            else if (item.type === 'potion_blue') playerStats.inventory.potions.blue++; 
            else if (item.type === 'potion_red') playerStats.inventory.potions.red++; 
            else if (item.type === 'coin') { 
                playerStats.inventory.coins++; 
                localStorage.setItem('kebra_coins', playerStats.inventory.coins); 
            }
            
            if (typeof window.updateHUD === 'function') window.updateHUD(); 
            currentItems.splice(i, 1); 
        }
    }

    for (let i = 0; i < currentCrates.length; i++) {
        let crate = currentCrates[i];
        if (!crate.isBroken && crate.health <= 0) {
            crate.isBroken = true; 
            if (crate.type === 'chest') {
                if (!worldState.openedChests) worldState.openedChests = {}; 
                worldState.openedChests[crate.id] = true;
                
                currentItems.push({ id: 'potion_chest_' + Date.now(), type: 'potion_green', x: crate.x + 25, y: crate.y + 25, size: 15, collected: false });
                currentItems.push({ id: 'coin_chest1_' + Date.now(), type: 'coin', x: crate.x + 10, y: crate.y + 40, size: 8, collected: false });
                currentItems.push({ id: 'coin_chest2_' + Date.now(), type: 'coin', x: crate.x + 40, y: crate.y + 40, size: 8, collected: false });
                
                if (typeof window.spawnParticles === 'function') window.spawnParticles(crate.x + crate.size/2, crate.y + crate.size/2, '#f1c40f', 30);
            } else {
                if (!worldState.brokenCrates) worldState.brokenCrates = {}; 
                worldState.brokenCrates[crate.id] = true;
                
                currentItems.push({ id: 'coin_' + Date.now() + i, type: 'coin', x: crate.x + 15, y: crate.y + 15, size: 8, collected: false });
            }
        }
    }
};
