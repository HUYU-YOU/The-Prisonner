// ============================================================================
// VARIABLES GLOBALES (js/globals.js)
// ============================================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const wallMargin = 60;
const bookshelf = { x: 1200 / 2 - 100, y: 40, width: 200, height: 150 };

let gameState = "MENU"; // MENU, PLAYING, GAMEOVER, PAUSED
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
let necroKills = [];

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
