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
  }

  preloadMaps() {
    // Above ground maps
    this.load.tilemapTiledJSON('level1', 'assets/map_level_1.json');
    this.load.tilemapTiledJSON('level2', 'assets/map_level_2.json');
    this.load.tilemapTiledJSON('level3', 'assets/map_level_3.json');
    this.load.tilemapTiledJSON('level4', 'assets/map_level_4.json');
    this.load.tilemapTiledJSON('level5', 'assets/map_level_5.json');

    // Underground maps
    this.load.tilemapTiledJSON('level6', 'assets/map_level_6.json');
  }

  preloadCharacters() {
    // Character spritesheets
    this.load.spritesheet('player', 'assets/player/player.png', {
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
    this.load.image('full-heart', 'assets/hud/Heart.png')
    this.load.image('half-heart', 'assets/hud/Half_a_heart.png')
    this.load.image('empty-heart', 'assets/hud/Heart0.png')
  }

  preloadSounds() {
    ['sward', 'walk', 'hurt', 'item_collect', 'coin_collect', 'door_close', 'door_open'].forEach(key => {
        this.load.audio(key, `assets/sounds/${key}.wav`);
    });

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
    this.image.add('hero_house_closed', 'assets/player/hero-house2.png');

    this.image.add('hero_house_open', 'assets/player/hero-house1.png');
  }

  create() {
    this.scene.start("MenuScene");
  }
}
