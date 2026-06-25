// ============================================================================
// VARIABLES GLOBALES (js/globals.js)
// Gère la mémoire centrale du jeu.
// ============================================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const wallMargin = 60;
const bookshelf = { x: 1200 / 2 - 100, y: 40, width: 200, height: 150 };

let gameState = "MENU"; 
let isPaused = false;
let lastClickTime = 0;
let leftClickHeld = false;
let leftClickHoldTime = 0;
let attackCooldown = 0;
let isAttacking = false;

let keys = {};
let mouse = { x: 0, y: 0 };
let isHolding = false;
let holdTimer = null;
let holdCompleted = false;
let spaceHoldTimer = 0;

let isArenaMode = false;
let arenaWave = 1;
let arenaState = "WAITING";
let arenaTimer = 300;
let arenaShrink = 0;
let waveStartDelay = 0;

let currentRoomId = 1;
let currentEnemies = [];
let currentItems = [];
let currentDoors = [];
let currentCrates = [];
let projectiles = [];
let enemyProjectiles = [];
let hazards = [];
let particles = [];
let bloodStains = [];
let necroSummons = [];

let playerInvulnerableTimer = 0;
let playerPoisonTimer = 0;
let playerSlowTimer = 0;
let shakeIntensity = 0;
let shakeTimer = 0;
let ultimateTimer = 0;
let isUltimateActive = false;
let elfStealthBroken = false;

let player = {
    x: 600, y: 400, size: 30, speed: 5, faceAngle: 0, heroClass: 'Knight',
    dashCooldown: 0, dashTimer: 0, dashVx: 0, dashVy: 0
};

let playerStats = {
    name: "HÉROS", weapon: "ARME", health: 100, maxHealth: 100, mana: 100,
    inventory: {
        keys: { gold: 0, skull: 0, orb: 0 },
        potions: { green: 0, yellow: 0, blue: 0, red: 0 },
        coins: 0
    }
};

let worldState = {
    unlockedDoors: {}, openedDoors: {}, collectedItems: {}, clearedRooms: {},
    enemyStates: {}, bloodStains: {}, visitedRooms: {}, 
    brokenCrates: {}, openedChests: {}, bossDefeated: false
};

// Fonctions globales ultra-basiques utilisées par tous les fichiers
window.checkCollision = function(rect1, rect2) {
    let w1 = rect1.width || rect1.size; let h1 = rect1.height || rect1.size;
    let w2 = rect2.width || rect2.size; let h2 = rect2.height || rect2.size;
    // Les <= et >= permettent de glisser le long des murs sans se coincer !
    return (rect1.x <= rect2.x + w2 && rect1.x + w1 >= rect2.x && rect1.y <= rect2.y + h2 && rect1.y + h1 >= rect2.y);
};

window.saveRoomState = function() {
    if (!worldState.enemyStates) worldState.enemyStates = {};
    worldState.enemyStates[currentRoomId] = JSON.parse(JSON.stringify(currentEnemies));
};
