import Phaser from "phaser";

export default class Preload extends Phaser.Scene {
  constructor() {
    super("Preload");
  }

  preload() {
    this.preloadTilesets();
    this.preloadMaps();
    this.preloadCharacters();
    this.preloadItems();
    this.preloadUI();
    this.preloadSounds();
    this.preloadMusic();
    this.preloadTraps();
    this.preloadObjects();
    this.preloadAnims();
    this.preloadBuildings();
    this.preloadCat();
    this.preloadEnemies();
    this.preloadNPCs();
    this.preloadIcons();
  }

  preloadAnims() {
    // Door spritesheet
    this.load.spritesheet('dungeon-door', 'assets/anims/door_anim.png', {
      frameWidth: 32,
      frameHeight: 48,
    });

    // Breakables anims
    this.load.spritesheet('box', 'assets/anims/break_box_anim.png', {
      frameWidth: 64,
      frameHeight: 48,
    });

    this.load.spritesheet('pot', 'assets/anims/break_pot_anim.png', {
      frameWidth: 64,
      frameHeight: 48,
    });

    // Flag check point anim
    this.load.spritesheet('checkpoint', 'assets/anims/checkpoint.png', {
      frameWidth: 16,
      frameHeight: 24,
    });
}

  preloadObjects() {
    this.load.image('bench', 'assets/objects/bench.png');
    this.load.image('bush1', 'assets/objects/bush1.png');
    this.load.image('bush2', 'assets/objects/bush2.png');
    this.load.image('bush3', 'assets/objects/bush3.png');
    this.load.image('bush4', 'assets/objects/bush4.png');
    this.load.image('log', 'assets/objects/log.png');
    this.load.image('plantPot', 'assets/objects/plantPot.png');
    this.load.image('stone1', 'assets/objects/stone1.png');
    this.load.image('stone2', 'assets/objects/stone2.png');
    this.load.image('stone3', 'assets/objects/stone3.png');
    this.load.image('stone4', 'assets/objects/stone4.png');
    this.load.image('stone5', 'assets/objects/stone5.png');
    this.load.image('tree1', 'assets/objects/tree1.png');
    this.load.image('tree2', 'assets/objects/tree2.png');
    this.load.image('treeStump1', 'assets/objects/treeStump1.png');
    this.load.image('treeStump2', 'assets/objects/treeStump2.png');
  }

  preloadTilesets() {
    this.load.image('tiles', 'assets/Tileset.png');
    this.load.image('tiles2', 'assets/Tileset2.png');
    this.load.image('ground_decor', 'assets/Decoration.png');
    this.load.image('nature_decor', 'assets/Objects.png');
    this.load.image('water', 'assets/Water.png');
    this.load.image('spikes', 'assets/traps/traps1.png');

    // Dungeon tilesheets
    this.load.image('dungeon', 'assets/tileset-export.png');
    this.load.image('door', 'assets/Wooden door-Sheet.png');

    // Interiors tilesheets
    this.load.image('interiors', 'assets/Interiors.png');
  }

  preloadMaps() {
    // Above ground maps
    this.load.tilemapTiledJSON('level1', 'assets/map_level_1.json');
    this.load.tilemapTiledJSON('level2', 'assets/map_level_2.json');
    this.load.tilemapTiledJSON('level3', 'assets/map_level_3.json');
    this.load.tilemapTiledJSON('level4', 'assets/map_level_4.json');
    this.load.tilemapTiledJSON('level5', 'assets/map_level_5.json');
    this.load.tilemapTiledJSON('level9', 'assets/map_level_9.json');

    // Underground maps
    this.load.tilemapTiledJSON('level6', 'assets/map_level_6.json');
    this.load.tilemapTiledJSON('level8', 'assets/map_level_8.json');

    // Interior maps
    //hero house
    this.load.tilemapTiledJSON('level7', 'assets/map_level_7.json');
    this.load.tilemapTiledJSON('level10', 'assets/map_level_10.json');
  }

