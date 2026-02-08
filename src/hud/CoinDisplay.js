import Phaser from "phaser";

export default class CoinDisplay {
    constructor(scene, x=10, y=10, startingCoins=0) {
        this.scene = scene;
        this.coins = startingCoins;
        this.x = x;
        this.y = y;

        this.background = scene.add.rectangle(x + 10, y + 10, 42, 18, 0x000000, 0.6)
        this.background.setOrigin(0, 0.5);
        this.background.setScrollFactor(0);
        this.background.setDepth(1000)

        this.coinIcon = scene.add.sprite(x + 17, y + 10, 'coin');
        this.coinIcon.setScale(0.6);
        this.coinIcon.play('coin-spin');
        this.coinIcon.setScrollFactor(0);
        this.coinIcon.setDepth(1000)

        this.text = scene.add.text(x + 23, y + 4, `${this.coins}`, {
            fontSize: '22px',
            fill: '#ffffff',
            fontFamily: 'Arial',
        })
        this.text.setScrollFactor(0);
        this.text.setDepth(1000)
        this.text.setScale(0.5)
    }

    addCoins(amount) {
        this.coins += amount;
        this.updateDisplay();

        this.scene.tweens.add({
            targets: this.background,
            alpha: 0.4,
            duration: 200,
            yoyo: true
        })
    }

    removeCoins(amount) {
        this.coins = Math.max(this.coins - amount, 0);
        this.updateDisplay();
    }

    updateDisplay() {
        this.text.setText(`${this.coins}`)
    }
}