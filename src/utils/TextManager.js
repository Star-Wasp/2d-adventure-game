import Phaser from "phaser";

export default class TextManager {
    constructor(scene) {
        this.scene = scene;

        this.isShowing = false;
        this.messagePanel = null;
        this.messageText = null;
        this.panelKey = null;
    }

    showMessage(x, y, panelKey) {
        if (this.isShowing) {return;};
        if (this.messagePanel) {return;}
        if (this.messageText) {return;};

        this.panelKey = panelKey;
        let message = '';

        if (this.panelKey === 'move-controls') {
            message = " ↑  MOVE UP\n← MOVE LEFT\n→ MOVE RIGHT\n ↓  MOVE DOWN";
        } else if (this.panelKey === 'jump') {
            message = "D - JUMP\n\nA - SWING SWARD";
        } else if (this.panelKey === 'home') {
            message = "HOME\nSWEET\nHOME";
        } else if (this.panelKey === 'flag') {
            message = "FLAGS SAVE\nYOUR PROGRESS";
        } else if (this.panelKey === 'potion-shop') {
            message = 'POTION SHOP\nGREAT DEALS\nEVERY DAY!'
        } else {
            message = "Unknown board";
        }
        
            this.isShowing = true;

            this.messagePanel = this.scene.add.sprite(x, y - 13, 'board-panel')
                .setOrigin(0.5, 1)
                .setDepth(1000)
                .setScale(1)
                

            this.messageText = this.scene.add.text(x, y - 21, message, {
                font: '12px Arial',
                fill: "#000000",
                align: "left",
                worldWrap: {width: this.messagePanel.width - 20}
            })
                .setOrigin(0.5, 1)
                .setDepth(1001)
                .setScale(0.3)
    }

    hideMessage() {
        if (this.messagePanel) {
            this.messagePanel.destroy();
            this.messagePanel = null;
        }
        if (this.messageText) {
            this.messageText.destroy();
            this.messageText = null;
        }
        this.isShowing = false;
        this.panelKey = null;
    }
}