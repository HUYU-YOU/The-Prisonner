// ============================================================================
// ASSETS MANAGER - CHARGEMENT DES IMAGES (js/assets.js)
// Ne contient désormais plus aucune variable pour éviter les bugs !
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


assetsManager.load('left_door_close', 'assets/decors/left_door_close.png');
assetsManager.load('left_door_open', 'assets/decors/left_door_open.png');
assetsManager.load('left_door_key', 'assets/decors/left_door_key.png'); 
assetsManager.load('right_door_close', 'assets/decors/right_door_close.png');
assetsManager.load('right_door_open', 'assets/decors/right_door_open.png');
assetsManager.load('right_door_key', 'assets/decors/right_door_key.png'); 
assetsManager.load('front_door_close', 'assets/decors/front_door_close.png');
assetsManager.load('front_door_open', 'assets/decors/front_door_open.png');
assetsManager.load('front_door_key', 'assets/decors/front_door_key.png'); 
assetsManager.load('back_door_close', 'assets/decors/back_door_close.png');
assetsManager.load('back_door_open', 'assets/decors/back_door_open.png');
assetsManager.load('back_door_key', 'assets/decors/back_door_key.png'); 

assetsManager.load('Elf_west', 'assets/skins/Elf_west.png');
assetsManager.load('Elf_est', 'assets/skins/Elf_est.png');
assetsManager.load('Elf_back', 'assets/skins/Elf_back.png');
assetsManager.load('Elf_front', 'assets/skins/Elf_front.png');
assetsManager.load('stairs_down', 'assets/decors/stairs_down.png'); 

// --- SKINS BURNED ---
assetsManager.load('Burned_top_view', 'assets/skins/Burned_top_view.jpeg');
assetsManager.load('Attack_fire_mage', 'assets/skins/Attack_fire_mage.jpeg');
assetsManager.load('Ulti_fire_mage', 'assets/skins/Ulti_fire_mage.jpeg');

// --- SKINS ENNEMIS ET ANIMATIONS ---
assetsManager.load('goblin_top_view', 'assets/skins/goblin_top_view.png');
assetsManager.load('goblin_top_attack', 'assets/skins/goblin_top_attack.png');
assetsManager.load('goblin_top_block', 'assets/skins/goblin_top_block.png');

assetsManager.load('Skeleton_top_view', 'assets/skins/Skeleton_top_view.png');
assetsManager.load('Skeleton_top_attack', 'assets/skins/Skeleton_top_attack.png');

assetsManager.load('spider_top_view', 'assets/skins/spider_top_view.jpeg');
assetsManager.load('troll_top_view', 'assets/skins/troll_top_view.png');    
assetsManager.load('drake_top_view', 'assets/skins/drake_top_view.png');
assetsManager.load('mage_top_view', 'assets/skins/mage_top_view.png');

// --- DÉCORS ET CAISSES ---
assetsManager.load('crate1', 'assets/decorations/crate1.png');     
assetsManager.load('crate2', 'assets/decorations/crate2.png');    
assetsManager.load('crate3', 'assets/decorations/crate3.png');    
assetsManager.load('crate4', 'assets/decorations/crate4.png');    

assetsManager.load('chest1', 'assets/decorations/chest1.png');    
assetsManager.load('chest2', 'assets/decorations/chest2.png');    

assetsManager.load('bibliotheque', 'assets/decorations/bibliotheque.png');
assetsManager.load('bench', 'assets/decorations/bench.png');
