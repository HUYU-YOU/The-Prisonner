// ============================================================================
// js/player.js - LOGIQUE DU HÉROS ET SÉLECTION
// ============================================================================

window.startHeroHold = function(heroClass) {
    isHolding = true; holdCompleted = false;
    holdTimer = setTimeout(() => { 
        holdCompleted = true; 
        if (typeof window.startArenaMode === 'function') window.startArenaMode(heroClass); 
    }, 10000); 
};

window.endHeroHold = function(heroClass) {
    if (isHolding) { 
        clearTimeout(holdTimer); 
        isHolding = false; 
        if (!holdCompleted && typeof window.selectHero === 'function') window.selectHero(heroClass); 
    }
};

window.selectHero = function(heroClass) {
    player.heroClass = heroClass;
    if (heroClass === 'Knight') { playerStats.name = "CHEVALIER"; playerStats.weapon = "ÉPÉE LOURDE"; player.speed = 4; playerStats.maxHealth = 140; playerStats.health = 140; } 
    else if (heroClass === 'Elf') { playerStats.name = "KEBRA"; playerStats.weapon = "ARC D'EMERYN"; player.speed = 6; playerStats.maxHealth = 100; playerStats.health = 100; } 
    else if (heroClass === 'Mage') { playerStats.name = "MAGE BRÛLEUR"; playerStats.weapon = "BOULES DE FEU"; player.speed = 5; playerStats.maxHealth = 100; playerStats.health = 100; } 
    else if (heroClass === 'Necromancer') { playerStats.name = "NÉCROMANCIEN"; playerStats.weapon = "FAUX DES ÂMES"; player.speed = 4.5; playerStats.maxHealth = 120; playerStats.health = 120; }
    
    playerStats.inventory.coins = parseInt(localStorage.getItem('kebra_coins')) || 0;
    player.dashCooldown = 0; player.dashTimer = 0;

    let pName = document.getElementById('p-name'); if (pName) pName.innerText = playerStats.name;
    let pWpn = document.getElementById('p-weapon'); if (pWpn) pWpn.innerText = playerStats.weapon;
    
    let audioControls = document.getElementById('audio-ui'); if (audioControls) audioControls.style.display = 'none';
    let menuScreen = document.getElementById('menu-screen'); if (menuScreen) menuScreen.style.display = 'none';
    
    if (typeof window.updatePortrait === 'function') window.updatePortrait(heroClass); 
    if (typeof window.loadRoom === 'function') window.loadRoom(1); 
    if (typeof window.updateHUD === 'function') window.updateHUD(); 
    gameState = "PLAYING";
};

window.startArenaMode = function(heroClass) {
    isArenaMode = true; arenaWave = 1; arenaState = "WAITING"; arenaTimer = 300; player.heroClass = heroClass;
    
    playerStats.inventory.coins = parseInt(localStorage.getItem('kebra_coins')) || 0;
    player.dashCooldown = 0; player.dashTimer = 0;

    if (heroClass === 'Knight') { playerStats.name = "CHEVALIER (ARÈNE)"; playerStats.weapon = "ÉPÉE LOURDE"; player.speed = 4; playerStats.maxHealth = 140; playerStats.health = 140; } 
    else if (heroClass === 'Elf') { playerStats.name = "KEBRA (ARÈNE)"; playerStats.weapon = "ARC D'EMERYN"; player.speed = 6; playerStats.maxHealth = 100; playerStats.health = 100; } 
    else if (heroClass === 'Mage') { playerStats.name = "MAGE BRÛLEUR"; playerStats.weapon = "BOULES DE FEU"; player.speed = 5; playerStats.maxHealth = 100; playerStats.health = 100; } 
    else if (heroClass === 'Necromancer') { playerStats.name = "NÉCROMANCIEN (ARÈNE)"; playerStats.weapon = "FAUX DES ÂMES"; player.speed = 4.5; playerStats.maxHealth = 120; playerStats.health = 120; }
    
    let pName = document.getElementById('p-name'); if (pName) pName.innerText = playerStats.name;
    let pWpn = document.getElementById('p-weapon'); if (pWpn) pWpn.innerText = playerStats.weapon;
    
    let audioControls = document.getElementById('audio-ui'); if (audioControls) audioControls.style.display = 'none';
    let menuScreen = document.getElementById('menu-screen'); if (menuScreen) menuScreen.style.display = 'none';
    
    if (typeof window.updatePortrait === 'function') window.updatePortrait(heroClass); 
    if (typeof window.loadRoom === 'function') window.loadRoom(999); 
    if (typeof window.updateHUD === 'function') window.updateHUD(); 
    gameState = "PLAYING";
};

