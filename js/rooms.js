// ============================================================================
// js/rooms.js - CHARGEMENT DES SALLES ET ÉLÉMENTS DE DÉCOR
// ============================================================================

window.loadRoom = function(roomId, entryFace = 'south') {
    currentRoomId = roomId; 
    projectiles = []; 
    enemyProjectiles = []; 
    hazards = []; 
    particles = []; 
    currentCrates = [];
  
    if (!worldState.bloodStains) worldState.bloodStains = {}; 
    if (!worldState.visitedRooms) worldState.visitedRooms = {};
    if (!worldState.brokenCrates) worldState.brokenCrates = {}; 
    if (!worldState.openedChests) worldState.openedChests = {};
    if (!worldState.bloodStains[roomId]) worldState.bloodStains[roomId] = []; 
  
    bloodStains = worldState.bloodStains[roomId];
    worldState.visitedRooms[roomId] = true;
  
    let bTop = (roomId === 2 || roomId === 3) ? 250 : wallMargin; 
    let bBot = (roomId === 2 || roomId === 3) ? 550 : canvas.height - wallMargin;

    // FIX : Hitbox des portes augmentées (+15px de hauteur) pour ne pas rester bloqué dans le mur !
    const doorN = { x: canvas.width/2 - 75, y: bTop - wallMargin, width: 150, height: wallMargin + 15, face: 'north' };
    const doorS = { x: canvas.width/2 - 75, y: bBot - 15, width: 150, height: wallMargin + 15, face: 'south' };
    const doorW = { x: -15, y: (bTop+bBot)/2 - 75, width: wallMargin + 15, height: 150, face: 'west' };
    const doorE = { x: canvas.width - wallMargin - 15, y: (bTop+bBot)/2 - 75, width: wallMargin + 15, height: 150, face: 'east' };

    // --- PLACEMENT DES PORTES ET COFFRES ---
    if (roomId === 1) { 
        currentDoors = [ { ...doorN, id: 'door_1_2', requiresKey: true, locked: !worldState.unlockedDoors['door_1_2'], dest: 2, spawnX: doorS.x, spawnY: doorS.y - 60 } ]; 
        currentItems = [];
        
        if (!worldState.collectedItems['key_tuto']) {
            currentItems.push({ id: 'key_tuto', type: 'key', x: 800, y: 400, size: 20, collected: false });
        }
        
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
        currentDoors = [ 
            { x: 200, y: canvas.height - wallMargin, width: 150, height: wallMargin + 15, face: 'south', id: 'door_7_5', dest: 5, spawnX: doorN.x, spawnY: doorN.y + wallMargin + 20 }, 
            { x: 800, y: canvas.height - wallMargin, width: 150, height: wallMargin + 15, face: 'south', id: 'door_7_6', dest: 6, spawnX: doorN.x, spawnY: doorN.y + wallMargin + 20 } 
        ]; 
        currentItems = [];
        if (!worldState.collectedItems['key_boss']) {
            currentItems.push({ id: 'key_boss', type: 'key', x: 600, y: 400, size: 20, collected: false });
        }
    }
    else if (roomId === 8) { currentDoors = [ { ...doorS, id: 'door_8_2', dest: 2, spawnX: doorN.x, spawnY: doorN.y + wallMargin + 20 } ]; currentItems = []; }

    // --- PLACEMENT DES CAISSES (Sauf dans la salle 1, 8 et l'Arène) ---
    if (roomId !== 1 && roomId !== 8 && roomId !== 999) {
        let broken0 = worldState.brokenCrates && worldState.brokenCrates[roomId + "_0"];
        currentCrates.push({ id: roomId + "_0", type: 'barrel', x: 150, y: bTop + 50, size: 45, health: broken0 ? 0 : 30, isBroken: broken0 });
        
        let broken1 = worldState.brokenCrates && worldState.brokenCrates[roomId + "_1"];
        currentCrates.push({ id: roomId + "_1", type: 'box', x: 1050, y: bBot - 90, size: 45, health: broken1 ? 0 : 30, isBroken: broken1 });
    }

    // --- APPARITION DES ENNEMIS ---
    currentEnemies = [];
    if (roomId !== 999) {
        if (worldState.enemyStates && worldState.enemyStates[roomId]) { 
            currentEnemies = JSON.parse(JSON.stringify(worldState.enemyStates[roomId])); 
        } 
        else if (!worldState.clearedRooms[roomId]) {
            let spawnX = canvas.width / 2; 
            let spawnY = (bTop + bBot) / 2 - 20;
            if (roomId === 2 || roomId === 3) { 
                if (entryFace === 'west') spawnX = canvas.width - wallMargin - 100; 
                else if (entryFace === 'east') spawnX = wallMargin + 100; 
            }

            if (roomId === 2) { window.spawnEnemy('goblin', 3, spawnX, spawnY); window.spawnEnemy('skeleton', 1, spawnX, spawnY); }
            else if (roomId === 3) { window.spawnEnemy('goblin', 3, spawnX, spawnY); window.spawnEnemy('spider', 1, spawnX, spawnY); }
            else if (roomId === 4) { window.spawnEnemy('goblin', 2, 800, 400); }
            else if (roomId === 5) { window.spawnEnemy('goblin', 2, 400, 300); }
            else if (roomId === 6) { window.spawnEnemy('goblin', 2, 800, 300); }
            else if (roomId === 7) { window.spawnEnemy('goblin', 5, 450, 200); }
            else if (roomId === 8) { window.spawnEnemy('troll', 1, 950, 550); } 
        }
    } else { 
        // Mode Arène
        currentDoors = []; 
        currentItems = []; 
        arenaShrink = 0; 
        player.x = canvas.width / 2 - player.size / 2; 
        player.y = canvas.height / 2 - player.size / 2; 
    }
};
