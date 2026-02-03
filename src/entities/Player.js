import Phaser from "phaser";
import HealthBar from "../hud/HealthBar";
import { savePlayerData } from "../utils/StorageManager";


export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = 'player', health=100) {
    super(scene, x, y, 'player');
    this.health = health;

    this.cleanupSounds(scene);

    // Physics and hitbox setup
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(this.width/4, this.height/3);
    this.body.setOffset(19, 25);

    this.swardHitbox = this.scene.add.rectangle(this.x, this.y, 35, 35, 0xff0000, 0);
    this.scene.physics.add.existing(this.swardHitbox);
    this.swardHitbox.body.setAllowGravity(false);
    this.swardHitbox.body.setImmovable(true);
    // End physics and hitbox setup

    this.facing = 'down';
    this.isSwinging = false;
    this.isJumping = false;

    // Animation setup
    this.createAnimations(scene);
    this.anims.play('player-idle');
    // End animation setup

    // Setting player properties and sound
    this.healthBar = new HealthBar(scene, 220, 220, 1, 100, this.health);

    this.lastTrapHitTime = 0;
    this.trapCooldown = 1000;

    this.speed = 100;

    this.walkSound = scene.sound.add('walk');
    this.swardSound = scene.sound.add('sward');
    this.hurtSound = scene.sound.add('hurt');
    // End setting player properties and sound

    this.init();

    }

    init() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.Akey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

    }

    cleanupSounds(scene) {
        scene.sound.getAll().forEach(s => {
        if (s.key === 'walk') {
            s.stop();
            s.destroy();
            }
        })
    }

    createAnimations(scene) {

        scene.anims.create({
        key: 'player-idle-down',
        frames: scene.anims.generateFrameNumbers('player', {start: 0, end: 5}),
        frameRate: 1,
        repeat: -1,
    });

        scene.anims.create({
        key: 'player-idle-up',
        frames: scene.anims.generateFrameNumbers('player', {start: 12, end: 17}),
        frameRate: 1,
        repeat: -1,
    })

        scene.anims.create({
        key: 'player-idle-side',
        frames: scene.anims.generateFrameNumbers('player', {start: 6, end: 11}),
        frameRate: 1,
        repeat: -1,
    });

    scene.anims.create({
        key: 'player-walk-down',
        frames: scene.anims.generateFrameNumbers('player', {start: 18, end: 23}),
        frameRate: 3,
        repeat: -1,
    });

    scene.anims.create({
        key: 'player-walk-up',
        frames: scene.anims.generateFrameNumbers('player', {start: 30, end: 35}),
        frameRate: 3,
        repeat: -1,
    });

    scene.anims.create({
        key: 'player-walk-sideways',
        frames: scene.anims.generateFrameNumbers('player', {start: 24, end: 29}),
        frameRate: 3,
        repeat: -1,
    });

    scene.anims.create({
        key: 'player-sward-down',
        frames: scene.anims.generateFrameNumbers('player', {start: 36, end: 39}),
        frameRate: 10,
        repeat: 0,
    });

    scene.anims.create({
        key: 'player-sward-up',
        frames: scene.anims.generateFrameNumbers('player', {start: 48, end: 51}),
        frameRate: 10,
        repeat: 0,
    });

    scene.anims.create({
        key: 'player-sward-side',
        frames: scene.anims.generateFrameNumbers('player', {start: 42, end: 45}),
        frameRate: 10,
        repeat: 0,
    });

    scene.anims.create({
        key: 'player-die',
        frames: scene.anims.generateFrameNumbers('player', {start: 54, end: 56}),
        frameRate: 3,
        repeat: 0,
    });

    scene.anims.create({
        key: 'player-jump-down',
        frames: scene.anims.generateFrameNumbers('player-jump-down-sheet', {start: 0, end: 8}),
        frameRate: 15,
        repeat: 0,
    });

    scene.anims.create({
        key: 'player-jump-side',
        frames: scene.anims.generateFrameNumbers('player-jump-side-sheet', {start: 0, end: 8}),
        frameRate: 15,
        repeat: 0,
    });

    scene.anims.create({
        key: 'player-jump-up',
        frames: scene.anims.generateFrameNumbers('player-jump-up-sheet', {start: 0, end: 8}),
        frameRate: 15,
        repeat: 0,
    });
    }

    checkTrapOverlap(spikeGroup) {
    this.scene.physics.add.overlap(this, spikeGroup, (player, spike) => {
        const now = this.scene.time.now;

        if (spike.anims.currentFrame.index >= 3 && spike.canDamage && now - spike.lastHitTime > spike.damageCooldown) {
            player.takeDamage(10);
            spike.lastHitTime = now;

            spike.canDamage = false;
            this.scene.time.delayedCall(spike.damageCooldown, () => {
                spike.canDamage = true;
                });
            }
        });
    }

    takeDamage(amount) {
        this.health -= amount;
        this.healthBar.decrease(this.health);

        const flashTimes = 6;
        const flashDuration = 100;

        for (let i=0; i < flashTimes; i++) {
            this.scene.time.delayedCall(flashDuration * i, () => {
                this.setTint(i % 2 === 0 ? 0xff0000 : 0xffffff);
            })
        }

        if (this.health <= 0) {
            this.die();
        }
        this.hurtSound.play({volume: 0.3})
    }

