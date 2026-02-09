import Phaser from "phaser";
import { getSavedCoins, savePlayerData } from "../utils/StorageManager";

export default class HealthMerchant extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = 'health-merchant') {
    super(scene, x, y, 'health-merchant');

    // Physics setup
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(this.width / 3, this.height / 3);
    this.body.setOffset(10, 20);

    this.facing = 'down';

    this.createAnimations(scene);
    this.anims.play('health-merchant-idle-down');

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
        {key: 'potion-20', heal: 20, cost: 20},
        {key: 'potion-50', heal: 50, cost: 50},
        {key: 'potion-100', heal: 100, cost: 100},
    ];

    this.potionIcons = [];
    this.potionText = [];

    this.potionAnims();

    }

    createAnimations(scene) {

        // Idle
        scene.anims.create({
            key: 'health-merchant-idle-down',
            frames: scene.anims.generateFrameNumbers('health-merchant', {start: 8, end: 11}),
            frameRate: 2,
            repeat: -1,
        });

        scene.anims.create({
            key: 'health-merchant-idle-up',
            frames: scene.anims.generateFrameNumbers('health-merchant', {start: 16, end: 19}),
            frameRate: 2,
            repeat: -1,
        });

        scene.anims.create({
            key: 'health-merchant-idle-side', // facing left
            frames: scene.anims.generateFrameNumbers('health-merchant', {start: 0, end: 3}),
            frameRate: 2,
            repeat: -1,
        });

        // walk
        scene.anims.create({
            key: 'health-merchant-walk-down',
            frames: scene.anims.generateFrameNumbers('health-merchant', {start: 12, end: 15}),
            frameRate: 2,
            repeat: -1,
        });

        scene.anims.create({
            key: 'health-merchant-walk-up',
            frames: scene.anims.generateFrameNumbers('health-merchant', {start: 20, end: 23}),
            frameRate: 2,
            repeat: -1,
        });

        scene.anims.create({
            key: 'health-merchant-walk-side', // facing left
            frames: scene.anims.generateFrameNumbers('health-merchant', {start: 4, end: 7}),
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
                this.anims.play('health-merchant-idle-up', true);
                break;
            case 'down':
                this.anims.play('health-merchant-idle-down', true);
                break;
            case 'side':
                this.anims.play('health-merchant-idle-side', true);
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
                this.anims.play('health-merchant-walk-side', true);
            } else if (this.body.velocity.x > 0) {
                this.setFlipX(true);
                this.facing = 'side';
                this.anims.play('health-merchant-walk-side', true);
            }
        } else {
            if (this.body.velocity.y < 0) {
                this.facing = 'up';
                this.anims.play('health-merchant-walk-up', true);
            } else {
                this.facing = 'down';
                this.anims.play('health-merchant-walk-down', true);
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

        this.shopPanel = this.scene.add.image(330, 245, 'potion-shop-menu')
            .setScrollFactor(0)
            .setDepth(1000)
            .setScale(1.5)            

        this.createSlots()

        this.forSale.forEach((potion, index) => {
            const x = 305 + index * 25;
            const y = 245;
            const icon = this.scene.add.sprite(x, y, potion.key)
                .setScrollFactor(0)
                .setDepth(1002)
                .setScale(0.5)
                .setInteractive({useHandCursor: true});

            this.potionIcons.push(icon);

            const healText = this.scene.add.text(
                icon.x - 6,
                icon.y - 12,
                `+${potion.heal}`,
                { fontSize: '11px', fill: '#ffffff' }
            )
                .setScrollFactor(0)
                .setDepth(1003)
                .setScale(0.5)

            const priceText = this.scene.add.text(
                icon.x - 8,
                icon.y + 6,
                `🪙${potion.cost}`,
                { fontSize: '11px', fill: '#ffffff' }
            )
                .setScrollFactor(0)
                .setDepth(1003)
                .setScale(0.5)

            this.potionText.push(healText, priceText);
            

            icon.on('pointerdown', () => {
                const coins = getSavedCoins();

                if (coins >= potion.cost) {
                    console.log('Potion purchased');

                    const newCoins = coins - potion.cost;

                    savePlayerData(this.scene.player.health, newCoins);

                    if (this.scene.coinDisplay) {
                        this.scene.coinDisplay.removeCoins(potion.cost);
                    }

                    console.log('Coins remaining: ', newCoins)

                    const player = this.scene.player;

                    const offset = Phaser.Math.Between(10, 20);

                    const potionSprite = this.scene.add.sprite(
                        player.x,
                        player.y + offset,
                        potion.key
                    );

                    potionSprite
                        .setDepth(player.depth - 1)
                        .setScale(0.4)
                    potionSprite.play('life-' + potion.key);
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

            slot.potionIndex = slotIndex;

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

        this.potionIcons.forEach(icon => icon.destroy());
        this.potionIcons = [];

        this.potionText.forEach(text => text.destroy());
        this.potionText = [];
    }

    potionAnims() {
        if (this.scene.anims.exists('life-potion-20') && this.scene.anims.exists('life-potion-50') && this.scene.anims.exists('life-potion-100')) {return;};

        this.scene.anims.create({
            key: 'life-potion-20',
            frames: this.scene.anims.generateFrameNumbers('life-potion-20', {start: 0, end: 1}),
            frameRate: 2,
            repeat: -1,
        });

        this.scene.anims.create({
            key: 'life-potion-50',
            frames: this.scene.anims.generateFrameNumbers('life-potion-50', {start: 0, end: 1}),
            frameRate: 2,
            repeat: -1,
        });

        this.scene.anims.create({
            key: 'life-potion-100',
            frames: this.scene.anims.generateFrameNumbers('life-potion-100', {start: 0, end: 1}),
            frameRate: 2,
            repeat: -1,
        });
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