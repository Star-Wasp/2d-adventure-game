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

        this.body.setSize(this.width / 2, this.height);
        this.body.setOffset(10, 0);

        this.facing = 'down';

        this.createAnimations(scene);
        this.anims.play('cat-idle-down');

        this.speed = 80;
        this.setScale(0.4);
        }

    createAnimations(scene) {
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

    scene.anims.create({
        key: 'cat-walk-down',
        frames: scene.anims.generateFrameNumbers('cat', {start: 12, end: 14}),
        frameRate: 2,
        repeat: -1,
    });

    scene.anims.create({
        key: 'cat-walk-up',
        frames: scene.anims.generateFrameNumbers('cat', {start: 15, end: 17}),
        frameRate: 2,
        repeat: -1,
    });

    scene.anims.create({
        key: 'cat-walk-side',
        frames: scene.anims.generateFrameNumbers('cat', {start: 18, end: 20}),
        frameRate: 2,
        repeat: -1,
    });

    }

    playIdle() {
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

    update() {
        //Code for cat sounds to add later
        // this.handleWalkSound();

        // this.handleMovementInput();
        
        // const preFaving = this.facing;
        // const velX = this.body.velocity.x;
        // const velY = this.body.velocity.y;

        // this.updateMovementAnimation();

        this.setDepth(this.y + 1)
    }

}