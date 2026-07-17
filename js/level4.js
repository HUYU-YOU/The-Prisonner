window.level4State = {
    isInit: false,
    hasStarted: false,
    imgLoaded: false,
    scrollSpeed: 6,
    distance: 0,
    maxDistance: 15000, 
    segments: [],
    traps: [], 
    trapSpawnTimer: 0, 
    dangerY: -400,
    isFinished: false,
    corridorW: 750, 
    segH: 1200,      

    init: function() {
        this.isInit = true;
        this.hasStarted = false;
        this.imgLoaded = false;
        this.distance = 0;
        
        this.corridorW = 750; 
        this.segH = 1200;     
        
        this.segments = [
            { id: 'OPFLOOR21', y: 0 },
            { id: 'OPFLOOR22', y: this.segH }
        ];
        this.traps = [];
        this.trapSpawnTimer = 0;
        this.dangerY = -400; 
        this.isFinished = false;

        // ANTI-NAN & POSITIONNEMENT NORD
        let pSize = (player && typeof player.size === 'number' && !isNaN(player.size)) ? player.size : 40;
        player.size = pSize;
        player.x = (canvas.width / 2) - (pSize / 2);
        player.y = canvas.height * 0.15; // Pop au Nord (haut de l'écran)
        player.faceAngle = Math.PI / 2;  // Regarde vers le Sud
        player.dashTimer = 0;
    },

    update: function() {
        if (!this.isInit) this.init();
        
        // Sécurité anti-NaN en boucle continue
        let pSize = (player && typeof player.size === 'number' && !isNaN(player.size)) ? player.size : 40;
        if (isNaN(player.x) || player.x === undefined) player.x = (canvas.width / 2) - (pSize / 2);
        if (isNaN(player.y) || player.y === undefined) player.y = canvas.height * 0.15;

        // ADAPTATION DYNAMIQUE À LA VRAIE TAILLE DE L'IMAGE
        if (!this.imgLoaded) {
            let floorImg = typeof assetsManager !== 'undefined' ? assetsManager.images['OPFLOOR21'] : null;
            if (floorImg && floorImg.complete && floorImg.naturalWidth > 0) {
                this.corridorW = floorImg.naturalWidth;
                this.segH = floorImg.naturalHeight;
                if (this.segments.length > 1) {
                    this.segments[1].y = this.segments[0].y + this.segH;
                }
                this.imgLoaded = true;
            }
        }
        
        if (!this.hasStarted) {
            if (keys['z'] || keys['w'] || keys['s'] || keys['q'] || keys['a'] || keys['d'] || keys['arrowup'] || keys['arrowdown'] || keys['arrowleft'] || keys['arrowright']) {
                this.hasStarted = true;
            } else {
                return; 
            }
        }
        
        // Orientation dynamique selon la fuite
        if (keys['s'] || keys['arrowdown']) player.faceAngle = Math.PI / 2;
        if (keys['z'] || keys['w'] || keys['arrowup']) player.faceAngle = -Math.PI / 2;
        if (keys['q'] || keys['a'] || keys['arrowleft']) player.faceAngle = Math.PI;
        if (keys['d'] || keys['arrowright']) player.faceAngle = 0;

        if (player.dashTimer > 0) player.dashTimer--;
        if (player.dashCooldown > 0) player.dashCooldown--;

        let currentSpeed = this.scrollSpeed;
        if (keys['s'] || keys['arrowdown']) currentSpeed = this.scrollSpeed * 1.5;
        if (keys['z'] || keys['w'] || keys['arrowup']) currentSpeed = this.scrollSpeed * 0.6;
        
        this.distance += currentSpeed;

        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].y -= currentSpeed;
        }

        if (this.segments[0] && this.segments[0].y <= -this.segH) {
            this.segments.shift();
        }

        let lastSegment = this.segments[this.segments.length - 1];
        if (lastSegment && lastSegment.y <= canvas.height - this.segH) {
            let nextId = 'OPFLOOR22'; 
            
            if (this.distance >= this.maxDistance) {
                nextId = 'OPFLOOR25'; 
                this.isFinished = true;
            } else if (this.distance > 1000) {
                let rand = Math.random();
                if (rand < 0.3) nextId = 'OPFLOOR23';
                else if (rand < 0.6) nextId = 'OPFLOOR24';
            }

            if (!this.isFinished || nextId === 'OPFLOOR25') {
                this.segments.push({ id: nextId, y: lastSegment.y + this.segH });
            }
        }

        let corridorX = (canvas.width - this.corridorW) / 2;
        let margin = this.corridorW * 0.22; 

        if (!this.isFinished && this.distance > 500) {
            this.trapSpawnTimer--;
            if (this.trapSpawnTimer <= 0) {
                let tWidth = 80 + Math.random() * 60;
                let tHeight = 80 + Math.random() * 60;
                
                let trapX = corridorX + margin + Math.random() * (this.corridorW - margin * 2 - tWidth);
                let trapTypes = ['hole', 'spikes', 'rock'];
                let tType = trapTypes[Math.floor(Math.random() * trapTypes.length)];
                
                this.traps.push({
                    type: tType,
                    x: trapX,
                    y: canvas.height + 100,
                    width: tWidth,
                    height: tHeight,
                    hitCooldown: 0
                });
                
                this.trapSpawnTimer = Math.max(25, 80 - (this.distance / this.maxDistance) * 50);
            }
        }

        let baseSpeed = (player && typeof player.speed === 'number' && !isNaN(player.speed)) ? player.speed : 4;
        let pSpeed = player.dashTimer > 0 ? baseSpeed * 2.2 : baseSpeed * 1.4;
        
        let oldPx = player.x;
        let oldPy = player.y;

        if (keys['q'] || keys['a'] || keys['arrowleft']) player.x -= pSpeed;
        if (keys['d'] || keys['arrowright']) player.x += pSpeed;
        if (keys['z'] || keys['w'] || keys['arrowup']) player.y -= pSpeed;
        if (keys['s'] || keys['arrowdown']) player.y += pSpeed;

        for (let i = this.traps.length - 1; i >= 0; i--) {
            let trap = this.traps[i];
            trap.y -= currentSpeed;
            if (trap.hitCooldown > 0) trap.hitCooldown--;

            let isColliding = false;
            if (typeof window.checkCollision === 'function') {
                isColliding = window.checkCollision(player, trap);
            }

            if (isColliding) {
                if (trap.type === 'rock') {
                    player.x = oldPx;
                    player.y = oldPy;
                    player.y -= currentSpeed; 
                } 
                else if (trap.type === 'hole') {
                    if (player.dashTimer <= 0 && trap.hitCooldown <= 0) {
                        playerStats.health -= 15;
                        trap.hitCooldown = 60; 
                        player.y -= 40; 
                        if (typeof window.updateHUD === 'function') window.updateHUD();
                    }
                }
                else if (trap.type === 'spikes') {
                    if (trap.hitCooldown <= 0 && (typeof playerInvulnerableTimer === 'undefined' || playerInvulnerableTimer <= 0)) {
                        playerStats.health -= 10;
                        trap.hitCooldown = 40;
                        if (typeof playerInvulnerableTimer !== 'undefined') playerInvulnerableTimer = 30;
                        if (typeof window.updateHUD === 'function') window.updateHUD();
                    }
                }
            }

            if (trap.y < -300) {
                this.traps.splice(i, 1);
            }
        }

        if (player.x < corridorX + margin) player.x = corridorX + margin;
        if (player.x > corridorX + this.corridorW - margin - pSize) player.x = corridorX + this.corridorW - margin - pSize;
        
        if (player.y < this.dangerY + 30) player.y = this.dangerY + 30; 
        if (player.y > canvas.height - pSize - 20) player.y = canvas.height - pSize - 20;

        this.dangerY += (currentSpeed * 0.55); 
        
        if (this.dangerY > player.y - 15) {
            playerStats.health -= 2; 
            if (typeof window.updateHUD === 'function') window.updateHUD();
            if (playerStats.health <= 0 && typeof window.handlePlayerDeath === 'function') window.handlePlayerDeath();
        } else if (this.dangerY < -400) {
            this.dangerY = -400; 
        }
        
        if (keys['z'] || keys['w'] || keys['arrowup']) this.dangerY += 0.5; 
    }
};

