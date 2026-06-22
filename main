// ============================================================================
// CORE LOOP CONTROLLER, ENGINE TICKS & USER INTERACTION LISTENERS
// ============================================================================

// --- ÉCOUTEURS INTERACTIFS GLOBAUX ---
window.startHeroHold = function(heroClass) {
  isHolding = true; holdCompleted = false;
  holdTimer = setTimeout(() => { holdCompleted = true; startArenaMode(heroClass); }, 10000); 
};

window.endHeroHold = function(heroClass) {
  if (isHolding) {
    clearTimeout(holdTimer); isHolding = false;
    if (!holdCompleted) selectHero(heroClass); 
  }
};

window.selectHero = function(heroClass) {
  if (heroClass === 'Mage') return;

  player.heroClass = heroClass;
  if (heroClass === 'Knight') {
    playerStats.name = "CHEVALIER"; playerStats.weapon = "ÉPÉE LOURDE"; player.speed = 4;
    playerStats.maxHealth = 140; playerStats.health = 140;
  } else if (heroClass === 'Elf') {
    playerStats.name = "KEBRA"; playerStats.weapon = "ARC D'EMERYN"; player.speed = 6;
    playerStats.maxHealth = 100; playerStats.health = 100;
  }
  document.getElementById('p-name').innerText = playerStats.name;
  document.getElementById('p-weapon').innerText = playerStats.weapon;
  document.getElementById('menu-screen').style.display = 'none';
  
  loadRoom(1); 
  updateHUD();
  gameState = "PLAYING";
};

function startArenaMode(heroClass) {
  isArenaMode = true; arenaWave = 1; arenaState = "WAITING"; arenaTimer = 300; 
  player.heroClass = heroClass;
  if (heroClass === 'Knight') {
    playerStats.name = "CHEVALIER (ARÈNE)"; playerStats.weapon = "ÉPÉE LOURDE"; player.speed = 4;
    playerStats.maxHealth = 140; playerStats.health = 140;
  } else if (heroClass === 'Elf') {
    playerStats.name = "KEBRA (ARÈNE)"; playerStats.weapon = "ARC D'EMERYN"; player.speed = 6;
    playerStats.maxHealth = 100; playerStats.health = 100;
  } else if (heroClass === 'Mage') {
    playerStats.name = "MAGE BRÛLEUR"; playerStats.weapon = "BOULES DE FEU"; player.speed = 5;
    playerStats.maxHealth = 100; playerStats.health = 100;
  }
  document.getElementById('p-name').innerText = playerStats.name;
  document.getElementById('p-weapon').innerText = playerStats.weapon;
  document.getElementById('menu-screen').style.display = 'none';
  
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
    } 
    else if (color === 'red' && playerStats.health < playerStats.maxHealth) {
      playerStats.health = Math.min(playerStats.maxHealth, playerStats.health + (playerStats.maxHealth * 0.5)); 
      potionUsed = true;
    } 
    else if (color === 'blue' && playerStats.mana < 100) {
      playerStats.mana = Math.min(100, playerStats.mana + 20); 
      potionUsed = true;
    } 
    else if (color === 'yellow') {
      playerPoisonTimer = 0; playerSlowTimer = 0;
      potionUsed = true;
    }
    if (potionUsed) {
      playerStats.inventory.potions[color]--;
      updateHUD();
      spawnParticles(player.x + player.size/2, player.y + player.size/2, '#3498db', 20);
    }
  }
};

window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);
window.addEventListener('mouseup', () => { leftClickHeld = false; });

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  mouse.x = (e.clientX - rect.left) * scaleX;
  mouse.y = (e.clientY - rect.top) * scaleY;
});

