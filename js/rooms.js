window.loadRoom = function(roomId, entryFace = 'south') {
    currentRoomId = roomId; 
    projectiles = []; enemyProjectiles = []; hazards = []; particles = []; currentCrates = []; necroSummons = []; necroKills = []; currentObstacles = []; currentDoors = []; currentItems = []; currentEnemies = []; playerInvulnerableTimer = 90;
    
    if (!worldState.bloodStains) worldState.bloodStains = {}; 
    if (!worldState.visitedRooms) worldState.visitedRooms = {}; 
    if (!worldState.brokenCrates) worldState.brokenCrates = {}; 
    if (!worldState.openedChests) worldState.openedChests = {}; 
    if (!worldState.unlockedDoors) worldState.unlockedDoors = {}; 
    if (!worldState.clearedRooms) worldState.clearedRooms = {}; 
    if (!worldState.collectedItems) worldState.collectedItems = {}; 
    if (!worldState.enemyStates) worldState.enemyStates = {};

    if (!worldState.bloodStains[roomId]) worldState.bloodStains[roomId] = []; 
    bloodStains = worldState.bloodStains[roomId]; worldState.visitedRooms[roomId] = true; 
    
    let isVertCorridor = (roomId === 5 || roomId === 6 || roomId === 111 || roomId === 112 || roomId === 113);
    let bLeft = isVertCorridor ? 350 : wallMargin; let bRight = isVertCorridor ? canvas.width - 350 : canvas.width - wallMargin;

    const doorN = { x: canvas.width/2 - 75, y: 0, width: 150, height: wallMargin + 15, face: 'north' };
    const doorS = { x: canvas.width/2 - 75, y: canvas.height - wallMargin - 15, width: 150, height: wallMargin + 15, face: 'south' };
    const doorW = { x: isVertCorridor ? bLeft - 15 : -15, y: canvas.height/2 - 75, width: wallMargin + 15, height: 150, face: 'west' };
    const doorE = { x: isVertCorridor ? bRight - wallMargin : canvas.width - wallMargin - 15, y: canvas.height/2 - 75, width: wallMargin + 15, height: 150, face: 'east' };

    const spawnN = { x: canvas.width/2 - 20, y: wallMargin + 20 };        
    const spawnS = { x: canvas.width/2 - 20, y: canvas.height - wallMargin - 60 }; 
    const spawnW = { x: (isVertCorridor ? bLeft : wallMargin) + 20, y: canvas.height/2 - 20 };        
    const spawnE = { x: (isVertCorridor ? bRight : canvas.width - wallMargin) - 60, y: canvas.height/2 - 20 }; 

    const doorN_right = { x: canvas.width - wallMargin - 200, y: 0, width: 150, height: wallMargin + 15, face: 'north' };
    const spawnN_right = { x: canvas.width - wallMargin - 125, y: wallMargin + 20 };

    // --- NIVEAU 1 ---
    if (roomId === 1) { 
        currentDoors = [ { ...doorN, id: 'door_1_2', requiresKey: true, locked: !worldState.unlockedDoors['door_1_2'], dest: 2, spawnX: spawnS.x, spawnY: spawnS.y } ]; 
        if (!worldState.collectedItems['key_tuto']) currentItems.push({ id: 'key_tuto', type: 'key', x: 800, y: 400, size: 20, collected: false });
        let isOpened = worldState.openedChests['chest_1']; currentCrates.push({ id: 'chest_1', type: 'chest', x: 250, y: 650, size: 60, health: isOpened ? 0 : 1, isBroken: isOpened });
    } 
    else if (roomId === 2) { currentDoors = [ { ...doorS, id: 'door_2_1', requiresKey: false, locked: false, dest: 1, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorW, id: 'door_2_3', requiresKey: false, locked: false, dest: 3, spawnX: spawnE.x, spawnY: spawnE.y }, { ...doorE, id: 'door_2_4', requiresKey: false, locked: false, dest: 4, spawnX: spawnW.x, spawnY: spawnW.y }, { ...doorN, id: 'door_2_8', requiresKey: true, locked: !worldState.unlockedDoors['door_2_8'], dest: 8, spawnX: spawnS.x, spawnY: spawnS.y } ]; }
    else if (roomId === 3) { currentDoors = [ { ...doorE, id: 'door_3_2', requiresKey: false, locked: false, dest: 2, spawnX: spawnW.x, spawnY: spawnW.y }, { ...doorN_right, id: 'door_3_5', requiresKey: false, locked: false, dest: 5, spawnX: spawnS.x, spawnY: spawnS.y } ]; currentObstacles.push({ x: canvas.width/2 - 25, y: wallMargin, width: 50, height: canvas.height - wallMargin*2, type: 'hole' }); if (!worldState.collectedItems['key_room3']) currentItems.push({ id: 'key_room3', type: 'key', x: wallMargin + 100, y: canvas.height/2, size: 20, collected: false }); }
    else if (roomId === 4) { currentDoors = [ { ...doorW, id: 'door_4_2', requiresKey: false, locked: false, dest: 2, spawnX: spawnE.x, spawnY: spawnE.y }, { ...doorN, id: 'door_4_6', requiresKey: false, locked: false, dest: 6, spawnX: spawnS.x, spawnY: spawnS.y } ]; }
    else if (roomId === 5) { currentDoors = [ { ...doorS, id: 'door_5_3', requiresKey: false, locked: false, dest: 3, spawnX: spawnN_right.x, spawnY: spawnN_right.y }, { ...doorN, id: 'door_5_7', requiresKey: false, locked: false, dest: 7, spawnX: canvas.width/2 - 75, spawnY: spawnS.y } ]; }
    else if (roomId === 6) { currentDoors = [ { ...doorS, id: 'door_6_4', requiresKey: false, locked: false, dest: 4, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorN, id: 'door_6_7', requiresKey: false, locked: false, dest: 7, spawnX: canvas.width/2 - 75, spawnY: spawnS.y } ]; }
    else if (roomId === 7) { currentDoors = [ { x: 200, y: canvas.height - wallMargin - 15, width: 150, height: wallMargin + 15, face: 'south', id: 'door_7_5', requiresKey: false, locked: false, dest: 5, spawnX: spawnN.x, spawnY: spawnN.y }, { x: 800, y: canvas.height - wallMargin - 15, width: 150, height: wallMargin + 15, face: 'south', id: 'door_7_6', requiresKey: false, locked: false, dest: 6, spawnX: spawnN.x, spawnY: spawnN.y } ]; if (!worldState.collectedItems['key_boss']) currentItems.push({ id: 'key_boss', type: 'key', x: 600, y: 400, size: 20, collected: false }); }
    else if (roomId === 8) { currentDoors = [ { ...doorS, id: 'door_8_2', requiresKey: false, locked: false, dest: 2, spawnX: spawnN.x, spawnY: spawnN.y } ]; }

    // --- NIVEAU 2 ---
    const doorW_top = { x: -15, y: canvas.height/3 - 75, width: wallMargin + 15, height: 150, face: 'west' };
    const doorW_bot = { x: -15, y: 2*canvas.height/3 - 75, width: wallMargin + 15, height: 150, face: 'west' };
    const doorE_top = { x: canvas.width - wallMargin - 15, y: canvas.height/3 - 75, width: wallMargin + 15, height: 150, face: 'east' };
    const doorE_bot = { x: canvas.width - wallMargin - 15, y: 2*canvas.height/3 - 75, width: wallMargin + 15, height: 150, face: 'east' };

    if (roomId === 100) { 
        // SALLE D'ARRIVÉE NIVEAU 2 (Avec l'escalier vers le Niveau 1)
        currentDoors = [ { ...doorS, id: 'door_100_101', requiresKey: false, locked: false, dest: 101, spawnX: spawnN.x, spawnY: spawnN.y } ]; 
    }
    else if (roomId === 101) { 
        // LA SALLE AUX 4 PORTES + 1 RETOUR NORD
        currentDoors = [ 
            { ...doorN, id: 'door_101_100', dest: 100, spawnX: spawnS.x, spawnY: spawnS.y },
            { ...doorW_top, id: 'door_101_102', requiresKey: true, locked: !worldState.unlockedDoors['door_101_102'], dest: 102, spawnX: canvas.width - wallMargin - 60, spawnY: canvas.height/3 },
            { ...doorW_bot, id: 'door_101_106', requiresKey: true, locked: !worldState.unlockedDoors['door_101_106'], dest: 106, spawnX: canvas.width - wallMargin - 60, spawnY: 2*canvas.height/3 },
            { ...doorE_top, id: 'door_101_103', requiresKey: true, locked: !worldState.unlockedDoors['door_101_103'], dest: 103, spawnX: wallMargin + 20, spawnY: canvas.height/3 },
            { ...doorE_bot, id: 'door_101_104', requiresKey: true, locked: !worldState.unlockedDoors['door_101_104'], dest: 104, spawnX: wallMargin + 20, spawnY: 2*canvas.height/3 }
        ]; 
    }
    else if (roomId === 102) { 
        currentDoors = [ 
            { ...doorE_top, id: 'door_102_101', dest: 101, spawnX: wallMargin + 20, spawnY: canvas.height/3 }, 
            { x: canvas.width/2 + 100, y: 0, width: 150, height: wallMargin + 15, face: 'north', id: 'door_102_105', dest: 105, spawnX: canvas.width/2 + 100, spawnY: spawnS.y } 
        ]; 
        // LE GRAND TROU À GAUCHE
        currentObstacles.push({ x: canvas.width/2 - 90, y: wallMargin, width: 180, height: canvas.height - wallMargin*2, type: 'hole' });
        if (!worldState.collectedItems['key_room102']) { currentItems.push({ id: 'key_room102', type: 'key', x: wallMargin + 80, y: canvas.height/2, size: 20, collected: false }); }
    }
    else if (roomId === 103) { currentDoors = [ { ...doorW_top, id: 'door_103_101', dest: 101, spawnX: canvas.width - wallMargin - 60, spawnY: canvas.height/3 }, { ...doorN, id: 'door_103_111', dest: 111, spawnX: spawnS.x, spawnY: spawnS.y } ]; }
    else if (roomId === 104) { currentDoors = [ { ...doorW_bot, id: 'door_104_101', dest: 101, spawnX: canvas.width - wallMargin - 60, spawnY: 2*canvas.height/3 }, { ...doorE, id: 'door_104_109', dest: 109, spawnX: spawnW.x, spawnY: spawnW.y } ]; }
    else if (roomId === 105) { currentDoors = [ { x: canvas.width/2 + 100, y: canvas.height - wallMargin - 15, width: 150, height: wallMargin + 15, face: 'south', id: 'door_105_102', dest: 102, spawnX: canvas.width/2 + 100, spawnY: spawnN.y }, { x: canvas.width/2 - 250, y: canvas.height - wallMargin - 15, width: 150, height: wallMargin + 15, face: 'south', id: 'door_105_106', dest: 106, spawnX: canvas.width/2 - 250, spawnY: spawnN.y } ]; }
    else if (roomId === 106) { currentDoors = [ { x: canvas.width/2 - 250, y: 0, width: 150, height: wallMargin + 15, face: 'north', id: 'door_106_105', dest: 105, spawnX: canvas.width/2 - 250, spawnY: spawnS.y }, { ...doorE_bot, id: 'door_106_101', dest: 101, spawnX: wallMargin + 20, spawnY: 2*canvas.height/3 } ]; }
    else if (roomId === 109) { currentDoors = [ { ...doorW, id: 'door_109_104', dest: 104, spawnX: spawnE.x, spawnY: spawnE.y }, { ...doorN, id: 'door_109_114', dest: 114, spawnX: spawnS.x, spawnY: spawnS.y } ]; }
    else if (roomId === 111) { currentDoors = [ { ...doorS, id: 'door_111_103', dest: 103, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorN, id: 'door_111_114', dest: 114, spawnX: spawnS.x, spawnY: spawnS.y } ]; }
    else if (roomId === 114) { currentDoors = [ { ...doorS, id: 'door_114_111', dest: 111, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorS, id: 'door_114_109', dest: 109, spawnX: spawnN.x, spawnY: spawnN.y } ]; currentObstacles.push({ x: canvas.width/2 - 120, y: canvas.height/2 - 120, width: 240, height: 240, type: 'water' }); }

    if (roomId !== 1 && roomId !== 8 && roomId !== 999 && roomId < 100) {
        let broken0 = worldState.brokenCrates && worldState.brokenCrates[roomId + "_0"]; currentCrates.push({ id: roomId + "_0", type: 'barrel', x: bLeft + 50, y: wallMargin + 50, size: 45, health: broken0 ? 0 : 30, isBroken: broken0 });
        let broken1 = worldState.brokenCrates && worldState.brokenCrates[roomId + "_1"]; currentCrates.push({ id: roomId + "_1", type: 'box', x: bRight - 90, y: canvas.height - 150, size: 45, health: broken1 ? 0 : 30, isBroken: broken1 });
    }

    if (roomId !== 999) {
        if (worldState.enemyStates && worldState.enemyStates[roomId]) { currentEnemies = JSON.parse(JSON.stringify(worldState.enemyStates[roomId])); } 
        else if (!worldState.clearedRooms[roomId]) {
            if (roomId === 2) { window.spawnEnemy('goblin', 1, canvas.width/2 - 150, canvas.height/2 - 150); window.spawnEnemy('goblin', 1, canvas.width/2 + 150, canvas.height/2 + 150); }
            else if (roomId === 3) window.spawnEnemy('goblin', 2, canvas.width/2, canvas.height/2);
            else if (roomId === 4) window.spawnEnemy('goblin', 2, 800, 400);
            else if (roomId === 5) window.spawnEnemy('goblin', 2, canvas.width/2, 300);
            else if (roomId === 6) window.spawnEnemy('goblin', 2, canvas.width/2, 300);
            else if (roomId === 7) { window.spawnEnemy('goblin', 4, 450, 200); window.spawnEnemy('skeleton', 1, 600, 300); }
            else if (roomId === 8) window.spawnEnemy('troll', 1, canvas.width/2 - 40, 150); 
            
            // MINOTAURES AU BON ENDROIT
            else if (roomId === 100 || roomId === 101) { /* Salles de transition vides */ }
            else if (roomId === 102) window.spawnEnemy('minotaure', 1, canvas.width/2 + 150, canvas.height/2);
            else if (roomId === 103) window.spawnEnemy('minotaure', 1, canvas.width/2, canvas.height/2);
            else if (roomId === 104) window.spawnEnemy('minotaure', 1, canvas.width/2, canvas.height/2);
            else if (roomId === 105) window.spawnEnemy('goblin', 4, canvas.width/2, 300);
            else if (roomId === 106) window.spawnEnemy('minotaure', 1, canvas.width/2, canvas.height/2);
            else if (roomId === 109) window.spawnEnemy('goblin', 3, canvas.width/2, canvas.height/2);
            else if (roomId === 111) window.spawnEnemy('goblin', 2, canvas.width/2, canvas.height/2);
            else if (roomId === 112) window.spawnEnemy('skeleton', 3, canvas.width/2, canvas.height/2);
            else if (roomId === 113) { window.spawnEnemy('troll', 1, canvas.width/2 - 100, canvas.height/2); window.spawnEnemy('troll', 1, canvas.width/2 + 100, canvas.height/2); }
        }
    } else { currentDoors = []; currentItems = []; arenaShrink = 0; player.x = canvas.width / 2 - player.size / 2; player.y = canvas.height / 2 - player.size / 2; }
};
