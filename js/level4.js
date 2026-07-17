window.level4State = {
    isInit: false,
    scrollSpeed: 6,
    distance: 0,
    maxDistance: 15000, 
    segments: [],
    dangerY: -100,
    isFinished: false,

    init: function() {
        this.isInit = true;
        this.distance = 0;
        this.segments = [
            { id: 'floor21', y: 0 }
        ];
        this.dangerY = -100;
        this.isFinished = false;

        // Positionne le joueur en haut pour courir vers le bas
        player.x = canvas.width / 2 - player.size / 2;
        player.y = canvas.height * 0.25;
        player.dashTimer = 0;
    },

    update: function() {
        if (!this.isInit) this.init();
        
        if (player.dashTimer > 0) player.dashTimer--;
        if (player.dashCooldown > 0) player.dashCooldown--;

        // Vitesse dynamique : on avance plus vite en allant vers le bas
        let currentSpeed = this.scrollSpeed;
        if (keys['s'] || keys['arrowdown']) currentSpeed = this.scrollSpeed * 1.5;
        if (keys['z'] || keys['w'] || keys['arrowup']) currentSpeed = this.scrollSpeed * 0.6;
        
        this.distance += currentSpeed;

        // Déplacer les sols vers le haut (illusion de courir vers le bas)
        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].y -= currentSpeed;
        }

        // Nettoyer les sols qui sont sortis de l'écran par le haut
        if (this.segments[0] && this.segments[0].y <= -canvas.height) {
            this.segments.shift();
        }

        // Générer les sols suivants par le bas
        let lastSegment = this.segments[this.segments.length - 1];
        if (lastSegment && lastSegment.y <= 0) {
            let nextId = 'floor22'; 
            
            if (this.distance >= this.maxDistance) {
                nextId = 'floor25'; // Arrivée
                this.isFinished = true;
            } else if (this.distance > 1000) {
                // Variation aléatoire au milieu du couloir
                let rand = Math.random();
                if (rand < 0.3) nextId = 'floor23';
                else if (rand < 0.6) nextId = 'floor24';
            }

            if (!this.isFinished || nextId === 'floor25') {
                this.segments.push({ id: nextId, y: lastSegment.y + canvas.height });
            }
        }

        // Contrôles du joueur
        let pSpeed = player.dashTimer > 0 ? player.speed * 2 : player.speed;
        if (keys['q'] || keys['a'] || keys['arrowleft']) player.x -= pSpeed;
        if (keys['d'] || keys['arrowright']) player.x += pSpeed;
        if (keys['z'] || keys['w'] || keys['arrowup']) player.y -= pSpeed;
        if (keys['s'] || keys['arrowdown']) player.y += pSpeed;

        // Limites du couloir
        let margin = 80; 
        if (player.x < margin) player.x = margin;
        if (player.x > canvas.width - margin - player.size) player.x = canvas.width - margin - player.size;
        
        // Bloqué par le danger en haut, et limite basse de l'écran
        if (player.y < this.dangerY + 30) player.y = this.dangerY + 30; 
        if (player.y > canvas.height - player.size - 20) player.y = canvas.height - player.size - 20;

        // Le Mur de la Mort avance !
        this.dangerY += (currentSpeed * 0.92); 
        
        // Si le danger rattrape le joueur
        if (this.dangerY > player.y - 15) {
            playerStats.health -= 2; 
            if (typeof window.updateHUD === 'function') window.updateHUD();
            if (playerStats.health <= 0 && typeof window.handlePlayerDeath === 'function') window.handlePlayerDeath();
        } else if (this.dangerY < -150) {
            this.dangerY = -150; 
        }
        
        // Ajustement de la tension : si on recule, le danger se rapproche vite
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
    
    // 1. Rendu des sols
    window.level4State.segments.forEach(seg => {
        let img = assetsManager.images[seg.id];
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, 0, seg.y, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = '#2c251f';
            ctx.fillRect(0, seg.y, canvas.width, canvas.height);
        }
    });

    // 2. Rendu du joueur
    ctx.save();
    ctx.translate(player.x + player.size/2, player.y + player.size/2);
    let dir = window.getDirectionName(player.faceAngle || Math.PI/2); 
    let pPrefix = player.heroClass ? player.heroClass : 'Knight';
    if (pPrefix === 'Mage') pPrefix = 'Burned';
    else pPrefix = pPrefix.charAt(0).toUpperCase() + pPrefix.slice(1).toLowerCase();
    
    let skin = pPrefix + '_' + dir + '_view';
    let img = window.getAsset(skin);
    
    if (img && img.complete && img.naturalWidth > 0) {
        let s = player.size * 3.75;
        ctx.drawImage(img, -s/2, -s/2, s, s);
    } else {
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath(); ctx.arc(0,0, player.size/2, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();

    // 3. Rendu du Mur de la Mort (Effondrement / Ténèbres)
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

    // 4. Interface : Barre de progression de la fuite
    let distPercent = Math.min(1, window.level4State.distance / window.level4State.maxDistance);
    let barW = 500;
    ctx.fillStyle = '#111'; ctx.fillRect(canvas.width/2 - barW/2, 20, barW, 20);
    ctx.fillStyle = '#e67e22'; ctx.fillRect(canvas.width/2 - barW/2 + 2, 22, (barW - 4) * distPercent, 16);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
    ctx.fillText("DISTANCE AVANT LA SORTIE", canvas.width/2, 36);
    ctx.textAlign = 'left';
};
