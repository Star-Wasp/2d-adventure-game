// Cat entity file named Fury in honor of my kitty cat.

import Phaser from "phaser";

export default class Fury extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture = 'cat') {
        super(scene, x, y, 'cat');

        //Code for cat sounds to add later
        // this.cleanupSounds(scene);

        // Physics setup
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(this.width / 3, this.height / 2);
        this.body.setOffset(20, 25);

        this.facing = 'down';
        this.isJumping = false;
        this.lastMoveX = 1;

        this.createAnimations(scene);
        this.anims.play('cat-idle-down');

        this.speed = 100;
        this.setScale(0.4);
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
        this.handleJumping();
        
        this.once('animationcomplete-cat-jump-up', () => {
            this.isJumping = false;
        })

        this.once('animationcomplete-cat-jump-down', () => {
            this.isJumping = false;
        })

        this.once('animationcomplete-cat-jump-side', () => {
            this.isJumping = false;
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
    // cleanupSounds(scene) {
    //     scene.sound.getAll().forEach(s => {
    //     if (s.key === 'walk') {
    //         s.stop();
    //         s.destroy();
    //         }
    //     })
    // }

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

    update() {
        //Code for cat sounds to add later
        // this.handleWalkSound();

        if (!this.target) {
            this.setDepth(this.y + 1);
            return;
        }

        

        const distanceX = this.target.x - this.x;
        const distanceY = this.target.y - this.y;
        const distance = Math.hypot(distanceX, distanceY);
        const desiredDistance = this.scene.mapType === 'dungeon' ? 18 : 50;
        
        let directionX;
        let directionY;

        if (distance > desiredDistance && distance > 0) {
            directionX = distanceX / distance;
            directionY = distanceY / distance; 
            this.setVelocityX(directionX * this.speed);
            this.setVelocityY(directionY * this.speed);
        } else {
            this.setVelocity(0);
        }

        this.updateMovementAnimation();

    }

}