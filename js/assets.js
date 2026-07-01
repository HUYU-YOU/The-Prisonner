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

assetsManager.load('left_door', 'assets/decors/left_door.png');
assetsManager.load('right_door', 'assets/decors/right_door.png');
assetsManager.load('back_door', 'assets/decors/back_door.png');   
assetsManager.load('front_door', 'assets/decors/front_door.png'); 
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
assetsManager.load('stairs_down', 'assets/decors/stairs_down.png'); 


// --- SKINS BURNED ---
assetsManager.load('Burned_top_view', 'assets/skins/Attack/Burned_top_view.jpeg');
assetsManager.load('Attack_fire_mage', 'assets/skins/Attack/Attack_fire_mage.jpeg');
assetsManager.load('Ulti_fire_mage', 'assets/skins/Attack/Ulti_fire_mage.jpeg');

// --- DÉCORS ET CAISSES ---
assetsManager.load('crate1', 'assets/decorations/crate.png');     
assetsManager.load('crate2', 'assets/decorations/crate2.png');    
assetsManager.load('crate3', 'assets/decorations/crate3.png');    
assetsManager.load('crate4', 'assets/decorations/crate4.png');    

assetsManager.load('chest1', 'assets/decorations/chest1.png');    
assetsManager.load('chest2', 'assets/decorations/chest2.png');    

assetsManager.load('bibliotheque', 'assets/decorations/bibliotheque.png');
assetsManager.load('bench', 'assets/decorations/bench.png');

// --- LOGISTIQUE ET RAMASSABLES ---
assetsManager.load('gold_coin', 'assets/decors/gold_coin.png');
assetsManager.load('gold_key', 'assets/decors/gold_key.png');
assetsManager.load('skeleton_key', 'assets/decors/skeleton_key.png');
assetsManager.load('portal_key', 'assets/decors/portal_key.png');
assetsManager.load('potion1', 'assets/decors/potion1.png');
assetsManager.load('potion2', 'assets/decors/potion2.png');
assetsManager.load('potion3', 'assets/decors/potion3.png');
assetsManager.load('potion4', 'assets/decors/potion4.png');

// --- SQUELETTES 8 DIRECTIONS ---
assetsManager.load('Skeleton_south_view', 'assets/skins/Skeleton/skeleton_south_view.png');
assetsManager.load('Skeleton_north_view', 'assets/skins/Skeleton/skeleton_north_view.png');
assetsManager.load('Skeleton_east_view', 'assets/skins/Skeleton/skeleton_east_view.png');
assetsManager.load('Skeleton_west_view', 'assets/skins/Skeleton/skeleton_west_view.png');
assetsManager.load('Skeleton_northeast_view', 'assets/skins/Skeleton/skeleton_northeast_view.png');
assetsManager.load('Skeleton_northwest_view', 'assets/skins/Skeleton/skeleton_northwest_view.png');
assetsManager.load('Skeleton_southeast_view', 'assets/skins/Skeleton/skeleton_southeast_view.png');
assetsManager.load('Skeleton_southwest_view', 'assets/skins/Skeleton/skeleton_southwest_view.png');

// --- GOBELINS 8 DIRECTIONS ---
assetsManager.load('Goblin_south_view', 'assets/skins/Goblin/goblin_south_view.png');
assetsManager.load('Goblin_north_view', 'assets/skins/Goblin/goblin_north_view.png');
assetsManager.load('Goblin_east_view', 'assets/skins/Goblin/goblin_east_view.png');
assetsManager.load('Goblin_west_view', 'assets/skins/Goblin/goblin_west_view.png');
assetsManager.load('Goblin_southwest_view', 'assets/skins/Goblin/goblin_southwest_view.png');
assetsManager.load('Goblin_northwest_view', 'assets/skins/Goblin/goblin_northwest_view.png');
assetsManager.load('Goblin_southeast_view', 'assets/skins/Goblin/goblin_southeast_view.png');
assetsManager.load('Goblin_northeast_view', 'assets/skins/Goblin/goblin_northeast_view.png');

