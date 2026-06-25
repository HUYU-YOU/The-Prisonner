// ============================================================================
// CORE LOOP CONTROLLER, ENGINE TICKS & USER INTERACTION LISTENERS
// ============================================================================
document.addEventListener('contextmenu', event => event.preventDefault());

// ============================================================================
// --- GESTION DE LA MUSIQUE (PLAYLIST) ---
// ============================================================================
const playlist = [
    'assets/audio/track1.mp3', 
    'assets/audio/track2.mp3', 
    'assets/audio/track3.mp3'  
];
let currentTrackIndex = 0;
let bgMusic = new Audio(playlist[currentTrackIndex]);
bgMusic.volume = 0.1; // Volume bas par défaut
let isMuted = false;

bgMusic.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    bgMusic.src = playlist[currentTrackIndex];
    bgMusic.play().catch(e => console.log(e));
});
window.toggleMute = function() {
    isMuted = !isMuted;
    bgMusic.muted = isMuted;
    let btn = document.getElementById('mute-btn');
    if (btn) btn.innerText = isMuted ? '🔇' : '🔊';
};
window.changeVolume = function(val) {
    bgMusic.volume = parseFloat(val);
    let slider1 = document.getElementById('volume-slider');
    let slider2 = document.getElementById('pause-volume');
    if (slider1) slider1.value = val;
    if (slider2) slider2.value = val;
};
window.addEventListener('DOMContentLoaded', () => {
    const audioUi = document.getElementById('audio-ui');
    const volSlider = document.getElementById('volume-slider');
    if (audioUi && volSlider) {
        audioUi.addEventListener('mouseenter', () => volSlider.style.display = 'block');
        audioUi.addEventListener('mouseleave', () => volSlider.style.display = 'none');
    }
});
document.body.addEventListener('click', () => {
    if (bgMusic.paused && !isMuted) {
        bgMusic.play().catch(e => console.log("Attente d'interaction audio"));
    }
}, { once: true });

// ============================================================================
// --- SYSTÈME DE PAUSE ET CARTE (MINIMAP) ---
// ============================================================================
let isPaused = false;
window.togglePause = function() {
    if (gameState !== "PLAYING" && gameState !== "PAUSED") return;
    if (gameState === "PLAYING") {
        gameState = "PAUSED";
        let pauseScreen = document.getElementById('pause-screen');
        if (pauseScreen) pauseScreen.style.display = 'flex';
        drawMiniMap();
    } else if (gameState === "PAUSED") {
        gameState = "PLAYING";
        let pauseScreen = document.getElementById('pause-screen');
        if (pauseScreen) pauseScreen.style.display = 'none';
        lastClickTime = Date.now(); 
        requestAnimationFrame(update);
    }
};
function drawMiniMap() {
    let mapCanvas = document.getElementById('map-canvas');
    if (!mapCanvas) return;
    let mctx = mapCanvas.getContext('2d');
    mctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    
    const mapGrid = {
        1: {x: 2, y: 4}, 2: {x: 2, y: 3}, 3: {x: 1, y: 3}, 4: {x: 3, y: 3}, 
        5: {x: 1, y: 2}, 6: {x: 3, y: 2}, 7: {x: 2, y: 1}, 8: {x: 2, y: 0}
    };
    let boxSize = 40; 
    let offsetX = 50; 
    let offsetY = 30;
    for (let id in mapGrid) {
        let roomId = parseInt(id);
        
        if (worldState.visitedRooms && worldState.visitedRooms[roomId]) {
            let px = offsetX + mapGrid[roomId].x * boxSize;
            let py = offsetY + mapGrid[roomId].y * boxSize;
            let width = boxSize; 
            let height = boxSize;
            
            if (roomId === 5 || roomId === 6) height = boxSize + 15;
            if (roomId === currentRoomId) {
                mctx.fillStyle = '#f1c40f'; // Actuelle (Jaune)
            } else if (roomId === 8) {
                mctx.fillStyle = '#e74c3c'; // Boss (Rouge)
            } else {
                mctx.fillStyle = '#7f8c8d'; // Explorée (Gris)
            }
            mctx.fillRect(px, py, width - 5, height - 5);
            mctx.strokeStyle = '#2c3e50'; 
            mctx.lineWidth = 2;
            mctx.strokeRect(px, py, width - 5, height - 5);
            mctx.fillStyle = '#111'; 
            mctx.font = 'bold 16px Arial';
            mctx.fillText(roomId, px + 15, py + 25);
        }
    }
}

