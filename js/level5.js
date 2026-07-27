// ============================================================================
// js/level5.js - LOGIQUE ET RENDU DU NIVEAU 5 (LABYRINTHE OPEN WORLD)
// ============================================================================

window.level5State = {
    isInit: false,
    cols: 25,
    rows: 25,
    cellSize: 200,
    mapW: 5000,
    mapH: 5000,
    cameraX: 0,
    cameraY: 0,
    grid: [],
    walls: [],
    enemies: [],
    spawnTimer: 0,
    hasKey: false,
    portalUnlocked: false,
    key: { x: 0, y: 0, width: 40, height: 40, collected: false },
    portal: { x: 0, y: 0, width: 150, height: 150 },

    init: function() {
        this.isInit = true;
        this.walls = [];
        this.enemies = [];
        this.hasKey = false;
        this.portalUnlocked = false;
        this.key.collected = false;
        this.mapW = this.cols * this.cellSize;
        this.mapH = this.rows * this.cellSize;

        // Génération du labyrinthe (Recursive Backtracking)
        this.grid = Array(this.cols).fill().map(() => Array(this.rows).fill(1));
        
        let carve = (cx, cy) => {
            let dirs = [[0,-1], [0,1], [1,0], [-1,0]].sort(() => Math.random() - 0.5);
            for (let d of dirs) {
                let nx = cx + d[0]*2, ny = cy + d[1]*2;
                if (nx > 0 && nx < this.cols-1 && ny > 0 && ny < this.rows-1 && this.grid[nx][ny] === 1) {
                    this.grid[cx + d[0]][cy + d[1]] = 0;
                    this.grid[nx][ny] = 0;
                    carve(nx, ny);
                }
            }
        };
        
        this.grid[1][1] = 0;
        carve(1, 1);

        // Nettoyage de quelques murs pour faire plus "Open World" (moins linéaire)
        for (let i = 0; i < 20; i++) {
            let rx = 1 + Math.floor(Math.random() * (this.cols - 2));
            let ry = 1 + Math.floor(Math.random() * (this.rows - 2));
            this.grid[rx][ry] = 0;
        }

        // Conversion de la grille en hitboxes (Murs)
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                if (this.grid[x][y] === 1) {
                    this.walls.push({
                        x: x * this.cellSize,
                        y: y * this.cellSize,
                        width: this.cellSize,
                        height: this.cellSize
                    });
                }
            }
        }

        // Placement du Portail (Début) et du Joueur
        this.portal.x = 1 * this.cellSize + (this.cellSize/2) - (this.portal.width/2);
        this.portal.y = 1 * this.cellSize + (this.cellSize/2) - (this.portal.height/2);
        
        let pSize = (player && typeof player.size === 'number' && !isNaN(player.size)) ? player.size : 40;
        player.x = this.portal.x + 150;
        player.y = this.portal.y + 50;

        // Placement de la clé squelette (loin dans le labyrinthe)
        let keyPlaced = false;
        for (let x = this.cols - 2; x > 0 && !keyPlaced; x--) {
            for (let y = this.rows - 2; y > 0 && !keyPlaced; y--) {
                if (this.grid[x][y] === 0) {
                    this.key.x = x * this.cellSize + (this.cellSize/2) - (this.key.width/2);
                    this.key.y = y * this.cellSize + (this.cellSize/2) - (this.key.height/2);
                    keyPlaced = true;
                }
            }
        }
    },

    spawnEnemy: function() {
        if (this.enemies.length >= 15) return;

        let emptyCells = [];
        for (let x = 1; x < this.cols - 1; x++) {
            for (let y = 1; y < this.rows - 1; y++) {
                if (this.grid[x][y] === 0) {
                    // Vérifier la distance avec le joueur pour ne pas spawn dessus
                    let cx = x * this.cellSize + this.cellSize/2;
                    let cy = y * this.cellSize + this.cellSize/2;
                    let dist = Math.hypot(player.x - cx, player.y - cy);
                    if (dist > 600) emptyCells.push({x: cx, y: cy});
                }
            }
        }

        if (emptyCells.length === 0) return;
        let spawnPos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        // 50% Orcs (Groupe de 3), 50% Golem (Solo)
        if (Math.random() < 0.5) {
            this.enemies.push({ type: 'golem', x: spawnPos.x, y: spawnPos.y, hp: 300, maxHp: 300, size: 60, speed: 1.2 });
        } else {
            for (let i = 0; i < 3; i++) {
                let ox = spawnPos.x + (Math.random() * 80 - 40);
                let oy = spawnPos.y + (Math.random() * 80 - 40);
                this.enemies.push({ type: 'orc', x: ox, y: oy, hp: 100, maxHp: 100, size: 45, speed: 2.5 });
            }
        }
    },

  update: function() {
        if (!this.isInit) this.init();

        let pSize = (player && typeof player.size === 'number' && !isNaN(player.size)) ? player.size : 40;
        let baseSpeed = (player && typeof player.speed === 'number' && !isNaN(player.speed)) ? player.speed : 4;
        let pSpeed = player.dashTimer > 0 ? baseSpeed * 2.2 : baseSpeed;

        if (player.dashTimer > 0) player.dashTimer--;
        if (player.dashCooldown > 0) player.dashCooldown--;

        let oldPx = player.x;
        let oldPy = player.y;

        // Mouvements Libres (pas bloqués par l'écran)
        if (keys['z'] || keys['w'] || keys['arrowup']) { player.y -= pSpeed; player.faceAngle = -Math.PI / 2; }
        if (keys['s'] || keys['arrowdown']) { player.y += pSpeed; player.faceAngle = Math.PI / 2; }
        if (keys['q'] || keys['a'] || keys['arrowleft']) { player.x -= pSpeed; player.faceAngle = Math.PI; }
        if (keys['d'] || keys['arrowright']) { player.x += pSpeed; player.faceAngle = 0; }

        // Collisions Murs Labyrinthe
        for (let wall of this.walls) {
            if (player.x < wall.x + wall.width && player.x + pSize > wall.x &&
                player.y < wall.y + wall.height && player.y + pSize > wall.y) {
                
                // Résolution simple des collisions
                if (oldPx + pSize <= wall.x || oldPx >= wall.x + wall.width) player.x = oldPx;
                if (oldPy + pSize <= wall.y || oldPy >= wall.y + wall.height) player.y = oldPy;
            }
        }

        // Limites strictes de la carte monde
        if (player.x < 0) player.x = 0;
        if (player.y < 0) player.y = 0;
        if (player.x > this.mapW - pSize) player.x = this.mapW - pSize;
        if (player.y > this.mapH - pSize) player.y = this.mapH - pSize;

        // Gestion Caméra
        this.cameraX = player.x + (pSize / 2) - (canvas.width / 2);
        this.cameraY = player.y + (pSize / 2) - (canvas.height / 2);

        // Clamp Caméra pour ne pas voir le néant
        if (this.cameraX < 0) this.cameraX = 0;
        if (this.cameraY < 0) this.cameraY = 0;
        if (this.cameraX > this.mapW - canvas.width) this.cameraX = this.mapW - canvas.width;
        if (this.cameraY > this.mapH - canvas.height) this.cameraY = this.mapH - canvas.height;

        // Récupération Clé
        if (!this.key.collected) {
            if (player.x < this.key.x + this.key.width && player.x + pSize > this.key.x &&
                player.y < this.key.y + this.key.height && player.y + pSize > this.key.y) {
                this.key.collected = true;
                this.hasKey = true;
                if (typeof window.updateHUD === 'function') window.updateHUD();
            }
        }

        // Déverrouillage Portail
        if (this.hasKey && !this.portalUnlocked) {
            let distToPortal = Math.hypot(player.x - (this.portal.x + this.portal.width/2), player.y - (this.portal.y + this.portal.height/2));
            if (distToPortal < 150) {
                this.portalUnlocked = true;
            }
        }

        // Transition au Boss Drake
        if (this.portalUnlocked) {
            if (player.x < this.portal.x + this.portal.width && player.x + pSize > this.portal.x &&
                player.y < this.portal.y + this.portal.height && player.y + pSize > this.portal.y) {
                // Lancer cinématique ou transition niveau 5 partie 2 / Boss
                if (typeof window.loadRoom === 'function') window.loadRoom(502, 'south'); // Conceptuel, vers arène Drake
            }
        }

        // Spawns et Mise à jour Ennemis
        this.spawnTimer++;
        if (this.spawnTimer > 150) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let e = this.enemies[i];
            
            // Mouvement simple vers le joueur s'il est proche
            let dist = Math.hypot(player.x - e.x, player.y - e.y);
            if (dist < 800) {
                let dx = player.x - e.x;
                let dy = player.y - e.y;
                let angle = Math.atan2(dy, dx);
                
                let nx = e.x + Math.cos(angle) * e.speed;
                let ny = e.y + Math.sin(angle) * e.speed;
                
                // Collisions murs simples pour ennemis
                let hitWall = false;
                for (let w of this.walls) {
                    if (nx < w.x + w.width && nx + e.size > w.x && ny < w.y + w.height && ny + e.size > w.y) {
                        hitWall = true; break;
                    }
                }
                
                if (!hitWall) {
                    e.x = nx;
                    e.y = ny;
                }
            }

            // Dégâts basiques au joueur
            if (dist < (e.size/2 + pSize/2)) {
                if (typeof playerInvulnerableTimer === 'undefined' || playerInvulnerableTimer <= 0) {
                    playerStats.health -= (e.type === 'golem' ? 15 : 5);
                    if (typeof playerInvulnerableTimer !== 'undefined') playerInvulnerableTimer = 30;
                    if (typeof window.updateHUD === 'function') window.updateHUD();
                }
            }
            
            // Logique des projectiles du joueur pour blesser les ennemis
            if (typeof projectiles !== 'undefined') {
                for (let j = projectiles.length - 1; j >= 0; j--) {
                    let proj = projectiles[j];
                    let projSize = proj.size || proj.width || 20; // Fallback sécurisé
                    
                    let projCenterX = proj.x + projSize / 2;
                    let projCenterY = proj.y + projSize / 2;
                    let enemyCenterX = e.x + e.size / 2;
                    let enemyCenterY = e.y + e.size / 2;
                    
                    let distToEnemy = Math.hypot(projCenterX - enemyCenterX, projCenterY - enemyCenterY);
                    
                    if (distToEnemy < (e.size / 2 + projSize / 2)) {
                        e.hp -= (proj.damage || 25);
                        projectiles.splice(j, 1); // Le projectile disparaît à l'impact
                    }
                }
            }

            // Mort de l'ennemi
            if (e.hp <= 0) {
                this.enemies.splice(i, 1);
            }
        }
    }

