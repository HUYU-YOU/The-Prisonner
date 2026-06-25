// ============================================================================
// NIVEAUX, CAISSES ET APPARITIONS (js/rooms.js)
// ============================================================================

function saveRoomState() {
    if (!worldState.enemyStates) worldState.enemyStates = {};
    worldState.enemyStates[currentRoomId] = JSON.parse(JSON.stringify(currentEnemies));
}

function spawnEnemy(type, count, baseX = null, baseY = null) {
    for (let i = 0; i < count; i++) {
        let ex = baseX; let ey = baseY;
        let size = 40, hp = 90, spd = 3.5, col = '#27ae60';
        
        if (type === 'skeleton') { hp = 50; spd = 2; col = '#bdc3c7'; } 
        else if (type === 'spider') { size = 30; hp = 1; spd = 7; col = '#8e44ad'; } 
        else if (type === 'troll') { size = 80; hp = 900; spd = 2.5; col = '#117a65'; } 
        else if (type === 'mage') { size = 60; hp = 900; spd = 2; col = '#9b59b6'; } 
        else if (type === 'dragon') { size = 150; hp = 3000; spd = 1.0; col = '#8b0000'; }

        if (ex === null || ey === null) {
            let bTop = (currentRoomId === 2 || currentRoomId === 3) ? 250 : wallMargin;
            let bBot = (currentRoomId === 2 || currentRoomId === 3) ? 550 : canvas.height - wallMargin;

            let minX = wallMargin + arenaShrink; let maxX = canvas.width - wallMargin - arenaShrink - size;
            let minY = bTop + arenaShrink; let maxY = bBot - arenaShrink - size;

            if (arenaWave >= 41) {
                let side = Math.floor(Math.random() * 4);
                if (side === 0) { ex = minX; ey = minY + Math.random() * (maxY - minY); }
                else if (side === 1) { ex = maxX; ey = minY + Math.random() * (maxY - minY); } 
                else if (side === 2) { ex = minX + Math.random() * (maxX - minX); ey = minY; } 
                else { ex = minX + Math.random() * (maxX - minX); ey = maxY; } 
            } else {
                let side = Math.floor(Math.random() * 2);
                if (side === 0) { ex = minX; ey = minY + Math.random() * (maxY - minY); } 
                else { ex = maxX; ey = minY + Math.random() * (maxY - minY); } 
            }
        }
        
        if (isArenaMode && arenaWave >= 25 && type !== 'spider' && type !== 'dragon') hp += (arenaWave - 24) * 30;

        currentEnemies.push({ 
            x: ex, y: ey, size: size, health: hp, maxHealth: hp, speed: spd, color: col, type: type, shootCooldown: 0, summonTimer: 180,
            wobble: Math.random() * Math.PI * 2, timeAlive: 0, phase: 1, invulnerable: false,
            isBurning: false, burnTicks: 0, burnTimer: 0, slowTimer: 0, isPermanentlySlowed: false, 
            killedBySummon: false, killedByNecro: false, attackAnimTimer: 0, blockAnimTimer: 0, ultiAnimTimer: 0, dashTimer: 180, isDashing: 0
        });
    }
}