// ============================================================================
// --- SYSTÈMES ET OUTILS DE BASE ---
// ============================================================================
function checkCollision(rect1, rect2) {
    let w1 = rect1.width || rect1.size; 
    let h1 = rect1.height || rect1.size;
    let w2 = rect2.width || rect2.size; 
    let h2 = rect2.height || rect2.size;
    
    return (rect1.x < rect2.x + w2 && 
            rect1.x + w1 > rect2.x && 
            rect1.y < rect2.y + h2 && 
            rect1.y + h1 > rect2.y);
}
function updatePortrait(heroClass) {
    const portrait = document.getElementById('portrait');
    const imgMap = {
        'Knight': 'assets/card/Knight.png',
        'Elf': 'assets/card/Elf.png',
        'Mage': 'assets/card/Burned.png',
        'Necromancer': 'assets/card/Burned.png'
    };
    if (imgMap[heroClass]) {
        portrait.style.backgroundImage = `url('${imgMap[heroClass]}')`;
    }
}
window.startHeroHold = function(heroClass) {
    isHolding = true; 
    holdCompleted = false;
    holdTimer = setTimeout(() => { 
        holdCompleted = true; 
        startArenaMode(heroClass); 
    }, 10000); 
};
window.endHeroHold = function(heroClass) {
    if (isHolding) {
        clearTimeout(holdTimer); 
        isHolding = false;
        if (!holdCompleted) {
            selectHero(heroClass); 
        }
    }
};
window.selectHero = function(heroClass) {
    player.heroClass = heroClass;
    
    if (heroClass === 'Knight') {
        playerStats.name = "CHEVALIER"; 
        playerStats.weapon = "ÉPÉE LOURDE"; 
        player.speed = 4;
        playerStats.maxHealth = 140; 
        playerStats.health = 140;
    } else if (heroClass === 'Elf') {
        playerStats.name = "KEBRA"; 
        playerStats.weapon = "ARC D'EMERYN"; 
        player.speed = 6;
        playerStats.maxHealth = 100; 
        playerStats.health = 100;
    } else if (heroClass === 'Mage') {
        playerStats.name = "MAGE BRÛLEUR"; 
        playerStats.weapon = "BOULES DE FEU"; 
        player.speed = 5;
        playerStats.maxHealth = 100; 
        playerStats.health = 100;
    } else if (heroClass === 'Necromancer') {
        playerStats.name = "NÉCROMANCIEN"; 
        playerStats.weapon = "FAUX DES ÂMES"; 
        player.speed = 4.5;
        playerStats.maxHealth = 120; 
        playerStats.health = 120;
    }
    
    playerStats.inventory.coins = parseInt(localStorage.getItem('kebra_coins')) || 0;
    player.dashCooldown = 0; 
    player.dashTimer = 0;
    document.getElementById('p-name').innerText = playerStats.name;
    document.getElementById('p-weapon').innerText = playerStats.weapon;
    
    let audioControls = document.getElementById('audio-ui');
    if (audioControls) audioControls.style.display = 'none';
    
    document.getElementById('menu-screen').style.display = 'none';
    
    updatePortrait(heroClass);
    loadRoom(1); 
    updateHUD(); 
    gameState = "PLAYING";
};
function startArenaMode(heroClass) {
    isArenaMode = true; 
    arenaWave = 1; 
    arenaState = "WAITING"; 
    arenaTimer = 300; 
    player.heroClass = heroClass;
    
    playerStats.inventory.coins = parseInt(localStorage.getItem('kebra_coins')) || 0;
    player.dashCooldown = 0; 
    player.dashTimer = 0;
    if (heroClass === 'Knight') {
        playerStats.name = "CHEVALIER (ARÈNE)"; 
        playerStats.weapon = "ÉPÉE LOURDE"; 
        player.speed = 4;
        playerStats.maxHealth = 140; 
        playerStats.health = 140;
    } else if (heroClass === 'Elf') {
        playerStats.name = "KEBRA (ARÈNE)"; 
        playerStats.weapon = "ARC D'EMERYN"; 
        player.speed = 6;
        playerStats.maxHealth = 100; 
        playerStats.health = 100;
    } else if (heroClass === 'Mage') {
        playerStats.name = "MAGE BRÛLEUR"; 
        playerStats.weapon = "BOULES DE FEU"; 
        player.speed = 5;
        playerStats.maxHealth = 100; 
        playerStats.health = 100;
    } else if (heroClass === 'Necromancer') {
        playerStats.name = "NÉCROMANCIEN (ARÈNE)"; 
        playerStats.weapon = "FAUX DES ÂMES"; 
        player.speed = 4.5;
        playerStats.maxHealth = 120; 
        playerStats.health = 120;
    }
    
    document.getElementById('p-name').innerText = playerStats.name;
    document.getElementById('p-weapon').innerText = playerStats.weapon;
    
    let audioControls = document.getElementById('audio-ui');
    if (audioControls) audioControls.style.display = 'none';
    
    document.getElementById('menu-screen').style.display = 'none';
    
    updatePortrait(heroClass);
    loadRoom(999); 
    updateHUD(); 
    gameState = "PLAYING";
}
window.usePotion = function(color) {
    if (playerStats.inventory.potions[color] > 0) {
        let potionUsed = false;
        if (color === 'green' && playerStats.health < playerStats.maxHealth) {
            playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + (playerStats.maxHealth * 0.2));
            potionUsed = true;
        } else if (color === 'red' && playerStats.health < playerStats.maxHealth) {
            playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + (playerStats.maxHealth * 0.5));
            potionUsed = true;
        } else if (color === 'blue' && playerStats.mana < 100) {
            playerStats.mana = Math.min(100, playerStats.mana + 20);
            potionUsed = true;
        } else if (color === 'yellow') {
            playerPoisonTimer = 0;
            playerSlowTimer = 0;
            potionUsed = true;
        }
        
        if (potionUsed) {
            playerStats.inventory.potions[color]--;
            updateHUD();
            spawnParticles(player.x + player.size/2, player.y + player.size/2, '#3498db', 20);
        }
    }
};

function triggerDash() {
    if (gameState !== "PLAYING") return;
    if (player.dashCooldown <= 0 && player.dashTimer <= 0) {
        let dx = mouse.x - (player.x + player.size / 2);
        let dy = mouse.y - (player.y + player.size / 2);
        let dist = Math.hypot(dx, dy); 
        if (dist === 0) { dx = 1; dy = 0; dist = 1; }
        
        player.dashVx = (dx/dist) * (player.speed * 4); 
        player.dashVy = (dy/dist) * (player.speed * 4);
        player.dashTimer = 12; 
        player.dashCooldown = 60; 
        playerInvulnerableTimer = 15; 
        spawnParticles(player.x + player.size/2, player.y + player.size/2, '#ecf0f1', 15);
    }
}
// --- CONTRÔLES ---
window.addEventListener('keydown', (e) => { 
    let k = e.key.toLowerCase(); 
    if(k === ' ') k = 'space'; 
    keys[k] = true; 
    
    if (k === 'shift') triggerDash();
    if (k === 'escape' || k === 'p' || k === 'm') togglePause();
    if (k === '1' || k === '&') usePotion('green');
    if (k === '2' || k === 'é') usePotion('red');
    if (k === '3' || k === '"') usePotion('blue');
    if (k === '4' || k === "'") usePotion('yellow');
});
window.addEventListener('keyup', (e) => { 
    let k = e.key.toLowerCase(); 
    if(k === ' ') k = 'space'; 
    keys[k] = false; 
});
window.addEventListener('mouseup', () => { 
    leftClickHeld = false; 
});
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouse.x = (e.clientX - rect.left) * scaleX;
    mouse.y = (e.clientY - rect.top) * scaleY;
});

