import Phaser from "phaser";
import BaseScene from "./BaseScene";
import Player from "../entities/Player";
import LevelManager from "../utils/LevelManager";
import CoinDisplay from "../hud/CoinDisplay";
import { getSavedLevel, saveLevel, getSavedPlayerHealth, getSavedCoins, savePlayerData } from "../utils/StorageManager";

export default class Play extends BaseScene {
  constructor() {
    super("Play", {
        width: 600,
        height: 600,
        fontSize: 20,
        fontColor: 'white',
        canGoBack: true,
        backKey: 'back',
        backScale: 0.5
    });

  }

  create() {
    super.create();

    if (!this.registry.has('bgMusic')) {
        this.registry.set('bgMusic', null)
    };

    this.setupLevelManager();

    this.createItemAnimations();

    const map = this.createMap();
    this.playLevelMusic();
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    const savedCoins = getSavedCoins() || 0;
    
    this.registry.set('coins', savedCoins)

    this.setupPlayer(map);

    this.setupCoinDisplay();

    this.player.checkTrapOverlap(this.spikeGroup);
    

    this.setupPlayerOverlaps();

    this.setupCollectibles();

    this.setupCamera(map);
  }

  playLevelMusic() {
    const currentLevelKey = this.levelManager.getCurrentLevelKey();
    const levelData = this.levelManager.levelData[currentLevelKey];

    if (!levelData) { return; };

    const musicType = levelData.musicType;

    let bgMusicEntry = this.registry.get('bgMusic');

    if (!bgMusicEntry || bgMusicEntry.musicType !== musicType) {
        if (bgMusicEntry && bgMusicEntry.instance) {
            bgMusicEntry.instance.stop();
        }

        const music = this.sound.add(musicType + '-music', { loop: true, volume: 0.3 });
        music.play();

        this.registry.set('bgMusic', {instance: music, musicType})
    }
  }

  setupCoinDisplay() {
    const coins = this.registry.get('coins');
    this.coinDisplay = new CoinDisplay(this, 210, 230, this.registry.get('coins'));
  }

  setupCamera(map) {
    this.cameras.main.startFollow(this.player,true, 0.1, 0.1, 0, -20);

    this.cameras.main.setBounds(
        0,
        0, 
        map.widthInPixels, 
        map.heightInPixels
    ); 

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  setupCollectibles() {
     this.collectibles = this.physics.add.group();

    this.physics.add.overlap(
        this.player,
        this.collectibles,
        this.handleCollectablePickup,
        null,
        this
    );
  }

  setupPlayerOverlaps() {
     this.physics.add.overlap(
        this.player.swardHitbox,
        this.breakableGroup,
        (hitbox, breakable) => {
            if (this.player.isSwinging) {
                const x = breakable.x;
                const y = breakable.y;

                breakable.destroy();
                this.itemSpawnDrop(x,y)
            }
        }
    )

    this.physics.add.overlap(
        this.player.swardHitbox,
        this.chestGroup,
        (hitbox, chest) => {
            if (this.player.isSwinging && !chest.isOpened) {
                   chest.isOpened = true;
                chest.play('chest-opening');
                chest.on('animationcomplete', () => {
                    for (let i = 0; i < 4; i++) {
                        const offsetX = Phaser.Math.Between(-20, 20);
                        const offsetY = Phaser.Math.Between(-22, 22);
                        this.itemSpawnDrop(chest.x + offsetX, chest.y + offsetY);
                    }
                }) 
            }
        },
        null,
        this
    )

    this.time.delayedCall(1500, () => {
        this.physics.add.overlap(this.player, this.endZones, (player, zone) => {
        zone.destroy();

        const nextLevel = zone.to_level;

        if (nextLevel) {
            const levelExists = this.levelManager.setLevel(nextLevel);
            if (levelExists) {
                saveLevel(this.levelManager.currentLevel);
                savePlayerData(this.player.health, this.registry.get('coins'))
              this.scene.restart();  
            } else {
                const popup = this.add.text(player.x, player.y - 20, "Not accessible yet", {
                    font: '10px Arial',
                    fill: '#070707',
                    backgroundColor: '#fbfbfbaa',
                    padding: {x: 5, y: 3},
                }).setOrigin(0.5);

                this.time.delayedCall(1500, () => popup.destroy())
            }   
        } else {
            console.log("End of game!!!");
        }
    })
    
    });
  }

  setupPlayer(map) {
    let savedHealth = getSavedPlayerHealth() || 100;
    if (savedHealth <= 0) {
        savedHealth = 100;
    }
    
    // Creating Player
    this.player = new Player(this, this.startPoint.x, this.startPoint.y, 'player', savedHealth);

    
    this.cameras.main.setZoom(3.7);
    this.cameras.main.centerOn(map.widthInPixels/2, map.heightInPixels/2);
    
    

    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.collisionLayer);
  }

