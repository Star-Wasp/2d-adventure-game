import Phaser from "phaser";
import BaseScene from "./BaseScene";
import Player from "../entities/Player";
import LevelManager from "../utils/LevelManager";
import CoinDisplay from "../hud/CoinDisplay";
import { getSavedLevel, saveLevel, getSavedPlayerHealth, getSavedCoins, savePlayerData, saveCheckpoint, getSavedCheckpoint, getSavedInventory, saveInventory} from "../utils/StorageManager";
import Fury from "../entities/Fury";
import Slime1 from "../entities/Slime1";
import Slime2 from "../entities/Slime2";
import Slime3 from "../entities/Slime3";
import HealthMerchant from "../entities/HealthMerchant";
import BagMenu from "../hud/BagMenu";
import BackHome from "../hud/BackHome";

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

    this.musicVolume = 0.01;
    this.soundVolume = 0.02;

  }

  create() {
    super.create();

    if (!this.registry.has('bgMusic')) {
        this.registry.set('bgMusic', null)
    };

    this.setupLevelManager();
    this.levelManager.deathRespawn();
    this.createItemAnimations();
    this.createBuildingAnimations();

    this.checkpointGroup = this.physics.add.staticGroup();  

    const map = this.createMap();
    this.playLevelMusic();
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    const savedCoins = getSavedCoins() || 0;
    
    this.registry.set('coins', savedCoins)

    this.furyIsOverJumpable = false;
    this.furyIsOverTrap = false;

    this.setupPlayer(map);

    this.setupEnemyZoneLayer(this.enemyZoneLayer);

    this.setupCoinDisplay();

    this.setupBagMenuDisplay();

    this.setupBackHomeButton();

    this.player.checkTrapOverlap(this.spikeGroup);

    this.setupJumpableColliders();
    
    this.setupPlayerOverlaps();

    this.setupCollectibles();

    this.setupCamera(map);

    this.playerInBuildingZone = false;
    this.currentBuilding = null;

    this.currentInteractionZone = null;
    this.currentCheckpoint = null;
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

        const music = this.sound.add(musicType + '-music', { loop: true, volume: this.musicVolume });
        music.play();

        this.registry.set('bgMusic', {instance: music, musicType})
    }
  }

  setupCoinDisplay() {
    const coins = this.registry.get('coins');
    this.coinDisplay = new CoinDisplay(this, 210, 230, this.registry.get('coins'));
  }

  setupBagMenuDisplay() {
    this.bagMenu = new BagMenu(this, 272, 242);

     const savedInventory = getSavedInventory();
    if (savedInventory) {
        this.bagMenu.inventory = savedInventory;

        this.bagMenu.slots.forEach((slot, i) => {
            if (savedInventory[i]) {
                slot.setTexture(savedInventory[i].textureKey);
                slot.amount = savedInventory[i].amount;
            }
        });
    }
  }

  setupBackHomeButton() {
    this.backHome = new BackHome(this, 272, 227);
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

    // Overlap with infoboards
    this.physics.add.overlap(
        this.player,
        this.infoGroup, () => {
            console.log("READING INFO BOARD")
        }
    )

    // Breakables overlap
     this.physics.add.overlap(
        this.player.swardHitbox,
        this.breakablesGroup,
        (hitbox, item) => {
            if (this.player.isSwinging && !item.isBroken && !this.player.isJumping) {
                item.isBroken = true;
                if (item.type === 'box') {
                    item.play('box-break');
                    item.on('animationcomplete-box-break', () => {
                    for (let i = 0; i < 3; i++) {
                        this.itemSpawnDrop(item.x, item.y);
                    } 
                }) 
                } else if (item.type === 'pot') {
                    item.play('pot-break');
                    item.on('animationcomplete-pot-break', () => {
                    for (let i = 0; i < 2; i++) {
                        this.itemSpawnDrop(item.x, item.y);
                    } 
                }) 
            }  
            }
        },
        null,
        this
    )

    // Chest operlap
    this.physics.add.overlap(
        this.player.swardHitbox,
        this.chestGroup,
        (hitbox, chest) => {
            if (this.player.isSwinging && !chest.isOpened && !this.player.isJumping) {
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

    // Trigger building door opening
    this.physics.add.overlap(this.player, this.endZones, (player, zone) => {
        if (!this.playerInBuildingZone) {
            this.playerInBuildingZone = true;
        }
        if (zone.isBuilding) {
            if (zone.to_level === 'level7') {
                const building = this.buildingsGroup.getChildren().find(b => b.buildingType === 'hero_house');
                this.currentBuilding = building;
                building.play('hero_house_opening_anim');
                this.sound.play('door_open', {volume: this.soundVolume});
            } else if (zone.to_level === 'level10') {
                const building = this.buildingsGroup.getChildren().find(b => b.buildingType === 'health_shop');
                this.currentBuilding = building;
                building.play('health_shop_opening_anim');
                this.sound.play('door_open', {volume: this.soundVolume});
        }
        }
    })
    
    // Zone overlap
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

    // Checking for overlap with interactive zone objects
    this.physics.add.overlap(this.player, this.InteractionZones, (player, zone) => {
        if (this.currentInteractionZone !== zone) {
            this.currentInteractionZone = zone;
            if (zone.interactionType === 'bookshelf') {
            console.log("Staring at books");
            } else if (zone.interactionType === 'bed') {
                if (this.player.health < 100) {
                    this.cameras.main.fadeOut(1000, 0, 0, 0);

                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.player.health = 100;
                        this.player.healthBar.setHealth(this.player.health);
                        savePlayerData(this.player.health, this.registry.get('coins'));
                        this.cameras.main.fadeIn(1000, 0, 0, 0)
                    })
                } else {
                  console.log("Fully rested! Lets go explore!");  
                }
            } else if (zone.interactionType === 'shop_potions') {
                this.healthMerchant.isShopping = true;
            }
        }
    })

    // Checkpoint functionality
    this.physics.add.overlap(this.player, this.checkpointGroup, (player, checkpoint) => {
        if (!checkpoint) {return; };
        if (!checkpoint.wasOverlapping) {
            checkpoint.wasOverlapping = true;
            this.currentCheckpointX = checkpoint.x;
            this.currentCheckpointY = checkpoint.y;
            const level = this.levelManager.getCurrentLevelKey();
            saveCheckpoint(checkpoint.x, checkpoint.y, level);
            }
        })

        // Overlap with enemies
        this.physics.add.overlap(
        this.player.swardHitbox,
        this.EnemyGroup,
        (hitbox, item) => {
            const now = this.time.now;
            if (this.player.isSwinging && now - item.lastHitTime > item.hitCooldown && !this.player.isJumping) {
                const damageAmount = Phaser.Math.Between(0, 10);
                item.takeDamage(damageAmount)
                item.lastHitTime = now;
            }
        })
    }

  setupPlayer(map) {
    let savedHealth = getSavedPlayerHealth() || 100;
    const currentLevel = this.levelManager.getCurrentLevelKey();

    let respawnX;
    let respawnY;

    const checkpoint = getSavedCheckpoint();
    if (checkpoint) {
        respawnX = checkpoint.coordinateX;
        respawnY = checkpoint.coordinateY;
    }
    if (this.levelManager.justRespawned) {
        savedHealth = 100;
        this.levelManager.justRespawned = false;
    }
    
    if (savedHealth <= 0) {
        savedHealth = 100;
    }
    
    // Creating Player
    if (checkpoint && checkpoint.level === currentLevel && this.spawnFromCheckpoint) {
        this.spawnFromCheckpoint = false;
        this.player = new Player(this, respawnX, respawnY, 'player', savedHealth);
        this.fury = new Fury(this, this.player.x + 30, this.player.y + 10, 'cat');
        this.fury.setTarget(this.player);
    } else {
        this.spawnFromCheckpoint = false;
        this.player = new Player(this, this.startPoint.x, this.startPoint.y, 'player', savedHealth); 
        this.fury = new Fury(this, this.player.x + 30, this.player.y + 10, 'cat');
        this.fury.setTarget(this.player);
    }
    
    this.cameras.main.setZoom(3.7);
    this.cameras.main.centerOn(map.widthInPixels/2, map.widthInPixels/2);
    
    this.player.setCollideWorldBounds(true);
    this.fury.setCollideWorldBounds(true);
    if (this.collisionLayer) {
        this.physics.add.collider(this.player, this.collisionLayer);
        this.physics.add.collider(this.fury, this.collisionLayer);
    }

    savePlayerData(savedHealth, this.registry.get('coins'));

  }

  setupLevelManager() {
    if (!this.registry.has('levelManager')) {
        this.registry.set('levelManager', new LevelManager());
    }

    this.levelManager = this.registry.get('levelManager');

    const savedCheckpoint = getSavedCheckpoint();
    const startedFromMenu = this.registry.get('startedFromMenu');
    this.registry.set('startedFromMenu', false);
    if (savedCheckpoint && !this.levelManager.isRespawningAfterDeath && startedFromMenu) {
        this.spawnFromCheckpoint = true;
    }
    

    if ((this.levelManager.isRespawningAfterDeath && savedCheckpoint) || (this.spawnFromCheckpoint && savedCheckpoint)) { 
        this.levelManager.setLevel(savedCheckpoint.level);
    } else {
        const savedLevel = getSavedLevel();
        this.levelManager.currentLevel = savedLevel;
    }
  }

    createMap() {

        const map = this.make.tilemap({key: this.levelManager.getCurrentLevelKey()});

        // Dongeon tilesets
        const dungeonTileset = map.addTilesetImage('tileset-export', 'dungeon');

        const doorTileset = map.addTilesetImage('Wooden door', 'door');

        // Interiors tileset
        const interiorsTileset = map.addTilesetImage('Interiors', 'interiors');

        // Tilesets
        const mainTileset = map.addTilesetImage('tileset', 'tiles');

        const mainTileset2 = map.addTilesetImage('Tileset2', 'tiles2');

        const waterTileset = map.addTilesetImage('water', 'water');

        const groundDecorTileset = map.addTilesetImage('decorations', 'ground_decor');

        const natureDecorTileset = map.addTilesetImage('objects', 'nature_decor');

        const trapTileset = map.addTilesetImage('spikes', 'spikes');

        // Static Layers

        const checkpointLayer = map.createStaticLayer('safe_point', mainTileset, 0, 0);
        if (checkpointLayer) {
            checkpointLayer
            .setDepth(1)
        }

        this.setupCheckpoints(checkpointLayer);

        const jumpableColliders = map.createStaticLayer('can_jump_over', mainTileset, 0, 0);
        if (jumpableColliders) {
            this.jumpableColliders = jumpableColliders;
            this.jumpableColliders.setCollisionByProperty({colliders: true});
            this.jumpableColliders.setCollisionByExclusion([-1]);
        }        

        const collisionLayer = map.createStaticLayer('collisions', mainTileset, 0, 0)
        if (collisionLayer) {
            this.collisionLayer = collisionLayer;
            this.collisionLayer.setDepth(0);
            this.collisionLayer.setCollisionByProperty({colliders: true});
            this.collisionLayer.setCollisionByExclusion([-1]);
        }
            
        const chestLayer = map.createStaticLayer('chests', mainTileset, 0, 0);
        chestLayer.setVisible(false);
        this.setupChests(map, chestLayer);

        const torchLayer = map.createStaticLayer('torches', mainTileset, 0, 0);
        torchLayer.setVisible(false);
        this.setupTorches(map, torchLayer);

        const groundLayer = map. createStaticLayer('ground', [mainTileset, groundDecorTileset, waterTileset, mainTileset2, dungeonTileset, doorTileset, interiorsTileset], 0, 0).setDepth(0);

        const higherLayer = map.createStaticLayer('higher_ground', [mainTileset, groundDecorTileset, waterTileset, mainTileset2, dungeonTileset, doorTileset, interiorsTileset], 0, 0).setDepth(0);

        const decorLayer = map.createStaticLayer('decor', interiorsTileset, 0, 0);

        const trapLayer = map.createStaticLayer('traps', trapTileset, 0, 0);

        this.spikeGroup = this.physics.add.group();

        this.setupSpikes(trapLayer);

        // Object Layers
        const infoLayer = map.getObjectLayer('info_board');
        this.infoGroup = this.physics.add.group();
        this.setupInfoBoards(infoLayer);

        const npcLayer = map.getObjectLayer('npc');
        this.npcGroup = this.physics.add.group();
        this.setupNpc(npcLayer);

        const zoneLayer = map.getObjectLayer('player_zones');

        const natureLayer = map.getObjectLayer('nature');

        const doorLayer = map.getObjectLayer('doors');

        this.enemyZoneLayer = map.getObjectLayer('enemy_zones');

        this.EnemyGroup = this.physics.add.group();

        const buildingLayer = map.getObjectLayer('buildings');

        this.buildingsGroup = this.physics.add.staticGroup();

        this.setupBuildings(buildingLayer);

        const breakableLayer = map.getObjectLayer('breakables');

        this.breakablesGroup = this.physics.add.group();

        this.setupBreakables(breakableLayer);

        this.spawnDoors(doorLayer);

        this.spawnNatureObjects(natureLayer);

        this.zoneLayer = zoneLayer;

        this.setupZones(zoneLayer);

        this.setupInteractionZones(zoneLayer);

        const mapTypeProperty = map.properties.find(p => p.name === 'type');
        this.mapType = mapTypeProperty ? mapTypeProperty.value : 'overground';

        this.handleRespawn();

        return map
    }

    setupInfoBoards(infoLayer) {
        if (!infoLayer) {return;};

        infoLayer.objects.forEach(obj => {
            if (obj.name === 'info-controls') {
                const infoBoard = this.add.sprite(obj.x, obj.y, 'info-board')
                    .setScale(0.8)
                    .setDepth(obj.y - 1);

                this.infoGroup.add(infoBoard);
            }
        })
    }

    setupNpc(npcLayer) {
        if (!npcLayer) {return;};

        npcLayer.objects.forEach(obj => {
            if (obj.name === 'health_merchant') {
                this.healthMerchant = new HealthMerchant(this, obj.x, obj.y);
                this.npcGroup.add(this.healthMerchant);
            }
        });

        npcLayer.objects.forEach(obj => {
            if (obj.name === 'health-merchant-sell' && this.healthMerchant) {
                this.healthMerchant.sellX = obj.x;
                this.healthMerchant.sellY = obj.y;
            }
        });
        
        if (this.collisionLayer) {
            this.physics.add.collider(this.npcGroup, this.collisionLayer);  
            }
    }

    setupEnemyZoneLayer(enemyZoneLayer) {
        if (!enemyZoneLayer) {return;};

        enemyZoneLayer.objects.forEach(obj => {
            if (obj.name === 'slime1') {
                const slime1 = new Slime1(this, obj.x, obj.y);
                this.EnemyGroup.add(slime1);
                slime1.setTarget(this.player);
                if (this.collisionLayer) {
                    this.physics.add.collider(slime1, this.collisionLayer);
                }
            } else if (obj.name === 'slime2') {
                const slime2 = new Slime2(this, obj.x, obj.y);
                this.EnemyGroup.add(slime2);
                slime2.setTarget(this.player);
                if (this.collisionLayer) {
                    this.physics.add.collider(slime2, this.collisionLayer);
                }
            } else if (obj.name === 'slime3') {
                const slime3 = new Slime3(this, obj.x, obj.y);
                this.EnemyGroup.add(slime3);
                slime3.setTarget(this.player);
                if (this.collisionLayer) {
                    this.physics.add.collider(slime3, this.collisionLayer);
                }
            }
        });
    }

    setupJumpableColliders() {
        if (!this.jumpableColliders) {return;};

        this.jumpableCollider = this.physics.add.collider(this.player, this.jumpableColliders);
    }

    setupCheckpoints(checkpointLayer) {
        if (checkpointLayer) {
        checkpointLayer.forEachTile(tile => {
            if (tile.index !== -1) {
                const checkpoint = this.checkpointGroup.create(
                    tile.getCenterX(),
                    tile.getCenterY(),
                    'checkpoint'
                )
                checkpoint.setOrigin(0.5);
                checkpoint.play('flag');
                checkpoint.setVisible(true);
                checkpoint.setDepth(checkpoint.y - 5);
                checkpoint.setScale(1.3);
                checkpoint.setSize(40, 40);
                checkpoint.setOffset(-10, -10);
                checkpoint.wasOverlapping = false;
                tile.setVisible(false)
                tile.setCollision(false);
                }
            })
        }   
    }

    handleRespawn() {
        if (this.levelManager.currentLevel === this.levelManager.respawnLevel) {
        
            this.player.x = this.levelManager.respawnX;
            this.player.y = this.levelManager.respawnY;

            this.player.health = 100;
            this.player.healthBar.setHealth(this.player.health);

            savePlayerData(this.player.health, this.registry.get('coins'));


            this.cameras.main.fadeIn(500, 0, 0, 0);
            this.cameras.main.once('camerafadeincomplete', () => {
                this.player.body.enable = true;
                this.player.isSwinging = false;
            });
        }
    }

    setupBuildings(layer) {
        if (!layer) {return;};

        layer.objects.forEach(obj => {
            const type = obj.properties.find(p => p.name === 'type')?.value;
            if (type === 'hero_house') {
                const hero_house = this.add.sprite(obj.x, obj.y, 'hero_house_closed')
                    .setOrigin(0.5, 1)
                    .setDepth(obj.y -16)
                    .setScale(1.5)
                    
                this.physics.world.enable(hero_house);
                this.buildingsGroup.add(hero_house);

                hero_house.body
                .setSize(14, 15)
                .setOffset(33, 33)

                hero_house.buildingType = type;
            } else if (type === 'health_shop') {
                const health_shop = this.add.sprite(obj.x, obj.y, 'health_shop_closed')
                    .setOrigin(0.5, 1)
                    .setDepth(obj.y -16)
                    .setScale(1.5)
                    
                this.physics.world.enable(health_shop);
                this.buildingsGroup.add(health_shop);

                health_shop.body
                .setSize(14, 15)
                .setOffset(33, 33)

                health_shop.buildingType = type;
            }
        })
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

    setupInteractionZones(zoneLayer) {
        this.InteractionZones = this.physics.add.staticGroup();

        this.InteractionZones.clear(true, true);

        let interactiveObjects = zoneLayer.objects.filter(obj =>
            obj.name === 'interactive');

        interactiveObjects.forEach(obj => {
            const typeProp = obj.properties.find(p => p.name === 'type');

            const zone = this.InteractionZones.create(
                obj.x + obj.width / 2,
                obj.y + obj.height / 2,
                null
            )
            
            zone.setSize(obj.width + 40, obj.height + 40);
            zone.setVisible(false)

            if (typeProp) {
                zone.interactionType = typeProp.value;
            }
        })
    }

    setupZones(zoneLayer) {

        // Set up level start and end zones
        const lastLevel = this.levelManager.lastLevel || 'level0'

        this.cameFromLevel = lastLevel;
        

        let startPoint;
   
        if (this.levelManager.isRespawningAfterDeath) {

            this.spawnFromCheckpoint = true;
       
            startPoint = zoneLayer.objects.find(obj => 
                obj.name === 'start' && 
                obj.properties.some(p => p.name === 'respawn' && p.value === true)
            );       
            this.levelManager.isRespawningAfterDeath = false;
            this.levelManager.justRespawned = true;
        }
        
        if (!startPoint) {
            startPoint = zoneLayer.objects.find(obj => obj.name === 'start' && obj.properties.some(p => p.name === 'from_level' && p.value === lastLevel))
        }

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

        const isBuildingProp = point.properties.find(p => p.name === 'isBuilding');
        zone.isBuilding = isBuildingProp ? isBuildingProp.value : false;
        
        const toLevelProp = point.properties.find(p => p.name === 'to_level');
        zone.to_level = toLevelProp ? toLevelProp.value: null;
    });

    }

    setupBreakables(breakableLayer) {
        if (!breakableLayer) {return;};

        breakableLayer.objects.forEach(obj => {
            const type = obj.properties.find(p => p.name === 'type')?.value;
            if (type) {
                const sprite = this.add.sprite(obj.x, obj.y, type)
                .setOrigin(0, 1);
                
                let depthOffset = -35;
                let offsetX = 25;
                let offsetY = 10;
                let bodyW = 20;
                let bodyH = 20;

                if (type === 'pot') {
                    depthOffset = -25;
                    offsetX = 25;
                    offsetY = 25
                    bodyW = 15;
                    bodyH = 15;
                }
 
                sprite
                .setDepth(obj.y + depthOffset);

                if (type === 'box') {
                    sprite.play('box-idle');
                } else if (type === 'pot') {
                    sprite.play('pot-idle');
                }
            this.breakablesGroup.add(sprite);
            this.physics.world.enable(sprite);
            sprite.body.setSize(bodyW, bodyH).setOffset(offsetX, offsetY);
            sprite.isBroken = false;
            sprite.type = type;
            }
            
        })
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
                chest.setDepth(chest.y - 10);
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
        frames: this.anims.generateFrameNumbers('life-potion', { start: 0, end: 2 }),
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
        key: 'box-idle',
        frames: this.anims.generateFrameNumbers('box', { start: 0, end: 1 }),
        frameRate: 2,
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
        frames: this.anims.generateFrameNumbers('pot', { start: 0, end: 1 }),
        frameRate: 2,
        repeat: -1
        });

        this.anims.create({
        key: 'pot-break',
        frames: this.anims.generateFrameNumbers('pot', { start: 3, end: 6 }),
        frameRate: 4,
        repeat: 0
        });

        // Checkpoint anim
        this.anims.create({
        key: 'flag',
        frames: this.anims.generateFrameNumbers('checkpoint', { start: 0, end: 9 }),
        frameRate: 10,
        repeat: -1
        });
    }

    createBuildingAnimations() {

        // Hero house anims
        this.anims.create({
        key: 'hero_house_opening_anim',
        frames: [
            {key: 'hero_house_closed'},
            {key: 'hero_house_halfopen'},
            {key: 'hero_house_open'},
        ],
        frameRate: 2,
        repeat: 0,
        });

        this.anims.create({
        key: 'hero_house_closing_anim',
        frames: [
            {key: 'hero_house_open'},
            {key: 'hero_house_halfopen'},
            {key: 'hero_house_closed'},
        ],
        frameRate: 2,
        repeat: 0,
        });

        // Health shop anims
        this.anims.create({
        key: 'health_shop_opening_anim',
        frames: [
            {key: 'health_shop_closed'},
            {key: 'health_shop_halfopen'},
            {key: 'health_shop_open'},
        ],
        frameRate: 2,
        repeat: 0,
        });

        this.anims.create({
        key: 'health_shop_closing_anim',
        frames: [
            {key: 'health_shop_open'},
            {key: 'health_shop_halfopen'},
            {key: 'health_shop_closed'},
        ],
        frameRate: 2,
        repeat: 0,
        });
    }

    itemSpawnDrop(x, y) {
        const roll = Math.random();

        if (roll < 0.7) {
            this.spawnCoin(x, y);
        } else if (roll < 0.8) {
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
        potion.setScale(0.4);
        potion.play('potion-idle');
        potion.setDepth(5);

        potion.type = 'potion';
        potion.healAmount = 5;

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
            this.coinDisplay.addCoins(1);
            this.sound.play('coin_collect', { volume: this.soundVolume });
        }

        if (item.type === 'potion') {
            if (player.health < 100) {
                player.health += item.healAmount;
                player.health = Math.min(player.health, 100);
                player.healthBar.setHealth(player.health);
                this.sound.play('item_collect', { volume: this.soundVolume });
            } else {
                if (this.bagMenu) {
                    this.bagMenu.addItem('inventory-potion');
                    this.sound.play('item_collect', { volume: this.soundVolume });
                }
            }
        }

        savePlayerData(player.health, this.registry.get('coins'), this.bagMenu.inventory);

        item.destroy();
    }


    update() {
        this.player.update();
        this.fury.update();
        this.EnemyGroup.getChildren().forEach(enemy => {
            enemy.update();
        })
        this.npcGroup.getChildren().forEach(npc => {
            npc.update();
        })

        if (this.playerInBuildingZone) {
            const stillOverlapping = this.physics.overlap(this.player, this.endZones);
            
            if (!stillOverlapping) {
                this.playerInBuildingZone = false;

                if (this.currentBuilding) {
                    this.currentBuilding.play(this.currentBuilding.buildingType + '_closing_anim');
                    this.sound.play('door_close', {volume: this.soundVolume})
                    this.currentBuilding = null;
                }
            }
        }

        if (this.currentInteractionZone) {
            const zone = this.currentInteractionZone;
            const playerBounds = this.player.getBounds();
            const zoneBounds = zone.getBounds();

            if (!Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, zoneBounds)) {
                if (zone.interactionType === 'shop_potions') {
                    this.healthMerchant.isShopping = false;
                    this.healthMerchant.hideMerchendice();
                }
                this.currentInteractionZone = null;

            }
            
        }

        const playerBounds = this.player.getBounds();
        this.checkpointGroup.getChildren().forEach((checkpoint) => {
            const checkpointBounds = checkpoint.getBounds();
            if (!Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, checkpointBounds)) {
                checkpoint.wasOverlapping = false;
            }
        })

        if (this.jumpableColliders) {
            const furyBounds = this.fury.getBounds();
            const overlapping = this.jumpableColliders.getTilesWithinWorldXY(
                furyBounds.x,
                furyBounds.y,
                furyBounds.width,
                furyBounds.height
            ).some(tile => tile.index !== -1);

            if (overlapping && !this.furyIsOverJumpable && !this.fury.isJumping) {
                this.furyIsOverJumpable = true;
                this.fury.startJumpingOver();
            } else if (!overlapping && this.furyIsOverJumpable) {
                this.furyIsOverJumpable = false;
            }
        }

        if (this.spikeGroup) {
            const furyBounds = this.fury.getBounds();
            const overlapping = this.physics.overlap(this.fury, this.spikeGroup)

            if (overlapping && !this.furyIsOverTrap && !this.fury.isJumping) {
                this.furyIsOverTrap = true;
                this.fury.startJumpingOver();
            } else if (!overlapping && this.furyIsOverTrap) {
                this.furyIsOverTrap = false;
            }
        }

        if (this.jumpableCollider && this.jumpableColliders) {
            this.jumpableCollider.active = !this.player.isJumping;
        }
        
    }
}