let currentCrates = []; 
canvas.addEventListener('mousedown', (e) => {
    if (gameState !== "PLAYING") return;
    
    if (e.button === 2) { triggerDash(); return; }
    if (e.button !== 0) return; 
    leftClickHeld = true; 
    leftClickHoldTime = 0;
    
    if (attackCooldown > 0) return;
    let dx = mouse.x - (player.x + player.size / 2);
    let dy = mouse.y - (player.y + player.size / 2);
    let angle = Math.atan2(dy, dx);
    player.faceAngle = angle; 
    
    let now = Date.now();
    if (now - lastClickTime < 300 && playerStats.mana >= 100) { 
        if (typeof activateUltimate === 'function') activateUltimate(); 
        return; 
    }
    lastClickTime = now;

    if (player.heroClass === 'Elf') {
        if (isUltimateActive) {
            elfStealthBroken = true; 
            let spread = 0.15;
            projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle - spread) * 12, vy: Math.sin(angle - spread) * 12, size: 5, hitTargets: [], angle: angle - spread, isFire: false });
            projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle + spread) * 12, vy: Math.sin(angle + spread) * 12, size: 5, hitTargets: [], angle: angle + spread, isFire: false });
            attackCooldown = 15;
        } else {
            projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle) * 12, vy: Math.sin(angle) * 12, size: 5, hitTargets: [], angle: angle, isFire: false });
            attackCooldown = 30;
        }
    } else if (player.heroClass === 'Mage') {
        projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle) * 10, vy: Math.sin(angle) * 10, size: 8, hitTargets: [], angle: angle, isFire: true });
        attackCooldown = 35;
    } else if (player.heroClass === 'Necromancer') {
        projectiles.push({ x: player.x + player.size / 2, y: player.y + player.size / 2, vx: Math.cos(angle) * 10, vy: Math.sin(angle) * 10, size: 6, hitTargets: [], angle: angle, isFire: false, isNecro: true });
        attackCooldown = 15;
    } else if (player.heroClass === 'Knight') {
        isAttacking = true; 
        attackCooldown = 40;
        let hitBox = { 
            x: player.x + player.size / 2 + Math.cos(angle) * 60 - 60, 
            y: player.y + player.size / 2 + Math.sin(angle) * 60 - 60, 
            size: 120 
        };
        
        currentEnemies.forEach(enemy => { 
            if (checkCollision(hitBox, enemy)) {
                if (!enemy.invulnerable) {
                    if (enemy.type === 'goblin' && Math.random() < 0.15) {
                        enemy.blockAnimTimer = 45; 
                        spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, '#bdc3c7', 15);
                    } else {
                        enemy.health -= 50;
                        spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, enemy.color, 15); 
                        triggerShake(5, 8); 
                        
                        // FIX SANG OPAQUE
                        if (!worldState.bloodStains[currentRoomId]) worldState.bloodStains[currentRoomId] = [];
                        worldState.bloodStains[currentRoomId].push({x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, r: 10 + Math.random() * 10});
                    }
                }
            } 
        });
        for (let i = 0; i < currentCrates.length; i++) {
            let obj = currentCrates[i];
            if (checkCollision(hitBox, obj) && !obj.isBroken) {
                obj.health -= 50;
            }
        }
    }
});