  setupLevelManager() {
    if (!this.registry.has('levelManager')) {
        this.registry.set('levelManager', new LevelManager());
    }
    this.levelManager = this.registry.get('levelManager');

    const savedLevel = getSavedLevel();
    this.levelManager.currentLevel = savedLevel;
  }

    createMap() {
        const map = this.make.tilemap({key: this.levelManager.getCurrentLevelKey()});

        // Dongeon tilesets
        const dungeonTileset = map.addTilesetImage('tileset-export', 'dungeon');

        const doorTileset = map.addTilesetImage('Wooden door', 'door');

        // Tilesets
        const mainTileset = map.addTilesetImage('tileset', 'tiles');

        const mainTileset2 = map.addTilesetImage('Tileset2', 'tiles2');

        const waterTileset = map.addTilesetImage('water', 'water');

        const groundDecorTileset = map.addTilesetImage('decorations', 'ground_decor');

        const natureDecorTileset = map.addTilesetImage('objects', 'nature_decor');

        const trapTileset = map.addTilesetImage('spikes', 'spikes');

        // Static Layers
        const collisionLayer = map.createStaticLayer('collisions', mainTileset, 0, 0).setDepth(0);

        const chestLayer = map.createStaticLayer('chests', mainTileset, 0, 0);
        chestLayer.setVisible(false);
        this.setupChests(map, chestLayer);

        const torchLayer = map.createStaticLayer('torches', mainTileset, 0, 0);
        torchLayer.setVisible(false);
        this.setupTorches(map, torchLayer);

        const groundLayer = map. createStaticLayer('ground', [mainTileset, groundDecorTileset, waterTileset, mainTileset2, dungeonTileset, doorTileset], 0, 0).setDepth(0);

        const higherLayer = map.createStaticLayer('higher_ground', [mainTileset, groundDecorTileset, waterTileset, mainTileset2, dungeonTileset, doorTileset], 0, 0).setDepth(0);

        const trapLayer = map.createStaticLayer('traps', trapTileset, 0, 0);

        this.spikeGroup = this.physics.add.group();

        this.setupSpikes(trapLayer);

        // Object Layers
        const zoneLayer = map.getObjectLayer('player_zones');

        const natureLayer = map.getObjectLayer('nature');

        const doorLayer = map.getObjectLayer('doors');

        const breakableLayer = map.getObjectLayer('breakables');

        this.setupBreakables(breakableLayer);

        this.spawnDoors(doorLayer);

        this.spawnNatureObjects(natureLayer);

        this.zoneLayer = zoneLayer;

        this.setupZones(zoneLayer);

        this.collisionLayer = collisionLayer;
        this.collisionLayer.setCollisionByProperty({colliders: true});
        this.collisionLayer.setCollisionByExclusion([-1]);

        const mapTypeProperty = map.properties.find(p => p.name === 'type');
        this.mapType = mapTypeProperty ? mapTypeProperty.value : 'overground';

        return map
    }

