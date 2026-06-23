// ============================================================================
// ENGINE INITIALIZATION & GLOBAL VARIABLES MANAGEMENT
// ============================================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1200;
canvas.height = 800;

// --- ETATS GENERAUX DU JEU ---
let gameState = "MENU";
const wallMargin = 50; 
let player = { x: 150, y: 150, size: 40, speed: 5, heroClass: null, faceAngle: 0 };
let keys = {};
let mouse = { x: 0, y: 0 };
let leftClickHeld = false;
let leftClickHoldTime = 0;

// --- NÉCROMANCIEN & VAGUES (NOUVEAUTÉS) ---
let spaceHoldTimer = 0;       // Chrono touche espace pour le menu secret
let waveStartDelay = 0;       // Délai de 1 sec avant attaque des ennemis
let necroKills = [];          // Le "Cimetière" (réserve d'âmes)
let necroSummons = [];        // Invocations sur le terrain

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

let worldState = {
    unlockedDoors: {},
    collectedItems: {},
    clearedRooms: {},
    bloodStains: {},
    enemyStates: {} 
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

// --- DECORATIONS ET STATISTIQUES JOUEUR ---
let bookshelf = { x: canvas.width - wallMargin - 40, y: 200, width: 40, height: 150 };

let playerStats = {
  name: "???", weapon: "???", health: 100, maxHealth: 100, mana: 0,
  inventory: {
    keys: { gold: 0, skull: 0, orb: 0 },
    potions: { green: 0, yellow: 0, blue: 0, red: 0 } 
  }
};

// ============================================================================
// ASSETS MANAGER - CHARGEMENT DES IMAGES
// ============================================================================

const assetsManager = {
    images: {},
    load(name, path) {
        let img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = path;
        this.images[name] = img;
        img.onload = () => console.log("Chargé : " + name);
        img.onerror = () => console.error("Erreur de chargement : " + path);
    }
};

assetsManager.load('sol_base', 'assets/tiles/floor.png'); 
assetsManager.load('left_wall', 'assets/tiles/left_wall.png');
assetsManager.load('right_wall', 'assets/tiles/right_wall.png');
assetsManager.load('back_wall', 'assets/tiles/back_wall.png');   
assetsManager.load('front_wall', 'assets/tiles/front_wall.png'); 
assetsManager.load('card_knight', 'assets/card/Knight.png');
assetsManager.load('card_elf', 'assets/card/Elf.png');
assetsManager.load('card_burned', 'assets/card/Burned.png');
assetsManager.load('left_door', 'assets/decors/left_door.png');
assetsManager.load('right_door', 'assets/decors/right_door.png');
assetsManager.load('back_door', 'assets/decors/back_door.png');   // Porte du NORD (Haut)
assetsManager.load('front_door', 'assets/decors/front_door.png'); // Porte du SUD (Bas)
