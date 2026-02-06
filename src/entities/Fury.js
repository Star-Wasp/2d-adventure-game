// Cat entity file named Fury in honor of my kitty cat.

import Phaser from "phaser";

export default class Fury extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture = 'cat') {
        super(scene, x, y, 'cat');

        //Code for cat sounds to add later
        this.cleanupSounds(scene);

        // Physics setup
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(this.width, this.height);
        this.body.setOffset(0, 0);

        this.facing = 'down';
        this.isJumping = false;
        this.lastMoveX = 1;

        // Setup wandering behaviour
        this.wanderTimer = 0;
        this.wanderInterval = 1000;
        this.wanderVelocityX = 0;
        this.wanderVelocityY = 0;
        this.isWandering = false;

        this.createAnimations(scene);
        this.anims.play('cat-idle-down');

        this.speed = 100;
        this.baseSpeed = this.speed;
        this.setScale(0.4);

        this.catWalkSound = scene.sound.add('cat-walk');
        }

    createAnimations(scene) {

        // Cat idle anims
        scene.anims.create({
        key: 'cat-idle-down',
        frames: scene.anims.generateFrameNumbers('cat', {start: 0, end: 2}),
        frameRate: 2,
        repeat: -1,
    });

    scene.anims.create({
        key: 'cat-idle-up',
        frames: scene.anims.generateFrameNumbers('cat', {start: 3, end: 5}),
        frameRate: 2,
        repeat: -1,
    });

    scene.anims.create({
        key: 'cat-idle-side',
        frames: scene.anims.generateFrameNumbers('cat', {start: 6, end: 8}),
        frameRate: 2,
        repeat: -1,
    });

    // Cat walk anims
    scene.anims.create({
        key: 'cat-walk-down',
        frames: scene.anims.generateFrameNumbers('cat', {start: 12, end: 14}),
        frameRate: 4,
        repeat: -1,
    });

    scene.anims.create({
        key: 'cat-walk-up',
        frames: scene.anims.generateFrameNumbers('cat', {start: 15, end: 17}),
        frameRate: 4,
        repeat: -1,
    });

    scene.anims.create({
        key: 'cat-walk-side',
        frames: scene.anims.generateFrameNumbers('cat', {start: 18, end: 20}),
        frameRate: 4,
        repeat: -1,
    });

    // Cat jump anims
    scene.anims.create({
        key: 'cat-jump-down',
        frames: scene.anims.generateFrameNumbers('cat-jump', {start: 0, end: 6}),
        frameRate: 10,
        repeat: 0,
    });

    scene.anims.create({
        key: 'cat-jump-up',
        frames: scene.anims.generateFrameNumbers('cat-jump', {start: 7, end: 13}),
        frameRate: 10,
        repeat: 0,
    });

    scene.anims.create({
        key: 'cat-jump-side',
        frames: scene.anims.generateFrameNumbers('cat-jump', {start: 14, end: 20}),
        frameRate: 10,
        repeat: 0,
    });

    }

    handleJumping() {
        if (!this.isJumping) { return; };

        if (this.facing === 'up') {
            this.anims.play('cat-jump-up', true);
        } else if (this.facing === 'down') {
            this.anims.play('cat-jump-down', true);
        } else if (this.facing === 'side') {
            if (this.lastMoveX < 0) {
                this.setFlipX(true);
            } else {
                this.setFlipX(false);
            }
            this.anims.play('cat-jump-side', true);
        }
    }

    startJumpingOver() {
        if (this.isJumping) {return; };

        this.isJumping = true;
        this.speed = this.baseSpeed * 1.5
        this.handleJumping();
        
        this.once('animationcomplete-cat-jump-up', () => {
            this.isJumping = false;
            this.speed = this.baseSpeed;
        })

        this.once('animationcomplete-cat-jump-down', () => {
            this.isJumping = false;
            this.speed = this.baseSpeed;
        })

        this.once('animationcomplete-cat-jump-side', () => {
            this.isJumping = false;
            this.speed = this.baseSpeed;
        })
        
    }

    playIdle() {
        if (this.isJumping) {return;};
        switch (this.facing) {
            case 'up':
                this.anims.play('cat-idle-up', true);
                break;
            case 'down':
                this.anims.play('cat-idle-down', true);
                break;
            case 'side':
                this.anims.play('cat-idle-side', true);
                break;
        }
    }

    // Setting up follow functionality
    setTarget(target) {
        this.target = target;
    }

    //Code for cat sounds to add later
    cleanupSounds(scene) {
        scene.sound.getAll().forEach(s => {
        if (s.key === 'cat-walk') {
            s.stop();
            s.destroy();
            }
        })
    }

    updateMovementAnimation() {
        if (this.isJumping) {return;};
        const absX = Math.abs(this.body.velocity.x);
        const absY = Math.abs(this.body.velocity.y);
        if (absX === 0 && absY === 0) {
            this.playIdle();
        } else if (absX > absY) {
            if (this.body.velocity.x < 0) {
                this.setFlipX(true);
                this.lastMoveX = -1;
                this.facing = 'side';
                this.anims.play('cat-walk-side', true);
            } else if (this.body.velocity.x > 0) {
                this.setFlipX(false);
                this.lastMoveX = 1;
                this.facing = 'side';
                this.anims.play('cat-walk-side', true);
            }
        } else {
            if (this.body.velocity.y < 0) {
                this.facing = 'up';
                this.anims.play('cat-walk-up', true);
            } else {
                this.facing = 'down';
                this.anims.play('cat-walk-down', true);
            }
        }
    }

    handleWalkSound() {
        const velocityThreshold = 1;
        const moving = Math.abs(this.body.velocity.x) > velocityThreshold || Math.abs(this.body.velocity.y) > velocityThreshold;

        if (moving && !this.catWalkSound.isPlaying) {
            this.catWalkSound.play({ volume: 0.1, loop: true, rate: 1 });
        } else if (!moving && this.catWalkSound.isPlaying || this.isJumping) {
            this.catWalkSound.stop();
        }
    }

    update() {
        //Code for cat sounds to add later
        this.handleWalkSound();

        if (!this.target) {
            this.setDepth(this.y -3);
            return;
        }

        if (this.isJumping) {
            this.setDepth(this.y -3);
            return;
        }

        

        const distanceX = this.target.x - this.x;
        const distanceY = this.target.y - this.y;
        const distance = Math.hypot(distanceX, distanceY);
        const desiredDistance = this.scene.mapType === 'dungeon' ? 20 : 70;
        
        let directionX;
        let directionY;

        if (distance > desiredDistance && distance > 0) {
            directionX = distanceX / distance;
            directionY = distanceY / distance; 
            this.setVelocityX(directionX * this.speed);
            this.setVelocityY(directionY * this.speed);
        } else {
            const currentTime = this.scene.time.now;

            if (currentTime - this.wanderTimer > this.wanderInterval) {
                this.wanderTimer = currentTime;
                if (Math.random() > 0.5) {
                    const angle = Math.random() * Math.PI * 2;
                    const wanderSpeed = this.speed * 0.2;

                    this.wanderVelocityX = Math.cos(angle) * wanderSpeed;
                    this.wanderVelocityY = Math.sin(angle) * wanderSpeed;
                    this.isWandering = true;
                } else {
                    this.wanderVelocityX = 0;
                    this.wanderVelocityY = 0;
                    this.isWandering = false;
                }
            this.setVelocityX(this.wanderVelocityX);
            this.setVelocityY(this.wanderVelocityY);
            }
        }

        this.updateMovementAnimation();

    }

}