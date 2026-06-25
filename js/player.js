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

window.triggerDash = function() {
    if (gameState !== "PLAYING") return;
    if (player.dashCooldown <= 0 && player.dashTimer <= 0) {
        let dx = mouse.x - (player.x + player.size / 2); let dy = mouse.y - (player.y + player.size / 2);
        let dist = Math.hypot(dx, dy); if (dist === 0) { dx = 1; dy = 0; dist = 1; }
        player.dashVx = (dx/dist) * (player.speed * 4); player.dashVy = (dy/dist) * (player.speed * 4);
        player.dashTimer = 12; player.dashCooldown = 60; playerInvulnerableTimer = 15; 
        if (typeof window.spawnParticles === 'function') window.spawnParticles(player.x + player.size/2, player.y + player.size/2, '#ecf0f1', 15);
    }
};

window.activateUltimate = function() {
    if (playerStats.mana >= 100) {
        playerStats.mana = 0;
        isUltimateActive = true;
        ultimateTimer = 300;
        playerInvulnerableTimer = 60; 
        if (typeof window.spawnParticles === 'function') window.spawnParticles(player.x + player.size/2, player.y + player.size/2, '#3498db', 50);
        if (typeof window.updateHUD === 'function') window.updateHUD();
    }
};

window.handlePlayerDeath = function() {
    gameState = "GAMEOVER";
    setTimeout(() => { alert("VOUS ÊTES MORT !"); window.location.reload(); }, 100);
};
