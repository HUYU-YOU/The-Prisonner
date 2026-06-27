// ============================================================================
// VARIABLES GLOBALES (js/globals.js)
// Centralise toute la mémoire du jeu
// ============================================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// --- ETATS GENERAUX DU JEU ---
let gameState = "MENU";
const wallMargin = 50; 
let player = { x: 150, y: 150, size: 40, speed: 5, heroClass: null, faceAngle: 0, dashCooldown: 0, dashTimer: 0, dashVx: 0, dashVy: 0 };
let keys = {};
let mouse = { x: 0, y: 0 };
let leftClickHeld = false;
let leftClickHoldTime = 0;

// --- NÉCROMANCIEN & VAGUES ---
let spaceHoldTimer = 0;
let waveStartDelay = 0;
let necroKills = [];
let necroSummons = [];

// --- SESSIONS DE COMBAT & EFFETS ---
let projectiles = [];
let enemyProjectiles = []; 
let hazards = []; 
let isAttacking = false;
let attackCooldown = 0;
let playerInvulnerableTimer = 0; 
let playerPoisonTimer = 0; 
let playerSlowTimer = 0; 
let bloodStains = []; 
let particles = [];
let shakeTimer = 0;
let shakeIntensity = 0;

// --- PARAMETRES DES COMPETANCES ULTIMES ---
let isUltimateActive = false;
let ultimateTimer = 0;
let elfStealthBroken = false;
let lastClickTime = 0;

// --- CARTOGRAPHIE ET SAUVEGARDE DU MONDE ---
let currentRoomId = 1;
let currentDoors = [];
let currentItems = [];
let currentEnemies = [];
let currentCrates = [];

let worldState = {
    unlockedDoors: {},
    openedDoors: {},
    collectedItems: {},
    clearedRooms: {},
    bloodStains: {},
    enemyStates: {},
    visitedRooms: {},
    brokenCrates: {},
    openedChests: {},
    bossDefeated: false
};

// --- CONFIGURATION DU MODE ARENE (VAGUES) ---
let holdTimer = null;
let isHolding = false;
let holdCompleted = false;
let isArenaMode = false;
let arenaWave = 1;
let arenaTimer = 0; 
let arenaState = "WAITING"; 
let arenaShrink = 0; 
let isPaused = false;

// --- DECORATIONS ET STATISTIQUES JOUEUR ---
let bookshelf = { x: 1200 - wallMargin - 40, y: 200, width: 40, height: 150 };

let playerStats = {
  name: "???", weapon: "???", health: 100, maxHealth: 100, mana: 0,
  inventory: {
    keys: { gold: 0, skull: 0, orb: 0 },
    potions: { green: 0, yellow: 0, blue: 0, red: 0 },
    coins: 0
  }
};

// --- FONCTIONS UTILITAIRES GLOBALES ---
window.checkCollision = function(rect1, rect2) {
    let w1 = rect1.width || rect1.size; let h1 = rect1.height || rect1.size;
    let w2 = rect2.width || rect2.size; let h2 = rect2.height || rect2.size;
    // L'utilisation de <= et >= permet de glisser contre les murs sans bloquer
    return (rect1.x <= rect2.x + w2 && rect1.x + w1 >= rect2.x && rect1.y <= rect2.y + h2 && rect1.y + h1 >= rect2.y);
};

window.saveRoomState = function() {
    if (!worldState.enemyStates) worldState.enemyStates = {};
    worldState.enemyStates[currentRoomId] = JSON.parse(JSON.stringify(currentEnemies));
};
