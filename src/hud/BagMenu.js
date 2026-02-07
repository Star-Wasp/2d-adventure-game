import Phaser from "phaser"

export default class BagMenu {
    constructor(scene, x, y) {

        this.scene = scene;

        this.x = x;
        this.y = y;

        this.bagIcon = scene.add.sprite(this.x, this.y, 'bag');
        this.bagIcon.setScrollFactor(0);
        this.bagIcon.setDepth(1000);
        this.bagIcon.setScale(0.7);
        this.bagIcon.setInteractive({ useHandCursor: true});

        this.bagIcon.on('pointerdown', () => {
            this.toggleInventory();
        })

        this.isOpen = false;
        this.inventoryPanel = null;

    }

    toggleInventory() {
        if (this.isOpen) {
            this.hideInventory();
        } else {
            this.showInventory();
        }
        this.isOpen = !this.isOpen;
    }

    showInventory() {
        this.inventoryPanel = this.scene.add.image(300, 310, 'inventory-menu');
        this.inventoryPanel.setScrollFactor(0);
        this.inventoryPanel.setDepth(999);
        this.inventoryPanel.setScale(1.5);
    }

    hideInventory() {
        if (this.inventoryPanel) {
            this.inventoryPanel.destroy();
            this.inventoryPanel = null;
        }
    }

}
