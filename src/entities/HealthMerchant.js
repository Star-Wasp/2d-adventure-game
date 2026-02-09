import Phaser from "phaser";

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

    this.setCollideWorldBounds();

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
        console.log(this.sellX, this.sellY, this.x, this.y);
        if (!this.sellX || !this.sellY) {return;};

        const distanceX = this.sellX - this.x;
        const distanceY = this.sellY - this.y;

        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        if (distance < 2) {
            this.setVelocity(0, 0);
            this.facing = 'down';
            this.playIdle();
            return;
        }

        const velX = (distanceX / distance) * this.speed;
        const velY = (distanceY / distance) * this.speed;

        this.setVelocity(velX, velY);

        this.updateMovementAnimation();
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