die() {
    this.setVelocity(0);
    this.body.enable = false;
    this.isSwinging = true;
    this.anims.play('player-die');

    this.scene.time.delayedCall(500, () => {
        this.scene.cameras.main.fadeOut(500, 0, 0, 0);
    });

    this.scene.cameras.main.once('camerafadeoutcomplete', () => {
        // Mark that the next level load is a death respawn
        this.scene.levelManager.isRespawningAfterDeath = true;

        // Restart the scene (createMap will handle the actual respawn)
        this.scene.scene.restart();
    });
}

    playIdle() {
        switch (this.facing) {
            case 'up':
                this.anims.play('player-idle-up', true);
                break;
            case 'down':
                this.anims.play('player-idle-down', true);
                break;
            case 'side':
                this.anims.play('player-idle-side', true);
                break;
        }
    }

    handleWalkSound() {
        const velocityThreshold = 1; // 
        const moving = Math.abs(this.body.velocity.x) > velocityThreshold || Math.abs(this.body.velocity.y) > velocityThreshold;

        if (moving && !this.walkSound.isPlaying) {
            this.walkSound.play({ volume: 0.3, loop: true, rate: 1.5 });
        } else if (!moving && this.walkSound.isPlaying) {
            this.walkSound.stop();
        }
    }

    handleMovementInput() {
        this.setVelocity(0);

        if (this.cursors.left.isDown){
            this.setVelocityX(-this.speed);
            this.facing = 'side';  
            this.setFlipX(true);
            
        } 
        else if (this.cursors.right.isDown) {
            this.setVelocityX(this.speed);
            this.facing = 'side';
            this.setFlipX(false);
        }
        else this.setVelocityX(0);

        if (this.cursors.up.isDown) {
           this.setVelocityY(-this.speed);
           this.facing = 'up'; 
        } 
        else if (this.cursors.down.isDown) {
           this.setVelocityY(this.speed);
           this.facing = 'down'; 
        }
        else this.setVelocityY(0);
    }

    updateMovementAnimation() {
        if (this.isSwinging) { return; };
        if (this.isJumping) {return; };
        if (this.body.velocity.y < 0) {
            this.anims.play('player-walk-up', true);
        } else if (this.body.velocity.y > 0) {
            this.anims.play('player-walk-down', true);
        } else if (this.body.velocity.x !== 0) {
            this.anims.play('player-walk-sideways', true);
        } else {
            this.playIdle();
        }
    }

    handleJumping() {
        if(Phaser.Input.Keyboard.JustDown(this.Akey) && !this.isSwinging && !this.isJumping) {
            this.isJumping = true;
            this.isSwinging = true;

            if (this.facing === 'up') {
                this.anims.play('player-jump-up');

            } else if (this.facing === 'down') {
                this.anims.play('player-jump-down');

            } else if (this.facing === 'side') {
                this.anims.play('player-jump-side');
            }
            this.once('animationcomplete', (anim) => {
                if (anim.key.startsWith('player-jump')) {
                    this.isJumping = false;
                    this.isSwinging = false;
                    this.playIdle();
                }
            })
    }
}

    handleSwinging() {
        if(Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.isSwinging) {
            this.isSwinging = true;

            if (this.facing === 'up') {
                this.anims.play('player-sward-up');
                this.swardSound.play({volume: 0.3});
            } else if (this.facing === 'down') {
                this.anims.play('player-sward-down');
                this.swardSound.play({volume: 0.3});
            } else if (this.facing === 'side') {
                this.anims.play('player-sward-side');
                this.swardSound.play({volume: 0.3});
            }
            this.once('animationcomplete', (anim) => {
                if (anim.key.startsWith('player-sward')) {
                    this.isSwinging = false;
                    this.playIdle();
                }
            })
        }
    }

    updateSwardHitbox() {
        const offset = 16;
        if (this.isSwinging) {
            switch(this.facing) {
                case 'up':
                    this.swardHitbox.setPosition(this.x, this.y -offset);
                    break;
                case 'down':
                    this.swardHitbox.setPosition(this.x, this.y + offset);
                    break;
                case 'side':
                    this.swardHitbox.setPosition(this.flipX ? this.x - offset : this.x + offset, this.y);
                    break;
            }
        } else {
            this.swardHitbox.setPosition(this.x, this.y);
        }
    }


    update() {

        this.handleWalkSound();

        this.handleMovementInput();
        
        const preFaving = this.facing;
        const velX = this.body.velocity.x;
        const velY = this.body.velocity.y;

        this.updateMovementAnimation();

        this.handleSwinging();
        this.handleJumping();

        this.updateSwardHitbox();
        this.setDepth(this.y + 1)
    }
}