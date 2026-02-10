import Phaser from "phaser";

export default class BackHome {
    constructor(scene, x, y) {

        this.scene = scene;

        this.x = x;
        this.y = y;

        this.homeIcon = scene.add.sprite(this.x, this.y, 'home')
        .setScrollFactor(0)
        .setDepth(1000)
        .setScale(0.8)
        .setInteractive({ useHandCursor: true});

        this.homeIcon.on('pointerdown', () => {
            this.goHome();
        })
    }

    goHome() {
        console.log("going home");
    }

}