window.updateLevel4 = function() {
    if (gameState !== "PLAYING") return;
    window.level4State.update();
    if (typeof window.renderLevel4 === 'function') window.renderLevel4();
};

window.renderLevel4 = function() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let corridorX = (canvas.width - window.level4State.corridorW) / 2;
    let pSize = (player && typeof player.size === 'number' && !isNaN(player.size)) ? player.size : 40;

    // 1. Fond du couloir
    window.level4State.segments.forEach(seg => {
        let img = assetsManager.images[seg.id];
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, corridorX, seg.y, window.level4State.corridorW, window.level4State.segH);
        } else {
            ctx.fillStyle = '#1a1511';
            ctx.fillRect(corridorX, seg.y, window.level4State.corridorW, window.level4State.segH);
            ctx.strokeStyle = '#2c251f'; ctx.lineWidth = 1; 
            for(let i = 0; i < window.level4State.corridorW; i += 60) { 
                for(let j = 0; j < window.level4State.segH; j += 60) { 
                    ctx.strokeRect(corridorX + i, seg.y + j, 60, 60); 
                }
            } 
        }
    });

    // 2. Murs pleins sur les côtés pour encadrer le couloir
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, corridorX, canvas.height);
    ctx.fillRect(corridorX + window.level4State.corridorW, 0, canvas.width - (corridorX + window.level4State.corridorW), canvas.height);

    // 3. Pièges
    window.level4State.traps.forEach(trap => {
        let imgKey = '';
        if (trap.type === 'hole') imgKey = 'trap_hole';
        else if (trap.type === 'spikes') imgKey = 'trap_spikes';
        else if (trap.type === 'rock') imgKey = 'trap_rock';

        let tImg = typeof window.getAsset === 'function' ? window.getAsset(imgKey) : assetsManager.images[imgKey];
        
        if (tImg && tImg.complete && tImg.naturalWidth > 0) {
            ctx.drawImage(tImg, trap.x, trap.y, trap.width, trap.height);
        } else {
            if (trap.type === 'hole') ctx.fillStyle = '#0a0a0a';
            else if (trap.type === 'spikes') ctx.fillStyle = '#7f8c8d';
            else if (trap.type === 'rock') ctx.fillStyle = '#34495e';
            
            ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
            
            if (trap.type === 'spikes') {
                ctx.fillStyle = '#c0392b';
                ctx.beginPath(); 
                ctx.arc(trap.x + trap.width/2, trap.y + trap.height/2, trap.width/4, 0, Math.PI*2); 
                ctx.fill();
            } else if (trap.type === 'rock') {
                ctx.strokeStyle = '#2c3e50';
                ctx.lineWidth = 4;
                ctx.strokeRect(trap.x, trap.y, trap.width, trap.height);
            }
        }
    });

    // 4. Joueur (Sécurisé à 100%)
    let px = isNaN(player.x) ? (canvas.width/2 - pSize/2) : player.x;
    let py = isNaN(player.y) ? (canvas.height*0.15) : player.y;

    ctx.save();
    ctx.translate(px + pSize/2, py + pSize/2);
    
    let drawPlayer = true;
    if (typeof playerInvulnerableTimer !== 'undefined' && playerInvulnerableTimer > 0 && Math.floor(playerInvulnerableTimer / 5) % 2 === 0) drawPlayer = false; 
    
    if (drawPlayer) {
        if (player.dashTimer > 0) ctx.globalAlpha = 0.5;
        
        let angle = player.faceAngle || (Math.PI/2);
        let deg = angle * 180 / Math.PI;
        while(deg < 0) deg += 360;
        deg = deg % 360;
        let dir = 'south';
        if (deg >= 45 && deg < 135) dir = 'south';
        else if (deg >= 135 && deg < 225) dir = 'west';
        else if (deg >= 225 && deg < 315) dir = 'north';
        else dir = 'east';

        let pPrefix = player.heroClass ? player.heroClass : 'Knight';
        if (pPrefix === 'Mage') pPrefix = 'Burned';
        else pPrefix = pPrefix.charAt(0).toUpperCase() + pPrefix.slice(1).toLowerCase();
        
        let skin1 = pPrefix + '_' + dir + '_view';
        let skin2 = skin1.toLowerCase();
        
        let img = null;
        if (typeof window.getAsset === 'function') {
            img = window.getAsset(skin1) || window.getAsset(skin2);
        } else if (assetsManager && assetsManager.images) {
            img = assetsManager.images[skin1] || assetsManager.images[skin2];
        }
        
        if (img && img.complete && img.naturalWidth > 0) {
            let s = pSize * 3.75;
            if (player.heroClass === 'Elf') s = pSize * 1.875;
            ctx.drawImage(img, -s/2, -s/2, s, s);
        } else {
            ctx.fillStyle = '#2ecc71';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0,0, pSize/2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        }
    }
    ctx.restore();

    // 5. Mur de la mort (Fumée)
    if (window.level4State.dangerY > 0) {
        ctx.fillStyle = 'rgba(10, 5, 5, 0.95)';
        ctx.fillRect(corridorX, 0, window.level4State.corridorW, window.level4State.dangerY);
        
        ctx.shadowColor = '#e74c3c';
        ctx.shadowBlur = 40;
        ctx.fillStyle = '#8a0303';
        for (let i = corridorX; i < corridorX + window.level4State.corridorW; i += 60) {
            ctx.beginPath();
            ctx.arc(i + 30, window.level4State.dangerY, 30 + Math.random() * 20, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }

    // 6. UI
    let distPercent = Math.min(1, window.level4State.distance / window.level4State.maxDistance);
    let barW = 500;
    ctx.fillStyle = '#111'; ctx.fillRect(canvas.width/2 - barW/2, 20, barW, 20);
    ctx.fillStyle = '#e67e22'; ctx.fillRect(canvas.width/2 - barW/2 + 2, 22, (barW - 4) * distPercent, 16);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
    ctx.fillText("FUITE : " + Math.floor(distPercent * 100) + "%", canvas.width/2, 36);
    ctx.textAlign = 'left';

    if (!window.level4State.hasStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, canvas.height/2 - 70, canvas.width, 140);
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("LE CHÂTEAU S'EFFONDRE !", canvas.width/2, canvas.height/2 - 10);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText("Déplacez-vous vers le sud (bas) pour fuir !", canvas.width/2, canvas.height/2 + 35);
        ctx.textAlign = 'left';
    }
};