function loadRoom(roomId, entryFace = 'south') {
  currentRoomId = roomId;
  projectiles = []; enemyProjectiles = []; hazards = []; particles = []; currentCrates = [];
  
  if (!worldState.bloodStains) worldState.bloodStains = {};
  if (!worldState.visitedRooms) worldState.visitedRooms = {};
  if (!worldState.brokenCrates) worldState.brokenCrates = {};
  if (!worldState.openedChests) worldState.openedChests = {};
  if (!worldState.bloodStains[roomId]) worldState.bloodStains[roomId] = [];
  
  bloodStains = worldState.bloodStains[roomId];
  worldState.visitedRooms[roomId] = true; // Met la Minimap à jour !
  
  let bTop = (roomId === 2 || roomId === 3) ? 250 : wallMargin;
  let bBot = (roomId === 2 || roomId === 3) ? 550 : 800 - wallMargin;

  // CORRECTION: Portes allongées de 15px pour éviter le blocage avec les collisions strictes !
  const doorN = { x: 1200/2 - 75, y: bTop - wallMargin, width: 150, height: wallMargin + 15, face: 'north' };
  const doorS = { x: 1200/2 - 75, y: bBot - 15, width: 150, height: wallMargin + 15, face: 'south' };
  const doorW = { x: -15, y: (bTop+bBot)/2 - 75, width: wallMargin + 15, height: 150, face: 'west' };
  const doorE = { x: 1200 - wallMargin - 15, y: (bTop+bBot)/2 - 75, width: wallMargin + 15, height: 150, face: 'east' };

  if (roomId === 1) { 
    currentDoors = [ { ...doorN, id: 'door_1_2', requiresKey: true, locked: !worldState.unlockedDoors['door_1_2'], dest: 2, spawnX: doorS.x, spawnY: doorS.y - 60 } ];
    currentItems = [];
    if (!worldState.collectedItems['key_tuto']) currentItems.push({ id: 'key_tuto', type: 'key', x: 800, y: 400, size: 20, collected: false });
    
    // Le Coffre (remplace la potion)
    let isOpened = worldState.openedChests && worldState.openedChests['chest_1'];
    currentCrates.push({ id: 'chest_1', type: 'chest', x: 250, y: 650, size: 60, health: isOpened ? 0 : 1, isBroken: isOpened });
  } 
  else if (roomId === 2) { 
    currentDoors = [
      { ...doorS, id: 'door_2_1', dest: 1, spawnX: doorN.x, spawnY: doorN.y + wallMargin + 20 },
      { ...doorW, id: 'door_2_3', dest: 3, spawnX: doorE.x - 60, spawnY: doorE.y + 20 },
      { ...doorE, id: 'door_2_4', dest: 4, spawnX: doorW.x + wallMargin + 20, spawnY: doorW.y + 20 },
      { ...doorN, id: 'door_2_8', requiresKey: true, locked: !worldState.unlockedDoors['door_2_8'], dest: 8, spawnX: doorS.x, spawnY: doorS.y - 60 } 
    ]; 
    currentItems = [];
  }
  else if (roomId === 3) { currentDoors = [ { ...doorE, id: 'door_3_2', dest: 2, spawnX: doorW.x + wallMargin + 20, spawnY: doorW.y + 20 }, { ...doorN, id: 'door_3_5', dest: 5, spawnX: doorS.x, spawnY: doorS.y - 60 } ]; currentItems = []; }
  else if (roomId === 4) { currentDoors = [ { ...doorW, id: 'door_4_2', dest: 2, spawnX: doorE.x - 60, spawnY: doorE.y + 20 }, { ...doorN, id: 'door_4_6', dest: 6, spawnX: doorS.x, spawnY: doorS.y - 60 } ]; currentItems = []; }
  else if (roomId === 5) { currentDoors = [ { ...doorS, id: 'door_5_3', dest: 3, spawnX: doorN.x, spawnY: doorN.y + wallMargin + 20 }, { ...doorN, id: 'door_5_7', dest: 7, spawnX: 275, spawnY: doorS.y - 60 } ]; currentItems = []; }
  else if (roomId === 6) { currentDoors = [ { ...doorS, id: 'door_6_4', dest: 4, spawnX: doorN.x, spawnY: doorN.y + wallMargin + 20 }, { ...doorN, id: 'door_6_7', dest: 7, spawnX: 875, spawnY: doorS.y - 60 } ]; currentItems = []; }
  else if (roomId === 7) { 
    currentDoors = [ { x: 200, y: 800 - wallMargin, width: 150, height: wallMargin + 15, face: 'south', id: 'door_7_5', dest: 5, spawnX: doorN.x, spawnY: doorN.y + wallMargin + 20 }, { x: 800, y: 800 - wallMargin, width: 150, height: wallMargin + 15, face: 'south', id: 'door_7_6', dest: 6, spawnX: doorN.x, spawnY: doorN.y + wallMargin + 20 } ];
    currentItems = [];
    if (!worldState.collectedItems['key_boss']) currentItems.push({ id: 'key_boss', type: 'key', x: 600, y: 400, size: 20, collected: false });
  }
  else if (roomId === 8) { currentDoors = [ { ...doorS, id: 'door_8_2', dest: 2, spawnX: doorN.x, spawnY: doorN.y + wallMargin + 20 } ]; currentItems = []; }

  // Apparition des caisses
  if (roomId !== 1 && roomId !== 8 && roomId !== 999) {
      let broken0 = worldState.brokenCrates && worldState.brokenCrates[roomId + "_0"];
      currentCrates.push({ id: roomId + "_0", type: 'barrel', x: 150, y: bTop + 50, size: 45, health: broken0 ? 0 : 30, isBroken: broken0 });
      
      let broken1 = worldState.brokenCrates && worldState.brokenCrates[roomId + "_1"];
      currentCrates.push({ id: roomId + "_1", type: 'box', x: 1050, y: bBot - 90, size: 45, health: broken1 ? 0 : 30, isBroken: broken1 });
  }

  currentEnemies = [];
  if (roomId !== 999) {
      if (worldState.enemyStates && worldState.enemyStates[roomId]) {
          currentEnemies = JSON.parse(JSON.stringify(worldState.enemyStates[roomId]));
      } else if (!worldState.clearedRooms[roomId]) {
          let spawnX = canvas.width / 2; let spawnY = (bTop + bBot) / 2 - 20;
          
          if (roomId === 2 || roomId === 3) {
              if (entryFace === 'west') spawnX = 1200 - wallMargin - 100;
              else if (entryFace === 'east') spawnX = wallMargin + 100;
          }

          if (roomId === 2) { spawnEnemy('goblin', 3, spawnX, spawnY); spawnEnemy('skeleton', 1, spawnX, spawnY); }
          else if (roomId === 3) { spawnEnemy('goblin', 3, spawnX, spawnY); spawnEnemy('spider', 1, spawnX, spawnY); }
          else if (roomId === 4) { spawnEnemy('goblin', 2, 800, 400); }
          else if (roomId === 5) { spawnEnemy('goblin', 2, 400, 300); }
          else if (roomId === 6) { spawnEnemy('goblin', 2, 800, 300); }
          else if (roomId === 7) { spawnEnemy('goblin', 5, 450, 200); }
          else if (roomId === 8) { spawnEnemy('troll', 1, 950, 550); } 
      }
  } else {
      currentDoors = []; currentItems = []; arenaShrink = 0; 
      player.x = canvas.width / 2 - player.size / 2; player.y = canvas.height / 2 - player.size / 2;
  }
}
