// ============================================================================
// js/renderer.js - MOTEUR DE RENDU VISUEL ET EFFETS
// ============================================================================

window.triggerShake = function(intensity, duration) { 
    shakeIntensity = intensity; 
    shakeTimer = duration; 
};

window.spawnParticles = function(x, y, color, count, isGlow = false) {
    if(typeof particles === 'undefined') particles = [];
    for (let i = 0; i < count; i++) {
        let angle = Math.random() * Math.PI * 2; 
        let speed = Math.random() * 5 + 2;
        particles.push({ 
            x: x, y: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, 
            life: 1.0, color: color, size: Math.random() * 5 + 3, glow: isGlow 
        });
    }
};

window.getDirectionName = function(angle) {
    let deg = angle * (180 / Math.PI);
    if (deg < 0) deg += 360;

    if (deg >= 337.5 || deg < 22.5) return 'east';
    if (deg >= 22.5 && deg < 67.5) return 'southeast';
    if (deg >= 67.5 && deg < 112.5) return 'south';
    if (deg >= 112.5 && deg < 157.5) return 'southwest';
    if (deg >= 157.5 && deg < 202.5) return 'west';
    if (deg >= 202.5 && deg < 247.5) return 'northwest';
    if (deg >= 247.5 && deg < 292.5) return 'north';
    if (deg >= 292.5 && deg < 337.5) return 'northeast';
    return 'south';
};

window.getAsset = function(name) {
    if (!name) return null;
    return assetsManager.images[name] || 
           assetsManager.images[name.toLowerCase()] || 
           assetsManager.images[name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()];
};

