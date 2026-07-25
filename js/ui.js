// ============================================================================
// js/ui.js - INTERFACE UTILISATEUR, HUD ET MINIMAP
// ============================================================================

window.updateHUD = function() {
    let healthPercent = (playerStats.health / playerStats.maxHealth) * 100;
    
    let hBar = document.getElementById('health-bar'); if(hBar) hBar.style.width = healthPercent + "%";
    let mBar = document.getElementById('mana-bar'); if(mBar) mBar.style.width = playerStats.mana + "%";
    
    let kg = document.getElementById('key-gold'); if(kg) kg.innerText = playerStats.inventory.keys.gold;
    let ks = document.getElementById('key-skull'); if(ks) ks.innerText = playerStats.inventory.keys.skull;
    let ko = document.getElementById('key-orb'); if(ko) ko.innerText = playerStats.inventory.keys.orb;
    
    let pg = document.getElementById('p-green'); if(pg) pg.innerText = playerStats.inventory.potions.green;
    let py = document.getElementById('p-yellow'); if(py) py.innerText = playerStats.inventory.potions.yellow;
    let pb = document.getElementById('p-blue'); if(pb) pb.innerText = playerStats.inventory.potions.blue;
    let pr = document.getElementById('p-red'); if(pr) pr.innerText = playerStats.inventory.potions.red;
    
    let pcoins = document.getElementById('inv-coins'); 
    if(pcoins && playerStats.inventory.coins !== undefined) pcoins.innerText = playerStats.inventory.coins;
};

window.updatePortrait = function(heroClass) {
    const portrait = document.getElementById('portrait');
    const imgMap = { 
        'Knight': 'assets/card/Knight.png', 
        'Elf': 'assets/card/Elf.png', 
        'Mage': 'assets/card/Burned.png', 
        'Necromancer': 'assets/card/Burned.png' 
    };
    if (imgMap[heroClass] && portrait) portrait.style.backgroundImage = `url('${imgMap[heroClass]}')`;
};

window.togglePause = function() {
    if (gameState !== "PLAYING" && gameState !== "PAUSED") return;

    if (gameState === "PLAYING") {
        gameState = "PAUSED";
        let pScreen = document.getElementById('pause-screen');
        if (pScreen) pScreen.style.display = 'flex';
        if (typeof window.drawMiniMap === 'function') window.drawMiniMap();
    } else {
        gameState = "PLAYING";
        let pScreen = document.getElementById('pause-screen');
        if (pScreen) pScreen.style.display = 'none';
        lastClickTime = Date.now();
    }
};
window.playCinematic = function(videoFile, onComplete) {
    // Sauvegarde l'état du jeu et met en pause
    window.previousGameState = gameState;
    gameState = "CINEMATIC";
    keys = {}; // Reset les touches

    // Conteneur plein écran
    let container = document.createElement('div');
    container.id = "cinematic-overlay";
    container.style.position = "absolute";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.backgroundColor = "#000000";
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";

    // Élément Vidéo
    let video = document.createElement('video');
    video.src = "assets/cinematic/" + videoFile;
    video.style.maxWidth = "100%";
    video.style.maxHeight = "100%";
    video.autoplay = true;
    video.controls = false; 

    // Texte "Passer" avec ENTRÉE
    let skipText = document.createElement('div');
    skipText.innerText = "Appuyez sur [ENTRÉE] pour passer";
    skipText.style.position = "absolute";
    skipText.style.bottom = "30px";
    skipText.style.right = "30px";
    skipText.style.color = "#ffffff";
    skipText.style.fontFamily = "Arial, sans-serif";
    skipText.style.fontSize = "20px";
    skipText.style.fontWeight = "bold";
    skipText.style.opacity = "0.8";

    container.appendChild(video);
    container.appendChild(skipText);
    document.body.appendChild(container);

    let isFinished = false;

    // Fonction de fin de cinématique
    let finishCinematic = function() {
        if (isFinished) return;
        isFinished = true;
        if (document.getElementById("cinematic-overlay")) {
            document.body.removeChild(container);
        }
        document.removeEventListener('keydown', skipHandler);
        gameState = window.previousGameState; // Relance le jeu
        if (onComplete) onComplete();
    };

    // Gestion de la touche Entrée
    let skipHandler = function(e) {
        if (e.code === 'Enter' || e.key === 'Enter') {
            e.preventDefault();
            video.pause();
            finishCinematic();
        }
    };

    video.onended = finishCinematic;
    video.onerror = finishCinematic; // Sécurité si le mp4 est introuvable
    document.addEventListener('keydown', skipHandler);
};