// --- SPIDER 8 DIRECTIONS ---
assetsManager.load('Spider_south_view', 'assets/skins/Spider/spider_south_view.png');
assetsManager.load('Spider_north_view', 'assets/skins/Spider/spider_north_view.png');
assetsManager.load('Spider_east_view', 'assets/skins/Spider/spider_east_view.png');
assetsManager.load('Spider_west_view', 'assets/skins/Spider/spider_west_view.png');
assetsManager.load('Spider_southwest_view', 'assets/skins/Spider/spider_southwest_view.png');
assetsManager.load('Spider_northwest_view', 'assets/skins/Spider/spider_northwest_view.png');
assetsManager.load('Spider_southeast_view', 'assets/skins/Spider/spider_southeast_view.png');
assetsManager.load('Spider_northeast_view', 'assets/skins/Spider/spider_northeast_view.png');
assetsManager.load('spider_top_view', 'assets/skins/Spider/spider_top_view.jpeg');

// --- KNIGHT 8 DIRECTIONS ---
assetsManager.load('Knight_south_view', 'assets/skins/Knight/Knight_south_view.png');
assetsManager.load('Knight_north_view', 'assets/skins/Knight/Knight_north_view.png');
assetsManager.load('Knight_east_view', 'assets/skins/Knight/Knight_east_view.png');
assetsManager.load('Knight_west_view', 'assets/skins/Knight/Knight_west_view.png');
assetsManager.load('Knight_northeast_view', 'assets/skins/Knight/Knight_northeast_view.png');
assetsManager.load('Knight_northwest_view', 'assets/skins/Knight/Knight_northwest_view.png');
assetsManager.load('Knight_southeast_view', 'assets/skins/Knight/Knight_southeast_view.png');
assetsManager.load('Knight_southwest_view', 'assets/skins/Knight/Knight_southwest_view.png');

// --- ELF 8 DIRECTIONS ---
assetsManager.load('Elf_south_view', 'assets/skins/Elf/Elf_south_view.png');
assetsManager.load('Elf_north_view', 'assets/skins/Elf/Elf_north_view.png');
assetsManager.load('Elf_east_view', 'assets/skins/Elf/Elf_east_view.png');
assetsManager.load('Elf_west_view', 'assets/skins/Elf/Elf_west_view.png');
assetsManager.load('Elf_northeast_view', 'assets/skins/Elf/Elf_northeast_view.png');
assetsManager.load('Elf_northwest_view', 'assets/skins/Elf/Elf_northwest_view.png');
assetsManager.load('Elf_southeast_view', 'assets/skins/Elf/Elf_southeast_view.png');
assetsManager.load('Elf_southwest_view', 'assets/skins/Elf/Elf_southwest_view.png');

// --- BURNED (Mage Joueur) 8 DIRECTIONS ---
assetsManager.load('Burned_south_view', 'assets/skins/Burned/Burned_south_view.png');
assetsManager.load('Burned_north_view', 'assets/skins/Burned/Burned_north_view.png');
assetsManager.load('Burned_east_view', 'assets/skins/Burned/Burned_east_view.png');
assetsManager.load('Burned_west_view', 'assets/skins/Burned/Burned_west_view.png');
assetsManager.load('Burned_northeast_view', 'assets/skins/Burned/Burned_northeast_view.png');
assetsManager.load('Burned_northwest_view', 'assets/skins/Burned/Burned_northwest_view.png');
assetsManager.load('Burned_southeast_view', 'assets/skins/Burned/Burned_southeast_view.png');
assetsManager.load('Burned_southwest_view', 'assets/skins/Burned/Burned_southwest_view.png');

