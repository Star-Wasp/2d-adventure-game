// Cat entity file named Furry in honor of my kitty cat.

import Phaser from "phaser";

export default class Furry extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture = 'cat') {
        super(scene, x, y, 'player');

        // Physics setup
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(this.width/4, this.height/3);
        this.body.setOffset(19, 25);

        this.facing = 'down';

        this.createAnimations(scene);
        this.anims.play('cat-idle');
        }

    createAnimations(scene) {
        scene.anims.create({
        key: 'cat-idle-down',
        frames: scene.anims.generateFrameNumbers('cat', {start: 0, end: 2}),
        frameRate: 1,
        repeat: -1,
    });

    scene.anims.create({
        key: 'cat-idle-up',
        frames: scene.anims.generateFrameNumbers('cat', {start: 3, end: 5}),
        frameRate: 1,
        repeat: -1,
    });

    scene.anims.create({
        key: 'cat-idle-side',
        frames: scene.anims.generateFrameNumbers('cat', {start: 6, end: 8}),
        frameRate: 1,
        repeat: -1,
    });

    scene.anims.create({
        key: 'cat-walk-down',
        frames: scene.anims.generateFrameNumbers('cat', {start: 12, end: 14}),
        frameRate: 1,
        repeat: -1,
    });

    scene.anims.create({
        key: 'cat-walk-up',
        frames: scene.anims.generateFrameNumbers('cat', {start: 15, end: 17}),
        frameRate: 1,
        repeat: -1,
    });

    scene.anims.create({
        key: 'cat-walk-sideways',
        frames: scene.anims.generateFrameNumbers('cat', {start: 18, end: 20}),
        frameRate: 1,
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

}