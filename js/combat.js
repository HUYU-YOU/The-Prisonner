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
            window.projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle - spread) * 12, vy: Math.sin(angle - spread) * 12, size: 5, hitTargets: [], angle: angle - spread, type: 'arrow_elf' });
            window.projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle + spread) * 12, vy: Math.sin(angle + spread) * 12, size: 5, hitTargets: [], angle: angle + spread, type: 'arrow_elf' });
            attackCooldown = 15;
        } else { 
            window.projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle) * 12, vy: Math.sin(angle) * 12, size: 5, hitTargets: [], angle: angle, type: 'arrow_elf' }); 
            attackCooldown = 30; 
        }
    } 
    else if (player.heroClass === 'Mage') {
        window.projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle) * 10, vy: Math.sin(angle) * 10, size: 8, hitTargets: [], angle: angle, type: 'fire_mage' }); 
        attackCooldown = 35;
    } 
    else if (player.heroClass === 'Necromancer') {
        window.projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle) * 10, vy: Math.sin(angle) * 10, size: 6, hitTargets: [], angle: angle, type: 'fire_necromancien' }); 
        attackCooldown = 15;
    } 
    else if (player.heroClass === 'Knight') {
        isAttacking = true; 
        attackCooldown = 40;
        let hitBox = { x: player.x + player.size / 2 + Math.cos(angle) * 60 - 60, y: player.y + player.size / 2 + Math.sin(angle) * 60 - 60, size: 120 };
        
        window.currentEnemies.forEach(enemy => { 
            if (window.checkCollision(hitBox, enemy)) {
                if (!enemy.invulnerable) {
                    if (enemy.type === 'goblin' && Math.random() < 0.15) { 
                        enemy.blockAnimTimer = 45; 
                    } else { 
                        enemy.health -= 50; 
                        
                        if (enemy.type !== 'skeleton') {
                            let hitNum = Math.floor(Math.random() * 3) + 1;
                            let maxLife = (currentRoomId === 999) ? 1200 : 3600;
                            // Sang divisé par deux (-50%)
                            window.bloodStains.push({ type: 'hit', imgId: 'bloods_hit_view' + hitNum, x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, size: enemy.size * 0.75, rotation: Math.random() * Math.PI * 2, life: maxLife });
                        }
                        if (typeof window.triggerShake === 'function') window.triggerShake(5, 8); 
                    }
                }
            } 
        });
        
        for (let i = 0; i < window.currentCrates.length; i++) {
            let obj = window.currentCrates[i]; 
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

    for (let i = window.projectiles.length - 1; i >= 0; i--) {
        let p = window.projectiles[i]; 
        p.x += p.vx; 
        p.y += p.vy;
        
        if (currentRoomId === 8 && window.checkCollision({x: p.x - p.size, y: p.y - p.size, width: p.size*2, height: p.size*2}, centerStairs)) { 
            window.projectiles.splice(i, 1); continue; 
        }
        if (p.x < bLeft || p.y < bTop || p.x > bRight || p.y > bBot) { 
            window.projectiles.splice(i, 1); continue; 
        }
        
        let projectileHit = false; 
        let arrowHitbox = { x: p.x - p.size, y: p.y - p.size, size: p.size * 2 };

        for (let c = 0; c < window.currentCrates.length; c++) {
            let obj = window.currentCrates[c];
            if (!obj.isBroken && window.checkCollision(arrowHitbox, obj)) { obj.health -= 50; projectileHit = true; break; }
        }

        for (let j = 0; j < window.currentEnemies.length; j++) {
            let enemy = window.currentEnemies[j];
            if (p.hitTargets && p.hitTargets.includes(enemy)) continue;
            
            if (!projectileHit && window.checkCollision(arrowHitbox, enemy)) {
                if (!enemy.invulnerable) {
                    let isBlocked = false;
                    if (enemy.type === 'goblin' && Math.random() < 0.15) { 
                        isBlocked = true; enemy.blockAnimTimer = 45; 
                    }
                    if (!isBlocked) { 
                        let dmg = 30; 
                        if (player.heroClass === 'Elf') dmg = 60; 
                        else if (p.type === 'fire_fusion') dmg = 40; 
                        
                        enemy.health -= dmg; 
                        
                        if (p.type === 'fire_mage' || player.heroClass === 'Mage') {
                            enemy.isBurning = true; enemy.burnTimer = 180; 
                        }
                    }
                }
                
                if (enemy.type !== 'skeleton') {
                    let hitNum = Math.floor(Math.random() * 3) + 1;
                    let maxLife = (currentRoomId === 999) ? 1200 : 3600;
                    window.bloodStains.push({ type: 'hit', imgId: 'bloods_hit_view' + hitNum, x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, size: enemy.size * 0.75, rotation: Math.random() * Math.PI * 2, life: maxLife });
                }
                
                // --- ICI : L'ATTAQUE DE BASE DU NÉCROMANCIEN NE TRANSPERCE PAS ! ---
                let isPiercingElf = (player.heroClass === 'Elf' && isUltimateActive);
                let isPiercing = isPiercingElf || player.heroClass === 'Mage' || p.type === 'fire_fusion';
                
                if (isPiercing) { 
                    if (!p.hitTargets) p.hitTargets = []; p.hitTargets.push(enemy); 
                } else { 
                    projectileHit = true; break; 
                } 
            }
        }
        if (projectileHit) window.projectiles.splice(i, 1); 
    }

    let isElfInvuln = (isUltimateActive && player.heroClass === 'Elf' && !elfStealthBroken);
    let fusionAggro = window.necroSummons.find(s => s.type === 'fusion');

    for (let i = window.enemyProjectiles.length - 1; i >= 0; i--) {
        let ep = window.enemyProjectiles[i];
        ep.x += ep.vx; ep.y += ep.vy;
        
        if (ep.type === 'armor_sword') {
            if (ep.lifeTimer === undefined) ep.lifeTimer = 0;
            ep.lifeTimer++;
            if (ep.lifeTimer === 30) { ep.vx *= -1; ep.vy *= -1; } 
            if (ep.lifeTimer >= 60) { window.enemyProjectiles.splice(i, 1); continue; } 
        }
        
        let epHitbox = { x: ep.x - ep.size, y: ep.y - ep.size, size: ep.size * 2 };
        
        if (ep.x < bLeft || ep.y < bTop || ep.x > bRight || ep.y > bBot) { 
            window.enemyProjectiles.splice(i, 1); continue; 
        }
        if (currentRoomId === 8 && window.checkCollision(epHitbox, centerStairs)) { 
            window.enemyProjectiles.splice(i, 1); continue; 
        }

        if (fusionAggro && window.checkCollision(fusionAggro, epHitbox)) {
            fusionAggro.health -= ep.damage || 15;
            window.enemyProjectiles.splice(i, 1);
            continue;
        }

        if (!fusionAggro && !isElfInvuln && playerInvulnerableTimer <= 0 && window.checkCollision(player, epHitbox)) {
            playerStats.health -= ep.damage || 15;
            if (ep.type === 'bat_web') { playerSlowTimer = 120; } 
            if (typeof window.triggerShake === 'function') window.triggerShake(8, 15);
            
            let hitNum = Math.floor(Math.random() * 3) + 1;
            let maxLife = (currentRoomId === 999) ? 1200 : 3600;
            window.bloodStains.push({ type: 'hit', imgId: 'bloods_hit_view' + hitNum, x: player.x + player.size/2, y: player.y + player.size/2, size: player.size * 0.75, rotation: Math.random() * Math.PI * 2, life: maxLife });
            
            playerInvulnerableTimer = 45;
            if (typeof window.updateHUD === 'function') window.updateHUD();
            if (playerStats.health <= 0 && typeof window.handlePlayerDeath === 'function') window.handlePlayerDeath();
            window.enemyProjectiles.splice(i, 1);
        }
    }
    
    for (let i = window.hazards.length - 1; i >= 0; i--) {
        let h = window.hazards[i];
        h.timer--;
        if (h.timer <= 0) {
            let target = player;
            let fusion = window.necroSummons.find(s => s.type === 'fusion');
            if (fusion) target = fusion;

            if (!isElfInvuln && playerInvulnerableTimer <= 0) {
                let distH = Math.hypot((target.x + target.size/2) - h.x, (target.y + target.size/2) - h.y);
                if (distH < h.radius) {
                    if (target === player) {
                        playerStats.health -= h.damage || 20;
                        playerInvulnerableTimer = 45;
                        if (typeof window.triggerShake === 'function') window.triggerShake(15, 25);
                        if (typeof window.updateHUD === 'function') window.updateHUD();
                        if (playerStats.health <= 0 && typeof window.handlePlayerDeath === 'function') window.handlePlayerDeath();
                    } else {
                        target.health -= h.damage || 20; 
                    }
                }
            }
            window.hazards.splice(i, 1); 
        }
    }
};

window.updateItemsAndCrates = function() {
    for (let i = window.currentItems.length - 1; i >= 0; i--) {
        let item = window.currentItems[i];
        if (window.checkCollision(player, item)) {
            worldState.collectedItems[item.id] = true; 
            
            if (item.type === 'key') playerStats.inventory.keys.gold++; 
            else if (item.type === 'key_skull') playerStats.inventory.keys.skull++; 
            else if (item.type === 'key_orb') playerStats.inventory.keys.orb++; 
            else if (item.type === 'potion_green') playerStats.inventory.potions.green++; 
            else if (item.type === 'potion_yellow') playerStats.inventory.potions.yellow++; 
            else if (item.type === 'potion_blue') playerStats.inventory.potions.blue++; 
            else if (item.type === 'potion_red') playerStats.inventory.potions.red++; 
            else if (item.type === 'coin') { 
                playerStats.inventory.coins++; localStorage.setItem('kebra_coins', playerStats.inventory.coins); 
            }
            if (typeof window.updateHUD === 'function') window.updateHUD(); 
            window.currentItems.splice(i, 1); 
        }
    }

    for (let i = 0; i < window.currentCrates.length; i++) {
        let crate = window.currentCrates[i];
        if (!crate.isBroken && crate.health <= 0) {
            crate.isBroken = true; 
            if (crate.type === 'chest') {
                if (!worldState.openedChests) worldState.openedChests = {}; worldState.openedChests[crate.id] = true;
                window.currentItems.push({ id: 'potion_chest_' + Date.now(), type: 'potion_green', x: crate.x + 25, y: crate.y + 25, size: 15, collected: false });
                window.currentItems.push({ id: 'coin_chest1_' + Date.now(), type: 'coin', x: crate.x + 10, y: crate.y + 40, size: 8, collected: false });
                window.currentItems.push({ id: 'coin_chest2_' + Date.now(), type: 'coin', x: crate.x + 40, y: crate.y + 40, size: 8, collected: false });
            } else {
                if (!worldState.brokenCrates) worldState.brokenCrates = {}; worldState.brokenCrates[crate.id] = true;
                window.currentItems.push({ id: 'coin_' + Date.now() + i, type: 'coin', x: crate.x + 15, y: crate.y + 15, size: 8, collected: false });
            }
        }
    }
};