// --- NECROMANCER 8 DIRECTIONS ---
assetsManager.load('Necromancer_south_view', 'assets/skins/Necromancien/Necromancien_south_view.png');
assetsManager.load('Necromancer_north_view', 'assets/skins/Necromancien/Necromancien_north_view.png');
assetsManager.load('Necromancer_east_view', 'assets/skins/Necromancien/Necromancien_east_view.png');
assetsManager.load('Necromancer_west_view', 'assets/skins/Necromancien/Necromancien_west_view.png');
assetsManager.load('Necromancer_northeast_view', 'assets/skins/Necromancien/Necromancien_northeast_view.png');
assetsManager.load('Necromancer_northwest_view', 'assets/skins/Necromancien/Necromancien_northwest_view.png');
assetsManager.load('Necromancer_southeast_view', 'assets/skins/Necromancien/Necromancien_southeast_view.png');
assetsManager.load('Necromancer_southwest_view', 'assets/skins/Necromancien/Necromancien_southwest_view.png');

// --- DRAGON (Ennemi) 8 DIRECTIONS ---
assetsManager.load('Dragon_south_view', 'assets/skins/Drake/Drake_south_view.png');
assetsManager.load('Dragon_north_view', 'assets/skins/Drake/Drake_north_view.png');
assetsManager.load('Dragon_east_view', 'assets/skins/Drake/Drake_east_view.png');
assetsManager.load('Dragon_west_view', 'assets/skins/Drake/Drake_west_view.png');
assetsManager.load('Dragon_northeast_view', 'assets/skins/Drake/Drake_northeast_view.png');
assetsManager.load('Dragon_northwest_view', 'assets/skins/Drake/Drake_northwest_view.png');
assetsManager.load('Dragon_southeast_view', 'assets/skins/Drake/Drake_southeast_view.png');
assetsManager.load('Dragon_southwest_view', 'assets/skins/Drake/Drake_southwest_view.png');

// --- TROLL 8 DIRECTIONS ---
assetsManager.load('Troll_south_view', 'assets/skins/Troll/troll_south_view.png');
assetsManager.load('Troll_north_view', 'assets/skins/Troll/troll_north_view.png');
assetsManager.load('Troll_east_view', 'assets/skins/Troll/troll_east_view.png');
assetsManager.load('Troll_west_view', 'assets/skins/Troll/troll_west_view.png');
assetsManager.load('Troll_northeast_view', 'assets/skins/Troll/troll_northeast_view.png');
assetsManager.load('Troll_northwest_view', 'assets/skins/Troll/troll_northwest_view.png');
assetsManager.load('Troll_southeast_view', 'assets/skins/Troll/troll_southeast_view.png');
assetsManager.load('Troll_southwest_view', 'assets/skins/Troll/troll_southwest_view.png');

// --- MAGE (Ennemi) 8 DIRECTIONS ---
assetsManager.load('Mage_south_view', 'assets/skins/Mage/mage_south_view.png');
assetsManager.load('Mage_north_view', 'assets/skins/Mage/mage_north_view.png');
assetsManager.load('Mage_east_view', 'assets/skins/Mage/mage_east_view.png');
assetsManager.load('Mage_west_view', 'assets/skins/Mage/mage_west_view.png');
assetsManager.load('Mage_northeast_view', 'assets/skins/Mage/mage_northeast_view.png');
assetsManager.load('Mage_northwest_view', 'assets/skins/Mage/mage_northwest_view.png');
assetsManager.load('Mage_southeast_view', 'assets/skins/Mage/mage_southeast_view.png');
assetsManager.load('Mage_southwest_view', 'assets/skins/Mage/mage_southwest_view.png');

// --- DEATH GOD 8 DIRECTIONS ---
assetsManager.load('Deathgod_south_view', 'assets/skins/deathgod/deathgod_south_view.png');
assetsManager.load('Deathgod_north_view', 'assets/skins/deathgod/deathgod_north_view.png');
assetsManager.load('Deathgod_east_view', 'assets/skins/deathgod/deathgod_east_view.png');
assetsManager.load('Deathgod_west_view', 'assets/skins/deathgod/deathgod_west_view.png');
assetsManager.load('Deathgod_northeast_view', 'assets/skins/deathgod/deathgod_northeast_view.png');
assetsManager.load('Deathgod_northwest_view', 'assets/skins/deathgod/deathgod_northwest_view.png');
assetsManager.load('Deathgod_southeast_view', 'assets/skins/deathgod/deathgod_southeast_view.png');
assetsManager.load('Deathgod_southwest_view', 'assets/skins/deathgod/deathgod_southwest_view.png');

