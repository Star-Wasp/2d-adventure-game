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

    this.swardHitbox = this.scene.add.rectangle(this.x, this.y, 25, 25, 0xff0000, 0);
    this.scene.physics.add.existing(this.swardHitbox);
    this.swardHitbox.body.setAllowGravity(false);
    this.swardHitbox.body.setImmovable(true);
    // End physics and hitbox setup

    this.facing = 'down';
    this.isSwinging = false;
    this.isJumping = false;
    this.isStunned = false;
    this.isShooting = false;

    // Animation setup
    this.createAnimations(scene);
    this.anims.play('player-idle');
    // End animation setup

    this.baseMaxHealth = 100;
    this.maxHealth = this.baseMaxHealth;

    // Setting player properties and sound
    this.healthBar = new HealthBar(scene, 220, 220, 1, this.maxHealth, this.health);

    this.lastTrapHitTime = 0;
    this.trapCooldown = 1000;

    this.lastShootTime = 0;
    this.shootCooldown = 300;

    this.speed = 100;
    this.attackBonus = 0;

    this.soundVolume = 0.02;

    this.walkSound = scene.sound.add('walk');
    this.swardSound = scene.sound.add('sward');
    this.hurtSound = scene.sound.add('hurt');
    this.jumpSound = scene.sound.add('jump');
    this.shootSound = scene.sound.add('shoot');
    // End setting player properties and sound

    this.init();

    }

    init() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.SwingKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

    this.Jumpkey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

    this.shootKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

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

    scene.anims.create({
        key: 'player-shoot-down',
        frames: scene.anims.generateFrameNumbers('player-shoot-attack', {start: 0, end: 3}),
        frameRate: 10,
        repeat: 0,
    });

    scene.anims.create({
        key: 'player-shoot-up',
        frames: scene.anims.generateFrameNumbers('player-shoot-attack', {start: 8, end: 11}),
        frameRate: 10,
        repeat: 0,
    });

    scene.anims.create({
        key: 'player-shoot-side',
        frames: scene.anims.generateFrameNumbers('player-shoot-attack', {start: 4, end: 7}),
        frameRate: 10,
        repeat: 0,
    });

    // Shoot attack projectile
    scene.anims.create({
        key: 'projectile-up',
        frames: scene.anims.generateFrameNumbers('projectile', {start: 3, end: 5}),
        frameRate: 5,
        repeat: -1,
    });

    scene.anims.create({
        key: 'projectile-down',
        frames: scene.anims.generateFrameNumbers('projectile', {start: 6, end: 8}),
        frameRate: 5,
        repeat: -1,
    });

    scene.anims.create({
        key: 'projectile-side',
        frames: scene.anims.generateFrameNumbers('projectile', {start: 0, end: 2}),
        frameRate: 5,
        repeat: -1,
    });

    }

    checkTrapOverlap(spikeGroup) {
    this.scene.physics.add.overlap(this, spikeGroup, (player, spike) => {
        const now = this.scene.time.now;

        if (spike.anims.currentFrame.index >= 3 && spike.canDamage && now - spike.lastHitTime > spike.damageCooldown && !this.isJumping) {
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
        if (!this.isStunned) {
            this.isStunned = true;
        this.scene.time.delayedCall(150, () => {
            this.isStunned = false;
        })
        }

        this.health -= amount;
        this.healthBar.decrease(this.health);

        savePlayerData(this.health, this.scene.registry.get('coins'));

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
        this.hurtSound.play({volume: this.soundVolume})
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

    applyEquipmentBonuses(inventory = []) {
        const has = (type) => inventory.some(item => item && item.type === type && item.count > 0);

        const bonusAttack = has('inventory-wood-sward') ? 5 : 0;
        const bonusHealth = has('inventory-wood-shield') ? 10 : 0;
        const bonusSpeed = has('inventory-leather-boots') ? 10 : 0;

        this.attackBonus = bonusAttack;
        this.maxHealth = this.baseMaxHealth + bonusHealth;
        this.speed = 100 + bonusSpeed;

        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
        if (this.healthBar && this.healthBar.setMaxHealth) {
            this.healthBar.setMaxHealth(this.maxHealth, this.health);
        }
    }

    handleWalkSound() {
        const velocityThreshold = 1;
        const moving = Math.abs(this.body.velocity.x) > velocityThreshold || Math.abs(this.body.velocity.y) > velocityThreshold;

        if (moving && !this.walkSound.isPlaying) {
            this.walkSound.play({ volume: this.soundVolume, loop: true, rate: 1.5 });
        } else if (!moving && this.walkSound.isPlaying || this.isJumping) {
            this.walkSound.stop();
        }
    }

    handleMovementInput() {
        if (this.isShooting || this.isSwinging) {
            this.setVelocity(0);
            return;
        }

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
        if (this.isShooting) {return; };
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
        if(Phaser.Input.Keyboard.JustDown(this.Jumpkey) && !this.isSwinging && !this.isJumping && !this.isShooting) {
            this.isJumping = true;

            if (this.facing === 'up') {
                this.anims.play('player-jump-up');
                this.jumpSound.play({volume: this.soundVolume})

            } else if (this.facing === 'down') {
                this.anims.play('player-jump-down');
                this.jumpSound.play({volume: this.soundVolume})

            } else if (this.facing === 'side') {
                this.anims.play('player-jump-side');
                this.jumpSound.play({volume: this.soundVolume})
            }
            this.once('animationcomplete', (anim) => {
                if (anim.key.startsWith('player-jump')) {
                    this.isJumping = false;
                    this.playIdle();
                    this.jumpSound.stop();
                }
            })
    }
}

    handleSwinging() {
        if(Phaser.Input.Keyboard.JustDown(this.SwingKey) && !this.isSwinging && !this.isShooting) {
            this.isSwinging = true;

            if (this.facing === 'up') {
                this.anims.play('player-sward-up');
                this.swardSound.play({volume: this.soundVolume});
            } else if (this.facing === 'down') {
                this.anims.play('player-sward-down');
                this.swardSound.play({volume: this.soundVolume});
            } else if (this.facing === 'side') {
                this.anims.play('player-sward-side');
                this.swardSound.play({volume: this.soundVolume});
            }
            this.once('animationcomplete', (anim) => {
                if (anim.key.startsWith('player-sward')) {
                    this.isSwinging = false;
                    this.playIdle();
                }
            })
        }
    }

    handleShooting() {

        const now = this.scene.time.now;
        if (now - this.lastShootTime < this.shootCooldown) {
            return;
        }

        if(Phaser.Input.Keyboard.JustDown(this.shootKey) && !this.isSwinging && !this.isShooting && !this.isJumping) {
            this.isShooting = true;
            this.lastShootTime = now;

            this.scene.spawnProjectile(this.x, this.y, this.facing, this.flipX)

            if (this.facing === 'up') {
                this.anims.play('player-shoot-up');
                this.shootSound.play({volume: this.soundVolume});
            } else if (this.facing === 'down') {
                this.anims.play('player-shoot-down');
                this.shootSound.play({volume: this.soundVolume});
            } else if (this.facing === 'side') {
                this.anims.play('player-shoot-side');
                this.shootSound.play({volume: this.soundVolume});
            }
            this.once('animationcomplete', (anim) => {
                if (anim.key.startsWith('player-shoot')) {
                    this.isShooting = false;
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
        if (this.isStunned) {return;};

        this.handleWalkSound();

        this.handleMovementInput();
        
        const preFaving = this.facing;
        const velX = this.body.velocity.x;
        const velY = this.body.velocity.y;

        this.handleSwinging();
        this.handleJumping();
        this.handleShooting();

        this.updateMovementAnimation();

        this.updateSwardHitbox();
        this.setDepth(this.y + 1)
    }
}