window.renderGameView = function() {
    if (!ctx) return;
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
    ctx.save(); 
    
    if (typeof shakeTimer !== 'undefined' && shakeTimer > 0) {
        let dx = (Math.random() - 0.5) * shakeIntensity * 2; 
        let dy = (Math.random() - 0.5) * shakeIntensity * 2;
        ctx.translate(dx, dy); 
        shakeTimer--; 
        shakeIntensity *= 0.9; 
    }
    
    let imageSol = assetsManager.images['sol_base'];
    let isNewFloor = false;
    
    if (typeof currentRoomId !== 'undefined') {
        let floorKey = 'sol_base';
        if (currentRoomId === 999 && worldState && worldState.arenaFloor) {
            floorKey = worldState.arenaFloor;
        } else if (worldState && worldState.roomFloors && worldState.roomFloors[currentRoomId]) {
            floorKey = worldState.roomFloors[currentRoomId];
        }
        
        if (assetsManager.images[floorKey] && assetsManager.images[floorKey].complete) {
            imageSol = assetsManager.images[floorKey];
            isNewFloor = (floorKey !== 'sol_base');
        }
    }

    ctx.fillStyle = '#2c251f'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (imageSol && imageSol.complete && imageSol.naturalWidth > 0) { 
        if (isNewFloor) {
            ctx.drawImage(imageSol, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = ctx.createPattern(imageSol, 'repeat'); 
            ctx.fillRect(0, 0, canvas.width, canvas.height); 
        }
    } else { 
        ctx.strokeStyle = '#3d342c'; ctx.lineWidth = 1; 
        for(let i = 0; i < canvas.width; i += 60) { 
            for(let j = 0; j < canvas.height; j += 60) { ctx.strokeRect(i, j, 60, 60); }
        } 
    }

    let isVertCorridor = (typeof currentRoomId !== 'undefined' && (currentRoomId === 5 || currentRoomId === 6 || currentRoomId === 111 || currentRoomId === 112 || currentRoomId === 113 || currentRoomId === 205 || currentRoomId === 206));
    if (isVertCorridor) {
        ctx.fillStyle = '#0a0a0a'; 
        ctx.fillRect(0, 0, 350 - wallMargin, canvas.height); 
        ctx.fillRect(canvas.width - 350 + wallMargin, 0, 350, canvas.height); 
        
        ctx.strokeStyle = '#3d342c'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(350 - wallMargin, 0); ctx.lineTo(350 - wallMargin, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(canvas.width - 350 + wallMargin, 0); ctx.lineTo(canvas.width - 350 + wallMargin, canvas.height); ctx.stroke();
    }
    
    let wallL = assetsManager.images['left_wall']; if (wallL && wallL.complete) ctx.drawImage(wallL, isVertCorridor ? 350 - wallMargin : 0, 0, wallMargin, canvas.height);
    let wallR = assetsManager.images['right_wall']; if (wallR && wallR.complete) ctx.drawImage(wallR, isVertCorridor ? canvas.width - 350 : canvas.width - wallMargin, 0, wallMargin, canvas.height);
    let wallT = assetsManager.images['back_wall']; if (wallT && wallT.complete) ctx.drawImage(wallT, 0, 0, canvas.width, wallMargin);
    let wallB = assetsManager.images['front_wall']; if (wallB && wallB.complete) ctx.drawImage(wallB, 0, canvas.height - wallMargin, canvas.width, wallMargin);
    
    if (typeof bloodStains !== 'undefined') {
        bloodStains.forEach(blood => { 
            ctx.save();
            let alpha = 1.0;
            let fadeTime = 300;
            if (blood.life !== undefined && blood.life < fadeTime) {
                alpha = Math.max(0, blood.life / fadeTime);
            }
            ctx.globalAlpha = alpha;
            
            ctx.translate(blood.x, blood.y);
            if (blood.rotation) ctx.rotate(blood.rotation);
            
            let bImg = window.getAsset(blood.imgId);
            
            if (bImg && bImg.complete && bImg.naturalWidth > 0) {
                let s = blood.size || 40;
                ctx.drawImage(bImg, -s/2, -s/2, s, s);
            } else {
                ctx.fillStyle = blood.type === 'kill' ? '#500000' : '#8a0303'; 
                ctx.beginPath(); ctx.arc(0, 0, (blood.size || 30) / 2, 0, Math.PI * 2); ctx.fill(); 
            }
            ctx.restore();
        });
    }
    ctx.globalAlpha = 1.0;

    if (typeof currentRoomId !== 'undefined' && currentRoomId === 999) { 
        ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 6; 
        let shrink = typeof arenaShrink !== 'undefined' ? arenaShrink : 0;
        ctx.strokeRect(wallMargin + shrink, wallMargin + shrink, canvas.width - (wallMargin + shrink) * 2, canvas.height - (wallMargin + shrink) * 2);
    }

    if (typeof currentRoomId !== 'undefined' && (currentRoomId === 8 || currentRoomId === 101)) {
        let sImg = assetsManager.images['stairs_down']; let sx = canvas.width/2 - 75, sy = canvas.height/2 - 75, sw = 150, sh = 150; 
        ctx.save();
        if (sImg && sImg.complete && sImg.naturalWidth > 0) {
            if (currentRoomId === 101) {
                ctx.translate(sx + sw/2, sy + sh/2);
                ctx.rotate(Math.PI);
                ctx.drawImage(sImg, -sw/2, -sh/2, sw, sh);
            } else {
                ctx.drawImage(sImg, sx, sy, sw, sh); 
                if (currentRoomId === 8 && !worldState.level2Unlocked) { ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fillRect(sx, sy, sw, sh); }
            }
        } else {
            ctx.fillStyle = '#111'; ctx.fillRect(sx, sy, sw, sh); ctx.strokeStyle = '#555'; ctx.lineWidth = 6; ctx.strokeRect(sx, sy, sw, sh);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center';
            if (currentRoomId === 8) {
                if (!worldState.level2Unlocked) { ctx.fillText("ESCALIER", sx + sw/2, sy + sh/2 - 10); ctx.fillStyle = '#e74c3c'; ctx.fillText("BLOQUÉ !", sx + sw/2, sy + sh/2 + 20); } 
                else { ctx.fillStyle = '#f1c40f'; ctx.fillText("SORTIE ICI", sx + sw/2, sy + sh/2 + 5); }
            } else if (currentRoomId === 101) {
                ctx.fillStyle = '#3498db'; ctx.fillText("RETOUR NIVEAU 1", sx + sw/2, sy + sh/2 + 5);
            }
            ctx.textAlign = 'left';
        }
        if (currentRoomId === 8 && worldState.level2Unlocked) { ctx.shadowColor = '#f1c40f'; ctx.shadowBlur = 30; ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 4; ctx.strokeRect(sx, sy, sw, sh); }
        if (currentRoomId === 101) { ctx.shadowColor = '#3498db'; ctx.shadowBlur = 30; ctx.strokeStyle = '#3498db'; ctx.lineWidth = 4; ctx.strokeRect(sx, sy, sw, sh); }
        ctx.restore();
    }

    if (typeof currentRoomId !== 'undefined' && currentRoomId === 1) {
        let benchX = 400; let benchY = canvas.height - wallMargin - 60; let imgBench = assetsManager.images['bench'];
        if (imgBench && imgBench.complete && imgBench.naturalWidth > 0) { ctx.drawImage(imgBench, benchX, benchY, 200, 80); } 
        if (typeof bookshelf !== 'undefined') {
            let imgBiblio = assetsManager.images['bibliotheque'];
            if (imgBiblio && imgBiblio.complete && imgBiblio.naturalWidth > 0) { ctx.drawImage(imgBiblio, bookshelf.x, bookshelf.y, bookshelf.width, bookshelf.height); } 
        }
    }

    if (typeof currentCrates !== 'undefined') {
        currentCrates.forEach(crate => {
            let imgName = ''; 
            if (crate.type === 'barrel') imgName = crate.isBroken ? 'crate2' : 'crate1'; 
            else if (crate.type === 'box') imgName = crate.isBroken ? 'crate4' : 'crate3'; 
            else if (crate.type === 'chest') imgName = crate.isBroken ? 'chest2' : 'chest1';
            
            let img = assetsManager.images[imgName]; ctx.save(); ctx.translate(crate.x + crate.size/2, crate.y + crate.size/2);
            if (!crate.isBroken && crate.health < 30 && crate.type !== 'chest') { ctx.rotate(Math.sin(Date.now() / 20) * 0.1); }
            
            if (img && img.complete && img.naturalWidth > 0) { ctx.drawImage(img, -crate.size/2, -crate.size/2, crate.size, crate.size); } 
            else { ctx.fillStyle = crate.isBroken ? '#5c4033' : '#8B4513'; if (crate.type === 'chest') ctx.fillStyle = crate.isBroken ? '#7f8c8d' : '#f1c40f'; ctx.fillRect(-crate.size/2, -crate.size/2, crate.size, crate.size); }
            ctx.restore();
        });
    }

    if (typeof currentDoors !== 'undefined') {
        currentDoors.forEach(door => {
            ctx.save();
            let doorImg = null; let isOpen = (worldState && worldState.openedDoors && worldState.openedDoors[door.id]) || false; let stateStr = '_close'; 
            
            if (isOpen) { stateStr = '_open'; } 
            else if (door.requiresKey && door.locked) { stateStr = '_key'; }
            if (typeof currentRoomId !== 'undefined' && currentRoomId === 8 && !worldState.level2Unlocked && door.face === 'south') { stateStr = '_close'; }
            
            if (typeof currentRoomId !== 'undefined' && currentRoomId >= 200 && currentRoomId < 900) {
                let faceKey = door.face; 
                let waterState = isOpen ? '_open' : '_close'; 
                let assetName = faceKey + '_water_door' + waterState; 
                doorImg = assetsManager.images[assetName];
                
                if (!doorImg || !doorImg.complete) {
                    if (faceKey === 'west') doorImg = assetsManager.images['left_water_door' + waterState];
                    if (faceKey === 'east') doorImg = assetsManager.images['right_water_door' + waterState];
                }
            } else {
                if (door.face === 'north') doorImg = assetsManager.images['back_door' + stateStr]; 
                else if (door.face === 'south') doorImg = assetsManager.images['front_door' + stateStr]; 
                else if (door.face === 'west') doorImg = assetsManager.images['left_door' + stateStr]; 
                else if (door.face === 'east') doorImg = assetsManager.images['right_door' + stateStr];
            }
            
            if (doorImg && doorImg.complete && doorImg.naturalWidth > 0) { ctx.drawImage(doorImg, door.x, door.y, door.width, door.height); } 
            else { ctx.fillStyle = isOpen ? '#1a110c' : '#3e2a1d'; ctx.fillRect(door.x, door.y, door.width, door.height); }
            ctx.restore();
        });
    }

    if (typeof currentItems !== 'undefined') {
        currentItems.forEach(item => {
            if (!item.collected) {
                let floatY = Math.sin(Date.now() / 200) * 3; 
                ctx.save(); 
                
                let scaleX = 1; let assetName = null;
                if (item.type === 'key') assetName = 'gold_key';
                else if (item.type === 'key_skull') assetName = 'skeleton_key';
                else if (item.type === 'key_orb') assetName = 'portal_key';
                else if (item.type === 'potion_green') assetName = 'potion1';
                else if (item.type === 'potion_yellow') assetName = 'potion2';
                else if (item.type === 'potion_blue') assetName = 'potion3';
                else if (item.type === 'potion_red') assetName = 'potion4';
                else if (item.type === 'coin') { assetName = 'gold_coin'; scaleX = 1; }
                
                ctx.scale(scaleX, 1); 
                
                if (item.type === 'scroll') {
                    ctx.fillStyle = '#f5f6fa'; ctx.fillRect(-10, -15, 20, 30); 
                    ctx.fillStyle = '#c0392b'; ctx.fillRect(-10, -5, 20, 10);  
                }
                else if (assetName && assetName.includes('key')) {
                    ctx.shadowColor = 'rgba(255, 215, 0, 1)'; 
                    ctx.shadowBlur = 25 + Math.abs(Math.sin(Date.now() / 150)) * 20; 
                    floatY += Math.sin(Date.now() / 150) * 5; 
                } else {
                    ctx.shadowColor = 'rgba(0,0,0,0.5)'; 
                    ctx.shadowBlur = 10; 
                }
                
                ctx.translate(item.x, item.y + floatY);

                if (item.type !== 'scroll') {
                    let itemImg = window.getAsset(assetName);
                    if (itemImg && itemImg.complete && itemImg.naturalWidth > 0) {
                        let imgRatio = itemImg.naturalWidth / itemImg.naturalHeight;
                        let displaySize = item.size * 2.5; 
                        if (assetName === 'gold_coin') displaySize = item.size * 3.5; 
                        else if (assetName && assetName.includes('key')) displaySize = item.size * 2.2; 
                        
                        ctx.drawImage(itemImg, -displaySize/2, -(displaySize / imgRatio)/2, displaySize, displaySize / imgRatio);
                    } else {
                        if (item.type === 'coin') { ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(0, 0, item.size, 0, Math.PI*2); ctx.fill(); } 
                        else if (item.type.includes('potion')) { ctx.fillStyle = item.type === 'potion_green' ? '#2ecc71' : '#e74c3c'; ctx.beginPath(); ctx.arc(0, 6, 10, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-5, -4, 10, 12); } 
                        else { ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(6, -3, 18, 6); }
                    }
                }
                ctx.restore();
            }
        });
    }

    if (typeof hazards !== 'undefined') {
        hazards.forEach(h => { 
            ctx.save();
            let isElysia = h.isElysia || false;
            let assetName = isElysia ? 'Attack_meteorites_elysia' : 'Attack_meteorites_dragon';
            let metImg = window.getAsset(assetName);
            
            let fallH = (h.timer / h.maxTimer) * 150; 
            
            if (metImg && metImg.complete && metImg.naturalWidth > 0) {
                ctx.shadowColor = isElysia ? '#e84393' : '#e74c3c'; 
                ctx.shadowBlur = 30; 
                ctx.drawImage(metImg, h.x - h.radius*1.5, h.y - fallH - h.radius*1.5, h.radius*3, h.radius*3);
            }
            ctx.restore();
        });
    }

    if (typeof necroSummons !== 'undefined') {
        necroSummons.forEach(s => {
            ctx.save(); 
            ctx.translate(s.x + s.size/2, s.y + s.size/2);
            
            let dir = window.getDirectionName(s.faceAngle || 0);
            let prefix = s.type === 'fusion' ? 'Fusion' : 'Soul';
            let action = (s.attackAnimTimer > 0) ? 'attack' : 'view';
            
            let sImg = window.getAsset(`${prefix}_${dir}_${action}`) || window.getAsset(`${prefix}_${dir}_view`);
            let scalePulse = 1 + Math.sin(Date.now() / 200) * 0.05;
            ctx.scale(scalePulse, scalePulse);
            
            ctx.shadowColor = s.type === 'fusion' ? '#f1c40f' : '#8e44ad'; 
            ctx.shadowBlur = 15;
            
            if (sImg && sImg.complete && sImg.naturalWidth > 0) {
                let displaySize = s.size * 3.75; 
                ctx.drawImage(sImg, -displaySize/2, -displaySize/2, displaySize, displaySize);
            } else {
                ctx.fillStyle = s.type === 'fusion' ? '#f1c40f' : '#8e44ad';
                ctx.beginPath(); ctx.arc(0, 0, s.size/2, 0, Math.PI*2); ctx.fill();
            }
            ctx.restore(); 
        });
    }

    if (typeof currentEnemies !== 'undefined') {
        currentEnemies.forEach(enemy => {
            ctx.save(); 
            ctx.translate(enemy.x + enemy.size/2, enemy.y + enemy.size/2);
            
            let angleToTarget = enemy.faceAngleTarget !== undefined ? enemy.faceAngleTarget : Math.atan2((player.y + player.size/2) - (enemy.y + enemy.size/2), (player.x + player.size/2) - (enemy.x + enemy.size/2));
            let dir = window.getDirectionName(angleToTarget);
            
            let prefix = enemy.type.charAt(0).toUpperCase() + enemy.type.slice(1);
            let eTypeLow = enemy.type.toLowerCase();
            
            let action = 'view';
            let skinName = '';

            if (enemy.blockAnimTimer > 0) {
                action = 'block';
                skinName = `${prefix}_${dir}_${action}`;
            } 
            else if (enemy.attackAnimTimer > 0) {
                action = 'attack';
                let t = enemy.attackAnimTimer;
                if (prefix === 'Skeleton' || prefix === 'Mage') {
                    if (t > 15) skinName = `${prefix}_${dir}_attack1`;
                    else skinName = `${prefix}_${dir}_attack2`;
                } else if (prefix === 'Dragon') {
                    if (t > 20) skinName = `${prefix}_${dir}_attack1`;
                    else if (t > 10) skinName = `${prefix}_${dir}_attack2`;
                    else skinName = `${prefix}_${dir}_attack3`;
                } else {
                    skinName = `${prefix}_${dir}_${action}`;
                }
            } else {
                skinName = `${prefix}_${dir}_${action}`;
            }

            let img = window.getAsset(skinName); 
            let is8Dir = true;
            
            if (!img || !img.complete || img.naturalWidth === 0) { 
                skinName = `${prefix}_${dir}_view`;
                img = window.getAsset(skinName); 
            }
            
            if (!img || !img.complete || img.naturalWidth === 0) { 
                is8Dir = false; 
                let fallbackName = ''; 
                
                if (eTypeLow === 'goblin') { 
                    if (enemy.blockAnimTimer > 0) fallbackName = 'goblin_top_block'; 
                    else if (enemy.attackAnimTimer > 0) fallbackName = 'goblin_top_attack'; 
                    else fallbackName = 'goblin_top_view'; 
                } 
                else if (eTypeLow === 'skeleton') { 
                    if (enemy.attackAnimTimer > 0) fallbackName = 'Skeleton_top_attack'; 
                    else fallbackName = 'Skeleton_top_view'; 
                } 
                else if (eTypeLow === 'spider') fallbackName = 'spider_top_view'; 
                else if (eTypeLow === 'troll') fallbackName = 'troll_top_view'; 
                else if (eTypeLow === 'mage') fallbackName = 'Burned_top_view'; 
                else if (eTypeLow === 'dragon') fallbackName = 'drake_top_view';
                else fallbackName = `${prefix}_south_view`;
                
                img = window.getAsset(fallbackName); 
            }

            let wobble = Math.sin(enemy.wobble) * 0.15; 
            let scalePulse = 1 + Math.sin(enemy.wobble * 2) * 0.05;  
            
            if (is8Dir) {
                ctx.rotate(wobble); 
            } else {
                ctx.rotate(angleToTarget - (Math.PI / 2) + wobble); 
            }
            
            ctx.scale(scalePulse, scalePulse); 
            
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; 
            ctx.shadowBlur = 10; 
            ctx.shadowOffsetX = 4; 
            ctx.shadowOffsetY = 4;
            
            if (enemy.type === 'orc') { ctx.shadowColor = '#27ae60'; ctx.shadowBlur = 20; } 
            else if (enemy.type === 'mage') { ctx.shadowColor = '#9b59b6'; ctx.shadowBlur = 20; } 
            else if (enemy.type === 'dragon' || enemy.type === 'minotaure') { ctx.shadowColor = '#e74c3c'; ctx.shadowBlur = 25; }
            else if (enemy.type === 'kraken') { ctx.shadowColor = '#2c3e50'; ctx.shadowBlur = 35; }
            
            let displaySize = enemy.size * 3.75; 
            if (img && img.complete && img.naturalWidth > 0) {
                if (['troll', 'dragon', 'goblin', 'skeleton', 'small_golem', 'orc', 'golem', 'gargouille', 'anglerfish', 'siren', 'kraken'].includes(eTypeLow)) {
                    displaySize = enemy.size * 1.875; 
                } else if (eTypeLow === 'wolf') {
                    displaySize = (enemy.size * 1.875) * 1.25; 
                }
                
                if (['mage', 'spider', 'wolf'].includes(eTypeLow) && !is8Dir) { 
                    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, displaySize/2.2, 0, Math.PI*2); ctx.clip(); 
                    ctx.drawImage(img, -displaySize/2, -displaySize/2, displaySize, displaySize); ctx.restore(); 
                } else { 
                    ctx.drawImage(img, -displaySize/2, -displaySize/2, displaySize, displaySize); 
                }
            } else { 
                ctx.fillStyle = '#e74c3c'; ctx.fillRect(-enemy.size/2, -enemy.size/2, enemy.size, enemy.size); 
            }
            
            ctx.shadowColor = 'transparent'; 
            ctx.shadowBlur = 0;
            
            if (enemy.isBurning) {
                ctx.rotate(Math.sin(Date.now() / 150) * 0.2); 
                let fireImgName = (Date.now() % 400 < 200) ? 'burned_ennemy_view1' : 'burned_ennemy_view2';
                let fireImg = window.getAsset(fireImgName);
                if (fireImg && fireImg.complete && fireImg.naturalWidth > 0) {
                    ctx.drawImage(fireImg, -displaySize/2, -displaySize/2, displaySize, displaySize);
                }
            }
            
            if (enemy.slowTimer > 0 || enemy.isPermanentlySlowed) { 
                ctx.strokeStyle = '#8e44ad'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, enemy.size/2 + 6, 0, Math.PI*2); ctx.stroke(); 
            }
            ctx.restore(); 
            
            if (!['troll', 'mage', 'dragon', 'deathgod', 'elysia', 'minotaure', 'gargouille', 'kraken'].includes(enemy.type)) { 
                ctx.fillStyle = '#111'; ctx.fillRect(enemy.x, enemy.y - 12, enemy.size, 4); 
                ctx.fillStyle = '#e74c3c'; ctx.fillRect(enemy.x, enemy.y - 12, enemy.size * (enemy.health / enemy.maxHealth), 4); 
            } 
        });
    }

    if (typeof projectiles !== 'undefined') {
        projectiles.forEach(p => { 
            ctx.save(); 
            ctx.translate(p.x, p.y); 
            
            let pImgName = 'Attack_arrow_elf';
            if (p.type === 'fire_mage') pImgName = 'Attack_fire_mage';
            else if (p.type === 'fire_necromancien' || p.type === 'fire_fusion') pImgName = 'Attack_fire_necromancien';

            let pImg = window.getAsset(pImgName);
            if (pImg && pImg.complete && pImg.naturalWidth > 0) {
                ctx.rotate(p.angle + Math.PI / 2);
                ctx.shadowColor = p.type === 'fire_mage' ? '#e67e22' : '#8e44ad'; 
                ctx.shadowBlur = 30; 
                
                let drawSize = p.size * 15.0; 
                
                if (p.type === 'fire_mage') {
                    let fbSize = p.size * 5.0; 
                    ctx.drawImage(pImg, -fbSize/2, -fbSize, fbSize, fbSize * 2.5);
                } else {
                    if (p.type === 'fire_necromancien') { drawSize = drawSize / 2; }
                    ctx.drawImage(pImg, -drawSize/2, -drawSize/2, drawSize, drawSize);
                }
            } else {
                ctx.rotate(p.angle); 
                ctx.fillStyle = '#ecf0f1'; ctx.fillRect(-8, -1, 16, 2); 
            }
            ctx.restore();
        });
    }
    
    if (typeof enemyProjectiles !== 'undefined') {
        enemyProjectiles.forEach(p => { 
            ctx.save(); 
            ctx.translate(p.x, p.y); 
            let pAngle = Math.atan2(p.vy, p.vx); 
            
            let epImgName = '';
            if (p.type === 'bone_skeleton') epImgName = 'Attack_bone_skeleton';
            else if (p.type === 'fire_mage_corompue') epImgName = 'Attack_mage_corompue';
            else if (p.type === 'fire_dragon') epImgName = 'Attack_fire_dragon';
            else if (p.type === 'fire_deathgod') epImgName = 'Attack_fire_deathgod';
            else if (p.type === 'fire_elysia') epImgName = 'Attack_fire_elysia';
            else if (p.type === 'armor_sword') epImgName = 'Attack_sword_armor';
            else if (p.type === 'rock_golem') epImgName = 'Attack_rock_golem';
            else if (p.type === 'rock_gargouille') epImgName = 'Attack_rock_gargouille';
            else if (p.type === 'water_ball') epImgName = 'Attack_water_ball'; 
            else if (p.type === 'ink_ball') epImgName = 'Attack_ink_ball'; 
            
            let epImg = window.getAsset(epImgName);
            if (p.rollAngle === undefined) p.rollAngle = 0;
            
            if (epImg && epImg.complete && epImg.naturalWidth > 0) {
                let spinDir = (p.vx >= 0) ? 1 : -1; 
                if (p.type === 'armor_sword') { p.rollAngle += 0.4; ctx.rotate(p.rollAngle); }
                else if (p.type === 'rock_gargouille') { p.rollAngle += 0.35 * spinDir; ctx.rotate(p.rollAngle); }
                else if (p.type === 'rock_golem') { p.rollAngle += 0.15 * spinDir; ctx.rotate(p.rollAngle); }
                else { ctx.rotate(pAngle + Math.PI / 2); }
                
                ctx.shadowColor = p.color || '#fff'; 
                ctx.shadowBlur = 40; 
                let drawSize = p.size * 12.0; 
                ctx.drawImage(epImg, -drawSize/2, -drawSize/2, drawSize, drawSize);
            } else {
                let spinDir = (p.vx >= 0) ? 1 : -1;
                if (p.type === 'armor_sword') { p.rollAngle += 0.4; ctx.rotate(p.rollAngle); }
                else if (p.type === 'rock_gargouille') { p.rollAngle += 0.35 * spinDir; ctx.rotate(p.rollAngle); }
                else if (p.type === 'rock_golem') { p.rollAngle += 0.15 * spinDir; ctx.rotate(p.rollAngle); }
                else { ctx.rotate(pAngle); }

                if (p.type === 'bone_skeleton') { 
                    ctx.fillStyle = '#ecf0f1'; let l = p.size * 1.5; let w = p.size * 0.3; let r = p.size * 0.6; ctx.fillRect(-l, -w, l * 2, w * 2); ctx.beginPath(); ctx.arc(-l, -w*1.2, r, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(-l, w*1.2, r, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(l, -w*1.2, r, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(l, w*1.2, r, 0, Math.PI*2); ctx.fill(); 
                } 
                else if (p.type === 'bat_web') { 
                    ctx.fillStyle = 'rgba(142, 68, 173, 0.8)'; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(0, -8); ctx.lineTo(-4, -4); ctx.lineTo(-8, -8); ctx.lineTo(-4, 0); ctx.lineTo(-8, 8); ctx.lineTo(-4, 4); ctx.lineTo(0, 8); ctx.closePath(); ctx.fill(); 
                } 
                else if (p.type === 'rock_golem' || p.type === 'rock_gargouille') {
                    ctx.fillStyle = p.color; ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2); ctx.fillStyle = '#2c3e50'; ctx.fillRect(-p.size, -p.size/4, p.size * 2, p.size/2); 
                }
                else { 
                    ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill(); 
                }
            }
            ctx.restore();
        });
    }

    let drawPlayer = true;
    if (typeof playerInvulnerableTimer !== 'undefined' && playerInvulnerableTimer > 0 && Math.floor(playerInvulnerableTimer / 5) % 2 === 0) drawPlayer = false; 
    
    if (drawPlayer) {
        let isElfInvuln = (typeof isUltimateActive !== 'undefined' && isUltimateActive && player.heroClass === 'Elf' && (typeof elfStealthBroken === 'undefined' || !elfStealthBroken));
        if (player.dashTimer > 0) ctx.globalAlpha = 0.5; 
        else if (isElfInvuln) ctx.globalAlpha = 0.4; 
        else ctx.globalAlpha = 1.0;
        
        let isMoving = (keys['z'] || keys['w'] || keys['s'] || keys['q'] || keys['a'] || keys['d'] || keys['arrowup'] || keys['arrowdown'] || keys['arrowleft'] || keys['arrowright']);
        let isSwimming = (typeof currentRoomId !== 'undefined' && currentRoomId >= 200 && currentRoomId < 900);
        
        let bobbingY = 0;
        let tilt = 0;
        if (!isSwimming) {
            bobbingY = isMoving ? Math.sin(Date.now() / 80) * 4 : Math.sin(Date.now() / 300) * 1.5;
            tilt = isMoving ? Math.sin(Date.now() / 120) * 0.1 : 0;
            if (player.dashTimer > 0) tilt = Math.PI / 8; 
        }
        
        ctx.save(); 
        ctx.translate(player.x + player.size / 2, player.y + player.size / 2 + bobbingY); 

        let dirP = window.getDirectionName(player.faceAngle);
        let prefixP = player.heroClass ? player.heroClass : 'Knight';
        
        if (prefixP === 'Mage') {
            prefixP = 'Burned'; 
        } else {
            prefixP = prefixP.charAt(0).toUpperCase() + prefixP.slice(1).toLowerCase();
        }
        
        let actionP = 'view';
        if ((typeof isAttacking !== 'undefined' && isAttacking) || (typeof attackCooldown !== 'undefined' && attackCooldown > 0)) {
            actionP = 'attack';
            let midTime = prefixP === 'Knight' ? 12 : 15;
            if (typeof attackCooldown !== 'undefined' && attackCooldown > midTime) actionP = 'attack1';
            else actionP = 'attack2';
        }
        
        let skinNameP = `${prefixP}_${dirP}_${actionP}`;
        
        if (isSwimming) {
            skinNameP = `${prefixP}_swim1_southwest_view`; 
        } 
        
        let pImg = window.getAsset(skinNameP);
        let is8DirP = !isSwimming; 

        if (!pImg || !pImg.complete || pImg.naturalWidth === 0) {
            let pSkinName = isSwimming ? `${prefixP}_swim1_south_view` : `${prefixP}_${dirP}_view`;
            pImg = window.getAsset(pSkinName);
        }

        if (!pImg || !pImg.complete || pImg.naturalWidth === 0) {
            skinNameP = `${prefixP}_${dirP}_${actionP}`;
            pImg = window.getAsset(skinNameP);
            if (!pImg || !pImg.complete || pImg.naturalWidth === 0) {
                let pSkinName = `${prefixP}_${dirP}_view`;
                pImg = window.getAsset(pSkinName);
            }
        }

        if (!pImg || !pImg.complete || pImg.naturalWidth === 0) {
            is8DirP = false;
            let fallbackNameP = '';
            if (player.heroClass === 'Elf') fallbackNameP = 'Elf_south_view';
            else if (player.heroClass === 'Mage') fallbackNameP = 'Burned_south_view';
            else fallbackNameP = `${prefixP}_south_view`;
            
            pImg = window.getAsset(fallbackNameP);
        }

        if (isSwimming) {
            let baseAngle = skinNameP.includes('southwest') ? (3 * Math.PI / 4) : (Math.PI / 2);
            ctx.rotate(player.faceAngle - baseAngle); 
        } else if (is8DirP) {
            let dirAngles = { 'east': 0, 'southeast': Math.PI/4, 'south': Math.PI/2, 'southwest': 3*Math.PI/4, 'west': Math.PI, 'northwest': -3*Math.PI/4, 'north': -Math.PI/2, 'northeast': -Math.PI/4 };
            let baseAngle = dirAngles[dirP] !== undefined ? dirAngles[dirP] : 0;
            let pivot = player.faceAngle - baseAngle;
            
            while (pivot < -Math.PI) pivot += Math.PI * 2;
            while (pivot > Math.PI) pivot -= Math.PI * 2;
            ctx.rotate(pivot + tilt); 
        } else {
            if (player.heroClass === 'Mage') ctx.rotate(player.faceAngle + tilt + (Math.PI / 2)); 
            else ctx.rotate(player.faceAngle + tilt); 
        }

        if (pImg && pImg.complete && pImg.naturalWidth > 0) {
            let displaySize = player.size * 3.75; 
            
            if (player.heroClass === 'Elf') {
                displaySize = (is8DirP || isSwimming) ? (player.size * 1.875) : (player.size * 4.5); 
            } else if (player.heroClass === 'Mage' && !is8DirP && !isSwimming) {
                displaySize = player.size * 5.25;
            }
            
            ctx.drawImage(pImg, -displaySize/2, -displaySize/2, displaySize, displaySize);
            
            if (prefixP === 'Knight' && typeof attackCooldown !== 'undefined' && attackCooldown > 0) {
                let swordImg = window.getAsset('Attack_sword_knight');
                if (swordImg && swordImg.complete && swordImg.naturalWidth > 0) {
                    ctx.save();
                    let maxCd = 25; 
                    let progress = (maxCd - attackCooldown) / maxCd; 
                    let swingAngle = -Math.PI / 2 + progress * Math.PI; 
                    
                    if (is8DirP && !isSwimming) ctx.rotate(-tilt); 
                    ctx.rotate(player.faceAngle); 
                    ctx.rotate(swingAngle); 
                    
                    ctx.translate(50, 0); 
                    ctx.globalAlpha = 1 - progress; 
                    ctx.shadowColor = '#ecf0f1'; 
                    ctx.shadowBlur = 20; 
                    ctx.drawImage(swordImg, -40, -40, 80, 80);
                    ctx.restore();
                }
            }
        } else {
            if (prefixP === 'Knight') {
                ctx.fillStyle = '#95a5a6'; ctx.beginPath(); ctx.arc(0, 0, player.size/2, 0, Math.PI*2); ctx.fill(); 
                ctx.fillStyle = '#2c3e50'; ctx.fillRect(-5, -10, 10, 20);
                
                ctx.save();
                if (typeof attackCooldown !== 'undefined' && attackCooldown > 0) {
                    let progress = (25 - attackCooldown) / 25;
                    let swipeAngle = -Math.PI / 2 + progress * (Math.PI * 1.3);
                    ctx.rotate(swipeAngle);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'; ctx.lineWidth = 4;
                    ctx.beginPath(); ctx.arc(0, 0, 40, -Math.PI / 2, swipeAngle); ctx.stroke();
                } else {
                    ctx.translate(5, 12); 
                }
                ctx.fillStyle = '#f1c40f'; ctx.fillRect(0, -3, 6, 6); 
                ctx.fillStyle = '#ecf0f1'; ctx.fillRect(6, -2, 28, 4); 
                ctx.restore();
            } else {
                ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.arc(0, 0, player.size/2, 0, Math.PI*2); ctx.fill();
            }
        }
        ctx.restore(); 
        ctx.globalAlpha = 1.0; 
    }
    
    if (!window.lightCanvas) {
        window.lightCanvas = document.createElement('canvas');
    }
    if (window.lightCanvas.width !== canvas.width || window.lightCanvas.height !== canvas.height) {
        window.lightCanvas.width = canvas.width;
        window.lightCanvas.height = canvas.height;
        window.lightCtx = window.lightCanvas.getContext('2d');
    }

    let lctx = window.lightCtx;
    lctx.clearRect(0, 0, window.lightCanvas.width, window.lightCanvas.height);
    
    lctx.globalCompositeOperation = 'source-over';
    
    let isElfUlt = (typeof isUltimateActive !== 'undefined' && isUltimateActive && player.heroClass === 'Elf');
    
    if (isElfUlt) {
        lctx.fillStyle = 'rgba(0, 0, 0, 0)'; 
    } 
    else if (typeof currentRoomId !== 'undefined' && currentRoomId >= 200 && currentRoomId < 900) {
        lctx.fillStyle = 'rgba(5, 20, 35, 0.85)'; 
    }
    else if (player.heroClass === 'Mage') {
        lctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; 
    } else {
        lctx.fillStyle = 'rgba(0, 0, 0, 0.70)'; 
    }
    lctx.fillRect(0, 0, canvas.width, canvas.height);

    lctx.globalCompositeOperation = 'destination-out';

    let px = player.x + player.size/2;
    let py = player.y + player.size/2;
    
    let pGrad = lctx.createRadialGradient(px, py, 60, px, py, 450);
    pGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    pGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    lctx.fillStyle = pGrad;
    lctx.beginPath();
    lctx.arc(px, py, 450, 0, Math.PI*2);
    lctx.fill();

    if (typeof currentRoomId !== 'undefined' && currentRoomId >= 200 && typeof currentEnemies !== 'undefined') {
        currentEnemies.forEach(e => {
            if (e.type === 'anglerfish') {
                let lx = e.x + e.size/2 + Math.cos(e.faceAngleTarget) * 30;
                let ly = e.y + e.size/2 + Math.sin(e.faceAngleTarget) * 30;
                let aGrad = lctx.createRadialGradient(lx, ly, 10, lx, ly, 150);
                aGrad.addColorStop(0, 'rgba(241, 196, 15, 0.9)');
                aGrad.addColorStop(1, 'rgba(241, 196, 15, 0)');
                lctx.fillStyle = aGrad;
                lctx.beginPath(); lctx.arc(lx, ly, 150, 0, Math.PI*2); lctx.fill();
            }
        });
    }

    if (typeof currentDoors !== 'undefined') {
        currentDoors.forEach(door => {
            let dx = door.x + door.width/2;
            let dy = door.y + door.height/2;
            
            if (door.face === 'north') dy = door.y;
            if (door.face === 'south') dy = door.y + door.height;
            if (door.face === 'west') dx = door.x;
            if (door.face === 'east') dx = door.x + door.width;

            let dGrad = lctx.createRadialGradient(dx, dy, 10, dx, dy, 200);
            dGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            dGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            lctx.fillStyle = dGrad;
            lctx.beginPath();
            lctx.arc(dx, dy, 200, 0, Math.PI*2);
            lctx.fill();
        });
    }

    if (typeof currentItems !== 'undefined') {
        currentItems.forEach(item => {
            if (!item.collected && (item.type === 'key' || item.type === 'key_skull' || item.type === 'key_orb')) {
                let dGrad = lctx.createRadialGradient(item.x, item.y, 5, item.x, item.y, 150);
                dGrad.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
                dGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
                lctx.fillStyle = dGrad;
                lctx.beginPath();
                lctx.arc(item.x, item.y, 150, 0, Math.PI*2);
                lctx.fill();
            }
        });
    }

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(window.lightCanvas, 0, 0);
    ctx.restore();
    
    if (typeof playerStats !== 'undefined' && playerStats.inventory && playerStats.inventory.coins !== undefined) {
        let coinImg = window.getAsset('gold_coin');
        if (coinImg && coinImg.complete && coinImg.naturalWidth > 0) {
            ctx.drawImage(coinImg, wallMargin + 15, 20, 30, 30);
        } else {
            ctx.fillStyle = '#f39c12'; ctx.beginPath(); ctx.arc(wallMargin + 30, 35, 16, 0, Math.PI*2); ctx.fill();
        }
        ctx.fillStyle = '#fff'; 
        ctx.font = 'bold 24px Arial'; 
        ctx.textAlign = 'left';
        ctx.fillText("x " + playerStats.inventory.coins, wallMargin + 55, 43);
    }
    
    if (typeof currentRoomId !== 'undefined' && currentRoomId >= 200 && currentRoomId < 900 && typeof worldState.oxygen !== 'undefined') {
        let oxyPercent = Math.max(0, worldState.oxygen / 36000);
        let boxWidth = 300; let boxX = canvas.width - boxWidth - wallMargin;
        ctx.fillStyle = '#111'; ctx.fillRect(boxX, 20, boxWidth, 20);
        ctx.fillStyle = '#3498db'; ctx.fillRect(boxX + 2, 22, (boxWidth - 4) * oxyPercent, 16);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Arial'; ctx.textAlign = 'center';
        ctx.fillText("OXYGÈNE : " + Math.ceil(worldState.oxygen / 60) + " s", boxX + boxWidth/2, 36);
        ctx.textAlign = 'left';
    }

    if (typeof currentEnemies !== 'undefined') {
        let boss = currentEnemies.find(e => ['troll', 'mage', 'dragon', 'deathgod', 'elysia', 'kraken'].includes(e.type));
        if (boss) {
            let bossName = "BOSS";
            if (boss.type === 'troll') bossName = "TROLL CORROMPU";
            else if (boss.type === 'mage') bossName = "MAGE EXILÉ";
            else if (boss.type === 'dragon') bossName = "DRAGON MAUDIT";
            else if (boss.type === 'deathgod') bossName = "DEATH GOD";
            else if (boss.type === 'elysia') bossName = "ELYSIA";
            else if (boss.type === 'kraken') bossName = "LEVIATHAN DES ABYSSES";
            
            let isPhase2 = boss.phase === 2 || (boss.health <= boss.maxHealth / 2); 
            let barWidth = 600; 
            let bx = canvas.width/2 - barWidth/2;
            
            ctx.fillStyle = '#111'; ctx.fillRect(bx, 30, barWidth, 24); 
            ctx.fillStyle = isPhase2 ? '#8e44ad' : '#e74c3c'; ctx.fillRect(bx + 2, 32, (barWidth - 4) * (Math.max(0, boss.health) / boss.maxHealth), 20);
            
            ctx.font = 'bold 20px Arial'; 
            ctx.textAlign = 'center'; 
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#000'; 
            
            let text = bossName + (boss.invulnerable ? " (INTRAITABLE)" : (isPhase2 ? " (ENRAGÉ)" : ""));
            ctx.strokeText(text, canvas.width/2, 22); 
            
            ctx.fillStyle = isPhase2 ? '#8e44ad' : '#f1c40f'; 
            ctx.fillText(text, canvas.width/2, 22); 
            ctx.textAlign = 'left';
        }
    }

    if (typeof currentRoomId !== 'undefined' && currentRoomId === 999) {
        ctx.fillStyle = '#ecf0f1'; 
        ctx.font = 'bold 28px Arial'; 
        ctx.textAlign = 'center';
        let displayWave = typeof arenaState !== 'undefined' && arenaState === "WAITING" ? arenaWave : arenaWave - 1;
        if (typeof arenaState !== 'undefined' && arenaState === "WAITING" && typeof arenaTimer !== 'undefined' && arenaTimer > 0) {
            ctx.fillText("VAGUE " + displayWave + " DANS " + Math.ceil(arenaTimer/60) + "S", canvas.width/2, wallMargin + 40);
        } else if (displayWave > 0) {
            ctx.fillText("VAGUE " + displayWave, canvas.width/2, wallMargin + 40);
        }
        ctx.textAlign = 'left';
    }

    if (typeof window.activeDialogue !== 'undefined' && window.activeDialogue) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 4;
        let dw = 700, dh = 150;
        let dx = canvas.width/2 - dw/2, dy = canvas.height - dh - 30; 
        
        ctx.fillRect(dx, dy, dw, dh);
        ctx.strokeRect(dx, dy, dw, dh);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        let lines = window.activeDialogue.text.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (i === lines.length - 1) ctx.fillStyle = '#f1c40f'; 
            ctx.fillText(lines[i], canvas.width/2, dy + 45 + (i * 35));
        }
        ctx.restore();
    }

    ctx.restore(); 
};