  preloadCharacters() {
    // Character spritesheets
    this.load.spritesheet('player', 'assets/player/player.png', {
      frameWidth: 48,
      frameHeight: 48,
    });

    this.load.spritesheet('player-jump-down-sheet', 'assets/player/player_jump_down.png', {
      frameWidth: 48,
      frameHeight: 48,
    });

    this.load.spritesheet('player-jump-side-sheet', 'assets/player/player_jump_side.png', {
      frameWidth: 48,
      frameHeight: 48,
  });

  this.load.spritesheet('player-jump-up-sheet', 'assets/player/player_jump_up.png', {
      frameWidth: 48,
      frameHeight: 48,
  });

  }

  preloadItems() {
    // Loading in items
    this.load.spritesheet('breakable_sprites', 'assets/Objects.png', { frameWidth: 16, frameHeight: 16 });

    // Chest spritesheet
    this.load.spritesheet('chest', 'assets/Level2Chest.png', {
      frameWidth: 48,
      frameHeight: 47,
    });

    // Torch spritesheet
    this.load.spritesheet('torch', 'assets/Wall_torch.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    //loading in collectibles
    this.load.spritesheet('life-potion', 'assets/collectibles/5PotionBottles.png', {
      frameWidth: 16,
      frameHeight: 16,
    })

    this.load.spritesheet('coin', 'assets/collectibles/Coin_One.png', {
      frameWidth: 16,
      frameHeight: 16,
    })
  }

  preloadUI() {
     // Loading Menu images
    this.load.image('menu-bg', 'assets/bg/menu_bg.png');
    this.load.image('back', 'assets/bg/back.png');

    // Loading hud assets
    this.load.image('full-heart', 'assets/hud/Heart.png');
    this.load.image('half-heart', 'assets/hud/Half_a_heart.png');
    this.load.image('empty-heart', 'assets/hud/Heart0.png');

    // Inventory menu
    this.load.image('inventory-menu', 'assets/hud/inverntory-menu.png');
  }

  preloadSounds() {
    // Preload wav sounds
    ['sward', 'walk', 'hurt', 'item_collect', 'coin_collect', 'door_close', 'door_open', 'jump', 'cat-walk', 'cat-jump'].forEach(key => {
        this.load.audio(key, `assets/sounds/${key}.wav`);
    });

    // Preload mp3 sounds
    ['cat-purring', 'cat-scared'].forEach(key => {
      this.load.audio(key, `assets/sounds/${key}.mp3`)
    })

}

  preloadMusic() {
    this.load.audio('overground-music', 'assets/sounds/no_action_bg_sound.ogg');
    this.load.audio('dungeon-music', 'assets/sounds/dungeon_bg_sound.ogg');
}

  preloadTraps() {
    [1,2,3,4].forEach(num => {
        this.load.image(`spike-${num}`, `assets/traps/traps${num}.png`);
    });

    this.load.spritesheet('breakable_sprites', 'assets/Objects.png', { frameWidth: 16, frameHeight: 16 });
}

  preloadBuildings() {

    // Preloading players house
    this.load.image('hero_house_closed', 'assets/buildings/hero-house2.png');

    this.load.image('hero_house_open', 'assets/buildings/hero-house1.png');

    this.load.image('hero_house_halfopen', 'assets/buildings/hero-house3.png');

    // Preloading health shop
    this.load.image('health_shop_closed', 'assets/buildings/health-shop2.png');

    this.load.image('health_shop_open', 'assets/buildings/health-shop1.png');

    this.load.image('health_shop_halfopen', 'assets/buildings/health-shop3.png');
  }

  preloadCat() {
    // Preload Cat spritesheets
    this.load.spritesheet('cat', 'assets/fury/cat.png', {
      frameWidth: 48,
      frameHeight: 48,
    });

    this.load.spritesheet('cat-jump', 'assets/fury/cat-jump.png', {
      frameWidth: 48,
      frameHeight: 64,
    });

  }

  preloadEnemies() {

    // Preload slime1 spritesheets
    this.load.spritesheet('slime1-idle', 'assets/enemies/slime1/Slime1_Idle.png', {
      frameWidth: 64,
      frameHeight: 64,
    })

    this.load.spritesheet('slime1-walk', 'assets/enemies/slime1/Slime1_Walk.png', {
      frameWidth: 64,
      frameHeight: 64,
    })

    this.load.spritesheet('slime1-run', 'assets/enemies/slime1/Slime1_Run.png', {
      frameWidth: 64,
      frameHeight: 64,
    })

    this.load.spritesheet('slime1-hurt', 'assets/enemies/slime1/Slime1_Hurt.png', {
      frameWidth: 64,
      frameHeight: 64,
    })

    this.load.spritesheet('slime1-death', 'assets/enemies/slime1/Slime1_Death.png', {
      frameWidth: 64,
      frameHeight: 64,
    })

    this.load.spritesheet('slime1-attack', 'assets/enemies/slime1/Slime1_Attack.png', {
      frameWidth: 64,
      frameHeight: 64,
    })

    // Preload slime2 spritesheets
    this.load.spritesheet('slime2-idle', 'assets/enemies/slime2/Slime2_Idle.png', {
      frameWidth: 64,
      frameHeight: 64,
    })

    this.load.spritesheet('slime2-walk', 'assets/enemies/slime2/Slime2_Walk.png', {
      frameWidth: 64,
      frameHeight: 64,
    })

    this.load.spritesheet('slime2-run', 'assets/enemies/slime2/Slime2_Run.png', {
      frameWidth: 64,
      frameHeight: 64,
    })

    this.load.spritesheet('slime2-hurt', 'assets/enemies/slime2/Slime2_Hurt.png', {
      frameWidth: 64,
      frameHeight: 64,
    })

    this.load.spritesheet('slime2-death', 'assets/enemies/slime2/Slime2_Death.png', {
      frameWidth: 64,
      frameHeight: 64,
    })

    this.load.spritesheet('slime2-attack', 'assets/enemies/slime2/Slime2_Attack.png', {
      frameWidth: 64,
      frameHeight: 64,
    })

    // Preload slime3 spritesheets
    this.load.spritesheet('slime3-idle', 'assets/enemies/slime3/Slime3_Idle.png', {
      frameWidth: 64,
      frameHeight: 64,
    })

    this.load.spritesheet('slime3-walk', 'assets/enemies/slime3/Slime3_Walk.png', {
      frameWidth: 64,
      frameHeight: 64,
    })

    this.load.spritesheet('slime3-run', 'assets/enemies/slime3/Slime3_Run.png', {
      frameWidth: 64,
      frameHeight: 64,
    })

    this.load.spritesheet('slime3-hurt', 'assets/enemies/slime3/Slime3_Hurt.png', {
      frameWidth: 64,
      frameHeight: 64,
    })

    this.load.spritesheet('slime3-death', 'assets/enemies/slime3/Slime3_Death.png', {
      frameWidth: 64,
      frameHeight: 64,
    })

    this.load.spritesheet('slime3-attack', 'assets/enemies/slime3/Slime3_Attack.png', {
      frameWidth: 64,
      frameHeight: 64,
    })
  }

  preloadNPCs() {

    // Preloading merchant spritesheet
    this.load.spritesheet('health-merchant', 'assets/npc/merchant1.png', {
      frameWidth: 32,
      frameHeight: 48,
    })

  }

  preloadIcons() {
    // bag
    this.load.image('bag', 'assets/icons/bag.png');
    this.load.image('inventory-potion', 'assets/icons/inventory-potion.png');
  }

  create() {
    this.scene.start("MenuScene");
  }

}
