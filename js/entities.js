// ============================================================================
// LOGIC SYSTEMS, SPAWNING, ROOM MAPS & ENTITIES REGISTRATION
// ============================================================================

function checkCollision(rect1, rect2) {
  let w1 = rect1.width || rect1.size; let h1 = rect1.height || rect1.size;
  let w2 = rect2.width || rect2.size; let h2 = rect2.height || rect2.size;
  return (rect1.x <= rect2.x + w2 && rect1.x + w1 >= rect2.x && rect1.y <= rect2.y + h2 && rect1.y + h1 >= rect2.y);
}

function spawnEnemy(type, count, baseX = null, baseY = null) {
    for (let i = 0; i < count; i++) {
        let ex = baseX; let ey = baseY;
        
        if (ex === null || ey === null) {
            let minSpawnX = wallMargin + arenaShrink;
            let maxSpawnX = canvas.width - wallMargin - arenaShrink - 40;
            let minSpawnY = wallMargin + arenaShrink;
            let maxSpawnY = canvas.height - wallMargin - arenaShrink - 40;

            if (arenaWave >= 41) {
                let side = Math.floor(Math.random() * 4);
                if (side === 0) { ex = minSpawnX; ey = minSpawnY + Math.random() * (maxSpawnY - minSpawnY); }
                else if (side === 1) { ex = maxSpawnX; ey = minSpawnY + Math.random() * (maxSpawnY - minSpawnY); } 
                else if (side === 2) { ex = minSpawnX + Math.random() * (maxSpawnX - minSpawnX); ey = minSpawnY; } 
                else { ex = minSpawnX + Math.random() * (maxSpawnX - minSpawnX); ey = maxSpawnY; } 
            } else {
                let side = Math.floor(Math.random() * 2);
                if (side === 0) { ex = minSpawnX; ey = minSpawnY + Math.random() * (maxSpawnY - minSpawnY); } 
                else { ex = maxSpawnX; ey = minSpawnY + Math.random() * (maxSpawnY - minSpawnY); } 
            }
        }
        
        let size = 40, hp = 90, spd = 3.5, col = '#27ae60';
        if (type === 'skeleton') { hp = 50; spd = 2; col = '#bdc3c7'; }
        else if (type === 'spider') { size = 30; hp = 1; spd = 7; col = '#8e44ad'; }
        else if (type === 'troll') { size = 80; hp = 900; spd = 2.5; col = '#117a65'; }
        else if (type === 'mage') { size = 60; hp = 900; spd = 2; col = '#9b59b6'; }
        else if (type === 'dragon') { size = 150; hp = 3000; spd = 1.0; col = '#8b0000'; }

        if (isArenaMode && arenaWave >= 25 && type !== 'spider' && type !== 'dragon') {
            hp += (arenaWave - 24) * 30;
        }

        currentEnemies.push({ 
            x: ex, y: ey, size: size, health: hp, maxHealth: hp, 
            speed: spd, color: col, type: type, shootCooldown: 0, summonTimer: 180,
            wobble: Math.random() * Math.PI * 2,
            timeAlive: 0, phase: 1, invulnerable: false,
            isBurning: false, burnTicks: 0, burnTimer: 0,
            slowTimer: 0, isPermanentlySlowed: false, // <-- RALENTISSEMENT INFINI NÉCRO
            killedBySummon: false, killedByNecro: false
        });
    }
}

function saveRoomState() {
    if (currentRoomId === 999) return; 
    worldState.enemyStates[currentRoomId] = JSON.parse(JSON.stringify(currentEnemies));
    if (currentEnemies.length === 0) {
        worldState.clearedRooms[currentRoomId] = true;
    }
}

