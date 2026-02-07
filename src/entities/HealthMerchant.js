import Phaser from "phaser";

export default class HealthMerchant extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = 'health-merchant') {
    super(scene, x, y, 'health-merchant');

    // Physics setup
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(this.width / 3, this.height / 3);
    this.body.setOffset(22, 20);

    this.facing = 'down';

    this.createAnimations(scene);
    this.anims.play('health-merchant-idle-down');

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

}