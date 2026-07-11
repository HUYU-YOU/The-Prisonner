// ============================================================================
// js/rooms.js - LOGIQUE DES SALLES ET SAUVEGARDES
// ============================================================================

window.saveRoomState = function() {
    if (currentRoomId === 999) return; 
    if (!worldState.enemyStates) worldState.enemyStates = {};
    if (typeof currentEnemies !== 'undefined') {
        worldState.enemyStates[currentRoomId] = JSON.parse(JSON.stringify(currentEnemies));
        if (currentEnemies.length === 0) { worldState.clearedRooms[currentRoomId] = true; }
    }
};

window.loadRoom = function(roomId, entryFace = 'south') {
    currentRoomId = roomId; 
    
    projectiles = []; enemyProjectiles = []; hazards = []; particles = []; currentCrates = []; necroSummons = []; necroKills = []; 
    currentObstacles = []; currentDoors = []; currentItems = []; currentEnemies = [];
    
    playerInvulnerableTimer = 30; 
    
    if (!worldState.bloodStains) worldState.bloodStains = {}; 
    if (!worldState.visitedRooms) worldState.visitedRooms = {};
    if (!worldState.brokenCrates) worldState.brokenCrates = {}; 
    if (!worldState.openedChests) worldState.openedChests = {};
    if (!worldState.unlockedDoors) worldState.unlockedDoors = {}; 
    if (!worldState.clearedRooms) worldState.clearedRooms = {};
    if (!worldState.collectedItems) worldState.collectedItems = {};
    if (!worldState.enemyStates) worldState.enemyStates = {};

    if (!worldState.bloodStains[roomId]) worldState.bloodStains[roomId] = []; 
    bloodStains = worldState.bloodStains[roomId];
    worldState.visitedRooms[roomId] = true; 
    
    if (!worldState.roomFloors) worldState.roomFloors = {};
    if (!worldState.roomFloors[roomId]) {
        if (roomId === 1) worldState.roomFloors[roomId] = 'sol_base';
        else if (roomId === 3) worldState.roomFloors[roomId] = 'floor5'; 
        else if (roomId === 114) worldState.roomFloors[roomId] = 'floor2';
        else if (roomId >= 107 && roomId <= 110) worldState.roomFloors[roomId] = 'floor3';
        else if (roomId === 103) worldState.roomFloors[roomId] = 'floor4';
        else if (roomId === 102) worldState.roomFloors[roomId] = 'floor5';
        else if (roomId >= 200) {
            let waterFloors = ['floor_water1', 'floor_water2', 'floor_water3'];
            worldState.roomFloors[roomId] = waterFloors[Math.floor(Math.random() * waterFloors.length)];
        }
        else if (roomId !== 999) {
            let randomFloors = ['sol_base', 'floor7', 'floor8', 'floor9', 'floor10', 'floor11', 'floor12', 'floor13', 'floor14', 'floor15', 'floor16', 'floor17', 'floor18', 'floor19', 'floor20'];
            worldState.roomFloors[roomId] = randomFloors[Math.floor(Math.random() * randomFloors.length)];
        }
    }

    let isVertCorridor = (roomId === 5 || roomId === 6 || roomId === 111 || roomId === 112 || roomId === 113 || roomId === 205 || roomId === 206);
    let bLeft = isVertCorridor ? 350 : wallMargin;
    let bRight = isVertCorridor ? canvas.width - 350 : canvas.width - wallMargin;
    let bTop = wallMargin; 
    let bBot = canvas.height - wallMargin;

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

    if (roomId === 1) { 
        currentDoors = [ { ...doorN, id: 'door_1_2', requiresKey: true, locked: !worldState.unlockedDoors['door_1_2'], dest: 2, spawnX: spawnS.x, spawnY: spawnS.y } ]; 
        if (!worldState.collectedItems['key_tuto']) currentItems.push({ id: 'key_tuto', type: 'key', x: 800, y: 400, size: 20, collected: false });
        let isOpened = worldState.openedChests['chest_1'];
        currentCrates.push({ id: 'chest_1', type: 'chest', x: 250, y: 650, size: 60, health: isOpened ? 0 : 1, isBroken: isOpened });
    } 
    else if (roomId === 2) { 
        currentDoors = [ { ...doorS, id: 'door_2_1', requiresKey: false, locked: false, dest: 1, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorW, id: 'door_2_3', requiresKey: false, locked: false, dest: 3, spawnX: spawnE.x, spawnY: spawnE.y }, { ...doorE, id: 'door_2_4', requiresKey: false, locked: false, dest: 4, spawnX: spawnW.x, spawnY: spawnW.y }, { ...doorN, id: 'door_2_8', requiresKey: true, locked: !worldState.unlockedDoors['door_2_8'], dest: 8, spawnX: spawnS.x, spawnY: spawnS.y } ]; 
    }
    else if (roomId === 3) { 
        currentDoors = [ 
            { ...doorE, id: 'door_3_2', requiresKey: false, locked: false, dest: 2, spawnX: spawnW.x, spawnY: spawnW.y }, 
            { ...doorN_right, id: 'door_3_5', requiresKey: false, locked: false, dest: 5, spawnX: spawnS.x, spawnY: spawnS.y } 
        ]; 
        currentObstacles.push({ x: canvas.width/2 - 120, y: wallMargin, width: 240, height: canvas.height - wallMargin*2, type: 'hole' });
        let isOpened3 = worldState.openedChests['chest_3'];
        currentCrates.push({ id: 'chest_3', type: 'chest', x: bLeft + 100, y: canvas.height/2 - 30, size: 60, health: isOpened3 ? 0 : 1, isBroken: isOpened3 });
    }
    else if (roomId === 4) { currentDoors = [ { ...doorW, id: 'door_4_2', requiresKey: false, locked: false, dest: 2, spawnX: spawnE.x, spawnY: spawnE.y }, { ...doorN, id: 'door_4_6', requiresKey: false, locked: false, dest: 6, spawnX: spawnS.x, spawnY: spawnS.y } ]; }
    else if (roomId === 5) { 
        currentDoors = [ 
            { ...doorS, id: 'door_5_3', requiresKey: false, locked: false, dest: 3, spawnX: spawnN_right.x, spawnY: spawnN_right.y }, 
            { ...doorN, id: 'door_5_7', requiresKey: false, locked: false, dest: 7, spawnX: 200 + 75 - 20, spawnY: canvas.height - wallMargin - 60 } 
        ]; 
    }
    else if (roomId === 6) { 
        currentDoors = [ 
            { ...doorS, id: 'door_6_4', requiresKey: false, locked: false, dest: 4, spawnX: spawnN.x, spawnY: spawnN.y }, 
            { ...doorN, id: 'door_6_7', requiresKey: false, locked: false, dest: 7, spawnX: 800 + 75 - 20, spawnY: canvas.height - wallMargin - 60 } 
        ]; 
    }
    else if (roomId === 7) { 
        currentDoors = [ { x: 200, y: canvas.height - wallMargin - 15, width: 150, height: wallMargin + 15, face: 'south', id: 'door_7_5', requiresKey: false, locked: false, dest: 5, spawnX: spawnN.x, spawnY: spawnN.y }, { x: 800, y: canvas.height - wallMargin - 15, width: 150, height: wallMargin + 15, face: 'south', id: 'door_7_6', requiresKey: false, locked: false, dest: 6, spawnX: spawnN.x, spawnY: spawnN.y } ]; 
        if (!worldState.collectedItems['key_boss']) currentItems.push({ id: 'key_boss', type: 'key', x: 600, y: 400, size: 20, collected: false });
    }
    else if (roomId === 8) { currentDoors = [ { ...doorS, id: 'door_8_2', requiresKey: false, locked: false, dest: 2, spawnX: spawnN.x, spawnY: spawnN.y } ]; }

    else if (roomId === 101) { 
        currentDoors = [ 
            { ...doorN, id: 'door_101_114', requiresKey: true, locked: !worldState.unlockedDoors['door_101_114'], dest: 114, spawnX: spawnS.x, spawnY: spawnS.y },
            { ...doorS, id: 'door_101_104', requiresKey: false, locked: false, dest: 104, spawnX: spawnN.x, spawnY: spawnN.y },
            { ...doorE, id: 'door_101_103', requiresKey: false, locked: false, dest: 103, spawnX: spawnW.x, spawnY: spawnW.y },
            { ...doorW, id: 'door_101_102', requiresKey: false, locked: false, dest: 102, spawnX: spawnE.x, spawnY: spawnE.y }
        ]; 
    }
    else if (roomId === 102) { 
        currentDoors = [ 
            { ...doorE, id: 'door_102_101', requiresKey: false, locked: false, dest: 101, spawnX: spawnW.x, spawnY: spawnW.y },
            { x: canvas.width/2 + 100, y: 0, width: 150, height: wallMargin + 15, face: 'north', id: 'door_102_105', dest: 105, spawnX: canvas.width/2 + 100, spawnY: spawnS.y },
            { ...doorW, id: 'door_102_106', requiresKey: false, locked: false, dest: 106, spawnX: spawnE.x, spawnY: spawnE.y }
        ]; 
        currentObstacles.push({ x: canvas.width/2 - 120, y: wallMargin, width: 240, height: canvas.height - wallMargin*2, type: 'hole' });
        if (!worldState.collectedItems['key_room102']) {
            currentItems.push({ id: 'key_room102', type: 'key', x: wallMargin + 100, y: canvas.height/2, size: 20, collected: false });
        }
    }
    else if (roomId === 103) { 
        currentDoors = [ 
            { ...doorW, id: 'door_103_101', requiresKey: false, locked: false, dest: 101, spawnX: spawnE.x, spawnY: spawnE.y },
            { ...doorN, id: 'door_103_111', requiresKey: false, locked: false, dest: 111, spawnX: spawnS.x, spawnY: spawnS.y }
        ]; 
        // SALLE 103 : TROUS PLUS PETITS ET COLLÉS DANS LES COINS DROITS
        currentObstacles.push({ x: canvas.width - wallMargin - 150, y: wallMargin, width: 150, height: 150, type: 'hole' });
        currentObstacles.push({ x: canvas.width - wallMargin - 150, y: canvas.height - wallMargin - 150, width: 150, height: 150, type: 'hole' });
    }
    else if (roomId === 104) { 
        let dW1 = { x: -15, y: 150, width: wallMargin + 15, height: 150, face: 'west' };
        let dW2 = { x: -15, y: canvas.height - 300, width: wallMargin + 15, height: 150, face: 'west' };
        let dE1 = { x: canvas.width - wallMargin - 15, y: 150, width: wallMargin + 15, height: 150, face: 'east' };
        let dE2 = { x: canvas.width - wallMargin - 15, y: canvas.height - 300, width: wallMargin + 15, height: 150, face: 'east' };

        currentDoors = [ 
            { ...doorN, id: 'door_104_101', requiresKey: false, locked: false, dest: 101, spawnX: spawnS.x, spawnY: spawnS.y },
            { ...dW1, id: 'door_104_107', requiresKey: true, locked: !worldState.unlockedDoors['door_104_107'], dest: 107, spawnX: spawnE.x, spawnY: spawnE.y },
            { ...dW2, id: 'door_104_108', requiresKey: true, locked: !worldState.unlockedDoors['door_104_108'], dest: 108, spawnX: spawnE.x, spawnY: spawnE.y },
            { ...dE1, id: 'door_104_109', requiresKey: true, locked: !worldState.unlockedDoors['door_104_109'], dest: 109, spawnX: spawnW.x, spawnY: spawnW.y },
            { ...dE2, id: 'door_104_110', requiresKey: true, locked: !worldState.unlockedDoors['door_104_110'], dest: 110, spawnX: spawnW.x, spawnY: spawnW.y }
        ]; 
    }
    else if (roomId === 105) { 
        currentDoors = [ 
            { x: canvas.width/2 + 100, y: canvas.height - wallMargin - 15, width: 150, height: wallMargin + 15, face: 'south', id: 'door_105_102', dest: 102, spawnX: canvas.width/2 + 100, spawnY: spawnN.y },
            { x: canvas.width/2 - 250, y: canvas.height - wallMargin - 15, width: 150, height: wallMargin + 15, face: 'south', id: 'door_105_106', dest: 106, spawnX: canvas.width/2 - 250, spawnY: spawnN.y }
        ]; 
    }
    else if (roomId === 106) { 
        currentDoors = [ 
            { x: canvas.width/2 - 250, y: 0, width: 150, height: wallMargin + 15, face: 'north', id: 'door_106_105', dest: 105, spawnX: canvas.width/2 - 250, spawnY: spawnS.y },
            { ...doorE, id: 'door_106_102', dest: 102, spawnX: spawnW.x, spawnY: spawnW.y }
        ]; 
    }
    else if (roomId === 107) { currentDoors = [ { ...doorE, id: 'door_107_104', dest: 104, spawnX: wallMargin + 20, spawnY: 225 } ]; }
    else if (roomId === 108) { currentDoors = [ { ...doorE, id: 'door_108_104', dest: 104, spawnX: wallMargin + 20, spawnY: canvas.height - 225 } ]; }
    else if (roomId === 109) { currentDoors = [ { ...doorW, id: 'door_109_104', dest: 104, spawnX: canvas.width - wallMargin - 60, spawnY: 225 } ]; }
    else if (roomId === 110) { currentDoors = [ { ...doorW, id: 'door_110_104', dest: 104, spawnX: canvas.width - wallMargin - 60, spawnY: canvas.height - 225 } ]; }
    else if (roomId === 111) { currentDoors = [ { ...doorS, id: 'door_111_103', dest: 103, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorN, id: 'door_111_112', dest: 112, spawnX: spawnS.x, spawnY: spawnS.y }, { ...doorW, id: 'door_111_114', requiresKey: true, locked: !worldState.unlockedDoors['door_111_114'], dest: 114, spawnX: spawnE.x, spawnY: spawnE.y } ]; }
    else if (roomId === 112) { currentDoors = [ { ...doorS, id: 'door_112_111', dest: 111, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorN, id: 'door_112_113', dest: 113, spawnX: spawnS.x, spawnY: spawnS.y } ]; }
    else if (roomId === 113) { currentDoors = [ { ...doorS, id: 'door_113_112', dest: 112, spawnX: spawnN.x, spawnY: spawnN.y } ]; }
    else if (roomId === 114) { 
        currentDoors = [ { ...doorS, id: 'door_114_101', requiresKey: true, locked: !worldState.unlockedDoors['door_114_101'], dest: 101, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorE, id: 'door_114_111', requiresKey: true, locked: !worldState.unlockedDoors['door_114_111'], dest: 111, spawnX: spawnW.x, spawnY: spawnW.y } ]; 
        // SÉPARATION : UN GRAND TRIGGER INVISIBLE, ET UN PETIT VISUEL D'EAU
        currentObstacles.push({ x: canvas.width/2 - 160, y: canvas.height/2 - 160, width: 320, height: 320, type: 'water_trigger' });
        currentObstacles.push({ x: canvas.width/2 - 120, y: canvas.height/2 - 120, width: 240, height: 240, type: 'water_visual' });
    }

    else if (roomId === 201) { currentDoors = [ { ...doorN, id: 'door_201_202', requiresKey: false, locked: false, dest: 202, spawnX: spawnS.x, spawnY: spawnS.y } ]; }
    else if (roomId === 202) { currentDoors = [ { ...doorS, id: 'door_202_201', requiresKey: false, locked: false, dest: 201, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorE, id: 'door_202_203', requiresKey: false, locked: false, dest: 203, spawnX: spawnW.x, spawnY: spawnW.y }, { ...doorW, id: 'door_202_204', requiresKey: false, locked: false, dest: 204, spawnX: spawnE.x, spawnY: spawnE.y }, { ...doorN, id: 'door_202_208', requiresKey: true, locked: !worldState.unlockedDoors['door_202_208'], dest: 208, spawnX: spawnS.x, spawnY: spawnS.y } ]; }
    else if (roomId === 203) { currentDoors = [ { ...doorW, id: 'door_203_202', requiresKey: false, locked: false, dest: 202, spawnX: spawnE.x, spawnY: spawnE.y } ]; if (!worldState.collectedItems['key_room203']) currentItems.push({ id: 'key_room203', type: 'key', x: canvas.width/2, y: canvas.height/2, size: 20, collected: false }); }
    else if (roomId === 204) { currentDoors = [ { ...doorE, id: 'door_204_202', requiresKey: false, locked: false, dest: 202, spawnX: spawnW.x, spawnY: spawnW.y }, { ...doorN, id: 'door_204_205', requiresKey: false, locked: false, dest: 205, spawnX: spawnS.x, spawnY: spawnS.y } ]; }
    else if (roomId === 205) { currentDoors = [ { ...doorS, id: 'door_205_204', requiresKey: false, locked: false, dest: 204, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorN, id: 'door_205_206', requiresKey: false, locked: false, dest: 206, spawnX: spawnS.x, spawnY: spawnS.y } ]; }
    else if (roomId === 206) { currentDoors = [ { ...doorS, id: 'door_206_205', requiresKey: false, locked: false, dest: 205, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorN, id: 'door_206_207', requiresKey: false, locked: false, dest: 207, spawnX: spawnS.x, spawnY: spawnS.y } ]; }
    else if (roomId === 207) { currentDoors = [ { ...doorS, id: 'door_207_206', requiresKey: false, locked: false, dest: 206, spawnX: spawnN.x, spawnY: spawnN.y } ]; if (!worldState.collectedItems['key_boss3']) currentItems.push({ id: 'key_boss3', type: 'key_skull', x: canvas.width/2, y: canvas.height/2, size: 20, collected: false }); }
    else if (roomId === 208) { currentDoors = [ { ...doorS, id: 'door_208_202', requiresKey: false, locked: false, dest: 202, spawnX: spawnN.x, spawnY: spawnN.y } ]; }

    if (roomId !== 1 && roomId !== 8 && roomId !== 999 && roomId < 100) {
        let broken0 = worldState.brokenCrates[roomId + "_0"]; currentCrates.push({ id: roomId + "_0", type: 'barrel', x: bLeft + 50, y: wallMargin + 50, size: 45, health: broken0 ? 0 : 30, isBroken: broken0 });
        let broken1 = worldState.brokenCrates[roomId + "_1"]; currentCrates.push({ id: roomId + "_1", type: 'box', x: bRight - 90, y: canvas.height - 150, size: 45, health: broken1 ? 0 : 30, isBroken: broken1 });
    }

    if (roomId === 999) {
        let isBossWave = (arenaWave % 5 === 0);
        if (isBossWave) {
            worldState.arenaFloor = 'floor6';
        } else {
            let randomFloors = ['sol_base', 'floor7', 'floor8', 'floor9', 'floor10', 'floor11', 'floor12', 'floor13', 'floor14', 'floor15', 'floor16', 'floor17', 'floor18', 'floor19', 'floor20'];
            worldState.arenaFloor = randomFloors[Math.floor(Math.random() * randomFloors.length)];
        }
        
        currentDoors = []; 
        currentItems = []; 
        arenaShrink = 0; 
        player.x = canvas.width / 2 - player.size / 2; 
        player.y = canvas.height / 2 - player.size / 2;
    } 
    else {
        if (worldState.enemyStates[roomId]) { 
            currentEnemies = JSON.parse(JSON.stringify(worldState.enemyStates[roomId])); 
        } 
        else if (!worldState.clearedRooms[roomId]) {
            if (roomId === 2) { window.spawnEnemy('goblin', 1, canvas.width/2 - 150, canvas.height/2 - 150); window.spawnEnemy('goblin', 1, canvas.width/2 + 150, canvas.height/2 + 150); }
            else if (roomId === 3) window.spawnEnemy('goblin', 2, canvas.width/2, canvas.height/2);
            else if (roomId === 4) window.spawnEnemy('goblin', 2, 800, 400);
            else if (roomId === 5) window.spawnEnemy('goblin', 2, canvas.width/2, 300);
            else if (roomId === 6) window.spawnEnemy('goblin', 2, canvas.width/2, 300);
            else if (roomId === 7) { window.spawnEnemy('goblin', 4, 450, 200); window.spawnEnemy('skeleton', 1, 600, 300); }
            else if (roomId === 8) window.spawnEnemy('troll', 1, canvas.width/2 - 40, 150); 
            
            else if (roomId === 101) { 
                window.spawnEnemy('skeleton', 1, bLeft + 40, bTop + 40); 
                window.spawnEnemy('skeleton', 1, bRight - 80, bTop + 40); 
                window.spawnEnemy('skeleton', 1, bLeft + 40, bBot - 80); 
                window.spawnEnemy('skeleton', 1, bRight - 80, bBot - 80); 
            }
            else if (roomId === 102) window.spawnEnemy('skeleton', 2, wallMargin + 50, canvas.height/2);
            else if (roomId === 103) { 
                // LES SQUELETTES SONT PLACÉS DANS LES HITBOXES ET BLOQUÉS
                window.spawnEnemy('skeleton', 1, canvas.width - wallMargin - 100, wallMargin + 50); 
                window.spawnEnemy('skeleton', 1, canvas.width - wallMargin - 100, canvas.height - wallMargin - 100); 
                currentEnemies.forEach(e => { if (e.type === 'skeleton') e.speed = 0; }); 
            }
            else if (roomId === 104) { window.spawnEnemy('goblin', 3, canvas.width/2, canvas.height/2); window.spawnEnemy('skeleton', 1, canvas.width/2, canvas.height/2); }
            else if (roomId === 105) window.spawnEnemy('orc', 3, canvas.width/2, 300);
            else if (roomId === 106) window.spawnEnemy('orc', 3, canvas.width/2, 300); 
            else if (roomId >= 107 && roomId <= 110) window.spawnEnemy('minotaure', 1, canvas.width/2, canvas.height/2);
            else if (roomId === 111) window.spawnEnemy('goblin', 2, canvas.width/2, canvas.height/2);
            else if (roomId === 112) window.spawnEnemy('skeleton', 3, canvas.width/2, canvas.height/2);
            else if (roomId === 113) { window.spawnEnemy('troll', 1, canvas.width/2 - 100, canvas.height/2); window.spawnEnemy('troll', 1, canvas.width/2 + 100, canvas.height/2); }

            else if (roomId === 202) { window.spawnEnemy('siren', 3, canvas.width/2, canvas.height/2); }
            else if (roomId === 203) { window.spawnEnemy('siren', 2, canvas.width/2, canvas.height/2); window.spawnEnemy('anglerfish', 1, canvas.width/2 + 100, canvas.height/2); }
            else if (roomId === 204) { window.spawnEnemy('siren', 2, canvas.width/2, canvas.height/2); window.spawnEnemy('anglerfish', 2, canvas.width/2 + 100, canvas.height/2); }
            else if (roomId === 205) { window.spawnEnemy('siren', 3, canvas.width/2, canvas.height/2); }
            else if (roomId === 206) { window.spawnEnemy('anglerfish', 3, canvas.width/2, canvas.height/2); }
            else if (roomId === 207) { window.spawnEnemy('siren', 4, canvas.width/2, canvas.height/2); }
            else if (roomId === 208) { window.spawnEnemy('kraken', 1, canvas.width/2 - 90, canvas.height/2 - 90); }
        }
    }
};
