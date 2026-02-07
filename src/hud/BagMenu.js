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

        this.slots = [];

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

        this.createInventorySlots();
    }

    createInventorySlots(rows = 4, cols = 4, startX = 262, startY = 272, spacing = 25) {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const slot = this.scene.add.rectangle(
                    startX + col * spacing,
                    startY + row * spacing,
                    22,
                    22,
                    0x00ff00,
                    0.3
                );
                slot
                .setScrollFactor(0)
                .setDepth(1000)
                .setInteractive({ useHandCursor: true})
                .on('pointerdown', () => {
                    alert(`slot clicked at row ${row + 1}, col ${col + 1}`);
                })
                this.slots.push(slot)
            }
        }
    }

    hideInventory() {
        if (this.inventoryPanel) {
            this.inventoryPanel.destroy();
            this.inventoryPanel = null;
        }

        this.slots.forEach(slot => {
            slot.destroy();
        })
        this.slots = [];
    }

}
