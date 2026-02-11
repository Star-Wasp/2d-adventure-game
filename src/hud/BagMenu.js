import Phaser from "phaser";
import { saveInventory, getSavedInventory, savePlayerData } from "../utils/StorageManager"

export default class BagMenu {
    constructor(scene, x, y) {

        this.scene = scene;

        this.x = x;
        this.y = y;

        this.bagIcon = scene.add.sprite(this.x, this.y, 'bag');
        this.bagIcon.setScrollFactor(0);
        this.bagIcon.setDepth(1000);
        this.bagIcon.setScale(0.5);
        this.bagIcon.setInteractive({ useHandCursor: true});

        this.bagIcon.on('pointerdown', () => {
            this.toggleInventory();
        })

        this.isOpen = false;
        this.inventoryPanel = null;

        this.slots = [];
        this.inventory = Array(16).fill(null);

        const saved = getSavedInventory();
        if (saved) {
            this.inventory = saved.map(item => item ? {...item, sprite: null, text: null} : null)
        }

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
            const inventoryToSave = this.inventory.map(item => {
                if (!item || item.count <= 0) return null;
                return {type: item.type, count: item.count}
            })
            saveInventory(inventoryToSave);
            if (this.scene.player?.applyEquipmentBonuses) {
                this.scene.player.applyEquipmentBonuses(this.inventory);
            }
            return true;
        }

        const emptySlotIndex = this.inventory.findIndex(slot => slot === null);

        if (emptySlotIndex === -1) {
            alert("inventory is full!")
            return false;
        }

        this.inventory[emptySlotIndex] = {
            type: itemType, 
            count: 1, 
            sprite: null, 
            text: null 
        };

        if (this.isOpen) {
            this.addItemSpriteToSlot(emptySlotIndex, itemType);
        }

        const inventoryToSave = this.inventory.map(item => {
            if (!item || item.count <= 0) return null;
            return {type: item.type, count: item.count};
        })
        saveInventory(inventoryToSave);
        if (this.scene.player?.applyEquipmentBonuses) {
                this.scene.player.applyEquipmentBonuses(this.inventory);
            }
        return true
    }

    addItemSpriteToSlot(slotIndex, itemType) {
        const slot = this.slots[slotIndex];

        const itemSprite = this.scene.add.sprite(slot.x, slot.y, itemType);
        itemSprite
            .setScrollFactor(0)
            .setDepth(1001)
            .setScale(0.7)
            .setInteractive({useHandCursor: true});

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

            itemSprite.on('pointerdown', () => {
        const item = this.inventory[slotIndex];
        if (!item) return;

        const potionRules = {
            'inventory-potion': {heal: 5, threshold: 95},
            'inventory-potion-20': {heal: 20, threshold: 80},
            'inventory-potion-50': {heal: 50, threshold: 50},
            'inventory-potion-100': {heal: 100, threshold: 30},
        };

        const key = Object.keys(potionRules).find(k => item.type === k);

        if (!key) {
            return;
        }

        const { heal, threshold } = potionRules[key];

        const maxHealth = this.scene.player.maxHealth || 100;

        if (this.scene.player.health >= maxHealth) {
            console.log("Can't use potion yet");
            return;
        }

        this.scene.player.health = Math.min(this.scene.player.health + heal, this.scene.player.maxHealth || 100);
        this.scene.player.healthBar.setHealth(this.scene.player.health);

        savePlayerData(this.scene.player.health, this.scene.registry.get('coins'));

        item.count--;
        if (item.count > 0) {
            if (item.text) item.text.setText(item.count);
        } else {
            if (item.sprite) {
                item.sprite.destroy();
                item.sprite = null;
            }
            if (item.text) {
                item.text.destroy();
                item.text = null;
            }
            this.inventory[slotIndex] = null;
        }

        const inventoryToSave = this.inventory.map(i => i && i.count > 0 ? {type: i.type, count: i.count} : null);
        saveInventory(inventoryToSave);
    });

    }

}
