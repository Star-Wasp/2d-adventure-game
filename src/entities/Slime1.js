
import Phaser from "phaser";

export default class Slime1 extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture = 'slime1-idle') {
        super(scene, x, y, 'slime1-idle');

        // Physics setup
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(this.width / 3, this.height / 3);
        this.body.setOffset(22, 20);

        this.facing = 'down';

        this.createAnimations(scene);
        this.anims.play('slime1-idle-down');

        this.speed = 100;
        this.baseSpeed = this.speed;
        this.setScale(0.7);

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

    update() {
        
    }

}