function spawnEnemy(type, count, baseX = null, baseY = null) {
    for (let i = 0; i < count; i++) {
        let ex = baseX; 
        let ey = baseY;
        
        let size = 40, hp = 90, spd = 3.5, col = '#27ae60';
        
        if (type === 'skeleton') { hp = 50; spd = 2; col = '#bdc3c7'; }
        else if (type === 'spider') { size = 30; hp = 1; spd = 7; col = '#8e44ad'; }
        else if (type === 'troll') { size = 80; hp = 900; spd = 2.5; col = '#117a65'; }
        else if (type === 'mage') { size = 60; hp = 900; spd = 2; col = '#9b59b6'; }
        else if (type === 'dragon') { size = 150; hp = 3000; spd = 1.0; col = '#8b0000'; }
        
        if (ex === null || ey === null) {
            let isVertCorridor = (currentRoomId === 5 || currentRoomId === 6);
            let bTop = wallMargin;
            let bBot = canvas.height - wallMargin;
            let bLeft = isVertCorridor ? 350 : wallMargin;
            let bRight = isVertCorridor ? canvas.width - 350 : canvas.width - wallMargin;

            let minSpawnX = bLeft + arenaShrink;
            let maxSpawnX = bRight - arenaShrink - size;
            let minSpawnY = bTop + arenaShrink;
            let maxSpawnY = bBot - arenaShrink - size;
            
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
        
        if (isArenaMode && arenaWave >= 25 && type !== 'spider' && type !== 'dragon') {
            hp += (arenaWave - 24) * 30;
        }
        currentEnemies.push({ 
            x: ex, y: ey, size: size, health: hp, maxHealth: hp, speed: spd, color: col, type: type, 
            shootCooldown: 0, summonTimer: 180, wobble: Math.random() * Math.PI * 2,
            timeAlive: 0, phase: 1, invulnerable: false, isBurning: false, burnTicks: 0, burnTimer: 0,
            slowTimer: 0, isPermanentlySlowed: false, killedBySummon: false, killedByNecro: false,
            attackAnimTimer: 0, blockAnimTimer: 0, ultiAnimTimer: 0, dashTimer: 180, isDashing: 0
        });
    }
}

function update() {
    if (gameState === "MENU") {
        if (keys['space']) {
            if (typeof spaceHoldTimer === 'undefined') spaceHoldTimer = 0;
            spaceHoldTimer++;
            if (spaceHoldTimer >= 300) { spaceHoldTimer = 0; keys['space'] = false; startArenaMode('Necromancer'); }
        } else { spaceHoldTimer = 0; }
        requestAnimationFrame(update); return;
    }
    if (gameState === "PAUSED") { requestAnimationFrame(update); return; }
    if (gameState !== "PLAYING" && gameState !== "GAMEOVER") { requestAnimationFrame(update); return; }
    if (gameState === "GAMEOVER") { renderGameView(); requestAnimationFrame(update); return; }
    
    // --- L'ARÈNE RÉTRÉCIT BIEN À LA VAGUE 10 ---
    if (currentRoomId === 999 && waveStartDelay > 0) waveStartDelay--;
    if (currentRoomId === 999 && arenaWave >= 10 && arenaShrink < 150) {
        arenaShrink += 0.1;
    }

    if (!worldState.openedDoors) worldState.openedDoors = {};
    let roomChanged = false;
    currentDoors.forEach(door => {
        if (currentRoomId === 8 && !worldState.bossDefeated && door.face === 'south') {
            if (checkCollision(player, door)) { player.y = door.y - player.size - 5; } return;
        }
        if (!roomChanged && checkCollision(player, door)) { 
            if (door.locked) {
                if (playerStats.inventory.keys.gold > 0) {
                    playerStats.inventory.keys.gold--; door.locked = false; worldState.unlockedDoors[door.id] = true; updateHUD();
                    spawnParticles(door.x + door.width/2, door.y + door.height/2, '#f1c40f', 30);
                    if (door.dest !== null) { 
                        worldState.openedDoors[door.id] = true; saveRoomState(); loadRoom(door.dest, door.face); player.x = door.spawnX; player.y = door.spawnY; roomChanged = true; 
                    }
                } else {
                    if (door.face === 'north') player.y = door.y + door.height; 
                    else if (door.face === 'south') player.y = door.y - player.size;
                    else if (door.face === 'east') player.x = door.x - player.size; 
                    else if (door.face === 'west') player.x = door.x + door.width;
                }
            } else if (door.dest !== null) { 
                worldState.openedDoors[door.id] = true; saveRoomState(); loadRoom(door.dest, door.face); player.x = door.spawnX; player.y = door.spawnY; roomChanged = true; 
            } 
        }
    });
    
    if (roomChanged) { requestAnimationFrame(update); return; }
    
    if ((keys['space'] || keys['0'] || keys['control']) && playerStats.mana >= 100) {
        if (typeof activateUltimate === 'function') activateUltimate(); 
        keys['space'] = false; keys['0'] = false; keys['control'] = false; 
    }
    
    if (leftClickHeld) {
        leftClickHoldTime++;
        if (leftClickHoldTime >= 180 && playerStats.mana >= 100) { 
            if (typeof activateUltimate === 'function') activateUltimate(); 
            leftClickHeld = false; 
        }
    }
    
    if (player.dashCooldown === undefined) player.dashCooldown = 0;
    if (player.dashCooldown > 0) player.dashCooldown--;
    if (isUltimateActive) {
        ultimateTimer--;
        if (ultimateTimer <= 0) isUltimateActive = false;
        if (player.heroClass === 'Knight' && ultimateTimer % 60 === 0) {
            playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + (playerStats.maxHealth * 0.1));
            updateHUD(); spawnParticles(player.x + player.size/2, player.y + player.size/2, '#2ecc71', 10);
        }
    }
    
    if (playerPoisonTimer > 0) {
        playerPoisonTimer--;
        if (playerPoisonTimer % 60 === 0 && playerStats.health > 1) {
            playerStats.health -= 5; if (playerStats.health < 1) playerStats.health = 1;
            updateHUD(); spawnParticles(player.x + player.size/2, player.y + player.size/2, '#8e44ad', 5);
        }
    }
    
    if (playerSlowTimer > 0) playerSlowTimer--;
    if (playerInvulnerableTimer > 0) playerInvulnerableTimer--;
    let manaBar = document.getElementById('mana-bar');
    if (playerStats.mana >= 100) { manaBar.style.opacity = Math.floor(Date.now() / 250) % 2 === 0 ? "1" : "0.3"; } else { manaBar.style.opacity = "1"; }
    
    let currentSpeedPlayer = playerSlowTimer > 0 ? player.speed / 2 : player.speed;
    let centerStairs = { x: canvas.width/2 - 75, y: canvas.height/2 - 75, width: 150, height: 150 };
    
    let dx_mov = 0; let dy_mov = 0;
    if (player.dashTimer > 0) {
        player.dashTimer--; dx_mov = player.dashVx; dy_mov = player.dashVy;
        if (player.dashTimer % 3 === 0) { spawnParticles(player.x + player.size/2, player.y + player.size/2, '#95a5a6', 2); }
    } else {
        if (keys['q'] || keys['a'] || keys['arrowleft'])  dx_mov -= currentSpeedPlayer;
        if (keys['d'] || keys['arrowright'])              dx_mov += currentSpeedPlayer;
        if (keys['z'] || keys['w'] || keys['arrowup'])    dy_mov -= currentSpeedPlayer;
        if (keys['s'] || keys['arrowdown'])               dy_mov += currentSpeedPlayer;
    }
    let oldPx = player.x; player.x += dx_mov;
    
    if (currentRoomId === 8 && checkCollision(player, centerStairs) && (!worldState.bossDefeated || playerStats.inventory.keys.skull <= 0)) { player.x = oldPx; player.dashTimer = 0; } 
    for (let i = 0; i < currentCrates.length; i++) {
        let obj = currentCrates[i];
        if ( (!obj.isBroken || obj.type === 'chest') && checkCollision(player, obj)) { player.x = oldPx; player.dashTimer = 0; break; }
    }
    let oldPy = player.y; player.y += dy_mov;
    
    if (currentRoomId === 8 && checkCollision(player, centerStairs) && (!worldState.bossDefeated || playerStats.inventory.keys.skull <= 0)) { player.y = oldPy; player.dashTimer = 0; } 
    for (let i = 0; i < currentCrates.length; i++) {
        let obj = currentCrates[i];
        if ( (!obj.isBroken || obj.type === 'chest') && checkCollision(player, obj)) { player.y = oldPy; player.dashTimer = 0; break; }
    }
    
    // LIMITES DE CORRIDOR
    let isVertCorridor = (currentRoomId === 5 || currentRoomId === 6);
    let bLeft = isVertCorridor ? 350 : wallMargin;
    let bRight = isVertCorridor ? canvas.width - 350 : canvas.width - wallMargin;
    let bTop = wallMargin;
    let bBot = canvas.height - wallMargin;

    let minLimitX = bLeft + arenaShrink; 
    let minLimitY = bTop + arenaShrink;
    let maxLimitX = bRight - arenaShrink - player.size;
    let maxLimitY = bBot - arenaShrink - player.size;
    if (player.x < minLimitX) player.x = minLimitX; if (player.y < minLimitY) player.y = minLimitY;
    if (player.x > maxLimitX) player.x = maxLimitX; if (player.y > maxLimitY) player.y = maxLimitY;
    
    if (currentRoomId === 1 && typeof bookshelf !== 'undefined' && player.x + player.size > bookshelf.x && player.y + player.size > bookshelf.y && player.y < bookshelf.y + bookshelf.height) {
        player.x = bookshelf.x - player.size;
    }
    if (player.dashTimer <= 0) {
        player.faceAngle = Math.atan2(mouse.y - (player.y + player.size / 2), mouse.x - (player.x + player.size / 2));
    }
    
    // --- RAMASSAGE DES OBJETS (ET PIÈCES) ---
    currentItems.forEach(item => {
        if (!item.collected && checkCollision(player, item)) {
            item.collected = true; worldState.collectedItems[item.id] = true; 
            if (item.type === 'key') playerStats.inventory.keys.gold++;
            else if (item.type === 'potion_green') playerStats.inventory.potions.green++;
            else if (item.type === 'key_skull') playerStats.inventory.keys.skull++; 
            else if (item.type === 'coin') { playerStats.inventory.coins++; localStorage.setItem('kebra_coins', playerStats.inventory.coins); }
            updateHUD(); spawnParticles(item.x, item.y, '#f1c40f', 15);
        }
    });

    if (attackCooldown > 0) attackCooldown--;
    if (player.heroClass === 'Knight' && attackCooldown < 25) isAttacking = false;
    let isElfInvuln = (isUltimateActive && player.heroClass === 'Elf' && !elfStealthBroken);
    
    // --- GESTION DES CAISSES ET COFFRES CASSÉS ---
    for (let i = 0; i < currentCrates.length; i++) {
        let crate = currentCrates[i];
        if (!crate.isBroken && crate.health <= 0) {
            crate.isBroken = true; 
            if (crate.type === 'chest') {
                worldState.openedChests[crate.id] = true;
                currentItems.push({ id: 'potion_chest_' + Date.now(), type: 'potion_green', x: crate.x + 30, y: crate.y + 40, size: 15, collected: false });
                currentItems.push({ id: 'coin_chest1_' + Date.now(), type: 'coin', x: crate.x + 40, y: crate.y + 10, size: 8, collected: false });
                currentItems.push({ id: 'coin_chest2_' + Date.now(), type: 'coin', x: crate.x + 10, y: crate.y + 40, size: 8, collected: false });
                spawnParticles(crate.x + crate.size/2, crate.y + crate.size/2, '#f1c40f', 30);
            } else {
                worldState.brokenCrates[crate.id] = true;
                currentItems.push({ id: 'coin_' + Date.now() + i, type: 'coin', x: crate.x + crate.size/2, y: crate.y + crate.size/2, size: 8, collected: false });
                spawnParticles(crate.x + crate.size/2, crate.y + crate.size/2, '#8B4513', 20);
            }
        }
    }
    
    // --- IA DES ENNEMIS ET COLLISIONS (BOSS RÉTABLIS !) ---
    currentEnemies.forEach((enemy) => {
        if (enemy.attackAnimTimer === undefined) enemy.attackAnimTimer = 0;
        if (enemy.blockAnimTimer === undefined) enemy.blockAnimTimer = 0;
        if (enemy.ultiAnimTimer === undefined) enemy.ultiAnimTimer = 0;
        if (enemy.dashTimer === undefined) { enemy.dashTimer = 180; enemy.isDashing = 0; }
        if (enemy.attackAnimTimer > 0) enemy.attackAnimTimer--;
        if (enemy.blockAnimTimer > 0) enemy.blockAnimTimer--;
        if (enemy.ultiAnimTimer > 0) enemy.ultiAnimTimer--; 
        
        enemy.wobble += 0.1; 
        let targetX = player.x; 
        let targetY = player.y; 
        let minDistToTarget = 9999;
        
        if (!isElfInvuln) minDistToTarget = Math.hypot(targetX - enemy.x, targetY - enemy.y);
        let dx = 0, dy = 0, dist = minDistToTarget; 
        if (dist !== 9999) { dx = targetX - enemy.x; dy = targetY - enemy.y; }
        
        let currentEnemySpeed = enemy.speed; 
        if (enemy.slowTimer > 0 || enemy.isPermanentlySlowed) currentEnemySpeed *= 0.5; 
        let dx_mov = 0, dy_mov = 0;

        // --- BOSS TROLL : DASH ENRAGÉ ---
        if (enemy.type === 'troll') {
            if (enemy.health <= enemy.maxHealth / 2) {
                currentEnemySpeed = enemy.speed * 1.8;
                if (enemy.dashTimer > 0) enemy.dashTimer--;
                if (enemy.dashTimer <= 0 && dist > 100) {
                    enemy.dashTimer = 180;
                    enemy.isDashing = 20;
                    let ang = Math.atan2(dy, dx);
                    enemy.dashVx = Math.cos(ang) * 12;
                    enemy.dashVy = Math.sin(ang) * 12;
                }
            }
        }

        // --- SQUELETTE : ATTAQUE A DISTANCE ---
        if (enemy.type === 'skeleton') {
            if (enemy.shootCooldown > 0) enemy.shootCooldown--;
            if (enemy.shootCooldown <= 0 && dist > 150 && dist < 600) {
                let ang = Math.atan2(dy, dx);
                enemyProjectiles.push({ type: 'bone', x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, vx: Math.cos(ang)*6, vy: Math.sin(ang)*6, size: 8, damage: 15 });
                enemy.shootCooldown = 120;
                enemy.attackAnimTimer = 20;
            }
        }

        // --- BOSS MAGE : INVOCATION ET BOULES DE FEU ---
        if (enemy.type === 'mage') {
            if (enemy.summonTimer > 0) enemy.summonTimer--;
            if (enemy.summonTimer <= 0) {
                spawnEnemy('skeleton', 2, enemy.x + 50, enemy.y + 50);
                enemy.summonTimer = 400;
                spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, '#9b59b6', 30);
            }
            if (enemy.shootCooldown > 0) enemy.shootCooldown--;
            if (enemy.shootCooldown <= 0) {
                let ang = Math.atan2(dy, dx);
                enemyProjectiles.push({ type: 'fire', x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, vx: Math.cos(ang)*7, vy: Math.sin(ang)*7, size: 12, damage: 25, color: '#e74c3c' });
                enemy.shootCooldown = (enemy.health <= enemy.maxHealth / 2) ? 60 : 120;
                enemy.attackAnimTimer = 20;
            }
        }

        // --- BOSS DRAGON : BOULES DE FEU ET MÉTÉORES ---
        if (enemy.type === 'dragon') {
            if (enemy.phase === undefined) enemy.phase = 1;
            if (enemy.health <= enemy.maxHealth / 2 && enemy.phase === 1) {
                enemy.phase = 2;
                enemy.invulnerable = true;
                enemy.phaseTimer = 30 * 60; // 30 sec invincible
            }
            if (enemy.phase === 2 && enemy.invulnerable) {
                enemy.phaseTimer--;
                if (enemy.phaseTimer <= 0) enemy.invulnerable = false;
                let rate = (enemy.phaseTimer < 15 * 60) ? 30 : 60; // s'accélère après 15s
                if (enemy.phaseTimer % rate === 0) {
                    hazards.push({
                        x: bLeft + arenaShrink + Math.random()*(bRight - bLeft - arenaShrink*2),
                        y: bTop + arenaShrink + Math.random()*(bBot - bTop - arenaShrink*2),
                        radius: 60, timer: 90, maxTimer: 90, type: 'meteor', damage: 40
                    });
                }
            } else {
                if (enemy.shootCooldown > 0) enemy.shootCooldown--;
                if (enemy.shootCooldown <= 0) {
                    let ang = Math.atan2(dy, dx);
                    for (let f = -2; f <= 2; f++) {
                        let fAng = ang + (f * 0.2);
                        enemyProjectiles.push({ type: 'fire', x: enemy.x + enemy.size/2, y: enemy.y + enemy.size/2, vx: Math.cos(fAng)*7, vy: Math.sin(fAng)*7, size: 15, color: '#c0392b', damage: 30 });
                    }
                    enemy.shootCooldown = 150;
                    enemy.attackAnimTimer = 20;
                }
            }
        }

        // --- GESTION BRULURE DE TES ATTAQUES ---
        if (enemy.isBurning) {
            enemy.burnTimer--;
            if (enemy.burnTimer <= 0 && enemy.burnTicks > 0) {
                enemy.health -= 15;
                enemy.burnTicks--;
                enemy.burnTimer = 30;
                spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, '#e67e22', 10);
            }
            if (enemy.burnTicks <= 0) enemy.isBurning = false;
        }

        if (enemy.type === 'skeleton') {
            if (dist < 400 && dist > 150) { dx_mov = 0; dy_mov = 0; }
            else if (dist <= 150) { dx_mov = -(dx / dist) * currentEnemySpeed; dy_mov = -(dy / dist) * currentEnemySpeed; }
            else { dx_mov = (dx / dist) * currentEnemySpeed; dy_mov = (dy / dist) * currentEnemySpeed; }
        } else {
            if (dist > 0 && dist < 9999) { dx_mov = (dx / dist) * currentEnemySpeed; dy_mov = (dy / dist) * currentEnemySpeed; }
        }

        if (enemy.isDashing > 0) { enemy.isDashing--; dx_mov = enemy.dashVx; dy_mov = enemy.dashVy; }
        
        let oldEx = enemy.x; enemy.x += dx_mov; 
        if (currentRoomId === 8 && checkCollision(enemy, centerStairs)) enemy.x = oldEx;
        for (let c = 0; c < currentCrates.length; c++) {
            let obj = currentCrates[c];
            if ((!obj.isBroken || obj.type === 'chest') && checkCollision(enemy, obj)) { enemy.x = oldEx; break; }
        }
        
        let oldEy = enemy.y; enemy.y += dy_mov; 
        if (currentRoomId === 8 && checkCollision(enemy, centerStairs)) enemy.y = oldEy;
        for (let c = 0; c < currentCrates.length; c++) {
            let obj = currentCrates[c];
            if ((!obj.isBroken || obj.type === 'chest') && checkCollision(enemy, obj)) { enemy.y = oldEy; break; }
        }
        
        let eMaxX = bRight - arenaShrink - enemy.size;
        let eMaxY = bBot - arenaShrink - enemy.size;
        let minLimitXE = bLeft + arenaShrink;
        let minLimitYE = bTop + arenaShrink;

        if (enemy.x < minLimitXE) enemy.x = minLimitXE; 
        if (enemy.y < minLimitYE) enemy.y = minLimitYE;
        if (enemy.x > eMaxX) enemy.x = eMaxX; 
        if (enemy.y > eMaxY) enemy.y = eMaxY;
        
        if (playerInvulnerableTimer <= 0 && !enemy.invulnerable && checkCollision(player, enemy) && !isElfInvuln) {
            playerStats.health -= 20; 
            triggerShake(12, 20); 
            spawnParticles(player.x + player.size/2, player.y + player.size/2, '#e74c3c', 25);
            playerInvulnerableTimer = 60; 
            updateHUD(); 
            if (playerStats.health <= 0 && typeof handlePlayerDeath === 'function') handlePlayerDeath();
        }
    });

    for (let i = currentEnemies.length - 1; i >= 0; i--) {
        if (currentEnemies[i].health <= 0) {
            let e = currentEnemies[i];
            
            // SANG OPAQUE
            if (!worldState.bloodStains[currentRoomId]) worldState.bloodStains[currentRoomId] = [];
            worldState.bloodStains[currentRoomId].push({x: e.x + e.size/2, y: e.y + e.size/2, r: 15 + Math.random() * 10});

            if (typeof necroKills !== 'undefined') necroKills.push(e.type);

            if (e.type === 'troll' && currentRoomId === 8 && !worldState.bossDefeated) {
                worldState.bossDefeated = true; 
                currentItems.push({ id: 'boss_key', type: 'key_skull', x: canvas.width/2 - 10, y: canvas.height/2 + 80, size: 20, collected: false });
                triggerShake(20, 30);
            }
            if (Math.random() < 0.3 && !['troll', 'mage', 'dragon'].includes(e.type)) {
                currentItems.push({ 
                    id: 'coin_en_' + Date.now() + i, type: 'coin', x: e.x + e.size/2, y: e.y + e.size/2, size: 8, collected: false 
                });
            }
            playerStats.mana = Math.min(100, playerStats.mana + 5); 
            spawnParticles(e.x + e.size/2, e.y + e.size/2, '#c0392b', 30);
            
            currentEnemies.splice(i, 1);
            if (currentEnemies.length === 0 && currentRoomId !== 999) {
                worldState.clearedRooms[currentRoomId] = true;
            }
            updateHUD();
        }
    }

    // --- GESTION DES PROJECTILES DU JOUEUR ---
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i]; 
        p.x += p.vx; 
        p.y += p.vy;
        
        if (currentRoomId === 8 && checkCollision({x: p.x - p.size, y: p.y - p.size, width: p.size*2, height: p.size*2}, centerStairs)) {
            projectiles.splice(i, 1); 
            continue; 
        }
        if (p.x < bLeft || p.y < bTop || p.x > bRight || p.y > bBot) { 
            projectiles.splice(i, 1); 
            continue; 
        }
        
        let projectileHit = false;
        let arrowHitbox = { x: p.x - p.size, y: p.y - p.size, size: p.size * 2 };
        for (let c = 0; c < currentCrates.length; c++) {
            let obj = currentCrates[c];
            if (!obj.isBroken && checkCollision(arrowHitbox, obj)) {
                obj.health -= 50;
                projectileHit = true;
                break;
            }
        }
        for (let j = 0; j < currentEnemies.length; j++) {
            let enemy = currentEnemies[j];
            if (p.hitTargets && p.hitTargets.includes(enemy)) continue;
            
            if (!projectileHit && checkCollision(arrowHitbox, enemy)) {
                if (!enemy.invulnerable) {
                    let isBlocked = false;
                    
                    if (enemy.type === 'goblin' && Math.random() < 0.15) {
                        isBlocked = true;
                        enemy.blockAnimTimer = 45; 
                        spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, '#bdc3c7', 15);
                    }
                    
                    if (!isBlocked) {
                        let dmg = 0;
                        if (player.heroClass === 'Elf') dmg = 60;
                        else if (player.heroClass === 'Mage') dmg = 30;
                        else if (player.heroClass === 'Necromancer') dmg = 30;
                        enemy.health -= dmg;

                        // FIX : LA BRÛLURE EST DE RETOUR ICI !!!
                        if (p.isFire) {
                            enemy.isBurning = true;
                            enemy.burnTicks = 5;
                            enemy.burnTimer = 30;
                        }
                    }
                }
                spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, enemy.color, 10);
                
                let isPiercingElf = (player.heroClass === 'Elf' && isUltimateActive);
                if (isPiercingElf || player.heroClass === 'Mage') {
                    if (!p.hitTargets) p.hitTargets = []; 
                    p.hitTargets.push(enemy); 
                } else { 
                    projectileHit = true; break; 
                } 
            }
        }
        if (projectileHit) projectiles.splice(i, 1); 
    }

    // --- GESTION DES MÉTÉORES DU DRAGON ---
    for (let i = hazards.length - 1; i >= 0; i--) {
        let h = hazards[i];
        h.timer--;
        if (h.timer <= 0) {
            if (h.type === 'meteor') {
                triggerShake(15, 10);
                spawnParticles(h.x, h.y, '#e74c3c', 40);
                if (playerInvulnerableTimer <= 0 && checkCollision(player, {x: h.x - h.radius, y: h.y - h.radius, width: h.radius*2, height: h.radius*2})) {
                    playerStats.health -= h.damage || 40;
                    playerInvulnerableTimer = 60;
                    triggerShake(20, 20);
                    updateHUD();
                    if (playerStats.health <= 0 && typeof handlePlayerDeath === 'function') handlePlayerDeath();
                }
            }
            hazards.splice(i, 1);
        }
    }

    if (currentRoomId === 8 && worldState && worldState.bossDefeated) {
        let triggerStairs = { x: canvas.width/2 - 45, y: canvas.height/2 - 45, width: 90, height: 90 };
        if (checkCollision(player, triggerStairs)) {
            if (playerStats.inventory.keys.skull > 0) {
                playerStats.inventory.keys.skull--; 
                setTimeout(() => { 
                    alert("FÉLICITATIONS !\n\nLa suite de l'aventure arrive très bientôt..."); 
                    window.location.reload(); 
                }, 100); 
                return;
            }
        }
    }
    renderGameView(); 
    requestAnimationFrame(update);
}

