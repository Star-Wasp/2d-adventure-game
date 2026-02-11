import Phaser from "phaser";
import { getSavedCoins, savePlayerData } from "../utils/StorageManager";

export default class Blacksmith extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = 'blacksmith') {
    super(scene, x, y, 'blacksmith');

    // Physics setup
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(this.width / 3, this.height / 3);
    this.body.setOffset(10, 20);

    this.facing = 'down';

    this.createAnimations(scene);
    this.anims.play('blacksmith-idle-down');

    this.paseDirectionTimer = 1000;
    this.paseTimer = 0;
    this.paseVelocityX = 0;
    this.paseVelocityY = 0;
    this.speed = 15;

    this.isShopping = false;
    this.shopPanel = null;
    this.shopSlots = [];

    this.setCollideWorldBounds();

    this.forSale = [
        {key: 'shop-wood-sward', bonus: 5, cost: 300, animKey: 'wood-sward-anim'}, // +5 attack
        {key: 'shop-wood-shield', bonus: 10, cost: 300, animKey: 'wood-shield-anim'}, // +10 health
        {key: 'shop-leather-boots', bonus: 10, cost: 250, animKey: 'leather-boots-anim'}, // +10 speed
    ];

    this.armoryIcons = [];
    this.armoryText = [];

    this.armorAnims();

  }

      createAnimations(scene) {
    // Idle
        scene.anims.create({
            key: 'blacksmith-idle-down',
            frames: scene.anims.generateFrameNumbers('blacksmith', {start: 8, end: 11}),
            frameRate: 2,
            repeat: -1,
        });

        scene.anims.create({
            key: 'blacksmith-idle-up',
            frames: scene.anims.generateFrameNumbers('blacksmith', {start: 16, end: 19}),
            frameRate: 2,
            repeat: -1,
        });

        scene.anims.create({
            key: 'blacksmith-idle-side', // facing left
            frames: scene.anims.generateFrameNumbers('blacksmith', {start: 0, end: 3}),
            frameRate: 2,
            repeat: -1,
        });

        // walk
        scene.anims.create({
            key: 'blacksmith-walk-down',
            frames: scene.anims.generateFrameNumbers('blacksmith', {start: 12, end: 15}),
            frameRate: 2,
            repeat: -1,
        });

        scene.anims.create({
            key: 'blacksmith-walk-up',
            frames: scene.anims.generateFrameNumbers('blacksmith', {start: 20, end: 23}),
            frameRate: 2,
            repeat: -1,
        });

        scene.anims.create({
            key: 'blacksmith-walk-side', // facing left
            frames: scene.anims.generateFrameNumbers('blacksmith', {start: 4, end: 7}),
            frameRate: 2,
            repeat: -1,
        });
      }

      armorAnims() {
        if (this.scene.anims.exists('wood-sward-anim') && this.scene.anims.exists('leather-boots-anim') && this.scene.anims.exists('wood-shield-anim')) {return;};

        this.scene.anims.create({
            key: 'wood-sward-anim',
            frames: this.scene.anims.generateFrameNumbers('wood-sward-anim', {start: 0, end: 1}),
            frameRate: 2,
            repeat: -1,
        });

        this.scene.anims.create({
            key: 'leather-boots-anim',
            frames: this.scene.anims.generateFrameNumbers('leather-boots-anim', {start: 0, end: 1}),
            frameRate: 2,
            repeat: -1,
        });

        this.scene.anims.create({
            key: 'wood-shield-anim',
            frames: this.scene.anims.generateFrameNumbers('wood-shield-anim', {start: 0, end: 1}),
            frameRate: 2,
            repeat: -1,
        });
      }

      handlePasing() {    
          if (this.isShopping) {return;};
          const currentTime = this.scene.time.now;
  
          if (currentTime - this.paseTimer > this.paseDirectionTimer) {
              this.paseTimer = currentTime;
              const newDirection = Phaser.Math.Between(0, 3);
              if (newDirection === 0) {
                  this.paseVelocityX = 0;
                  this.paseVelocityY = -this.speed;
              } else if (newDirection === 1) {
                  this.paseVelocityX = 0;
                  this.paseVelocityY = this.speed;
              } else if (newDirection === 2) {
                  this.paseVelocityX = -this.speed;
                  this.paseVelocityY = 0;
              } else if (newDirection === 3) {
                  this.paseVelocityX = this.speed;
                  this.paseVelocityY = 0;
              }
          }
          this.setVelocity(this.paseVelocityX,  this.paseVelocityY);
  
          this.updateMovementAnimation();   
      }
  
      playIdle() {
          switch (this.facing) {
              case 'up':
                  this.anims.play('blacksmith-idle-up', true);
                  break;
              case 'down':
                  this.anims.play('blacksmith-idle-down', true);
                  break;
              case 'side':
                  this.anims.play('blacksmith-idle-side', true);
                  break;
          }
      }
  
      updateMovementAnimation() {
          const absX = Math.abs(this.body.velocity.x);
          const absY = Math.abs(this.body.velocity.y);
          if (absX === 0 && absY === 0) {
              this.playIdle();
          } else if (absX > absY) {
              if (this.body.velocity.x < 0) {
                  this.setFlipX(false);
                  this.facing = 'side';
                  this.anims.play('blacksmith-walk-side', true);
              } else if (this.body.velocity.x > 0) {
                  this.setFlipX(true);
                  this.facing = 'side';
                  this.anims.play('blacksmith-walk-side', true);
              }
          } else {
              if (this.body.velocity.y < 0) {
                  this.facing = 'up';
                  this.anims.play('blacksmith-walk-up', true);
              } else {
                  this.facing = 'down';
                  this.anims.play('blacksmith-walk-down', true);
              }
          }
      }

    sell() {
        if (!this.sellX || !this.sellY) {return;};

        const distanceX = this.sellX - this.x;
        const distanceY = this.sellY - this.y;

        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (distance < 2) {
            this.setVelocity(0, 0);
            this.facing = 'down';
            this.playIdle();
            this.showMerchendice();
            return;
        }

        const velX = (distanceX / distance) * this.speed;
        const velY = (distanceY / distance) * this.speed;

        this.setVelocity(velX, velY);

        this.updateMovementAnimation();
    }
      
    showMerchendice() {
        if (this.shopPanel) {return;};

        if (!this.isShopping) {
            this.hideMerchendice();
        };

        this.shopPanel = this.scene.add.image(330, 245, 'armory-shop-menu')
            .setScrollFactor(0)
            .setDepth(1000)
            .setScale(1.5)            

        this.createSlots()

        this.forSale.forEach((item, index) => {
            const x = 305 + index * 25;
            const y = 245;
            const icon = this.scene.add.sprite(x, y, item.key)
                .setScrollFactor(0)
                .setDepth(1002)
                .setScale(0.5)
                .setInteractive({useHandCursor: true});

            this.armoryIcons.push(icon);

            const armorText = this.scene.add.text(
                icon.x - 6,
                icon.y - 12,
                `+${item.bonus}`,
                { fontSize: '11px', fill: '#ffffff' }
            )
                .setScrollFactor(0)
                .setDepth(1003)
                .setScale(0.5)

            const priceText = this.scene.add.text(
                icon.x - 8,
                icon.y + 6,
                `🪙${item.cost}`,
                { fontSize: '11px', fill: '#ffffff' }
            )
                .setScrollFactor(0)
                .setDepth(1003)
                .setScale(0.5)

            this.armoryText.push(armorText, priceText);
            

            icon.on('pointerdown', () => {
                const coins = getSavedCoins();

                if (coins >= item.cost) {
                    console.log('Armory items purchased');

                    const newCoins = coins - item.cost;

                    savePlayerData(this.scene.player.health, newCoins);
                    this.scene.registry.set('coins', newCoins);

                    if (this.scene.coinDisplay) {
                        this.scene.coinDisplay.removeCoins(item.cost);
                    }

                    console.log('Coins remaining: ', newCoins)

                    const player = this.scene.player;

                    const offsetX = Phaser.Math.Between(10, 20);
                    const offsetY = Phaser.Math.Between(25, 35);

                    const armorySprite = this.scene.physics.add.sprite(
                        player.x + offsetX,
                        player.y + offsetY,
                        item.animKey
                    );

                    armorySprite
                        .setDepth(player.depth - 1)
                        .setScale(0.8)
                    armorySprite.play(item.animKey);
                    armorySprite.setImmovable(true);

                    this.scene.physics.add.overlap(player, armorySprite, () => {
                        console.log("item collected");

                        if (this.scene.bagMenu) {
                            const inventoryKey = 'inventory-' + item.key.replace('shop-', '');
                            console.log(inventoryKey)
                            this.scene.bagMenu.addItem(inventoryKey);
                        }
                        armorySprite.destroy()
                    },
                    null,
                    this
                    );
                } else {
                    console.log("not enough coins");
                }
            })
        })
    }
      
    createSlots(cols = 3, startX = 305, startY = 245, spacing = 25) {
        let slotIndex = 0;

        for (let col = 0; col < cols; col++) {
            const slot = this.scene.add.rectangle(
                startX + col * spacing,
                startY,
                22,
                22,
                0x00ff00,
                0
            );

            slot.armoryIndex = slotIndex;

            slot
                .setOrigin(0.5)
                .setScrollFactor(0)
                .setDepth(1001)
                .setInteractive(false);
                slot.input.enabled = false;
            
            this.shopSlots.push(slot);
            slotIndex++;
        }
    }
      
    hideMerchendice() {
        if (this.shopPanel) {
            this.shopPanel.destroy();
            this.shopPanel = null;
        }

        this.shopSlots.forEach(slot => slot.destroy());
        this.shopSlots = [];

        this.armoryIcons.forEach(icon => icon.destroy());
        this.armoryIcons = [];

        this.armoryText.forEach(text => text.destroy());
        this.armoryText = [];
    }

    update() {
        if (!this.isShopping) {
            this.handlePasing()  
        }
        

        if (this.isShopping) {
            this.sell();
        }
      }

}