// --- ELYSIA 8 DIRECTIONS ---
assetsManager.load('Elysia_south_view', 'assets/skins/elysia/elysia_south_view.png');
assetsManager.load('Elysia_north_view', 'assets/skins/elysia/elysia_north_view.png');
assetsManager.load('Elysia_east_view', 'assets/skins/elysia/elysia_east_view.png');
assetsManager.load('Elysia_west_view', 'assets/skins/elysia/elysia_west_view.png');
assetsManager.load('Elysia_northeast_view', 'assets/skins/elysia/elysia_northeast_view.png');
assetsManager.load('Elysia_northwest_view', 'assets/skins/elysia/elysia_northwest_view.png');
assetsManager.load('Elysia_southeast_view', 'assets/skins/elysia/elysia_southeast_view.png');
assetsManager.load('Elysia_southwest_view', 'assets/skins/elysia/elysia_southwest_view.png');

// --- ARMOR 8 DIRECTIONS ---
assetsManager.load('Armor_south_view', 'assets/skins/armor/armor_south_view.png');
assetsManager.load('Armor_north_view', 'assets/skins/armor/armor_north_view.png');
assetsManager.load('Armor_east_view', 'assets/skins/armor/armor_east_view.png');
assetsManager.load('Armor_west_view', 'assets/skins/armor/armor_west_view.png');
assetsManager.load('Armor_northeast_view', 'assets/skins/armor/armor_northeast_view.png');
assetsManager.load('Armor_northwest_view', 'assets/skins/armor/armor_northwest_view.png');
assetsManager.load('Armor_southeast_view', 'assets/skins/armor/armor_southeast_view.png');
assetsManager.load('Armor_southwest_view', 'assets/skins/armor/armor_southwest_view.png');

// --- AMES (SOUL) 8 DIRECTIONS ---
assetsManager.load('Soul_south_view', 'assets/skins/soul/soul_south_view.png');
assetsManager.load('Soul_north_view', 'assets/skins/soul/soul_north_view.png');
assetsManager.load('Soul_east_view', 'assets/skins/soul/soul_east_view.png');
assetsManager.load('Soul_west_view', 'assets/skins/soul/soul_west_view.png');
assetsManager.load('Soul_northeast_view', 'assets/skins/soul/soul_northeast_view.png');
assetsManager.load('Soul_northwest_view', 'assets/skins/soul/soul_northwest_view.png');
assetsManager.load('Soul_southeast_view', 'assets/skins/soul/soul_southeast_view.png');
assetsManager.load('Soul_southwest_view', 'assets/skins/soul/soul_southwest_view.png');

// --- FUSION 8 DIRECTIONS ---
assetsManager.load('Fusion_south_view', 'assets/skins/fusions/fusion_south_view.png');
assetsManager.load('Fusion_north_view', 'assets/skins/fusions/fusion_north_view.png');
assetsManager.load('Fusion_east_view', 'assets/skins/fusions/fusion_east_view.png');
assetsManager.load('Fusion_west_view', 'assets/skins/fusions/fusion_west_view.png');
assetsManager.load('Fusion_northeast_view', 'assets/skins/fusions/fusion_northeast_view.png');
assetsManager.load('Fusion_northwest_view', 'assets/skins/fusions/fusion_northwest_view.png');
assetsManager.load('Fusion_southeast_view', 'assets/skins/fusions/fusion_southeast_view.png');
assetsManager.load('Fusion_southwest_view', 'assets/skins/fusions/fusion_southwest_view.png');

