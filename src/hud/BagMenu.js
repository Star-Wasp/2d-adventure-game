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
                .setOrigin(0.5)
                .setScrollFactor(0)
                .setDepth(1000)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    const index = slot.inventoryIndex;
                    const item = this.inventory[index];

                    if (!item) {
                        alert(`Slot ${index} is currently empty.`);
                        return;
                    }

                    item.count--;

                    if (item.text) {
                        item.text.setText(item.count);
                    }

                    if (item.count <= 0) {
                        if (item.sprite) {
                            item.sprite.destroy();
                            item.sprite = null;
                        }
                        if (item.text) {
                            item.text.destroy();
                            item.text = null;
                        }
                        this.inventory[index] = null;
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
            if (item && item.text) {
                item.text.destroy();
                item.text = null;
            }
        })
    }

    addItem(itemType) {

        const existingSlotIndex = this.inventory.findIndex(slot => slot && slot.type === itemType);

        if (existingSlotIndex !== -1) {
            this.inventory[existingSlotIndex].count++;
            if (this.isOpen && this.inventory[existingSlotIndex].text) {
                this.inventory[existingSlotIndex].text.setText(this.inventory[existingSlotIndex].count);
            }
            return true;
        }

        const emptySlotIndex = this.inventory.findIndex(slot => slot === null);

        if (emptySlotIndex === -1) {
            alert("inventory is full!")
            return false;
        }

        this.inventory[emptySlotIndex] = { type: itemType, count: 1, sprite: null, text: null };

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
            .setInteractive({draggable: true});

            this.scene.input.setDraggable(itemSprite);
            itemSprite.sourceSlot = slotIndex;

            const countText = this.scene.add.text(
                slot.x + 7,
                slot.y + 4,
                this.inventory[slotIndex].count,
                { fontSize: '16px', fill: '#ffffff' }
                )
                .setScrollFactor(0)
                .setDepth(1002)
                .setScale(0.5)

            this.inventory[slotIndex].sprite = itemSprite;
            this.inventory[slotIndex].text = countText;

            itemSprite.on('dragstart', () => {
                itemSprite.setDepth(1003);
            })

            itemSprite.on('drag', (pointer, dragX, dragY) => {
                itemSprite.x = dragX;
                itemSprite.y = dragY;

                if (countText) {
                    countText.x = dragX + 7;
                    countText.y = dragY + 4;
                }
            });

            itemSprite.on('dragend', (pointer) => {
                const sourceIndex = itemSprite.sourceSlot;
                let targetSlot = null;

                for (let s of this.slots) {
                    if (Phaser.Geom.Rectangle.Contains(s.getBounds(), itemSprite.x, itemSprite.y)) {
                        targetSlot = s;
                        break;
                    }
                }

                if (!targetSlot) {
                    // Snap back to original
                    itemSprite.x = this.slots[sourceIndex].x;
                    itemSprite.y = this.slots[sourceIndex].y;
                    if (countText) {
                        countText.x = this.slots[sourceIndex].x + 7;
                        countText.y = this.slots[sourceIndex].y + 4;
                    }
                    return;
                }

                const targetIndex = targetSlot.inventoryIndex;

                if (this.inventory[targetIndex] === null) {
                    // Move item to empty slot
                    this.inventory[targetIndex] = this.inventory[sourceIndex];
                    this.inventory[sourceIndex] = null;

                    // Snap sprite + text to target slot
                    itemSprite.x = targetSlot.x;
                    itemSprite.y = targetSlot.y;
                    if (countText) {
                        countText.x = targetSlot.x + 7;
                        countText.y = targetSlot.y + 4;
                    }

                    itemSprite.sourceSlot = targetIndex;
                } else {
                    // Target slot occupied → snap back
                    itemSprite.x = this.slots[sourceIndex].x;
                    itemSprite.y = this.slots[sourceIndex].y;
                    if (countText) {
                        countText.x = this.slots[sourceIndex].x + 7;
                        countText.y = this.slots[sourceIndex].y + 4;
                    }
                }
            });
    }

}