window.drawMiniMap = function() {
    let mapCanvas = document.getElementById('map-canvas');
    if (!mapCanvas) return;
    
    mapCanvas.width = 400;
    mapCanvas.height = 400;
    mapCanvas.style.width = "100%";
    mapCanvas.style.height = "auto";
    mapCanvas.style.maxWidth = "350px";
    mapCanvas.style.borderRadius = "8px";

    let mctx = mapCanvas.getContext('2d');
    mctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    mctx.fillStyle = '#111';
    mctx.fillRect(0, 0, mapCanvas.width, mapCanvas.height);
    
    let mapGrid = {};
    let fMin = 1, fMax = 99;
    if (currentRoomId === 999) { fMin = 999; fMax = 999; }
    else if (currentRoomId >= 200) { fMin = 200; fMax = 299; }
    else if (currentRoomId >= 100) { fMin = 100; fMax = 199; }

    const fullGrid = {
        1: {x: 2, y: 9}, 2: {x: 2, y: 8}, 3: {x: 1, y: 8}, 4: {x: 3, y: 8}, 
        5: {x: 1, y: 7}, 6: {x: 3, y: 7}, 7: {x: 2, y: 6}, 8: {x: 2, y: 5},
        101: {x: 2, y: 4}, 102: {x: 1, y: 4}, 103: {x: 3, y: 4}, 104: {x: 2, y: 5}, 
        105: {x: 1, y: 3}, 106: {x: 0, y: 4}, 107: {x: 1, y: 5}, 108: {x: 1, y: 6},
        109: {x: 3, y: 5}, 110: {x: 3, y: 6}, 111: {x: 3, y: 3}, 112: {x: 3, y: 2}, 
        113: {x: 3, y: 1}, 114: {x: 2, y: 3},
        201: {x: 2, y: 4}, 202: {x: 2, y: 3}, 203: {x: 3, y: 3}, 204: {x: 1, y: 3}, 
        205: {x: 1, y: 2}, 206: {x: 1, y: 1}, 207: {x: 2, y: 1}, 208: {x: 2, y: 0},
        999: {x: 2, y: 2}
    };

    for(let id in fullGrid) {
        if (id >= fMin && id <= fMax) mapGrid[id] = fullGrid[id];
    }
    
    let boxSize = 35; 
    let currPos = mapGrid[currentRoomId] || {x: 2, y: 4};
    
    let offsetX = (mapCanvas.width / 2) - (currPos.x * boxSize) - (boxSize / 2);
    let offsetY = (mapCanvas.height / 2) - (currPos.y * boxSize) - (boxSize / 2);

    for (let id in mapGrid) {
        let roomId = parseInt(id);
        if (worldState.visitedRooms && worldState.visitedRooms[roomId]) {
            let px = offsetX + mapGrid[roomId].x * boxSize;
            let py = offsetY + mapGrid[roomId].y * boxSize;
            let width = boxSize; let height = boxSize;

            if (roomId === 2 || roomId === 202) width = boxSize * 1.5;

            if (roomId === currentRoomId) mctx.fillStyle = '#f1c40f'; 
            else if (roomId === 8 || roomId === 108 || roomId === 110 || roomId === 113 || roomId === 208) mctx.fillStyle = '#e74c3c'; 
            else mctx.fillStyle = '#7f8c8d'; 

            mctx.fillRect(px, py, width - 4, height - 4);
            mctx.strokeStyle = '#2c3e50'; mctx.lineWidth = 2;
            mctx.strokeRect(px, py, width - 4, height - 4);

            if (roomId === currentRoomId) {
                mctx.fillStyle = '#111'; mctx.font = 'bold 16px Arial'; mctx.textAlign = 'center';
                mctx.fillText("X", px + width/2 - 2, py + height/2 + 6);
            }
        }
    }
};
