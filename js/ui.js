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
};
if (playerStats.inventory.coins !== undefined) {
        let coinImg = assetsManager.images['gold_coin'];
        if (coinImg && coinImg.complete && coinImg.naturalWidth > 0) {
            ctx.drawImage(coinImg, wallMargin + 15, 20, 30, 30);
        } else {
            ctx.fillStyle = '#f39c12'; ctx.beginPath(); ctx.arc(wallMargin + 30, 35, 16, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(wallMargin + 30, 35, 10, 0, Math.PI*2); ctx.fill();
        }
        ctx.fillStyle = '#fff'; ctx.font = 'bold 24px Arial'; ctx.textAlign = 'left';
        ctx.fillText("x " + playerStats.inventory.coins, wallMargin + 55, 43);
    }
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
        // Le jeu reprendra dans la boucle main.js
    }
};

window.drawMiniMap = function() {
    let mapCanvas = document.getElementById('map-canvas');
    if (!mapCanvas) return;
    let mctx = mapCanvas.getContext('2d');
    mctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    
    const mapGrid = { 1: {x: 2, y: 4}, 2: {x: 2, y: 3}, 3: {x: 1, y: 3}, 4: {x: 3, y: 3}, 5: {x: 1, y: 2}, 6: {x: 3, y: 2}, 7: {x: 2, y: 1}, 8: {x: 2, y: 0} };
    let boxSize = 40; let offsetX = 50; let offsetY = 30;

    for (let id in mapGrid) {
        let roomId = parseInt(id);
        if (worldState.visitedRooms && worldState.visitedRooms[roomId]) {
            let px = offsetX + mapGrid[roomId].x * boxSize;
            let py = offsetY + mapGrid[roomId].y * boxSize;
            let width = boxSize; let height = boxSize;
            if (roomId === 2 || roomId === 3) width = boxSize + 15;

            if (roomId === currentRoomId) mctx.fillStyle = '#f1c40f'; 
            else if (roomId === 8) mctx.fillStyle = '#e74c3c'; 
            else mctx.fillStyle = '#7f8c8d'; 

            mctx.fillRect(px, py, width - 5, height - 5);
            mctx.strokeStyle = '#2c3e50'; mctx.lineWidth = 2;
            mctx.strokeRect(px, py, width - 5, height - 5);

            mctx.fillStyle = '#111'; mctx.font = 'bold 16px Arial';
            mctx.fillText(roomId, px + 15, py + 25);
        }
    }
};
