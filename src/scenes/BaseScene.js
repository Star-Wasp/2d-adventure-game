import Phaser from "phaser";

class BaseScene extends Phaser.Scene {
    constructor(key, config = {}) {
        super(key);
        this.config = config;

        this.fontSize = config.fontSize || 40;
        this.lineHeight = config.lineHeight || 85;
        this.fontOptions = {
            fontSize: `${this.fontSize}px`,
            fill: config.fontColor || 'rgb(107, 85, 18)'
        }

        this.screenCenter = [config.width / 2, config.height / 2];
    }

    create() {
        if (this.config.backgroundKey) {
            this.add.image(0, 0, this.config.backgroundKey)
            .setOrigin(0)
            .setScale(this.config.backgroundScale || 1)
        }

        if (this.config.canGoBack) {
            const backButton = this.add.image(
                this.config.width - 220,
                this.config.height - 220,
                this.config.backKey || 'back'
            )
                .setOrigin(1)
                .setScale(this.config.backScale || 2)
                .setInteractive()
                .setDepth(1000)
                

                backButton.setScrollFactor(0);

                backButton.on('pointerdown', () => {
                    this.scene.start('MenuScene');
            })
        }
    }

    createMenu(menu, setUpMenuEvents) {
        let lastMenuPositionY = 0;

        menu.forEach(menuItem => {
            const menuPosition = [
                this.screenCenter[0],
                this.screenCenter[1] + lastMenuPositionY
            ]
            menuItem.textGO = this.add.text(...menuPosition, menuItem.text, this.fontOptions).setOrigin(0.5, 1);
            lastMenuPositionY += this.lineHeight;
            setUpMenuEvents(menuItem)
        })
    }

}

export default BaseScene;