function loadRoom(roomId) {
  currentRoomId = roomId;
  projectiles = []; enemyProjectiles = []; hazards = []; particles = [];
  necroSummons = []; necroKills = []; 
  
  if (!worldState.bloodStains[roomId]) worldState.bloodStains[roomId] = [];
  bloodStains = worldState.bloodStains[roomId];
  
  const doorN = { x: 1200/2 - 75, y: 0, width: 150, height: wallMargin, face: 'north' };
  const doorS = { x: 1200/2 - 75, y: 800 - wallMargin, width: 150, height: wallMargin, face: 'south' };
  const doorW = { x: 0, y: 800/2 - 75, width: wallMargin, height: 150, face: 'west' };
  const doorE = { x: 1200 - wallMargin, y: 800/2 - 75, width: wallMargin, height: 150, face: 'east' };

  const spawnN = { x: 1200/2 - 20, y: wallMargin + 20 };        
  const spawnS = { x: 1200/2 - 20, y: 800 - wallMargin - 60 }; 
  const spawnW = { x: wallMargin + 20, y: 800/2 - 20 };        
  const spawnE = { x: 1200 - wallMargin - 60, y: 800/2 - 20 }; 

  if (roomId === 1) { 
    currentDoors = [ { ...doorN, id: 'door_1_2', requiresKey: true, locked: !worldState.unlockedDoors['door_1_2'], dest: 2, spawnX: spawnS.x, spawnY: spawnS.y } ];
    currentItems = [];
    if (!worldState.collectedItems['potion_room1']) currentItems.push({ id: 'potion_room1', type: 'potion_green', x: 250, y: 650, size: 15, collected: false });
    if (!worldState.collectedItems['key_tuto']) currentItems.push({ id: 'key_tuto', type: 'key', x: 800, y: 400, size: 20, collected: false });
  } 
  else if (roomId === 2) { 
    currentDoors = [
      { ...doorS, id: 'door_2_1', requiresKey: false, locked: false, dest: 1, spawnX: spawnN.x, spawnY: spawnN.y },
      { ...doorW, id: 'door_2_3', requiresKey: false, locked: false, dest: 3, spawnX: spawnE.x, spawnY: spawnE.y },
      { ...doorE, id: 'door_2_4', requiresKey: false, locked: false, dest: 4, spawnX: spawnW.x, spawnY: spawnW.y },
      { ...doorN, id: 'door_2_8', requiresKey: true, locked: !worldState.unlockedDoors['door_2_8'], dest: 8, spawnX: spawnS.x, spawnY: spawnS.y } 
    ];
    currentItems = [];
  }
  else if (roomId === 3) { 
    currentDoors = [ { ...doorE, id: 'door_3_2', requiresKey: false, locked: false, dest: 2, spawnX: spawnW.x, spawnY: spawnW.y }, { ...doorN, id: 'door_3_5', requiresKey: false, locked: false, dest: 5, spawnX: spawnS.x, spawnY: spawnS.y } ];
    currentItems = [];
  }
  else if (roomId === 4) { 
    currentDoors = [ { ...doorW, id: 'door_4_2', requiresKey: false, locked: false, dest: 2, spawnX: spawnE.x, spawnY: spawnE.y }, { ...doorN, id: 'door_4_6', requiresKey: false, locked: false, dest: 6, spawnX: spawnS.x, spawnY: spawnS.y } ];
    currentItems = [];
  }
  else if (roomId === 5) { 
    currentDoors = [ { ...doorS, id: 'door_5_3', requiresKey: false, locked: false, dest: 3, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorN, id: 'door_5_7', requiresKey: false, locked: false, dest: 7, spawnX: 275, spawnY: spawnS.y } ];
    currentItems = [];
  }
  else if (roomId === 6) { 
    currentDoors = [ { ...doorS, id: 'door_6_4', requiresKey: false, locked: false, dest: 4, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorN, id: 'door_6_7', requiresKey: false, locked: false, dest: 7, spawnX: 875, spawnY: spawnS.y } ];
    currentItems = [];
  }
  else if (roomId === 7) { 
    currentDoors = [
      { x: 200, y: 800 - wallMargin, width: 150, height: wallMargin, face: 'south', id: 'door_7_5', requiresKey: false, locked: false, dest: 5, spawnX: spawnN.x, spawnY: spawnN.y },
      { x: 800, y: 800 - wallMargin, width: 150, height: wallMargin, face: 'south', id: 'door_7_6', requiresKey: false, locked: false, dest: 6, spawnX: spawnN.x, spawnY: spawnN.y }
    ];
    currentItems = [];
    if (!worldState.collectedItems['key_boss']) currentItems.push({ id: 'key_boss', type: 'key', x: 600, y: 400, size: 20, collected: false });
  }
  else if (roomId === 8) { 
    currentDoors = [ { ...doorS, id: 'door_8_2', requiresKey: false, locked: false, dest: 2, spawnX: spawnN.x, spawnY: spawnN.y } ];
    currentItems = [];
  }

  currentEnemies = [];
  if (roomId !== 999) {
      if (worldState.enemyStates[roomId]) {
          currentEnemies = JSON.parse(JSON.stringify(worldState.enemyStates[roomId]));
      } else if (!worldState.clearedRooms[roomId]) {
          if (roomId === 2) spawnEnemy('goblin', 1, 600, 400);
          else if (roomId === 3) spawnEnemy('goblin', 2, 400, 400);
          else if (roomId === 4) spawnEnemy('goblin', 2, 800, 400);
          else if (roomId === 5) spawnEnemy('goblin', 2, 400, 300);
          else if (roomId === 6) spawnEnemy('goblin', 2, 800, 300);
          else if (roomId === 7) spawnEnemy('goblin', 5, 450, 200);
      }
  } else if (roomId === 999) {
      currentDoors = []; currentItems = [];
      arenaShrink = 0; 
      player.x = canvas.width / 2 - player.size / 2;
      player.y = canvas.height / 2 - player.size / 2;
  }
}

