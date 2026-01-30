
import Phaser from "phaser"

class HealthBar {

    constructor(scene, x, y, scale = 1, maxHealth, health) {
        this.bar = new Phaser.GameObjects.Graphics(scene);

        this.scene = scene;

        this.x = x;
        this.y = y;
        this.scale = scale;
        this.maxHealth = maxHealth;
        this.value = health;

        this.size = {
            width: 40,
            height: 8,
        };

        this.pixelPerHealth = this.size.width / this.maxHealth;

        scene.add.existing(this.bar);
        this.draw();
    }

    decrease(amount) {

        this.value = Math.max(amount, 0);
        this.draw();
    }

    setHealth(value) {
        this.value = value;
        this.draw();
    }

    draw(x, y, scale) {

        this.bar.clear();
        const { width, height } = this.size;

        const margin = 2;

        this.bar.fillStyle(0x000);
        this.bar.fillRect(this.x, this.y, width + margin, height + margin);

        this.bar.fillStyle(0xFFFFFF);
        this.bar.fillRect(this.x + margin, this.y + margin, width - margin, height - margin);

         const healthWidth = Math.floor(this.value * this.pixelPerHealth);
        if (healthWidth <= width / 1.5 && healthWidth > width / 3) {
            this.bar.fillStyle(0xfc6703);
        } else if (healthWidth <= width / 3) {
            this.bar.fillStyle(0xeb0000);
        } else {
            this.bar.fillStyle(0x41ba09);
        }

        if (healthWidth > 0) {
            this.bar.fillRect(this.x + margin, this.y + margin, healthWidth - margin, height - margin);
        }

        this.bar.setScrollFactor(0, 0).setScale(this.scale);
    }
}

export default HealthBar;