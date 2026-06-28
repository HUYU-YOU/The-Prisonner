// ============================================================================
// js/rooms.js - LOGIQUE DES SALLES ET SAUVEGARDES
// ============================================================================

window.saveRoomState = function() {
    if (currentRoomId === 999) return; 
    if (!worldState.enemyStates) worldState.enemyStates = {};
    worldState.enemyStates[currentRoomId] = JSON.parse(JSON.stringify(currentEnemies));
    if (currentEnemies.length === 0) { worldState.clearedRooms[currentRoomId] = true; }
};

window.loadRoom = function(roomId, entryFace = 'south') {
    currentRoomId = roomId; 
    projectiles = []; enemyProjectiles = []; hazards = []; particles = []; currentCrates = []; necroSummons = []; necroKills = []; 
    
    playerInvulnerableTimer = 90; 
    
    if (!worldState.bloodStains) worldState.bloodStains = {}; 
    if (!worldState.visitedRooms) worldState.visitedRooms = {};
    if (!worldState.brokenCrates) worldState.brokenCrates = {}; 
    if (!worldState.openedChests) worldState.openedChests = {};
    if (!worldState.bloodStains[roomId]) worldState.bloodStains[roomId] = []; 
    
    bloodStains = worldState.bloodStains[roomId];
    worldState.visitedRooms[roomId] = true; 
    
    let isVertCorridor = (roomId === 5 || roomId === 6);
    let bLeft = isVertCorridor ? 350 : wallMargin;
    let bRight = isVertCorridor ? canvas.width - 350 : canvas.width - wallMargin;

    const doorN = { x: canvas.width/2 - 75, y: 0, width: 150, height: wallMargin + 15, face: 'north' };
    const doorS = { x: canvas.width/2 - 75, y: canvas.height - wallMargin - 15, width: 150, height: wallMargin + 15, face: 'south' };
    const doorW = { x: -15, y: canvas.height/2 - 75, width: wallMargin + 15, height: 150, face: 'west' };
    const doorE = { x: canvas.width - wallMargin - 15, y: canvas.height/2 - 75, width: wallMargin + 15, height: 150, face: 'east' };

    const spawnN = { x: canvas.width/2 - 20, y: wallMargin + 20 };        
    const spawnS = { x: canvas.width/2 - 20, y: canvas.height - wallMargin - 60 }; 
    const spawnW = { x: wallMargin + 20, y: canvas.height/2 - 20 };        
    const spawnE = { x: canvas.width - wallMargin - 60, y: canvas.height/2 - 20 }; 

    if (roomId === 1) { 
        currentDoors = [ { ...doorN, id: 'door_1_2', requiresKey: true, locked: !worldState.unlockedDoors['door_1_2'], dest: 2, spawnX: spawnS.x, spawnY: spawnS.y } ]; 
        currentItems = [];
        if (!worldState.collectedItems['key_tuto']) currentItems.push({ id: 'key_tuto', type: 'key', x: 800, y: 400, size: 20, collected: false });
        let isOpened = worldState.openedChests && worldState.openedChests['chest_1'];
        currentCrates.push({ id: 'chest_1', type: 'chest', x: 250, y: 650, size: 60, health: isOpened ? 0 : 1, isBroken: isOpened });
    } 
    else if (roomId === 2) { 
        currentDoors = [ { ...doorS, id: 'door_2_1', requiresKey: false, locked: false, dest: 1, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorW, id: 'door_2_3', requiresKey: false, locked: false, dest: 3, spawnX: spawnE.x, spawnY: spawnE.y }, { ...doorE, id: 'door_2_4', requiresKey: false, locked: false, dest: 4, spawnX: spawnW.x, spawnY: spawnW.y }, { ...doorN, id: 'door_2_8', requiresKey: true, locked: !worldState.unlockedDoors['door_2_8'], dest: 8, spawnX: spawnS.x, spawnY: spawnS.y } ]; 
        currentItems = [];
    }
    else if (roomId === 3) { currentDoors = [ { ...doorE, id: 'door_3_2', requiresKey: false, locked: false, dest: 2, spawnX: spawnW.x, spawnY: spawnW.y }, { ...doorN, id: 'door_3_5', requiresKey: false, locked: false, dest: 5, spawnX: spawnS.x, spawnY: spawnS.y } ]; currentItems = []; }
    else if (roomId === 4) { currentDoors = [ { ...doorW, id: 'door_4_2', requiresKey: false, locked: false, dest: 2, spawnX: spawnE.x, spawnY: spawnE.y }, { ...doorN, id: 'door_4_6', requiresKey: false, locked: false, dest: 6, spawnX: spawnS.x, spawnY: spawnS.y } ]; currentItems = []; }
    else if (roomId === 5) { currentDoors = [ { ...doorS, id: 'door_5_3', requiresKey: false, locked: false, dest: 3, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorN, id: 'door_5_7', requiresKey: false, locked: false, dest: 7, spawnX: canvas.width/2 - 75, spawnY: spawnS.y } ]; currentItems = []; }
    else if (roomId === 6) { currentDoors = [ { ...doorS, id: 'door_6_4', requiresKey: false, locked: false, dest: 4, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorN, id: 'door_6_7', requiresKey: false, locked: false, dest: 7, spawnX: canvas.width/2 - 75, spawnY: spawnS.y } ]; currentItems = []; }
    else if (roomId === 7) { 
        currentDoors = [ { x: 200, y: canvas.height - wallMargin - 15, width: 150, height: wallMargin + 15, face: 'south', id: 'door_7_5', requiresKey: false, locked: false, dest: 5, spawnX: spawnN.x, spawnY: spawnN.y }, { x: 800, y: canvas.height - wallMargin - 15, width: 150, height: wallMargin + 15, face: 'south', id: 'door_7_6', requiresKey: false, locked: false, dest: 6, spawnX: spawnN.x, spawnY: spawnN.y } ]; 
        currentItems = [];
        if (!worldState.collectedItems['key_boss']) currentItems.push({ id: 'key_boss', type: 'key', x: 600, y: 400, size: 20, collected: false });
    }
    else if (roomId === 8) { currentDoors = [ { ...doorS, id: 'door_8_2', requiresKey: false, locked: false, dest: 2, spawnX: spawnN.x, spawnY: spawnN.y } ]; currentItems = []; }

    if (roomId !== 1 && roomId !== 8 && roomId !== 999) {
        let broken0 = worldState.brokenCrates && worldState.brokenCrates[roomId + "_0"]; currentCrates.push({ id: roomId + "_0", type: 'barrel', x: bLeft + 50, y: wallMargin + 50, size: 45, health: broken0 ? 0 : 30, isBroken: broken0 });
        let broken1 = worldState.brokenCrates && worldState.brokenCrates[roomId + "_1"]; currentCrates.push({ id: roomId + "_1", type: 'box', x: bRight - 90, y: canvas.height - 150, size: 45, health: broken1 ? 0 : 30, isBroken: broken1 });
    }

    currentEnemies = [];
    if (roomId !== 999) {
        if (worldState.enemyStates && worldState.enemyStates[roomId]) { currentEnemies = JSON.parse(JSON.stringify(worldState.enemyStates[roomId])); } 
        else if (!worldState.clearedRooms[roomId]) {
            
            if (roomId === 2) {
                window.spawnEnemy('goblin', 1, canvas.width/2 - 150, canvas.height/2 - 150);
                window.spawnEnemy('goblin', 1, canvas.width/2 + 150, canvas.height/2 + 150);
            }
            else if (roomId === 3) {
                window.spawnEnemy('goblin', 2, canvas.width/2, canvas.height/2);
            }
            else if (roomId === 4) window.spawnEnemy('goblin', 2, 800, 400);
            else if (roomId === 5) window.spawnEnemy('goblin', 2, canvas.width/2, 300);
            else if (roomId === 6) window.spawnEnemy('goblin', 2, canvas.width/2, 300);
            else if (roomId === 7) { window.spawnEnemy('goblin', 4, 450, 200); window.spawnEnemy('skeleton', 1, 600, 300); }
            
            // --- CORRECTION : Le Boss apparaît en haut, loin de l'escalier ---
            else if (roomId === 8) window.spawnEnemy('troll', 1, canvas.width/2 - 40, 150); 
        }
    } else { currentDoors = []; currentItems = []; arenaShrink = 0; player.x = canvas.width / 2 - player.size / 2; player.y = canvas.height / 2 - player.size / 2; }
};