canvas.addEventListener('mousedown', (e) => {
  if (gameState !== "PLAYING") return;
  
  leftClickHeld = true; leftClickHoldTime = 0;
  if (attackCooldown > 0) return;

  let dx = mouse.x - (player.x + player.size / 2);
  let dy = mouse.y - (player.y + player.size / 2);
  let angle = Math.atan2(dy, dx);
  player.faceAngle = angle; 
  
  let now = Date.now();
  if (now - lastClickTime < 300 && playerStats.mana >= 100) {
      activateUltimate(); return;
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
  } else if (player.heroClass === 'Knight') {
    isAttacking = true; attackCooldown = 40;
    let hitBox = { x: player.x + player.size / 2 + Math.cos(angle) * 60 - 60, y: player.y + player.size / 2 + Math.sin(angle) * 60 - 60, size: 120 };
    currentEnemies.forEach(enemy => { 
        if (checkCollision(hitBox, enemy)) {
            if (!enemy.invulnerable) enemy.health -= 50;
            spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, enemy.color, 15);
            triggerShake(5, 8); 
        } 
    });
  }
});

// --- CORE FRAME LOOP TICK ---
function update() {
  if (gameState !== "PLAYING" && gameState !== "GAMEOVER") { requestAnimationFrame(update); return; }

  if (gameState === "GAMEOVER") { renderGameView(); requestAnimationFrame(update); return; }

  // LOGIQUE CHANGE ROOM ET TRANSITIONS
  let roomChanged = false;
  currentDoors.forEach(door => {
    if (!roomChanged && checkCollision(player, door)) { 
      if (door.locked) {
        if (playerStats.inventory.keys.gold > 0) {
          playerStats.inventory.keys.gold--; door.locked = false;
          worldState.unlockedDoors[door.id] = true; updateHUD();
          spawnParticles(door.x + door.width/2, door.y + door.height/2, '#f1c40f', 30);
          if (door.dest !== null) {
              saveRoomState(); loadRoom(door.dest); player.x = door.spawnX; player.y = door.spawnY; roomChanged = true;
          }
        } else {
          if (door.face === 'north') player.y = door.y + door.height;
          else if (door.face === 'south') player.y = door.y - player.size;
          else if (door.face === 'east') player.x = door.x - player.size;
          else if (door.face === 'west') player.x = door.x + door.width;
        }
      } else if (door.dest !== null) {
        saveRoomState(); loadRoom(door.dest); player.x = door.spawnX; player.y = door.spawnY; roomChanged = true;
      } 
    }
  });
  if (roomChanged) { requestAnimationFrame(update); return; }

  // ULTIME ET TIMERS MOTRICES
  if ((keys[' '] || keys['0'] || keys['control']) && playerStats.mana >= 100) {
      activateUltimate(); keys[' '] = false; keys['0'] = false; keys['control'] = false; 
  }
  if (leftClickHeld) {
      leftClickHoldTime++;
      if (leftClickHoldTime >= 180 && playerStats.mana >= 100) { activateUltimate(); leftClickHeld = false; }
  }
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
  if (playerStats.mana >= 100) manaBar.style.opacity = Math.floor(Date.now() / 250) % 2 === 0 ? "1" : "0.3";
  else manaBar.style.opacity = "1";

  // SYSTEM COMPORTEMENT ARÈNE / VAGUES
  if (currentRoomId === 999) {
    if (arenaWave === 11 && arenaState === "ACTIVE") {
        if (arenaShrink < 250) { arenaShrink += (250 / 1800); }
    } else if (arenaWave > 11 || (arenaWave === 11 && arenaState === "WAITING")) { arenaShrink = 0; }

    if (arenaState === "ACTIVE" && currentEnemies.length === 0) { arenaState = "WAITING"; arenaTimer = 300; }
    
    if (arenaState === "WAITING") {
      arenaTimer--;
      if (arenaTimer <= 0) {
        if (arenaWave === 10) spawnEnemy('troll', 1); 
        else if (arenaWave === 20) spawnEnemy('mage', 1); 
        else if (arenaWave === 30) spawnEnemy('dragon', 1);
        else {
            if (arenaWave < 6) spawnEnemy('goblin', arenaWave);
            else if (arenaWave >= 6 && arenaWave <= 10) { spawnEnemy('skeleton', 5); spawnEnemy('goblin', arenaWave - 5); }
            else if (arenaWave >= 11 && arenaWave <= 14) { spawnEnemy('skeleton', 5 + (arenaWave - 10)); spawnEnemy('goblin', 4); }
            else { 
                spawnEnemy('skeleton', 9); 
                if (arenaWave >= 25) {
                    spawnEnemy('spider', 10); spawnEnemy('goblin', 4 + (arenaWave - 24)); 
                } else {
                    spawnEnemy('spider', arenaWave - 14); spawnEnemy('goblin', 4); 
                }
            }
        }
        arenaWave++; arenaState = "ACTIVE";
        if ((arenaWave - 1) % 10 === 0 && (arenaWave - 1) > 0) {
            currentItems.push({ id: 'potion_arena_' + arenaWave, type: 'potion_green', x: canvas.width/2 - 7.5, y: canvas.height/2 - 7.5, size: 15, collected: false });
        }
      }
    }
  }

  // CONTROLES DE DEPLACEMENT
  let currentSpeed = playerSlowTimer > 0 ? player.speed / 2 : player.speed;
  if (keys['z'] || keys['w'] || keys['arrowup'])    player.y -= currentSpeed;
  if (keys['s'] || keys['arrowdown'])               player.y += currentSpeed;
  if (keys['q'] || keys['a'] || keys['arrowleft'])  player.x -= currentSpeed;
  if (keys['d'] || keys['arrowright'])              player.x += currentSpeed;

  let minLimitX = wallMargin + arenaShrink; let minLimitY = wallMargin + arenaShrink;
  let maxLimitX = canvas.width - wallMargin - arenaShrink - player.size;
  let maxLimitY = canvas.height - wallMargin - arenaShrink - player.size;

  if (player.x < minLimitX) player.x = minLimitX; if (player.y < minLimitY) player.y = minLimitY;
  if (player.x > maxLimitX) player.x = maxLimitX; if (player.y > maxLimitY) player.y = maxLimitY;

  if (currentRoomId === 1 && player.x + player.size > bookshelf.x && player.y + player.size > bookshelf.y && player.y < bookshelf.y + bookshelf.height) {
    player.x = bookshelf.x - player.size;
  }

  let mouseDx = mouse.x - (player.x + player.size / 2);
  let mouseDy = mouse.y - (player.y + player.size / 2);
  player.faceAngle = Math.atan2(mouseDy, mouseDx);

  // RAMASSAGE DES UTILS
  currentItems.forEach(item => {
    if (!item.collected && checkCollision(player, item)) {
      item.collected = true; worldState.collectedItems[item.id] = true; 
      if (item.type === 'key') playerStats.inventory.keys.gold++;
      else if (item.type === 'potion_green') playerStats.inventory.potions.green++;
      updateHUD(); spawnParticles(item.x, item.y, '#f1c40f', 15);
    }
  });

  if (attackCooldown > 0) attackCooldown--;
  if (player.heroClass === 'Knight' && attackCooldown < 25) isAttacking = false;

  let isElfInvuln = (isUltimateActive && player.heroClass === 'Elf' && !elfStealthBroken);
  
  // TOUTE L'IA ET SYSTEMES COMPORTEMENTAUX DES ADVERSAIRES
  currentEnemies.forEach((enemy) => {
    enemy.wobble += 0.1; 
    let eMaxX = canvas.width - wallMargin - arenaShrink - enemy.size;
    let eMaxY = canvas.height - wallMargin - arenaShrink - enemy.size;
    if (enemy.x < minLimitX) enemy.x = minLimitX; if (enemy.y < minLimitY) enemy.y = minLimitY;
    if (enemy.x > eMaxX) enemy.x = eMaxX; if (enemy.y > eMaxY) enemy.y = eMaxY;

    if (enemy.isBurning && enemy.burnTicks > 0) {
        enemy.burnTimer--;
        if (enemy.burnTimer <= 0) {
            enemy.health -= 10; enemy.burnTicks--; enemy.burnTimer = 60;
            spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, '#e67e22', 5);
        }
        if (enemy.burnTicks <= 0) enemy.isBurning = false;
    }

    let dx = 0, dy = 0, dist = 9999;
    if (!isElfInvuln) { dx = player.x - enemy.x; dy = player.y - enemy.y; dist = Math.hypot(dx, dy); }
    
    if (enemy.type === 'goblin') {
        if (dist > 0 && dist < 9999) { enemy.x += (dx / dist) * enemy.speed; enemy.y += (dy / dist) * enemy.speed; }
    } else if (enemy.type === 'spider' || enemy.type === 'skeleton') {
        if (enemy.type === 'spider') {
            if (dist > 100 && dist < 9999) { enemy.x += (dx / dist) * enemy.speed; enemy.y += (dy / dist) * enemy.speed; }
        } else { 
            if (dist > 300 && dist < 9999) { enemy.x += (dx / dist) * enemy.speed; enemy.y += (dy / dist) * enemy.speed; }
            else if (dist < 200) { enemy.x -= (dx / dist) * enemy.speed; enemy.y -= (dy / dist) * enemy.speed; }
        }
        if (enemy.shootCooldown > 0) enemy.shootCooldown--;
        if (enemy.shootCooldown <= 0 && dist < 600) {
            let pSize = enemy.type === 'spider' ? 6 : 8;
            let pSpeed = enemy.type === 'spider' ? 8 : 6;
            let pColor = enemy.type === 'spider' ? '#8e44ad' : '#ecf0f1';
            enemyProjectiles.push({ x: enemy.x+enemy.size/2, y: enemy.y+enemy.size/2, vx: (dx/dist)*pSpeed, vy: (dy/dist)*pSpeed, size: pSize, color: pColor, damage: 20, type: enemy.type === 'spider' ? 'poison' : 'normal' });
            enemy.shootCooldown = 120;
        }
    } else if (enemy.type === 'troll') {
        if (dist > 0 && dist < 9999) { enemy.x += (dx / dist) * enemy.speed; enemy.y += (dy / dist) * enemy.speed; }
        enemy.summonTimer--;
        if (enemy.summonTimer <= 0) {
            spawnEnemy('goblin', 1, enemy.x, enemy.y); enemy.summonTimer = 180; 
            spawnParticles(enemy.x+enemy.size/2, enemy.y+enemy.size/2, '#27ae60', 20);
        }
    } else if (enemy.type === 'mage') {
        if (dist > 300 && dist < 9999) { enemy.x += (dx / dist) * enemy.speed; enemy.y += (dy / dist) * enemy.speed; }
        else if (dist < 200) { enemy.x -= (dx / dist) * enemy.speed; enemy.y -= (dy / dist) * enemy.speed; }
        enemy.timeAlive++; 
        if (enemy.shootCooldown > 0) enemy.shootCooldown--;
        if (enemy.shootCooldown <= 0 && dist < 800) {
            enemyProjectiles.push({ x: enemy.x+enemy.size/2, y: enemy.y+enemy.size/2, vx: (dx/dist)*6, vy: (dy/dist)*6, size: 10, color: '#9b59b6', damage: 40, type: 'normal' });
            enemy.shootCooldown = Math.max(30, 90 - (enemy.timeAlive / 20)); 
        }
        enemy.summonTimer--;
        if (enemy.summonTimer <= 0) {
            spawnEnemy('skeleton', 1, enemy.x+50, enemy.y); spawnEnemy('spider', 1, enemy.x-50, enemy.y);
            enemy.summonTimer = 180; spawnParticles(enemy.x+enemy.size/2, enemy.y+enemy.size/2, '#9b59b6', 20);
        }
    } else if (enemy.type === 'dragon') {
        if (enemy.phase2Timer === undefined) enemy.phase2Timer = 1800; 
        if (enemy.phase === 1) {
            if (dist > 150 && dist < 9999) { enemy.x += (dx / dist) * enemy.speed; enemy.y += (dy / dist) * enemy.speed; }
            if (enemy.shootCooldown > 0) enemy.shootCooldown--;
            if (enemy.shootCooldown <= 0 && dist < 500) {
                let baseAngle = Math.atan2(dy, dx);
                for(let a = -Math.PI/4; a <= Math.PI/4 + 0.01; a += Math.PI/8) {
                    let fireAngle = baseAngle + a;
                    enemyProjectiles.push({ x: enemy.x+enemy.size/2, y: enemy.y+enemy.size/2, vx: Math.cos(fireAngle)*7, vy: Math.sin(fireAngle)*7, size: 14, color: '#e67e22', damage: playerStats.maxHealth * 0.20, type: 'fire' });
                }
                enemy.shootCooldown = 90;
            }
            if (enemy.health <= enemy.maxHealth / 2) {
                enemy.phase = 2; enemy.invulnerable = true;
                spawnParticles(enemy.x+enemy.size/2, enemy.y+enemy.size/2, '#c0392b', 100); triggerShake(20, 40);
            }
        } else if (enemy.phase === 2) {
            enemy.phase2Timer--; enemy.health = (enemy.phase2Timer / 1800) * (enemy.maxHealth / 2); 
            let rate = enemy.phase2Timer < 600 ? 0.12 : 0.04; 
            if (Math.random() < rate) {
                let mx = wallMargin + arenaShrink + Math.random() * (canvas.width - wallMargin*2 - arenaShrink*2);
                let my = wallMargin + arenaShrink + Math.random() * (canvas.height - wallMargin*2 - arenaShrink*2);
                hazards.push({ x: mx, y: my, radius: 70, timer: 60, maxTimer: 60, damage: 40 });
            }
            if (enemy.shootCooldown > 0) enemy.shootCooldown--;
            if (enemy.shootCooldown <= 0 && dist < 9999) {
                enemyProjectiles.push({ x: enemy.x+enemy.size/2, y: enemy.y+enemy.size/2, vx: (dx/dist)*8, vy: (dy/dist)*8, size: 12, color: '#c0392b', damage: 30, type: 'fire' });
                enemy.shootCooldown = enemy.phase2Timer < 600 ? 15 : 40;
            }
            if (enemy.phase2Timer <= 0) enemy.health = 0; 
        }
    }

    if (playerInvulnerableTimer <= 0 && !isElfInvuln && !enemy.invulnerable && checkCollision(player, enemy)) {
      playerStats.health -= (enemy.type === 'troll' ? 50 : (enemy.type === 'dragon' ? 0 : 20)); 
      triggerShake(12, 20); spawnParticles(player.x + player.size/2, player.y + player.size/2, '#e74c3c', 25);
      playerInvulnerableTimer = 60; updateHUD();
      if (playerStats.health <= 0) handlePlayerDeath();
    }
  });

  // REPOUSSE PHYSIQUE ENTRE MONSTRES
  for (let i = 0; i < currentEnemies.length; i++) {
    for (let j = i + 1; j < currentEnemies.length; j++) {
      let e1 = currentEnemies[i]; let e2 = currentEnemies[j];
      let dx = (e1.x + e1.size/2) - (e2.x + e2.size/2); let dy = (e1.y + e1.size/2) - (e2.y + e2.size/2);
      let dist = Math.hypot(dx, dy); let minDist = (e1.size + e2.size) / 2; 
      if (dist < minDist) {
        if (dist === 0) { dx = Math.random()-0.5; dy = Math.random()-0.5; dist = Math.hypot(dx, dy); }
        let overlap = minDist - dist;
        e1.x += (dx / dist) * (overlap / 2); e1.y += (dy / dist) * (overlap / 2);
        e2.x -= (dx / dist) * (overlap / 2); e2.y -= (dy / dist) * (overlap / 2);
      }
    }
  }

  // DANGERS AMBIANTS (MÉTÉORES DRAGON)
  for (let i = hazards.length - 1; i >= 0; i--) {
      let h = hazards[i]; h.timer--;
      if(h.timer <= 0) {
          if(Math.hypot((player.x+player.size/2) - h.x, (player.y+player.size/2) - h.y) < h.radius + player.size/2) {
              if (playerInvulnerableTimer <= 0 && !isElfInvuln) {
                  playerStats.health -= h.damage; triggerShake(15, 20);
                  playerInvulnerableTimer = 60; updateHUD();
                  if (playerStats.health <= 0) handlePlayerDeath();
              }
          }
          spawnParticles(h.x, h.y, '#e74c3c', 30); triggerShake(8, 10); hazards.splice(i, 1);
      }
  }

  // NETTOYAGE PHYSIQUE ET RECOMPENSES
  for (let i = currentEnemies.length - 1; i >= 0; i--) {
    if (currentEnemies[i].health <= 0) {
      if (!worldState.bloodStains[currentRoomId]) worldState.bloodStains[currentRoomId] = [];
      for(let b = 0; b < 5; b++) {
          worldState.bloodStains[currentRoomId].push({ x: currentEnemies[i].x + Math.random() * 30 - 15, y: currentEnemies[i].y + Math.random() * 30 - 15, r: Math.random() * 12 + 4 });
      }
      playerStats.mana = Math.min(100, playerStats.mana + 5); 
      spawnParticles(currentEnemies[i].x + currentEnemies[i].size/2, currentEnemies[i].y + currentEnemies[i].size/2, '#c0392b', 30);
      currentEnemies.splice(i, 1);
      if (currentEnemies.length === 0) worldState.clearedRooms[currentRoomId] = true;
      updateHUD();
    }
  }

  // CONTROLE DES INTERSECTIONS DE PROJECTILES (PERFORANTS ELFE & MAGE)
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i]; p.x += p.vx; p.y += p.vy;
    if (p.x < wallMargin || p.y < wallMargin || p.x > canvas.width - wallMargin || p.y > canvas.height - wallMargin) { projectiles.splice(i, 1); continue; }
    
    for (let j = 0; j < currentEnemies.length; j++) {
      let enemy = currentEnemies[j];
      if (p.hitTargets && p.hitTargets.includes(enemy)) continue;
      let arrowHitbox = { x: p.x - p.size, y: p.y - p.size, size: p.size * 2 };
      
      if (checkCollision(arrowHitbox, enemy)) {
        if (!enemy.invulnerable) {
            let dmg = player.heroClass === 'Elf' ? 60 : (player.heroClass === 'Mage' ? 30 : 0);
            enemy.health -= dmg;
            if (player.heroClass === 'Mage') { enemy.isBurning = true; enemy.burnTicks = 5; enemy.burnTimer = 60; }
        }
        spawnParticles(enemy.x + enemy.size/2, enemy.y + enemy.size/2, enemy.color, 10);
        if (player.heroClass === 'Elf' || player.heroClass === 'Mage') {
            if (!p.hitTargets) p.hitTargets = []; p.hitTargets.push(enemy); 
        } else { projectiles.splice(i, 1); break; }
      }
    }
  }

  // TRAJECTOIRE ENEMY PROJECTILES
  for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
    let p = enemyProjectiles[i]; p.x += p.vx; p.y += p.vy;
    if (p.x < wallMargin || p.y < wallMargin || p.x > canvas.width - wallMargin || p.y > canvas.height - wallMargin) { enemyProjectiles.splice(i, 1); continue; }
    let arrowHitbox = { x: p.x - p.size, y: p.y - p.size, size: p.size * 2 };
    if (playerInvulnerableTimer <= 0 && !isElfInvuln && checkCollision(arrowHitbox, player)) {
        playerStats.health -= p.damage; triggerShake(10, 15);
        spawnParticles(player.x + player.size/2, player.y + player.size/2, '#e74c3c', 25);
        if (p.type === 'poison') { playerPoisonTimer = 300; playerSlowTimer = 180; } 
        playerInvulnerableTimer = 60; enemyProjectiles.splice(i, 1); updateHUD();
        if (playerStats.health <= 0) handlePlayerDeath();
    }
  }

  // APPEL DU RENDU DE RENDERER.JS ET TICK FRAME SUIVANTE
  renderGameView();
  requestAnimationFrame(update);
}

// DECLENCHEMENT AUTOMATIQUE DU MOTEUR
update();
