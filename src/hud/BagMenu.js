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
        this.inventory = Array(16).fill(null);

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

        this.inventory.forEach((item, index) => {
            if (item !== null) {
                this.addItemSpriteToSlot(index, item.type);
            }
        })
    }

    createInventorySlots(rows = 4, cols = 4, startX = 262, startY = 272, spacing = 25) {
    let slotIndex = 0;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {

            const slot = this.scene.add.rectangle(
                startX + col * spacing,
                startY + row * spacing,
                22,
                22,
                0x00ff00,
                0
            );

            slot.inventoryIndex = slotIndex;

            slot
                .setScrollFactor(0)
                .setDepth(1000)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    const index = slot.inventoryIndex;
                    const item = this.inventory[index];

                    if (!item) {
                        alert(`Slot ${index} is currently empty.`);
                    } else {
                        alert(`Slot ${index} contains a ${item.type}${item.count ? ` (x${item.count})` : ''}`);
                    }
                });

            this.slots.push(slot);
            slotIndex++;
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

        this.inventory.forEach(item => {
            if (item && item.sprite) {
                item.sprite.destroy();
                item.sprite = null;
            }
        })
    }

    addItem(itemType) {
        const emptySlotIndex = this.inventory.findIndex(slot => slot === null);

        if (emptySlotIndex === -1) {
            alert("inventory is full!")
            return false;
        }

        this.inventory[emptySlotIndex] = { type: itemType };

        if (this.isOpen) {
            this.addItemSpriteToSlot(emptySlotIndex, itemType);
            return true;
        }
    }

    addItemSpriteToSlot(slotIndex, itemType) {
        const slot = this.slots[slotIndex];

        const itemSprite = this.scene.add.sprite(slot.x, slot.y, 'inventory-potion');
        itemSprite
            .setScrollFactor(0)
            .setDepth(1001)
            .setScale(0.7)

            this.inventory[slotIndex].sprite = itemSprite;
    }

}