// --- GOLEM ---
assetsManager.load('Golem_north_view', 'assets/skins/Golem/golem_north_view.png');
assetsManager.load('Golem_south_view', 'assets/skins/Golem/golem_south_view.png');
assetsManager.load('Golem_east_view', 'assets/skins/Golem/golem_east_view.png');
assetsManager.load('Golem_west_view', 'assets/skins/Golem/golem_west_view.png');
assetsManager.load('Golem_northeast_view', 'assets/skins/Golem/golem_northeast_view.png');
assetsManager.load('Golem_northwest_view', 'assets/skins/Golem/golem_northwest_view.png');
assetsManager.load('Golem_southeast_view', 'assets/skins/Golem/golem_southeast_view.png');
assetsManager.load('Golem_southwest_view', 'assets/skins/Golem/golem_southwest_view.png');

// --- SMALL GOLEM (Utilise les mêmes images que le Golem) ---
assetsManager.load('Small_golem_north_view', 'assets/skins/Golem/golem_north_view.png');
assetsManager.load('Small_golem_south_view', 'assets/skins/Golem/golem_south_view.png');
assetsManager.load('Small_golem_east_view', 'assets/skins/Golem/golem_east_view.png');
assetsManager.load('Small_golem_west_view', 'assets/skins/Golem/golem_west_view.png');
assetsManager.load('Small_golem_northeast_view', 'assets/skins/Golem/golem_northeast_view.png');
assetsManager.load('Small_golem_northwest_view', 'assets/skins/Golem/golem_northwest_view.png');
assetsManager.load('Small_golem_southeast_view', 'assets/skins/Golem/golem_southeast_view.png');
assetsManager.load('Small_golem_southwest_view', 'assets/skins/Golem/golem_southwest_view.png');

// --- ORC ---
assetsManager.load('Orc_north_view', 'assets/skins/orc/orc_north_view.png');
assetsManager.load('Orc_south_view', 'assets/skins/orc/orc_south_view.png');
assetsManager.load('Orc_east_view', 'assets/skins/orc/orc_east_view.png');
assetsManager.load('Orc_west_view', 'assets/skins/orc/orc_west_view.png');
assetsManager.load('Orc_northeast_view', 'assets/skins/orc/orc_northeast_view.png');
assetsManager.load('Orc_northwest_view', 'assets/skins/orc/orc_northwest_view.png');
assetsManager.load('Orc_southeast_view', 'assets/skins/orc/orc_southeast_view.png');
assetsManager.load('Orc_southwest_view', 'assets/skins/orc/orc_southwest_view.png');

// --- WOLF ---
assetsManager.load('Wolf_north_view', 'assets/skins/wolf/wolf_north_view.png');
assetsManager.load('Wolf_south_view', 'assets/skins/wolf/wolf_south_view.png');
assetsManager.load('Wolf_east_view', 'assets/skins/wolf/wolf_east_view.png');
assetsManager.load('Wolf_west_view', 'assets/skins/wolf/wolf_west_view.png');
assetsManager.load('Wolf_northeast_view', 'assets/skins/wolf/wolf_northeast_view.png');
assetsManager.load('Wolf_northwest_view', 'assets/skins/wolf/wolf_northwest_view.png');
assetsManager.load('Wolf_southeast_view', 'assets/skins/wolf/wolf_southeast_view.png');
assetsManager.load('Wolf_southwest_view', 'assets/skins/wolf/wolf_southwest_view.png');

// --- GARGOUILLE ---
assetsManager.load('Gargouille_north_view', 'assets/skins/gargouille/gargouille_north_view.png');
assetsManager.load('Gargouille_south_view', 'assets/skins/gargouille/gargouille_south_view.png');
assetsManager.load('Gargouille_east_view', 'assets/skins/gargouille/gargouille_east_view.png');
assetsManager.load('Gargouille_west_view', 'assets/skins/gargouille/gargouille_west_view.png');
assetsManager.load('Gargouille_northeast_view', 'assets/skins/gargouille/gargouille_northeast_view.png');
assetsManager.load('Gargouille_northwest_view', 'assets/skins/gargouille/gargouille_northwest_view.png');
assetsManager.load('Gargouille_southeast_view', 'assets/skins/gargouille/gargouille_southeast_view.png');
assetsManager.load('Gargouille_southwest_view', 'assets/skins/gargouille/gargouille_southwest_view.png');