window.usePotion = function(color) {
    if (playerStats.inventory.potions[color] > 0) {
        let potionUsed = false;
        if (color === 'green' && playerStats.health < playerStats.maxHealth) { playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + (playerStats.maxHealth * 0.2)); potionUsed = true; } 
        else if (color === 'red' && playerStats.health < playerStats.maxHealth) { playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + (playerStats.maxHealth * 0.5)); potionUsed = true; } 
        else if (color === 'blue' && playerStats.mana < 100) { playerStats.mana = Math.min(100, playerStats.mana + 20); potionUsed = true; } 
        else if (color === 'yellow') { playerPoisonTimer = 0; playerSlowTimer = 0; potionUsed = true; }
        
        if (potionUsed) { 
            playerStats.inventory.potions[color]--; 
            if (typeof window.updateHUD === 'function') window.updateHUD(); 
            if (typeof window.spawnParticles === 'function') window.spawnParticles(player.x + player.size/2, player.y + player.size/2, '#3498db', 20); 
        }
    }
};
window.activateUltimate = function() {
    if (playerStats.mana < 100) return;

    if (player.heroClass === 'Necromancer') {
        if (typeof necroSummons !== 'undefined' && necroSummons.length > 0) {
            let totalHP = 0; 
            necroSummons.forEach(s => totalHP += s.health);
            necroSummons = []; 
            totalHP *= 2; 
            // Création de la FUSION
            necroSummons.push({ type: 'fusion', x: player.x, y: player.y - 30, health: totalHP, maxHealth: totalHP, damage: 60, size: 60, speed: 3.5, attackCooldown: 0, invulnerableTimer: 180, faceAngle: 0 }); 
        } else if (typeof necroKills !== 'undefined' && necroKills.length > 0) {
            necroKills.forEach(kill => {
                // Création des AMES
                necroSummons.push({ type: 'soul', x: player.x + (Math.random()*80-40), y: player.y + (Math.random()*80-40), health: 100, maxHealth: 100, damage: 20, size: 30, speed: 4.5, attackCooldown: 0, faceAngle: 0 });
            });
            necroKills = []; 
        } else { return; }
    }
    
    isUltimateActive = true; 
    playerStats.mana = 0; 
    ultimateTimer = 600; 
    elfStealthBroken = false; 
    
    if (player.heroClass === 'Knight') {
        playerInvulnerableTimer = 300; 
    } else if (player.heroClass === 'Mage') {
        currentEnemies.forEach(enemy => {
            let ultDmg = enemy.isBurning ? 100 : 50; 
            if (!enemy.invulnerable) {
                enemy.health -= ultDmg;
                enemy.ultiAnimTimer = 30;
            }
            enemy.isBurning = true; 
            enemy.burnTimer = 180;
        });
    }
    
    if (typeof window.triggerShake === 'function') window.triggerShake(12, 15); 
    if (typeof window.updateHUD === 'function') window.updateHUD();
};

window.triggerDash = function() {
    if (gameState !== "PLAYING") return;
    if (player.dashCooldown <= 0 && player.dashTimer <= 0) {
        let dx = mouse.x - (player.x + player.size / 2); let dy = mouse.y - (player.y + player.size / 2);
        let dist = Math.hypot(dx, dy); if (dist === 0) { dx = 1; dy = 0; dist = 1; }
        player.dashVx = (dx/dist) * (player.speed * 4); player.dashVy = (dy/dist) * (player.speed * 4);
        player.dashTimer = 12; player.dashCooldown = 60; playerInvulnerableTimer = 15; 
        // L'effet dégueulasse des particules grises au démarrage a été retiré.
    }
};