    spawnDoors(layer) {
        if (!layer) { return; };

        layer.objects.forEach(obj => {
            const type = obj.properties.find(p => p.name === 'type')?.value;
            if (type === 'dungeon_door') {
                const door = this.add.sprite(obj.x, obj.y, 'dungeon-door')
                    .setOrigin(0.5, 1);

                door.setFrame(15);
                door.isOpening = false;

        this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, door.x, door.y);
            if (!door.isOpening && distance < 60) {
                this.openDoor(door);
            }
            }
        })
            }
        })
    }

    openDoor(door) {
        if (door.isOpening) {return;};

        door.isOpening = true;

        this.sound.play('door_open');
        door.play('dungeon-door-open');

        door.once('animationcomplete-dungeon-door-open', () => {
            this.sound.play('door_close');
            door.play('dungeon-door-close');

            door.once('animationcomplete-dungeon-door-close', () => {
                door.isOpening = false;
                door.setFrame(15);
            })
        })
    }

    spawnNatureObjects(layer) {
        if (!layer) {return;};

        layer.objects.forEach(obj => {
            const kind = obj.properties.find(p => p.name === 'kind')?.value;
            if(kind) {
                const sprite = this.add.sprite(obj.x, obj.y, kind)
                .setOrigin(0, 1)
                
                let depthOffset = -28;

                sprite.setDepth(obj.y + depthOffset)
            }
        })
    }

    setupZones(zoneLayer) {
        const lastLevel = this.levelManager.lastLevel || 'level0'

        let startPoint = zoneLayer.objects.find(obj => obj.name === 'start' && obj.properties.some(p => p.name === 'from_level' && p.value === lastLevel))

        if (!startPoint) {
            startPoint = zoneLayer.objects.find(obj => obj.name === 'start' )
        }

        this.startPoint = startPoint;

        this.endPoints = zoneLayer.objects.filter(obj => obj.name === 'end');

        this.endZones = this.physics.add.staticGroup();

        this.endPoints.forEach(point => {
            const zone = this.endZones.create(
            point.x + point.width / 2,
            point.y + point.height / 2,
            null
        );
        zone.setSize(point.width, point.height);
        zone.setVisible(false);
        
        const toLevelProp = point.properties.find(p => p.name === 'to_level');
        zone.to_level = toLevelProp ? toLevelProp.value: null;
    });
    }

    setupBreakables(breakableLayer) {
        if (!breakableLayer) {return;};
    }

    setupSpikes(trapLayer) {
          trapLayer.forEachTile(tile => {
            if (tile.index !== -1) {
                const spike = this.spikeGroup.create(tile.getCenterX(), tile.getCenterY(), 'spike-1');
                spike.setOrigin(0.5);

                spike.body.setAllowGravity(false);
                spike.body.setImmovable(true);
                spike.canDamage = true;
                spike.damageCooldown = 1000;
                spike.lastHitTime = 0;

                spike.isUp = false;
                spike.popDuration = 500;
                spike.downDuration = 1000;

                const spikeLoop = () => {
                    spike.isUp = true;
                    spike.play('spike-animation');

                    this.time.delayedCall(spike.apopDuration, () => {
                        spike.isUp = false;
                        spike.setTexture('spike-1');

                        this.time.delayedCall(spike.downDuration, spikeLoop)
                    })
                }

                spikeLoop();
                
            }
        })
    }

    setupChests(map, chestLayer) {
        this.chestGroup = this.physics.add.staticGroup();    

        chestLayer.forEachTile(tile => {
            if (tile.index !== -1) {
                const chest = this.chestGroup.create(
                    tile.getCenterX(),
                    tile.getCenterY(),
                    'chest'
                )
                chest.setDepth(chest.y);
                chest.setAlpha(1);
                chest.setVisible(true);
                chest.setSize(18, 18)
                chest.setOrigin(0.5);
                tile.setCollision(false);
                chest.isOpened = false;
            }
        })
    }

    setupTorches(torchLayer) {
        this.torchGroup = this.physics.add.staticGroup();    

        torchLayer.forEachTile(tile => {
            if (tile.index !== -1) {
                const torch = this.torchGroup.create(
                    tile.getCenterX(),
                    tile.getCenterY(),
                    'torch'
                )
                torch.setOrigin(0.5);
                torch.setDepth(torch.y);
                torch.play('torch-flicker')
                torch.setVisible(true);
                tile.setCollision(false);
            }
        })
    }

    createItemAnimations() {
        this.anims.create({
        key: 'coin-spin',
        frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 11 }),
        frameRate: 8,
        repeat: -1
        });

        this.anims.create({
        key: 'potion-idle',
        frames: this.anims.generateFrameNumbers('life-potion', { start: 0, end: 4 }),
        frameRate: 2,
        repeat: -1
        });

        this.anims.create({
        key: 'spike-animation',
        frames: [
            {key: 'spike-1'},
            {key: 'spike-2'},
            {key: 'spike-3'},
            {key: 'spike-4'},
            {key: 'spike-3'},
            {key: 'spike-2'},
            {key: 'spike-1'},
        ],
        frameRate: 10,
        repeat: 0,
        });

        this.anims.create({
        key: 'chest-opening',
        frames: this.anims.generateFrameNumbers('chest', { start: 0, end: 4 }),
        frameRate: 4,
        repeat: 0
        });

        this.anims.create({
        key: 'torch-flicker',
        frames: this.anims.generateFrameNumbers('torch', { start: 0, end: 3 }),
        frameRate: 4,
        repeat: -1
        });

        this.anims.create({
        key: 'dungeon-door-open',
        frames: this.anims.generateFrameNumbers('dungeon-door', { start: 0, end: 8 }),
        frameRate: 4,
        repeat: 0
        });

        this.anims.create({
        key: 'dungeon-door-close',
        frames: this.anims.generateFrameNumbers('dungeon-door', { start: 9, end: 15 }),
        frameRate: 4,
        repeat: 0
        });

        // Breakables anims
        this.anims.create({
        key: 'box-idel',
        frames: this.anims.generateFrameNumbers('box', { start: 0, end: 2 }),
        frameRate: 4,
        repeat: -1
        });

        this.anims.create({
        key: 'box-break',
        frames: this.anims.generateFrameNumbers('box', { start: 3, end: 6 }),
        frameRate: 4,
        repeat: 0
        });
        this.anims.create({
        key: 'pot-idle',
        frames: this.anims.generateFrameNumbers('pot', { start: 0, end: 2 }),
        frameRate: 4,
        repeat: 0
        });

        this.anims.create({
        key: 'pot-break',
        frames: this.anims.generateFrameNumbers('pot', { start: 3, end: 6 }),
        frameRate: 4,
        repeat: 0
        });
    }

    itemSpawnDrop(x, y) {
        const roll = Math.random();

        if (roll < 0.4) {
            this.spawnCoin(x, y);
        } else if (roll < 0.6) {
            this.spawnPotion(x, y);
        }
    }

    spawnCoin(x, y) {
        const coin = this.collectibles.create(x, y, 'coin');
        coin.setScale(0.6);
        coin.play('coin-spin');
        coin.setDepth(5);

        coin.type = 'coin';
        coin.body.enable = false;

        this.time.delayedCall(200, () => {
        if (coin.active) {
            coin.body.enable = true;
        }
    });
}

    spawnPotion(x, y) {
        const potion = this.collectibles.create(x, y, 'life-potion');
        potion.setScale(0.6);
        potion.play('potion-idle');
        potion.setDepth(5);

        potion.type = 'potion';
        potion.healAmount = Phaser.Math.Between(1, 10);

        this.time.delayedCall(200, () => {
        if (potion.active) {
            potion.body.enable = true;
        }
    });
}

    handleCollectablePickup(player, item) {
        let coins = this.registry.get('coins') || 0;
        if (item.type === 'coin') {
            coins += 1;
            this.registry.set('coins', coins);
            this.coinDisplay.addCoins(1)
            this.sound.play('coin_collect', {volume: 0.1});

        }
        
        if (item.type === 'potion') {
            player.health += item.healAmount;
            player.health = Math.min(player.health, 100);
            player.healthBar.setHealth(player.health);
            this.sound.play('item_collect', {volume: 0.1});
        }
        savePlayerData(player.health, coins);

        item.destroy();
    }

    update() {
        this.player.update();
    }

}