function loadRoom(roomId, entryFace = 'south') {
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
  
  // FIX: Salles entières sauf la 5 et 6 qui sont des couloirs verticaux !
  let isVertCorridor = (roomId === 5 || roomId === 6);
  let bTop = wallMargin;
  let bBot = 800 - wallMargin;
  let bLeft = wallMargin;
  let bRight = 1200 - wallMargin;

  if (isVertCorridor) {
      bLeft = 350;
      bRight = 1200 - 350;
  }

  const doorN = { x: 1200/2 - 75, y: bTop - wallMargin, width: 150, height: wallMargin, face: 'north' };
  const doorS = { x: 1200/2 - 75, y: bBot, width: 150, height: wallMargin, face: 'south' };
  const doorW = { x: bLeft - wallMargin, y: 800/2 - 75, width: wallMargin, height: 150, face: 'west' };
  const doorE = { x: bRight, y: 800/2 - 75, width: wallMargin, height: 150, face: 'east' };
  
  if (roomId === 1) { 
    currentDoors = [ { ...doorN, id: 'door_1_2', requiresKey: true, locked: !worldState.unlockedDoors['door_1_2'], dest: 2, spawnX: doorS.x, spawnY: doorS.y - 60 } ];
    currentItems = [];
    if (!worldState.collectedItems['key_tuto']) currentItems.push({ id: 'key_tuto', type: 'key', x: 800, y: 400, size: 20, collected: false });
    
    let isOpened = worldState.openedChests && worldState.openedChests['chest_1'];
    currentCrates.push({ 
        id: 'chest_1', type: 'chest', x: 250, y: 650, size: 60, 
        health: isOpened ? 0 : 1, opened: isOpened, isBroken: isOpened
    });
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
  else if (roomId === 5) { currentDoors = [ { ...doorS, id: 'door_5_3', dest: 3, spawnX: doorN.x, spawnY: doorN.y + wallMargin + 20 }, { ...doorN, id: 'door_5_7', dest: 7, spawnX: 1200/2 - 75, spawnY: doorS.y - 60 } ]; currentItems = []; }
  else if (roomId === 6) { currentDoors = [ { ...doorS, id: 'door_6_4', dest: 4, spawnX: doorN.x, spawnY: doorN.y + wallMargin + 20 }, { ...doorN, id: 'door_6_7', dest: 7, spawnX: 1200/2 - 75, spawnY: doorS.y - 60 } ]; currentItems = []; }
  else if (roomId === 7) { 
    currentDoors = [ { x: 200, y: 800 - wallMargin, width: 150, height: wallMargin, face: 'south', id: 'door_7_5', dest: 5, spawnX: doorN.x, spawnY: doorN.y + wallMargin + 20 }, { x: 800, y: 800 - wallMargin, width: 150, height: wallMargin, face: 'south', id: 'door_7_6', dest: 6, spawnX: doorN.x, spawnY: doorN.y + wallMargin + 20 } ];
    currentItems = [];
    if (!worldState.collectedItems['key_boss']) currentItems.push({ id: 'key_boss', type: 'key', x: 600, y: 400, size: 20, collected: false });
  }
  else if (roomId === 8) { currentDoors = [ { ...doorS, id: 'door_8_2', dest: 2, spawnX: doorN.x, spawnY: doorN.y + wallMargin + 20 } ]; currentItems = []; }
  
  if (!worldState.clearedRooms[roomId] || true) {
      if (roomId !== 1 && roomId !== 8 && roomId !== 999) {
          let broken0 = worldState.brokenCrates && worldState.brokenCrates[roomId + "_0"];
          currentCrates.push({ 
              id: roomId + "_0", type: 'barrel', x: bLeft + 50, y: bTop + 50, size: 45, 
              health: broken0 ? 0 : 30, isBroken: broken0 
          });
          
          let broken1 = worldState.brokenCrates && worldState.brokenCrates[roomId + "_1"];
          currentCrates.push({ 
              id: roomId + "_1", type: 'box', x: bRight - 90, y: bBot - 90, size: 45, 
              health: broken1 ? 0 : 30, isBroken: broken1 
          });
      }
  }
  currentEnemies = [];
  if (roomId !== 999) {
      if (worldState.enemyStates && worldState.enemyStates[roomId]) {
          currentEnemies = JSON.parse(JSON.stringify(worldState.enemyStates[roomId]));
      } else if (!worldState.clearedRooms[roomId]) {
          
          let spawnX = canvas.width / 2; 
          let spawnY = canvas.height / 2 - 20;
          
          if (roomId === 2 || roomId === 3) {
              if (entryFace === 'west') spawnX = 1200 - wallMargin - 100;
              else if (entryFace === 'east') spawnX = wallMargin + 100;
          }
          
          // FIX : SPAWNS DU MODE HISTOIRE
          if (roomId === 2) { spawnEnemy('goblin', 2, spawnX, spawnY); }
          else if (roomId === 3) { spawnEnemy('goblin', 2, spawnX, spawnY); }
          else if (roomId === 4) { spawnEnemy('goblin', 2, 800, 400); }
          else if (roomId === 5) { spawnEnemy('goblin', 2, 600, 400); }
          else if (roomId === 6) { spawnEnemy('goblin', 2, 600, 400); }
          else if (roomId === 7) { spawnEnemy('goblin', 4, 450, 200); spawnEnemy('skeleton', 1, 600, 300); }
          else if (roomId === 8) { spawnEnemy('troll', 1, 600, 300); } 
      }
  } else {
      currentDoors = []; currentItems = []; arenaShrink = 0; 
      player.x = canvas.width / 2 - player.size / 2; 
      player.y = canvas.height / 2 - player.size / 2;
  }
}

// FIX : RESTAURATION ULTIMATE & MORT
window.activateUltimate = function() {
    if (playerStats.mana < 100) return;

    if (player.heroClass === 'Necromancer') {
        if (typeof necroSummons !== 'undefined' && necroSummons.length > 0) {
            let totalHP = 0; necroSummons.forEach(s => totalHP += s.health);
            necroSummons = []; totalHP *= 2; 
            necroSummons.push({ type: 'fusion', x: player.x, y: player.y - 30, health: totalHP, maxHealth: totalHP, damage: 60, size: 60, speed: 4.5, attackCooldown: 0, invulnerableTimer: 180 }); 
            spawnParticles(player.x + player.size/2, player.y + player.size/2, '#f1c40f', 80, true);
        } else if (typeof necroKills !== 'undefined' && necroKills.length > 0) {
            necroKills.forEach(kill => {
                let sz = 30, hp = 40, dmg = 15, spd = 4.5;
                if(kill === 'troll') { hp = 200; sz = 60; dmg = 30; spd = 3.5; }
                else if(kill === 'mage') { hp = 100; sz = 45; dmg = 20; spd = 4; }
                else if(kill === 'dragon') { hp = 500; sz = 80; dmg = 50; spd = 3; }
                else if(kill === 'spider') { sz = 20; hp = 20; dmg = 10; spd = 6; }
                necroSummons.push({ type: kill, x: player.x + (Math.random()*80-40), y: player.y + (Math.random()*80-40), health: hp, maxHealth: hp, damage: dmg, size: sz, speed: spd, attackCooldown: 0, invulnerableTimer: 0 });
            });
            necroKills = []; 
            spawnParticles(player.x + player.size/2, player.y + player.size/2, '#2ecc71', 50, true);
        } else { return; }
    }
    
    isUltimateActive = true; playerStats.mana = 0; ultimateTimer = 600; elfStealthBroken = false; 
    
    if (player.heroClass === 'Knight') {
        playerInvulnerableTimer = 300; 
        spawnParticles(player.x + player.size/2, player.y + player.size/2, '#f1c40f', 50, true);
    } else if (player.heroClass === 'Elf') {
        spawnParticles(player.x + player.size/2, player.y + player.size/2, '#2ecc71', 50, true);
    } else if (player.heroClass === 'Mage') {
        currentEnemies.forEach(enemy => {
            let ultDmg = enemy.isBurning ? 100 : 50; 
            if (!enemy.invulnerable) { enemy.health -= ultDmg; enemy.ultiAnimTimer = 30; }
            enemy.isBurning = true; enemy.burnTicks = 10; enemy.burnTimer = 60;
            spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, '#e67e22', 30, true);
        });
    }
    triggerShake(12, 15); updateHUD();
};

