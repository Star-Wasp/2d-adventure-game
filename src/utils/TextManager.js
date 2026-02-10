import Phaser from "phaser";

export default class TextManager {
    constructor(scene, panelKey) {
        this.scene = scene;
        this.panelKey = panelKey;
    }

    showMessage(x, y) {
        if (this.panelKey === 'move-controls') {
            const message = "↑ MOVE UP\n← MOVE LEFT\n→ MOVE RIGHT\n↓ MOVE DOWN"
            console.log(message)
        }
    }
}