window.activateUltimate = function() {
    if (playerStats.mana < 100) return;

    if (player.heroClass === 'Necromancer') {
        if (typeof necroSummons !== 'undefined' && necroSummons.length > 0) {
            let totalHP = 0; necroSummons.forEach(s => totalHP += s.health);
            necroSummons = []; totalHP *= 2; 
            necroSummons.push({ type: 'fusion', x: player.x, y: player.y - 30, health: totalHP, maxHealth: totalHP, damage: 60, size: 60, speed: 4.5, attackCooldown: 0, invulnerableTimer: 180 }); 
            if(typeof window.spawnParticles === 'function') window.spawnParticles(player.x + player.size/2, player.y + player.size/2, '#f1c40f', 80, true);
        } else if (typeof necroKills !== 'undefined' && necroKills.length > 0) {
            necroKills.forEach(kill => {
                let sz = 30, hp = 40, dmg = 15, spd = 4.5;
                if(kill === 'troll') { hp = 200; sz = 60; dmg = 30; spd = 3.5; }
                else if(kill === 'mage') { hp = 100; sz = 45; dmg = 20; spd = 4; }
                else if(kill === 'dragon') { hp = 500; sz = 80; dmg = 50; spd = 3; }
                else if(kill === 'spider') { sz = 20; hp = 20; dmg = 10; spd = 6; }
                necroSummons.push({ type: kill, x: player.x + (Math.random()*80-40), y: player.y + (Math.random()*80-40), health: hp, maxHealth: hp, damage: dmg, size: sz, speed: spd, attackCooldown: 0, invulnerableTimer: 0 });
            });
            necroKills = []; 
            if(typeof window.spawnParticles === 'function') window.spawnParticles(player.x + player.size/2, player.y + player.size/2, '#2ecc71', 50, true);
        } else { return; }
    }
    
    isUltimateActive = true; playerStats.mana = 0; ultimateTimer = 600; elfStealthBroken = false; 
    
    if (player.heroClass === 'Knight') {
        playerInvulnerableTimer = 300; 
        if(typeof window.spawnParticles === 'function') window.spawnParticles(player.x + player.size/2, player.y + player.size/2, '#f1c40f', 50, true);
    } else if (player.heroClass === 'Elf') {
        if(typeof window.spawnParticles === 'function') window.spawnParticles(player.x + player.size/2, player.y + player.size/2, '#2ecc71', 50, true);
    } else if (player.heroClass === 'Mage') {
        currentEnemies.forEach(enemy => {
            let ultDmg = enemy.isBurning ? 100 : 50; 
            if (!enemy.invulnerable) {
                enemy.health -= ultDmg;
                enemy.ultiAnimTimer = 30;
            }
            enemy.isBurning = true; enemy.burnTicks = 10; enemy.burnTimer = 60;
            if(typeof window.spawnParticles === 'function') window.spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, '#e67e22', 30, true);
        });
    }
    
    if (typeof window.triggerShake === 'function') window.triggerShake(12, 15); 
    if (typeof window.updateHUD === 'function') window.updateHUD();
};

window.handlePlayerDeath = function() {
    gameState = "GAMEOVER"; 
    setTimeout(() => {
        gameState = "MENU"; isArenaMode = false; isUltimateActive = false;
        currentEnemies = []; bloodStains = []; projectiles = []; enemyProjectiles = []; hazards = []; particles = [];
        shakeTimer = 0; shakeIntensity = 0; playerPoisonTimer = 0; playerSlowTimer = 0; arenaShrink = 0; 
        spaceHoldTimer = 0; waveStartDelay = 0; necroKills = []; necroSummons = [];
        
        worldState = { unlockedDoors: {}, openedDoors: {}, collectedItems: {}, clearedRooms: {}, bloodStains: {}, enemyStates: {}, visitedRooms: {}, brokenCrates: {}, openedChests: {}, bossDefeated: false }; 
        playerStats.inventory = { keys: { gold: 0, skull: 0, orb: 0 }, potions: { green: 0, yellow: 0, blue: 0, red: 0 }, coins: parseInt(localStorage.getItem('kebra_coins')) || 0 };
        
        let menuScreen = document.getElementById('menu-screen'); if (menuScreen) menuScreen.style.display = 'flex';
        let audioUi = document.getElementById('audio-ui'); if (audioUi) audioUi.style.display = 'flex';
        
        playerStats.health = playerStats.maxHealth; playerStats.mana = 0; 
        if (typeof window.updateHUD === 'function') window.updateHUD();
    }, 3000); 
};
