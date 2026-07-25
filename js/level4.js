// ============================================================================
// js/level4.js - LOGIQUE ET RENDU DU NIVEAU 4 (COURSE D'OBSTACLES)
// ============================================================================
window.level4State = {
    isInit: false,
    hasStarted: false,
    imgLoaded: false,
    scrollSpeed: 4.5, 
    distance: 0,
    sequence: ['OPFLOOR21', 'OPFLOOR22', 'OPFLOOR23', 'OPFLOOR24', 'OPFLOOR22', 'OPFLOOR23', 'OPFLOOR24', 'OPFLOOR25'],
    currentSeqIndex: 0,
    segments: [],
    traps: [], 
    trapSpawnTimer: 0, 
    dangerY: 0,
    scrollingStopped: false,
    portalSpawned: false,
    corridorW: 750, 
    segH: 1200,      
    cinematicPlayed: false,

    // Initialisation du niveau
    init: function() {
        this.isInit = true;
        this.hasStarted = false;
        this.imgLoaded = false;
        this.distance = 0;
        this.currentSeqIndex = 0;
        this.scrollingStopped = false;
        this.portalSpawned = false;
        
        this.corridorW = 750; 
        this.segH = 1200;      
        
        this.segments = [
            { id: this.sequence[0], y: canvas.height - this.segH } 
        ];
        this.traps = [];
        this.trapSpawnTimer = 0;
        
        this.dangerY = canvas.height + 300; 

        // --- RÈGLE SPÉCIALE CHEVALIER : PAS D'EFFONDREMENT ---
        if (player.heroClass === 'Knight') {
            if (!this.cinematicPlayed) {
                this.cinematicPlayed = true;
                if (typeof window.playCinematic === 'function') {
                    window.playCinematic('knight3.mp4', function() {
                        if (typeof window.loadRoom === 'function') window.loadRoom(302, 'south');
                        player.x = canvas.width / 2 - player.size / 2;
                        player.y = canvas.height - 150;
                    });
                } else {
                    if (typeof window.loadRoom === 'function') window.loadRoom(302, 'south');
                }
            }
            return;
        }

        // --- SPAWN SÉCURISÉ PLUS HAUT (HORS DE LA FUMÉE) ---
        let pSize = (player && typeof player.size === 'number' && !isNaN(player.size)) ? player.size : 40;
        player.size = pSize;
        player.x = (canvas.width / 2) - (pSize / 2);
        player.y = canvas.height * 0.4; // Placé plus haut sur l'écran
        player.faceAngle = -Math.PI / 2; 
        player.dashTimer = 0;

        // Déclenchement de la Cinématique 3 au lancement
        if (!this.cinematicPlayed) {
            this.cinematicPlayed = true;
            let pPrefix = player.heroClass ? player.heroClass.toLowerCase() : 'knight';
            if (pPrefix === 'mage') pPrefix = 'burned';
            if (pPrefix === 'necromancer') pPrefix = 'necro';
            
            if (typeof window.playCinematic === 'function') {
                window.playCinematic(pPrefix + '3.mp4', function() {
                    gameState = "PLAYING";
                });
            }
        }
    },

    // Réinitialisation après la mort
    reset: function() {
        this.isInit = false;
        this.cinematicPlayed = false;
        this.hasStarted = false;
        this.distance = 0;
        this.currentSeqIndex = 0;
        this.scrollingStopped = false;
        this.portalSpawned = false;
        this.traps = [];
    },

    // Moteur du niveau
    update: function() {
        if (!this.isInit) this.init();
        
        // --- SÉCURITÉ SPAWN ---
        let pSize = (player && typeof player.size === 'number' && !isNaN(player.size)) ? player.size : 40;
        if (isNaN(player.x) || player.x === undefined) player.x = (canvas.width / 2) - (pSize / 2);
        if (isNaN(player.y) || player.y === undefined) player.y = canvas.height * 0.4;

        // Auto-adaptation aux vrais pixels de l'image
        if (!this.imgLoaded) {
            let floorImg = typeof assetsManager !== 'undefined' ? assetsManager.images['OPFLOOR21'] : null;
            if (floorImg && floorImg.complete && floorImg.naturalWidth > 0) {
                this.corridorW = floorImg.naturalWidth;
                this.segH = floorImg.naturalHeight;
                this.segments[0].y = canvas.height - this.segH; 
                this.imgLoaded = true;
            }
        }
        
        // Attente de démarrage du mouvement
        if (!this.hasStarted) {
            if (keys['z'] || keys['w'] || keys['s'] || keys['q'] || keys['a'] || keys['d'] || keys['arrowup'] || keys['arrowdown'] || keys['arrowleft'] || keys['arrowright']) {
                this.hasStarted = true;
            } else {
                return; 
            }
        }
        
        // Direction du joueur
        if (keys['s'] || keys['arrowdown']) player.faceAngle = Math.PI / 2;
        if (keys['z'] || keys['w'] || keys['arrowup']) player.faceAngle = -Math.PI / 2;
        if (keys['q'] || keys['a'] || keys['arrowleft']) player.faceAngle = Math.PI;
        if (keys['d'] || keys['arrowright']) player.faceAngle = 0;

        if (player.dashTimer > 0) player.dashTimer--;
        if (player.dashCooldown > 0) player.dashCooldown--;

        let currentSpeed = 0;
        this.scrollSpeed = 4.5; // RALENTISSEMENT GLOBAL
        
        // Gestion du défilement de la map
        if (!this.scrollingStopped) {
            currentSpeed = this.scrollSpeed;
            if (keys['z'] || keys['w'] || keys['arrowup']) currentSpeed = this.scrollSpeed * 1.5;
            if (keys['s'] || keys['arrowdown']) currentSpeed = this.scrollSpeed * 0.7;
            
            this.distance += currentSpeed;

            for (let i = 0; i < this.segments.length; i++) {
                this.segments[i].y += currentSpeed;
            }

            let firstSegment = this.segments[0];
            if (firstSegment.y > -canvas.height && this.currentSeqIndex < this.sequence.length - 1) {
                this.currentSeqIndex++;
                this.segments.unshift({ id: this.sequence[this.currentSeqIndex], y: firstSegment.y - this.segH });
            }

            let lastSegment = this.segments[this.segments.length - 1];
            if (lastSegment.y > canvas.height) {
                this.segments.pop();
            }

            // Arrivée sur la map 25
            if (this.currentSeqIndex === this.sequence.length - 1) {
                if (this.segments[0].y >= 0) {
                    let diff = this.segments[0].y; 
                    for (let i = 0; i < this.segments.length; i++) this.segments[i].y -= diff; 
                    this.scrollingStopped = true;
                    this.portalSpawned = true;
                }
            }
        }

        let corridorX = (canvas.width - this.corridorW) / 2;
        let margin = this.corridorW * 0.22; 

        // Génération dynamique des pièges
        if (!this.scrollingStopped) {
            this.trapSpawnTimer--;
            if (this.trapSpawnTimer <= 0) {
                let tWidth = 80 + Math.random() * 60;
                let tHeight = 80 + Math.random() * 60;
                
                let trapX = corridorX + margin + Math.random() * (this.corridorW - margin * 2 - tWidth);
                let trapTypes = ['hole_block', 'hole_death', 'spikes', 'caisse'];
                let tType = trapTypes[Math.floor(Math.random() * trapTypes.length)];
                
                this.traps.push({
                    type: tType,
                    x: trapX,
                    y: -200, 
                    width: tWidth,
                    height: tHeight,
                    hitCooldown: 0,
                    stateTimer: Math.random() * 60,
                    isActive: false
                });
                
                let progress = this.currentSeqIndex / this.sequence.length;
                this.trapSpawnTimer = Math.max(50, 110 - (progress * 40));
            }
        }

        // Gestion du mouvement des Pièges
        for (let i = this.traps.length - 1; i >= 0; i--) {
            let trap = this.traps[i];
            trap.y += currentSpeed; 
            if (trap.hitCooldown > 0) trap.hitCooldown--;

            if (trap.type === 'spikes') {
                trap.stateTimer++;
                if (trap.stateTimer > 50) {
                    trap.isActive = !trap.isActive;
                    trap.stateTimer = 0;
                }
            }
            if (trap.y > canvas.height + 200) {
                this.traps.splice(i, 1);
            }
        }

        // --- DÉPLACEMENTS JOUEUR & COLLISIONS "GLISSANTES" ---
        let baseSpeed = (player && typeof player.speed === 'number' && !isNaN(player.speed)) ? player.speed : 4;
        let pSpeed = player.dashTimer > 0 ? baseSpeed * 2.2 : baseSpeed * 1.4;
        
        if (typeof window.playerSlowTimer !== 'undefined' && window.playerSlowTimer > 0) {
            pSpeed *= 0.5;
        }

        // 1. Déplacement sur l'axe X (Latéral)
        let oldPx = player.x;
        if (keys['q'] || keys['a'] || keys['arrowleft']) player.x -= pSpeed;
        if (keys['d'] || keys['arrowright']) player.x += pSpeed;

        for (let trap of this.traps) {
            if (typeof window.checkCollision === 'function' && window.checkCollision(player, trap)) {
                if (trap.type === 'caisse' || (trap.type === 'hole_block' && player.dashTimer <= 0)) {
                    player.x = oldPx; 
                    break;
                }
            }
        }

        // 2. Déplacement sur l'axe Y (Vertical)
        let oldPy = player.y;
        if (keys['z'] || keys['w'] || keys['arrowup']) player.y -= pSpeed;
        if (keys['s'] || keys['arrowdown']) player.y += pSpeed;

        for (let trap of this.traps) {
            if (typeof window.checkCollision === 'function' && window.checkCollision(player, trap)) {
                if (trap.type === 'caisse' || (trap.type === 'hole_block' && player.dashTimer <= 0)) {
                    player.y = oldPy; 
                    player.y += currentSpeed; 
                    break;
                }
                else if (trap.type === 'hole_death') {
                    if (player.dashTimer <= 0) {
                        playerStats.health = 0; 
                        if (typeof window.updateHUD === 'function') window.updateHUD();
                        if (typeof window.handlePlayerDeath === 'function') window.handlePlayerDeath();
                    }
                }
                else if (trap.type === 'spikes') {
                    if (trap.isActive && trap.hitCooldown <= 0 && (typeof playerInvulnerableTimer === 'undefined' || playerInvulnerableTimer <= 0)) {
                        playerStats.health -= 10;
                        trap.hitCooldown = 40;
                        if (typeof playerInvulnerableTimer !== 'undefined') playerInvulnerableTimer = 30;
                        window.playerSlowTimer = 60; 
                        if (typeof window.updateHUD === 'function') window.updateHUD();
                    }
                }
            }
        }

        // Passage du portail vers le Boss Mage
        if (this.portalSpawned) {
            let portalZone = { x: canvas.width/2 - 50, y: 50, width: 100, height: 100 };
            if (typeof window.checkCollision === 'function' && window.checkCollision(player, portalZone)) {
                if (typeof window.saveRoomState === 'function') window.saveRoomState();
                
                let pPrefix = player.heroClass ? player.heroClass.toLowerCase() : 'elf';
                if (pPrefix === 'mage') pPrefix = 'burned';
                if (pPrefix === 'necromancer') pPrefix = 'necro';
                
                let videoName = pPrefix + '4.mp4';
                
                let goToBoss = function() {
                    if (typeof window.loadRoom === 'function') window.loadRoom(302, 'south'); 
                    player.x = canvas.width / 2 - player.size / 2;
                    player.y = canvas.height - 150;
                    player.dashTimer = 0; 
                    if (typeof window.updateHUD === 'function') window.updateHUD(); 
                };

                if (typeof window.playCinematic === 'function') {
                    window.playCinematic(videoName, goToBoss);
                } else {
                    goToBoss();
                }
                return;
            }
        }

        // Limites du couloir
        if (player.x < corridorX + margin) player.x = corridorX + margin;
        if (player.x > corridorX + this.corridorW - margin - pSize) player.x = corridorX + this.corridorW - margin - pSize;
        if (player.y < 20) player.y = 20; 
        if (player.y > canvas.height - pSize - 20) player.y = canvas.height - pSize - 20;

        // Progression de l'éboulement
        if (!this.scrollingStopped) {
            let targetDangerY = canvas.height - 60; 
            if (this.dangerY > targetDangerY) {
                this.dangerY -= 1; 
            } else {
                this.dangerY = targetDangerY; 
            }
        }

        // Dégâts de l'éboulement
        if (player.y + pSize > this.dangerY + 30) {
            playerStats.health -= 0.5; 
            if (typeof window.updateHUD === 'function') window.updateHUD();
            if (playerStats.health <= 0 && typeof window.handlePlayerDeath === 'function') window.handlePlayerDeath();
        }
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

    // 1. Rendu du fond
    window.level4State.segments.forEach(seg => {
        let img = assetsManager.images[seg.id];
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, corridorX, seg.y, window.level4State.corridorW, window.level4State.segH);
        } else {
            ctx.fillStyle = '#1a1511';
            ctx.fillRect(corridorX, seg.y, window.level4State.corridorW, window.level4State.segH);
        }
    });

    // 2. Murs noirs latéraux
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, corridorX, canvas.height);
    ctx.fillRect(corridorX + window.level4State.corridorW, 0, canvas.width - (corridorX + window.level4State.corridorW), canvas.height);

    // 3. Rendu du Portail du Boss
    if (window.level4State.portalSpawned) {
        let portalImg = assetsManager.images['portal_key'];
        if (portalImg && portalImg.complete && portalImg.naturalWidth > 0) {
            ctx.drawImage(portalImg, canvas.width/2 - 50, 50, 100, 100);
        } else {
            ctx.fillStyle = '#8e44ad';
            ctx.beginPath(); ctx.arc(canvas.width/2, 100, 50, 0, Math.PI*2); ctx.fill();
        }
    }

    // 4. Rendu des Pièges
    window.level4State.traps.forEach(trap => {
        let imgKey = '';
        if (trap.type === 'hole_block' || trap.type === 'hole_death') imgKey = 'hole';
        else if (trap.type === 'spikes') imgKey = trap.isActive ? 'pic_1' : 'pic_0';
        else if (trap.type === 'caisse') imgKey = 'caisse';

        let tImg = typeof window.getAsset === 'function' ? window.getAsset(imgKey) : assetsManager.images[imgKey];
        
        if (tImg && tImg.complete && tImg.naturalWidth > 0) {
            if (trap.type === 'hole_death') {
                ctx.globalAlpha = 0.8; 
                ctx.drawImage(tImg, trap.x, trap.y, trap.width, trap.height);
                ctx.globalAlpha = 1.0;
            } else {
                ctx.drawImage(tImg, trap.x, trap.y, trap.width, trap.height);
            }
        } else {
            if (trap.type === 'hole_block') ctx.fillStyle = '#111111';
            else if (trap.type === 'hole_death') ctx.fillStyle = '#000000';
            else if (trap.type === 'spikes') ctx.fillStyle = trap.isActive ? '#c0392b' : '#7f8c8d';
            else if (trap.type === 'caisse') ctx.fillStyle = '#8e44ad';
            ctx.fillRect(trap.x, trap.y, trap.width, trap.height);
        }
    });

    // 5. Rendu du Joueur (CORRIGÉ POUR LA VISIBILITÉ GARANTIE)
    let px = isNaN(player.x) ? (canvas.width/2 - pSize/2) : player.x;
    let py = isNaN(player.y) ? (canvas.height*0.75) : player.y;

    ctx.save();
    ctx.translate(px + pSize/2, py + pSize/2);
    
    let drawPlayer = true;
    if (typeof playerInvulnerableTimer !== 'undefined' && playerInvulnerableTimer > 0 && Math.floor(playerInvulnerableTimer / 5) % 2 === 0) drawPlayer = false; 
    
    if (drawPlayer) {
        if (player.dashTimer > 0) ctx.globalAlpha = 0.5;
        
        // Halo blanc clair derrière le joueur
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, pSize * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        let angle = player.faceAngle || (-Math.PI/2);
        let deg = angle * 180 / Math.PI;
        while(deg < 0) deg += 360;
        deg = deg % 360;
        let dir = 'north';
        if (deg >= 45 && deg < 135) dir = 'south';
        else if (deg >= 135 && deg < 225) dir = 'west';
        else if (deg >= 225 && deg < 315) dir = 'north';
        else dir = 'east';

        let pPrefix = player.heroClass ? player.heroClass : 'Knight';
        if (pPrefix === 'Mage') pPrefix = 'Burned';
        else pPrefix = pPrefix.charAt(0).toUpperCase() + pPrefix.slice(1).toLowerCase();
        
        // CORRECTION VISIBILITE : Toujours fallback sur south_view qui existe forcément
        let skin1 = `${pPrefix}_${dir}_view`;
        let fallbackName = `${pPrefix}_south_view`;
        
        let img = typeof window.getAsset === 'function' ? window.getAsset(skin1) : null;
        if (!img || !img.complete || img.naturalWidth === 0) {
            img = typeof window.getAsset === 'function' ? window.getAsset(fallbackName) : null;
        }
        
        if (img && img.complete && img.naturalWidth > 0) {
            let s = pSize * 3.75;
            if (player.heroClass === 'Elf') s = pSize * 1.875;
            ctx.drawImage(img, -s/2, -s/2, s, s);
        } else {
            ctx.fillStyle = '#2ecc71';
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.arc(0,0, pSize/2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(pPrefix, 0, 4);
        }
    }
    ctx.restore();

    // 6. Rendu de l'Éboulement
    if (window.level4State.dangerY < canvas.height) {
        ctx.fillStyle = 'rgba(30, 20, 15, 0.95)';
        ctx.fillRect(corridorX, window.level4State.dangerY, window.level4State.corridorW, canvas.height - window.level4State.dangerY);
        
        ctx.shadowColor = '#1a110b';
        ctx.shadowBlur = 20;
        for (let i = corridorX; i < corridorX + window.level4State.corridorW; i += 45) {
            ctx.fillStyle = (i % 90 === 0) ? '#4e342e' : '#3e2723';
            ctx.beginPath();
            ctx.arc(i + 20, window.level4State.dangerY + Math.random() * 15, 30 + Math.random() * 20, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }

    // 7. Barre de progression / UI
    let totalSegments = window.level4State.sequence.length;
    let distPercent = Math.min(1, window.level4State.currentSeqIndex / (totalSegments - 1));
    let barW = 500;
    ctx.fillStyle = '#111'; ctx.fillRect(canvas.width/2 - barW/2, 20, barW, 20);
    ctx.fillStyle = '#e67e22'; ctx.fillRect(canvas.width/2 - barW/2 + 2, 22, (barW - 4) * distPercent, 16);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
    
    if (window.level4State.portalSpawned) {
        ctx.fillText("PORTAIL DU BOSS OUVERT !", canvas.width/2, 36);
    } else {
        ctx.fillText("FUITE : " + Math.floor(distPercent * 100) + "%", canvas.width/2, 36);
    }
    ctx.textAlign = 'left';

    // Message de démarrage
    if (!window.level4State.hasStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, canvas.height/2 - 70, canvas.width, 140);
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("LE CHÂTEAU S'EFFONDRE !", canvas.width/2, canvas.height/2 - 10);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText("Déplacez-vous vers le NORD (Haut) pour fuir !", canvas.width/2, canvas.height/2 + 35);
        ctx.textAlign = 'left';
    }
};