function activateUltimate() {
    if (playerStats.mana < 100) return;

    if (player.heroClass === 'Necromancer') {
        if (necroSummons.length > 0) {
            let totalHP = 0;
            necroSummons.forEach(s => totalHP += s.health);
            necroSummons = []; 
            totalHP *= 2; // PV DOUBLÉS POUR LA FUSION
            
            // FUSION INVULNÉRABLE (3 SECS = 180 frames)
            necroSummons.push({ type: 'fusion', x: player.x, y: player.y - 30, health: totalHP, maxHealth: totalHP, damage: 60, size: 60, speed: 4.5, attackCooldown: 0, invulnerableTimer: 180 }); 
            spawnParticles(player.x + player.size/2, player.y + player.size/2, '#f1c40f', 80, true);
        } else if (necroKills.length > 0) {
            necroKills.forEach(kill => {
                let sz = 30, hp = 40, dmg = 15, spd = 4.5; // INVOCATIONS PLUS RAPIDES
                if(kill === 'troll') { hp = 200; sz = 60; dmg = 30; spd = 3.5; }
                else if(kill === 'mage') { hp = 100; sz = 45; dmg = 20; spd = 4; }
                else if(kill === 'dragon') { hp = 500; sz = 80; dmg = 50; spd = 3; }
                else if(kill === 'spider') { sz = 20; hp = 20; dmg = 10; spd = 6; }
                necroSummons.push({ type: kill, x: player.x + (Math.random()*80-40), y: player.y + (Math.random()*80-40), health: hp, maxHealth: hp, damage: dmg, size: sz, speed: spd, attackCooldown: 0, invulnerableTimer: 0 });
            });
            necroKills = []; 
            spawnParticles(player.x + player.size/2, player.y + player.size/2, '#2ecc71', 50, true);
        } else {
            return; 
        }
    }
    
    isUltimateActive = true;
    playerStats.mana = 0;
    ultimateTimer = 600; 
    elfStealthBroken = false; 
    
    if (player.heroClass === 'Knight') {
        playerInvulnerableTimer = 300; 
        spawnParticles(player.x + player.size/2, player.y + player.size/2, '#f1c40f', 50, true);
    } else if (player.heroClass === 'Elf') {
        spawnParticles(player.x + player.size/2, player.y + player.size/2, '#2ecc71', 50, true);
    } else if (player.heroClass === 'Mage') {
        currentEnemies.forEach(enemy => {
            let ultDmg = enemy.isBurning ? 100 : 50; 
            if (!enemy.invulnerable) enemy.health -= ultDmg;
            enemy.isBurning = true;
            enemy.burnTicks = 10;
            enemy.burnTimer = 60;
            spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, '#e67e22', 30, true);
        });
    }
    
    triggerShake(12, 15);
    updateHUD();
}

function handlePlayerDeath() {
    gameState = "GAMEOVER"; 
    
    setTimeout(() => {
        gameState = "MENU";
        isArenaMode = false;
        isUltimateActive = false;
        currentEnemies = []; bloodStains = []; projectiles = []; enemyProjectiles = []; hazards = []; particles = [];
        shakeTimer = 0; shakeIntensity = 0; playerPoisonTimer = 0; playerSlowTimer = 0; arenaShrink = 0; 
        
        spaceHoldTimer = 0; waveStartDelay = 0; necroKills = []; necroSummons = [];
        
        worldState.unlockedDoors = {};
        worldState.collectedItems = {};
        worldState.clearedRooms = {};
        worldState.bloodStains = {};
        worldState.enemyStates = {}; 
        
        playerStats.inventory.keys.gold = 0;
        playerStats.inventory.potions.green = 0;
        playerStats.inventory.potions.yellow = 0;
        playerStats.inventory.potions.blue = 0;
        playerStats.inventory.potions.red = 0;
        
        document.getElementById('menu-screen').style.display = 'flex';
        playerStats.health = playerStats.maxHealth;
        playerStats.mana = 0;
        updateHUD();
    }, 3000); 
}
