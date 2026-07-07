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
    try {
        currentRoomId = roomId; 
        
        projectiles = []; enemyProjectiles = []; hazards = []; particles = []; currentCrates = []; necroSummons = []; necroKills = []; 
        currentObstacles = []; currentDoors = []; currentItems = []; currentEnemies = [];
        
        playerInvulnerableTimer = 90; 
        
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
        
        let isVertCorridor = (roomId === 5 || roomId === 6 || roomId === 111 || roomId === 112 || roomId === 113);
        let bLeft = isVertCorridor ? 350 : wallMargin;
        let bRight = isVertCorridor ? canvas.width - 350 : canvas.width - wallMargin;

        const doorN = { x: canvas.width/2 - 75, y: 0, width: 150, height: wallMargin + 15, face: 'north' };
        const doorS = { x: canvas.width/2 - 75, y: canvas.height - wallMargin - 15, width: 150, height: wallMargin + 15, face: 'south' };
        const doorW = { x: isVertCorridor ? bLeft - 15 : -15, y: canvas.height/2 - 75, width: wallMargin + 15, height: 150, face: 'west' };
        const doorE = { x: isVertCorridor ? bRight - wallMargin : canvas.width - wallMargin - 15, y: canvas.height/2 - 75, width: wallMargin + 15, height: 150, face: 'east' };

        const spawnN = { x: canvas.width/2 - 20, y: wallMargin + 20 };        
        const spawnS = { x: canvas.width/2 - 20, y: canvas.height - wallMargin - 60 }; 
        const spawnW = { x: (isVertCorridor ? bLeft : wallMargin) + 20, y: canvas.height/2 - 20 };        
        const spawnE = { x: (isVertCorridor ? bRight : canvas.width - wallMargin) - 60, y: canvas.height/2 - 20 }; 

        if (roomId === 1) { 
            currentDoors = [ { ...doorN, id: 'door_1_2', requiresKey: true, locked: !worldState.unlockedDoors['door_1_2'], dest: 2, spawnX: spawnS.x, spawnY: spawnS.y } ]; 
            if (!worldState.collectedItems['key_tuto']) currentItems.push({ id: 'key_tuto', type: 'key', x: 800, y: 400, size: 20, collected: false });
            let isOpened = worldState.openedChests['chest_1'];
            currentCrates.push({ id: 'chest_1', type: 'chest', x: 250, y: 650, size: 60, health: isOpened ? 0 : 1, isBroken: isOpened });
        } 
        else if (roomId === 2) { 
            currentDoors = [ { ...doorS, id: 'door_2_1', requiresKey: false, locked: false, dest: 1, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorW, id: 'door_2_3', requiresKey: false, locked: false, dest: 3, spawnX: spawnE.x, spawnY: spawnE.y }, { ...doorE, id: 'door_2_4', requiresKey: false, locked: false, dest: 4, spawnX: spawnW.x, spawnY: spawnW.y }, { ...doorN, id: 'door_2_8', requiresKey: true, locked: !worldState.unlockedDoors['door_2_8'], dest: 8, spawnX: spawnS.x, spawnY: spawnS.y } ]; 
        }
        else if (roomId === 3) { currentDoors = [ { ...doorE, id: 'door_3_2', requiresKey: false, locked: false, dest: 2, spawnX: spawnW.x, spawnY: spawnW.y }, { ...doorN, id: 'door_3_5', requiresKey: false, locked: false, dest: 5, spawnX: spawnS.x, spawnY: spawnS.y } ]; }
        else if (roomId === 4) { currentDoors = [ { ...doorW, id: 'door_4_2', requiresKey: false, locked: false, dest: 2, spawnX: spawnE.x, spawnY: spawnE.y }, { ...doorN, id: 'door_4_6', requiresKey: false, locked: false, dest: 6, spawnX: spawnS.x, spawnY: spawnS.y } ]; }
        else if (roomId === 5) { currentDoors = [ { ...doorS, id: 'door_5_3', requiresKey: false, locked: false, dest: 3, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorN, id: 'door_5_7', requiresKey: false, locked: false, dest: 7, spawnX: 255, spawnY: canvas.height - wallMargin - 100 } ]; }
        else if (roomId === 6) { currentDoors = [ { ...doorS, id: 'door_6_4', requiresKey: false, locked: false, dest: 4, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorN, id: 'door_6_7', requiresKey: false, locked: false, dest: 7, spawnX: 855, spawnY: canvas.height - wallMargin - 100 } ]; }
        else if (roomId === 7) { 
            currentDoors = [ { x: 200, y: canvas.height - wallMargin - 15, width: 150, height: wallMargin + 15, face: 'south', id: 'door_7_5', requiresKey: false, locked: false, dest: 5, spawnX: spawnN.x, spawnY: spawnN.y }, { x: 800, y: canvas.height - wallMargin - 15, width: 150, height: wallMargin + 15, face: 'south', id: 'door_7_6', requiresKey: false, locked: false, dest: 6, spawnX: spawnN.x, spawnY: spawnN.y } ]; 
            if (!worldState.collectedItems['key_boss']) currentItems.push({ id: 'key_boss', type: 'key', x: 600, y: 400, size: 20, collected: false });
        }
        else if (roomId === 8) { currentDoors = [ { ...doorS, id: 'door_8_2', requiresKey: false, locked: false, dest: 2, spawnX: spawnN.x, spawnY: spawnN.y } ]; }

        // --- NIVEAU 2 ---
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
                { ...doorE, id: 'door_102_101', requiresKey: true, locked: !worldState.unlockedDoors['door_102_101'], dest: 101, spawnX: spawnW.x, spawnY: spawnW.y },
                { x: canvas.width/2 + 100, y: 0, width: 150, height: wallMargin + 15, face: 'north', id: 'door_102_105', dest: 105, spawnX: canvas.width/2 + 100, spawnY: spawnS.y },
                { ...doorW, id: 'door_102_106', requiresKey: false, locked: false, dest: 106, spawnX: spawnE.x, spawnY: spawnE.y }
            ]; 
            // CORRECTION : Zone de collision super élargie pour bloquer les bords de la crevasse !
            currentObstacles.push({ x: canvas.width/2 - 130, y: wallMargin, width: 260, height: canvas.height - wallMargin*2, type: 'hole' });
            
            // CORRECTION : La Clé apparaît bien à gauche
            if (!worldState.collectedItems['key_room_102']) {
                currentItems.push({ id: 'key_room_102', type: 'key', x: wallMargin + 150, y: canvas.height/2, size: 20, collected: false });
            }
        }
        else if (roomId === 103) { 
            currentDoors = [ 
                { ...doorW, id: 'door_103_101', requiresKey: false, locked: false, dest: 101, spawnX: spawnE.x, spawnY: spawnE.y },
                { ...doorN, id: 'door_103_111', requiresKey: false, locked: false, dest: 111, spawnX: spawnS.x, spawnY: spawnS.y }
            ]; 
            currentObstacles.push({ x: canvas.width - wallMargin - 150, y: wallMargin, width: 150, height: 150, type: 'hole' });
            currentObstacles.push({ x: canvas.width - wallMargin - 150, y: canvas.height - wallMargin - 150, width: 150, height: 150, type: 'hole' });
        }
        else if (roomId === 104) { 
            currentDoors = [ 
                { ...doorN, id: 'door_104_101', requiresKey: false, locked: false, dest: 101, spawnX: spawnS.x, spawnY: spawnS.y },
                { ...doorW, id: 'door_104_107', requiresKey: true, locked: !worldState.unlockedDoors['door_104_107'], dest: 107, spawnX: spawnE.x, spawnY: spawnE.y },
                { ...doorE, id: 'door_104_109', requiresKey: true, locked: !worldState.unlockedDoors['door_104_109'], dest: 109, spawnX: spawnW.x, spawnY: spawnW.y }
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
        else if (roomId === 107) { currentDoors = [ { ...doorE, id: 'door_107_104', dest: 104, spawnX: spawnW.x, spawnY: spawnW.y }, { ...doorS, id: 'door_107_108', dest: 108, spawnX: spawnN.x, spawnY: spawnN.y } ]; }
        else if (roomId === 108) { currentDoors = [ { ...doorN, id: 'door_108_107', dest: 107, spawnX: spawnS.x, spawnY: spawnS.y } ]; }
        else if (roomId === 109) { currentDoors = [ { ...doorW, id: 'door_109_104', dest: 104, spawnX: spawnE.x, spawnY: spawnE.y }, { ...doorS, id: 'door_109_110', dest: 110, spawnX: spawnN.x, spawnY: spawnN.y } ]; }
        else if (roomId === 110) { currentDoors = [ { ...doorN, id: 'door_110_109', dest: 109, spawnX: spawnS.x, spawnY: spawnS.y } ]; }
        else if (roomId === 111) { currentDoors = [ { ...doorS, id: 'door_111_103', dest: 103, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorN, id: 'door_111_112', dest: 112, spawnX: spawnS.x, spawnY: spawnS.y }, { ...doorW, id: 'door_111_114', requiresKey: true, locked: !worldState.unlockedDoors['door_111_114'], dest: 114, spawnX: spawnE.x, spawnY: spawnE.y } ]; }
        else if (roomId === 112) { currentDoors = [ { ...doorS, id: 'door_112_111', dest: 111, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorN, id: 'door_112_113', dest: 113, spawnX: spawnS.x, spawnY: spawnS.y } ]; }
        else if (roomId === 113) { currentDoors = [ { ...doorS, id: 'door_113_112', dest: 112, spawnX: spawnN.x, spawnY: spawnN.y } ]; }
        else if (roomId === 114) { 
            currentDoors = [ { ...doorS, id: 'door_114_101', requiresKey: true, locked: !worldState.unlockedDoors['door_114_101'], dest: 101, spawnX: spawnN.x, spawnY: spawnN.y }, { ...doorE, id: 'door_114_111', requiresKey: true, locked: !worldState.unlockedDoors['door_114_111'], dest: 111, spawnX: spawnW.x, spawnY: spawnW.y } ]; 
            currentObstacles.push({ x: canvas.width/2 - 120, y: canvas.height/2 - 120, width: 240, height: 240, type: 'water' });
        }

        if (roomId !== 1 && roomId !== 8 && roomId !== 999 && roomId < 100) {
            let broken0 = worldState.brokenCrates[roomId + "_0"]; currentCrates.push({ id: roomId + "_0", type: 'barrel', x: bLeft + 50, y: wallMargin + 50, size: 45, health: broken0 ? 0 : 30, isBroken: broken0 });
            let broken1 = worldState.brokenCrates[roomId + "_1"]; currentCrates.push({ id: roomId + "_1", type: 'box', x: bRight - 90, y: canvas.height - 150, size: 45, health: broken1 ? 0 : 30, isBroken: broken1 });
        }

        if (roomId !== 999) {
            if (worldState.enemyStates[roomId]) { currentEnemies = JSON.parse(JSON.stringify(worldState.enemyStates[roomId])); } 
            else if (!worldState.clearedRooms[roomId]) {
                if (roomId === 2) { window.spawnEnemy('goblin', 1, canvas.width/2 - 150, canvas.height/2 - 150); window.spawnEnemy('goblin', 1, canvas.width/2 + 150, canvas.height/2 + 150); }
                else if (roomId === 3) window.spawnEnemy('goblin', 2, canvas.width/2, canvas.height/2);
                else if (roomId === 4) window.spawnEnemy('goblin', 2, 800, 400);
                else if (roomId === 5) window.spawnEnemy('goblin', 2, canvas.width/2, 300);
                else if (roomId === 6) window.spawnEnemy('goblin', 2, canvas.width/2, 300);
                else if (roomId === 7) { window.spawnEnemy('goblin', 4, 450, 200); window.spawnEnemy('skeleton', 1, 600, 300); }
                else if (roomId === 8) window.spawnEnemy('troll', 1, canvas.width/2 - 40, 150); 
                else if (roomId === 101) window.spawnEnemy('skeleton', 3, canvas.width/2, canvas.height/2);
                else if (roomId === 102) window.spawnEnemy('skeleton', 2, wallMargin + 50, canvas.height/2);
                else if (roomId === 103) { window.spawnEnemy('skeleton', 1, canvas.width - wallMargin - 80, wallMargin + 80); window.spawnEnemy('skeleton', 1, canvas.width - wallMargin - 80, canvas.height - wallMargin - 80); }
                else if (roomId === 104) { window.spawnEnemy('goblin', 3, canvas.width/2, canvas.height/2); window.spawnEnemy('skeleton', 1, canvas.width/2, canvas.height/2); }
                else if (roomId === 105) window.spawnEnemy('orc', 3, canvas.width/2, 300);
                else if (roomId === 106) window.spawnEnemy('skeleton', 3, canvas.width/2, 300);
                else if (roomId >= 107 && roomId <= 110) window.spawnEnemy('minotaure', 1, canvas.width/2, canvas.height/2);
                else if (roomId === 111) window.spawnEnemy('goblin', 2, canvas.width/2, canvas.height/2);
                else if (roomId === 112) window.spawnEnemy('skeleton', 3, canvas.width/2, canvas.height/2);
                else if (roomId === 113) { window.spawnEnemy('troll', 1, canvas.width/2 - 100, canvas.height/2); window.spawnEnemy('troll', 1, canvas.width/2 + 100, canvas.height/2); }
            }
        } else { currentDoors = []; currentItems = []; arenaShrink = 0; player.x = canvas.width / 2 - player.size / 2; player.y = canvas.height / 2 - player.size / 2; }
    } catch (e) {
        console.error("ERREUR FATALE DANS LOADROOM:", e);
    }
};
