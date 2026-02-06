
import Phaser from "phaser";

export default class Slime1 extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture = 'slime1-idle') {
        super(scene, x, y, 'slime1-idle');

        // Physics setup
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);

        this.body.setSize(this.width / 3, this.height / 3);
        this.body.setOffset(22, 20);

        this.facing = 'down';

        this.createAnimations(scene);
        this.anims.play('slime1-idle-down');

        this.speed = 40;
        this.baseSpeed = this.speed;
        this.setScale(0.7);

        this.patrolDirectionTimer = 1000;
        this.isMoving = false;
        this.patrolTimer = 0;
        this.patrolVelocityX =0;
        this.patrolVelocityY =0;

        this.lastHitTime = 0;
        this.hitCooldown = 500;

        this.isHurt = false;

        this.maxHealth = 50;

        }

    createAnimations(scene) {

        // Slime1 idle anims
        scene.anims.create({
            key: 'slime1-idle-down',
            frames: scene.anims.generateFrameNumbers('slime1-idle', {start: 0, end: 5}),
            frameRate: 2,
            repeat: -1,
        });

        scene.anims.create({
            key: 'slime1-idle-up',
            frames: scene.anims.generateFrameNumbers('slime1-idle', {start: 6, end: 11}),
            frameRate: 2,
            repeat: -1,
        });

        scene.anims.create({
            key: 'slime1-idle-side',
            frames: scene.anims.generateFrameNumbers('slime1-idle', {start: 18, end: 23}),
            frameRate: 2,
            repeat: -1,
        });

        // Slime1 walk anims
        scene.anims.create({
            key: 'slime1-walk-down',
            frames: scene.anims.generateFrameNumbers('slime1-walk', {start: 0, end: 7}),
            frameRate: 2,
            repeat: -1,
        });

        scene.anims.create({
            key: 'slime1-walk-up',
            frames: scene.anims.generateFrameNumbers('slime1-walk', {start: 8, end: 15}),
            frameRate: 2,
            repeat: -1,
        });

        scene.anims.create({
            key: 'slime1-walk-side',
            frames: scene.anims.generateFrameNumbers('slime1-walk', {start: 24, end: 31}),
            frameRate: 2,
            repeat: -1,
        });

        // Slime1 hurt anims
        scene.anims.create({
            key: 'slime1-hurt-down',
            frames: scene.anims.generateFrameNumbers('slime1-hurt', {start: 0, end: 4}),
            frameRate: 6,
            repeat: 0,
        });

        scene.anims.create({
            key: 'slime1-hurt-up',
            frames: scene.anims.generateFrameNumbers('slime1-hurt', {start: 5, end: 9}),
            frameRate: 6,
            repeat: 0,
        });

        scene.anims.create({
            key: 'slime1-hurt-side',
            frames: scene.anims.generateFrameNumbers('slime1-hurt', {start: 15, end: 19}),
            frameRate: 6,
            repeat: 0,
        });

        // Slime1 death anims
        scene.anims.create({
            key: 'slime1-death-down',
            frames: scene.anims.generateFrameNumbers('slime1-death', {start: 0, end: 9}),
            frameRate: 6,
            repeat: 0,
        });

        scene.anims.create({
            key: 'slime1-death-up',
            frames: scene.anims.generateFrameNumbers('slime1-death', {start: 10, end: 19}),
            frameRate: 6,
            repeat: 0,
        });

        scene.anims.create({
            key: 'slime1-death-side',
            frames: scene.anims.generateFrameNumbers('slime1-death', {start: 30, end: 39}),
            frameRate: 6,
            repeat: 0,
        });
    }

    playIdle() {
        switch (this.facing) {
            case 'up':
                this.anims.play('slime1-idle-up', true);
                break;
            case 'down':
                this.anims.play('slime1-idle-down', true);
                break;
            case 'side':
                this.anims.play('slime1-idle-side', true);
                break;
        }
    }

    handlePatrol() {
        if (this.isHurt) {return;};

        const currentTime = this.scene.time.now;

        if (currentTime - this.patrolTimer > this.patrolDirectionTimer) {
            this.patrolTimer = currentTime;
            const newDirection = Phaser.Math.Between(0, 3);
            if (newDirection === 0) {
                this.patrolVelocityX = 0;
                this.patrolVelocityY = -this.speed;
            } else if (newDirection === 1) {
                this.patrolVelocityX = 0;
                this.patrolVelocityY = this.speed;
            } else if (newDirection === 2) {
                this.patrolVelocityX = -this.speed;
                this.patrolVelocityY = 0;
            } else if (newDirection === 3) {
                this.patrolVelocityX = this.speed;
                this.patrolVelocityY = 0;
            }
        }
        this.setVelocity(this.patrolVelocityX,  this.patrolVelocityY);

        this.updateMovementAnimation();
   
    }

    enemyTakesHit() {
        if (this.isHurt) {return;};

        this.isHurt = true;
        this.setVelocity(0);

        if (this.facing === 'side') {
            this.anims.play('slime1-hurt-side', true);
        } else if (this.facing === 'down') {
            this.anims.play('slime1-hurt-down', true);
        } else if (this.facing === 'up') {
            this.anims.play('slime1-hurt-up', true);
        }

        this.once('animationcomplete-slime1-hurt-side', () => {
            this.isHurt = false;
        })

        this.once('animationcomplete-slime1-hurt-down', () => {
            this.isHurt = false;
        })

        this.once('animationcomplete-slime1-hurt-up', () => {
            this.isHurt = false;
        })
    }

    updateMovementAnimation() {
        if (this.isHurt) {return;};

        const absX = Math.abs(this.body.velocity.x);
        const absY = Math.abs(this.body.velocity.y);
        if (absX === 0 && absY === 0) {
            this.playIdle();
        } else if (absX > absY) {
            if (this.body.velocity.x < 0) {
                this.setFlipX(true);
                this.facing = 'side';
                this.anims.play('slime1-walk-side', true);
            } else if (this.body.velocity.x > 0) {
                this.setFlipX(false);
                this.facing = 'side';
                this.anims.play('slime1-walk-side', true);
            }
        } else {
            if (this.body.velocity.y < 0) {
                this.facing = 'up';
                this.anims.play('slime1-walk-up', true);
            } else {
                this.facing = 'down';
                this.anims.play('slime1-walk-down', true);
            }
        }
    }

    update() {
        this.handlePatrol();
    }

}