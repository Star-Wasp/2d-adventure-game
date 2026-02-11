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

    // this.forSale = [
    //     {key: 'potion-20', heal: 20, cost: 20},
    //     {key: 'potion-50', heal: 50, cost: 50},
    //     {key: 'potion-100', heal: 100, cost: 100},
    // ];

    // this.potionIcons = [];
    // this.potionText = [];

    // this.potionAnims();

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

      update() {
        this.handlePasing();
      }

}