window.level4State = {
    isInit: false,
    hasStarted: false,
    scrollSpeed: 6,
    distance: 0,
    maxDistance: 15000, 
    segments: [],
    traps: [], 
    trapSpawnTimer: 0, 
    dangerY: -300,
    isFinished: false,

    init: function() {
        this.isInit = true;
        this.hasStarted = false;
        this.distance = 0;
        this.segments = [
            { id: 'floor21', y: 0 },
            { id: 'floor22', y: canvas.height } // Précharge le 2eme pour éviter le trou noir
        ];
        this.traps = [];
        this.trapSpawnTimer = 0;
        this.dangerY = -300; // Recule le mur rouge au départ
        this.isFinished = false;

        player.x = canvas.width / 2 - player.size / 2;
        player.y = canvas.height * 0.25;
        player.dashTimer = 0;
    },

    update: function() {
        if (!this.isInit) this.init();
        
        // --- NOUVEAU : On attend que tu bouges pour lancer l'enfer ---
        if (!this.hasStarted) {
            if (keys['z'] || keys['w'] || keys['s'] || keys['q'] || keys['a'] || keys['d'] || keys['arrowup'] || keys['arrowdown'] || keys['arrowleft'] || keys['arrowright']) {
                this.hasStarted = true;
            } else {
                return; // Bloque l'update tant que tu es immobile
            }
        }
        
        if (player.dashTimer > 0) player.dashTimer--;
        if (player.dashCooldown > 0) player.dashCooldown--;

        let currentSpeed = this.scrollSpeed;
        if (keys['s'] || keys['arrowdown']) currentSpeed = this.scrollSpeed * 1.5;
        if (keys['z'] || keys['w'] || keys['arrowup']) currentSpeed = this.scrollSpeed * 0.6;
        
        this.distance += currentSpeed;

        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].y -= currentSpeed;
        }

        if (this.segments[0] && this.segments[0].y <= -canvas.height) {
            this.segments.shift();
        }

        let lastSegment = this.segments[this.segments.length - 1];
        if (lastSegment && lastSegment.y <= 0) {
            let nextId = 'floor22'; 
            
            if (this.distance >= this.maxDistance) {
                nextId = 'floor25'; 
                this.isFinished = true;
            } else if (this.distance > 1000) {
                let rand = Math.random();
                if (rand < 0.3) nextId = 'floor23';
                else if (rand < 0.6) nextId = 'floor24';
            }

            if (!this.isFinished || nextId === 'floor25') {
                this.segments.push({ id: nextId, y: lastSegment.y + canvas.height });
            }
        }

        if (!this.isFinished && this.distance > 500) {
            this.trapSpawnTimer--;
            if (this.trapSpawnTimer <= 0) {
                let margin = 100;
                let trapX = margin + Math.random() * (canvas.width - margin * 2 - 80);
                let trapTypes = ['hole', 'spikes', 'rock'];
                let tType = trapTypes[Math.floor(Math.random() * trapTypes.length)];
                
                let tWidth = 80 + Math.random() * 60;
                let tHeight = 80 + Math.random() * 60;
                
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

        let pSpeed = player.dashTimer > 0 ? player.speed * 2 : player.speed;
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

        let margin = 80; 
        if (player.x < margin) player.x = margin;
        if (player.x > canvas.width - margin - player.size) player.x = canvas.width - margin - player.size;
        
        if (player.y < this.dangerY + 30) player.y = this.dangerY + 30; 
        if (player.y > canvas.height - player.size - 20) player.y = canvas.height - player.size - 20;

        this.dangerY += (currentSpeed * 0.92); 
        
        if (this.dangerY > player.y - 15) {
            playerStats.health -= 2; 
            if (typeof window.updateHUD === 'function') window.updateHUD();
            if (playerStats.health <= 0 && typeof window.handlePlayerDeath === 'function') window.handlePlayerDeath();
        } else if (this.dangerY < -300) {
            this.dangerY = -300; 
        }
        
        if (keys['z'] || keys['w'] || keys['arrowup']) this.dangerY += 2; 
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
    
    window.level4State.segments.forEach(seg => {
        let img = assetsManager.images[seg.id];
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, 0, seg.y, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#2c251f';
            ctx.fillRect(0, seg.y, canvas.width, canvas.height);
            // Grille de secours visuelle pour comprendre le mouvement
            ctx.strokeStyle = '#3d342c'; ctx.lineWidth = 1; 
            for(let i = 0; i < canvas.width; i += 60) { 
                for(let j = 0; j < canvas.height; j += 60) { ctx.strokeRect(i, seg.y + j, 60, 60); }
            } 
        }
    });

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

    ctx.save();
    ctx.translate(player.x + player.size/2, player.y + player.size/2);
    
    let drawPlayer = true;
    if (typeof playerInvulnerableTimer !== 'undefined' && playerInvulnerableTimer > 0 && Math.floor(playerInvulnerableTimer / 5) % 2 === 0) drawPlayer = false; 
    
    if (drawPlayer) {
        if (player.dashTimer > 0) ctx.globalAlpha = 0.5;
        let dir = typeof window.getDirectionName === 'function' ? window.getDirectionName(player.faceAngle || Math.PI/2) : 'south'; 
        let pPrefix = player.heroClass ? player.heroClass : 'Knight';
        if (pPrefix === 'Mage') pPrefix = 'Burned';
        else pPrefix = pPrefix.charAt(0).toUpperCase() + pPrefix.slice(1).toLowerCase();
        
        let skin = pPrefix + '_' + dir + '_view';
        let img = typeof window.getAsset === 'function' ? window.getAsset(skin) : assetsManager.images[skin];
        
        if (img && img.complete && img.naturalWidth > 0) {
            let s = player.size * 3.75;
            if (player.heroClass === 'Elf') s = player.size * 1.875;
            ctx.drawImage(img, -s/2, -s/2, s, s);
        } else {
            ctx.fillStyle = '#2ecc71';
            ctx.beginPath(); ctx.arc(0,0, player.size/2, 0, Math.PI*2); ctx.fill();
        }
    }
    ctx.restore();

    ctx.fillStyle = 'rgba(10, 5, 5, 0.95)';
    ctx.fillRect(0, 0, canvas.width, window.level4State.dangerY);
    
    ctx.shadowColor = '#e74c3c';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#8a0303';
    for (let i = 0; i < canvas.width; i += 60) {
        ctx.beginPath();
        ctx.arc(i + 30, window.level4State.dangerY, 30 + Math.random() * 20, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;

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
        ctx.fillText("Déplacez-vous pour commencer à fuir !", canvas.width/2, canvas.height/2 + 35);
        ctx.textAlign = 'left';
    }
};