window.handlePlayerDeath = function() {
    gameState = "GAMEOVER"; 
    setTimeout(() => {
        gameState = "MENU"; isArenaMode = false; isUltimateActive = false;
        currentEnemies = []; bloodStains = []; projectiles = []; enemyProjectiles = []; hazards = []; particles = [];
        shakeTimer = 0; shakeIntensity = 0; playerPoisonTimer = 0; playerSlowTimer = 0; arenaShrink = 0; 
        spaceHoldTimer = 0; waveStartDelay = 0;
        if (typeof necroKills !== 'undefined') necroKills = []; 
        if (typeof necroSummons !== 'undefined') necroSummons = [];
        
        worldState = { unlockedDoors: {}, openedDoors: {}, collectedItems: {}, clearedRooms: {}, bloodStains: {}, enemyStates: {}, visitedRooms: {}, brokenCrates: {}, openedChests: {}, bossDefeated: false }; 
        playerStats.inventory = { keys: { gold: 0, skull: 0, orb: 0 }, potions: { green: 0, yellow: 0, blue: 0, red: 0 }, coins: parseInt(localStorage.getItem('kebra_coins')) || 0 };
        
        let menuScreen = document.getElementById('menu-screen'); if (menuScreen) menuScreen.style.display = 'flex';
        let audioUi = document.getElementById('audio-ui'); if (audioUi) audioUi.style.display = 'flex';
        
        playerStats.health = playerStats.maxHealth; playerStats.mana = 0; updateHUD();
    }, 3000); 
};

update();
