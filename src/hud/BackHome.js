import Phaser from "phaser";
import { saveLevel, savePlayerData, clearCheckpoint } from "../utils/StorageManager";

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
    const levelExists = this.scene.levelManager.setLevel('level7');
    if (!levelExists) {
        console.log("level7 not found");
        return;
    }

    saveLevel(this.scene.levelManager.currentLevel);

    const inventory = this.scene.bagMenu ? this.scene.bagMenu.inventory : null;
    savePlayerData(this.scene.player.health, this.scene.registry.get('coins'), inventory);

    clearCheckpoint();

    this.scene.scene.restart();
}

}