// --- MINOTAURE ---
assetsManager.load('Minotaure_north_view', 'assets/skins/orc/minotaure_north_view.png');
assetsManager.load('Minotaure_south_view', 'assets/skins/orc/minotaure_south_view.png');
assetsManager.load('Minotaure_east_view', 'assets/skins/orc/minotaure_east_view.png');
assetsManager.load('Minotaure_west_view', 'assets/skins/orc/minotaure_west_view.png');
assetsManager.load('Minotaure_northeast_view', 'assets/skins/orc/minotaure_northeast_view.png');
assetsManager.load('Minotaure_northwest_view', 'assets/skins/orc/minotaure_northwest_view.png');
assetsManager.load('Minotaure_southeast_view', 'assets/skins/orc/minotaure_southeast_view.png');
assetsManager.load('Minotaure_southwest_view', 'assets/skins/orc/minotaure_southwest_view.png');



// --- EFFETS DE SANG (Dégâts et Morts) ---
assetsManager.load('bloods_hit_view1', 'assets/effects/bloods_hit_view1.png');
assetsManager.load('bloods_hit_view2', 'assets/effects/bloods_hit_view2.png');
assetsManager.load('bloods_hit_view3', 'assets/effects/bloods_hit_view3.png');

assetsManager.load('bloods_kill_view1', 'assets/effects/bloods_kill_view1.png');
assetsManager.load('bloods_kill_view2', 'assets/effects/bloods_kill_view2.png');
assetsManager.load('bloods_kill_view3', 'assets/effects/bloods_kill_view3.png');

assetsManager.load('skeleton_kill_view1', 'assets/effects/skeleton_kill_view1.png');
assetsManager.load('skeleton_kill_view2', 'assets/effects/skeleton_kill_view2.png');
assetsManager.load('skeleton_kill_view3', 'assets/effects/skeleton_kill_view3.png');

// --- PROJECTILES ET ATTAQUES MAGIQUES ---
assetsManager.load('Attack_fire_mage', 'assets/skins/Attack/Attack_fire_mage.jpeg'); 
assetsManager.load('Attack_fire_necromancien', 'assets/skins/Attack/Attack_fire_necromancien.jpeg');
assetsManager.load('Attack_fire_elysia', 'assets/skins/Attack/Attack_fire_elysia.jpeg');
assetsManager.load('Attack_fire_dragon', 'assets/skins/Attack/Attack_fire_dragon.jpeg');
assetsManager.load('Attack_fire_deathgod', 'assets/skins/Attack/Attack_fire_deathgod.jpeg');
assetsManager.load('Attack_bone_skeleton', 'assets/skins/Attack/Attack_bone_skeleton.jpeg');
assetsManager.load('Attack_sword_armor', 'assets/skins/Attack/Attack_sword_armor.jpeg');
assetsManager.load('Attack_arrow_elf', 'assets/skins/Attack/Attack_arrow_elf.jpeg');
assetsManager.load('Attack_sword_knight', 'assets/skins/Attack/Attack_sword_knight.jpeg');
assetsManager.load('Attack_mage_corompue', 'assets/skins/Attack/Attack_mage_corompue.jpeg');
// --- NOUVELLES ATTAQUES (Projectiles) ---
assetsManager.load('Attack_rock_golem', 'assets/skins/Attack/Attack_rock_golem.jpeg');
assetsManager.load('Attack_rock_gargouille', 'assets/skins/Attack/Attack_rock_gargouille.jpeg');
// --- MÉTÉORES (DANGERS VENANT DU CIEL) ---
assetsManager.load('Attack_meteorites_elysia', 'assets/skins/Attack/Attack_meteorites_elysia.jpeg');
assetsManager.load('Attack_meteorites_dragon', 'assets/skins/Attack/Attack_meteorites_dragon.jpeg');