window.updateLevel5 = function() {
    if (gameState !== "PLAYING") return;
    window.level5State.update();
    if (typeof window.renderLevel5 === 'function') window.renderLevel5();
};

window.renderLevel5 = function() {
    if (!ctx) return;
    
    // Remplissage fond de base
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Application du décalage caméra global
    ctx.translate(-window.level5State.cameraX, -window.level5State.cameraY);

    // 1. Sol (Motif optionnel)
    ctx.fillStyle = '#262626';
    for (let x = 0; x < window.level5State.mapW; x += 400) {
        for (let y = 0; y < window.level5State.mapH; y += 400) {
            ctx.fillRect(x + 5, y + 5, 390, 390);
        }
    }

    // 2. Murs
    let wallImg = typeof window.getAsset === 'function' ? window.getAsset('wall_laby') : (typeof assetsManager !== 'undefined' ? assetsManager.images['wall_laby'] : null);
    for (let wall of window.level5State.walls) {
        // Culling : ne dessine que ce qui est à l'écran
        if (wall.x + wall.width > window.level5State.cameraX && wall.x < window.level5State.cameraX + canvas.width &&
            wall.y + wall.height > window.level5State.cameraY && wall.y < window.level5State.cameraY + canvas.height) {
            
            if (wallImg && wallImg.complete && wallImg.naturalWidth > 0) {
                ctx.drawImage(wallImg, wall.x, wall.y, wall.width, wall.height);
            } else {
                ctx.fillStyle = '#34495e'; // Fallback
                ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
                ctx.strokeStyle = '#2c3e50';
                ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
            }
        }
    }

    // 3. Portail
    let pImgName = window.level5State.portalUnlocked ? 'portal_open' : 'portal_close';
    let portalImg = typeof window.getAsset === 'function' ? window.getAsset(pImgName) : (typeof assetsManager !== 'undefined' ? assetsManager.images[pImgName] : null);
    if (portalImg && portalImg.complete && portalImg.naturalWidth > 0) {
        ctx.drawImage(portalImg, window.level5State.portal.x, window.level5State.portal.y, window.level5State.portal.width, window.level5State.portal.height);
    } else {
        ctx.fillStyle = window.level5State.portalUnlocked ? '#8e44ad' : '#7f8c8d';
        ctx.fillRect(window.level5State.portal.x, window.level5State.portal.y, window.level5State.portal.width, window.level5State.portal.height);
    }

    // 4. Clé Squelette
    if (!window.level5State.key.collected) {
        let keyImg = typeof window.getAsset === 'function' ? window.getAsset('key_skeleton') : (typeof assetsManager !== 'undefined' ? assetsManager.images['key_skeleton'] : null);
        if (keyImg && keyImg.complete && keyImg.naturalWidth > 0) {
            ctx.drawImage(keyImg, window.level5State.key.x, window.level5State.key.y, window.level5State.key.width, window.level5State.key.height);
        } else {
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(window.level5State.key.x + window.level5State.key.width/2, window.level5State.key.y + window.level5State.key.height/2, 20, 0, Math.PI*2);
            ctx.fill();
        }
    }

    // 5. Ennemis
    for (let e of window.level5State.enemies) {
        if (e.type === 'golem') {
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(e.x, e.y, e.size, e.size); // Remplacer par dessin sprite Golem
        } else {
            ctx.fillStyle = '#27ae60';
            ctx.beginPath(); ctx.arc(e.x + e.size/2, e.y + e.size/2, e.size/2, 0, Math.PI*2); ctx.fill(); // Remplacer par dessin sprite Orc
        }
        
        // Barre de vie Ennemi
        ctx.fillStyle = 'red';
        ctx.fillRect(e.x, e.y - 10, e.size, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(e.x, e.y - 10, e.size * (e.hp / e.maxHp), 5);
    }

    // 6. Joueur (Réutilise la logique de dessin standard simplifiée)
    let pSize = (player && typeof player.size === 'number' && !isNaN(player.size)) ? player.size : 40;
    
    ctx.translate(player.x + pSize/2, player.y + pSize/2);
    
    let drawPlayer = true;
    if (typeof playerInvulnerableTimer !== 'undefined' && playerInvulnerableTimer > 0 && Math.floor(playerInvulnerableTimer / 5) % 2 === 0) drawPlayer = false; 
    
    if (drawPlayer) {
        if (player.dashTimer > 0) ctx.globalAlpha = 0.5;
        else ctx.globalAlpha = 1.0;

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
        
        let skin1 = `${pPrefix}_${dir}_view`;
        let img = typeof window.getAsset === 'function' ? window.getAsset(skin1) : null;
        
        if (img && img.complete && img.naturalWidth > 0) {
            let s = pSize * 3.75;
            if (player.heroClass === 'Knight') s = pSize * 3.0; 
            else if (player.heroClass === 'Elf') s = pSize * 2.25; 
            ctx.drawImage(img, -s/2, -s/2, s, s);
        } else {
            ctx.fillStyle = '#2ecc71';
            ctx.beginPath(); ctx.arc(0,0, pSize/2, 0, Math.PI*2); ctx.fill();
        }
    }

    ctx.restore(); // Annule le Translate du joueur et de la caméra

    // UI : Indication d'objectif statique à l'écran
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(window.level5State.hasKey ? "Clé Squelette acquise ! Retournez au portail." : "Trouvez la Clé Squelette dans le labyrinthe.", 20, 100);
};
