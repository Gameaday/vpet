/**
 * Item System Module
 * Manages items, inventory, and shop for VPet
 */

// Item categories
const ItemCategory = {
    FOOD: 'food',
    MEDICINE: 'medicine',
    COSMETIC: 'cosmetic',
    BATTLE: 'battle',
    EVOLUTION: 'evolution'
};

// Item definitions
const ITEMS = {
    // Basic Food Items
    apple: {
        id: 'apple',
        name: '🍎 Apple',
        category: ItemCategory.FOOD,
        description: 'A fresh apple. Restores 20 hunger.',
        price: 10,
        effects: { hunger: 20, happiness: 5 },
        stackable: true
    },
    meat: {
        id: 'meat',
        name: '🍖 Meat',
        category: ItemCategory.FOOD,
        description: 'Protein-rich meat. Restores 30 hunger.',
        price: 20,
        effects: { hunger: 30, happiness: 10 },
        stackable: true
    },
    cake: {
        id: 'cake',
        name: '🍰 Cake',
        category: ItemCategory.FOOD,
        description: 'Delicious cake! Restores hunger and boosts happiness.',
        price: 50,
        effects: { hunger: 25, happiness: 30 },
        stackable: true
    },
    
    // Medicine Items
    healthPotion: {
        id: 'healthPotion',
        name: '💊 Health Potion',
        category: ItemCategory.MEDICINE,
        description: 'Restores 30 health points.',
        price: 30,
        effects: { health: 30 },
        stackable: true
    },
    energyDrink: {
        id: 'energyDrink',
        name: '⚡ Energy Drink',
        category: ItemCategory.MEDICINE,
        description: 'Restores 40 energy points.',
        price: 25,
        effects: { energy: 40 },
        stackable: true
    },
    medicine: {
        id: 'medicine',
        name: '💉 Medicine',
        category: ItemCategory.MEDICINE,
        description: 'Cures illness and restores some health.',
        price: 40,
        effects: { health: 20, cureIllness: true },
        stackable: true
    },
    vitamins: {
        id: 'vitamins',
        name: '💊 Vitamins',
        category: ItemCategory.MEDICINE,
        description: 'Boosts all stats slightly.',
        price: 60,
        effects: { health: 10, hunger: 10, happiness: 10, energy: 10 },
        stackable: true
    },
    
    // Battle Items
    attackBoost: {
        id: 'attackBoost',
        name: '⚔️ Attack Boost',
        category: ItemCategory.BATTLE,
        description: 'Increases attack power for 3 turns.',
        price: 80,
        effects: { attackBoost: 1.5, duration: 3 },
        stackable: true
    },
    defenseBoost: {
        id: 'defenseBoost',
        name: '🛡️ Defense Boost',
        category: ItemCategory.BATTLE,
        description: 'Increases defense for 3 turns.',
        price: 80,
        effects: { defenseBoost: 1.5, duration: 3 },
        stackable: true
    },
    revive: {
        id: 'revive',
        name: '✨ Revive',
        category: ItemCategory.BATTLE,
        description: 'Restores 50% HP during battle.',
        price: 100,
        effects: { battleHeal: 0.5 },
        stackable: true
    },
    
    // Evolution Items
    evolutionStone: {
        id: 'evolutionStone',
        name: '💎 Evolution Stone',
        category: ItemCategory.EVOLUTION,
        description: 'Influences evolution path towards power.',
        price: 200,
        effects: { evolutionPath: 'power' },
        stackable: false
    },
    careCharm: {
        id: 'careCharm',
        name: '🌸 Care Charm',
        category: ItemCategory.EVOLUTION,
        description: 'Influences evolution path towards care.',
        price: 200,
        effects: { evolutionPath: 'care' },
        stackable: false
    },
    rareCandy: {
        id: 'rareCandy',
        name: '🍬 Rare Candy',
        category: ItemCategory.EVOLUTION,
        description: 'Speeds up evolution by 1 hour.',
        price: 150,
        effects: { ageBoost: 3600000 },
        stackable: true
    },
    
    // Cosmetic Items
    hat: {
        id: 'hat',
        name: '🎩 Top Hat',
        category: ItemCategory.COSMETIC,
        description: 'A fancy top hat for your pet.',
        price: 100,
        effects: { cosmetic: 'hat' },
        stackable: false
    },
    bow: {
        id: 'bow',
        name: '🎀 Bow',
        category: ItemCategory.COSMETIC,
        description: 'A cute bow accessory.',
        price: 80,
        effects: { cosmetic: 'bow' },
        stackable: false
    },
    sunglasses: {
        id: 'sunglasses',
        name: '🕶️ Sunglasses',
        category: ItemCategory.COSMETIC,
        description: 'Cool sunglasses for your pet.',
        price: 120,
        effects: { cosmetic: 'sunglasses' },
        stackable: false
    }
};

/**
 * Inventory Manager
 * Handles pet inventory storage and management
 */
class InventoryManager {
    constructor() {
        this.items = {};
        this.maxSlots = 30;
        this.loadInventory();
    }
    
    /**
     * Load inventory from localStorage
     */
    loadInventory() {
        const saved = localStorage.getItem('petInventory');
        if (saved) {
            try {
                this.items = JSON.parse(saved);
            } catch (error) {
                console.error('Error loading inventory:', error);
                this.items = {};
            }
        }
    }
    
    /**
     * Save inventory to localStorage
     */
    saveInventory() {
        localStorage.setItem('petInventory', JSON.stringify(this.items));
    }
    
    /**
     * Add item to inventory
     * @param {string} itemId - Item ID to add
     * @param {number} quantity - Quantity to add (default 1)
     * @returns {boolean} Success status
     */
    addItem(itemId, quantity = 1) {
        const item = ITEMS[itemId];
        if (!item) {
            console.error('Invalid item ID:', itemId);
            return false;
        }
        
        // Check if inventory is full (non-stackable items)
        if (!item.stackable && this.items[itemId]) {
            console.log('Item not stackable and already owned');
            return false;
        }
        
        // Check slot limit
        const currentSlots = Object.keys(this.items).length;
        if (!this.items[itemId] && currentSlots >= this.maxSlots) {
            console.log('Inventory full');
            return false;
        }
        
        // Add or increment
        if (this.items[itemId]) {
            this.items[itemId] += quantity;
        } else {
            this.items[itemId] = quantity;
        }
        
        this.saveInventory();
        return true;
    }
    
    /**
     * Remove item from inventory
     * @param {string} itemId - Item ID to remove
     * @param {number} quantity - Quantity to remove (default 1)
     * @returns {boolean} Success status
     */
    removeItem(itemId, quantity = 1) {
        if (!this.items[itemId] || this.items[itemId] < quantity) {
            console.error('Insufficient item quantity:', itemId);
            return false;
        }
        
        this.items[itemId] -= quantity;
        
        // Remove if quantity reaches 0
        if (this.items[itemId] <= 0) {
            delete this.items[itemId];
        }
        
        this.saveInventory();
        return true;
    }
    
    /**
     * Get item quantity
     * @param {string} itemId - Item ID
     * @returns {number} Quantity
     */
    getQuantity(itemId) {
        return this.items[itemId] || 0;
    }
    
    /**
     * Check if item exists in inventory
     * @param {string} itemId - Item ID
     * @returns {boolean} Has item
     */
    hasItem(itemId) {
        return this.getQuantity(itemId) > 0;
    }
    
    /**
     * Get all inventory items
     * @returns {Object} Inventory items
     */
    getAll() {
        return { ...this.items };
    }
    
    /**
     * Clear entire inventory
     */
    clear() {
        this.items = {};
        this.saveInventory();
    }
}

/**
 * Shop Manager
 * Handles shop interface and purchases
 */
class ShopManager {
    constructor(inventoryManager) {
        this.inventory = inventoryManager;
        this.coins = 0;
        this.loadCoins();
    }
    
    /**
     * Load coins from localStorage
     */
    loadCoins() {
        const saved = localStorage.getItem('petCoins');
        if (saved) {
            this.coins = parseInt(saved, 10) || 0;
        }
    }
    
    /**
     * Save coins to localStorage
     */
    saveCoins() {
        localStorage.setItem('petCoins', this.coins.toString());
    }
    
    /**
     * Get current coin balance
     * @returns {number} Coin balance
     */
    getCoins() {
        return this.coins;
    }
    
    /**
     * Add coins
     * @param {number} amount - Amount to add
     */
    addCoins(amount) {
        this.coins += amount;
        this.saveCoins();
    }
    
    /**
     * Remove coins
     * @param {number} amount - Amount to remove
     * @returns {boolean} Success status
     */
    removeCoins(amount) {
        if (this.coins < amount) {
            return false;
        }
        this.coins -= amount;
        this.saveCoins();
        return true;
    }
    
    /**
     * Purchase item from shop
     * @param {string} itemId - Item ID to purchase
     * @returns {boolean} Success status
     */
    purchaseItem(itemId) {
        const item = ITEMS[itemId];
        if (!item) {
            console.error('Invalid item ID:', itemId);
            return false;
        }
        
        // Check if user has enough coins
        if (this.coins < item.price) {
            console.log('Insufficient coins');
            return false;
        }
        
        // Try to add to inventory
        if (!this.inventory.addItem(itemId, 1)) {
            console.log('Failed to add item to inventory');
            return false;
        }
        
        // Deduct coins
        this.removeCoins(item.price);
        return true;
    }
    
    /**
     * Get items available in shop by category
     * @param {string} category - Item category (optional)
     * @returns {Array} Shop items
     */
    getShopItems(category = null) {
        const items = Object.values(ITEMS);
        
        if (category) {
            return items.filter(item => item.category === category);
        }
        
        return items;
    }
    
    /**
     * Get item details
     * @param {string} itemId - Item ID
     * @returns {Object} Item details
     */
    getItemDetails(itemId) {
        return ITEMS[itemId] || null;
    }
}

/**
 * Use item on pet
 * @param {string} itemId - Item ID to use
 * @param {Object} pet - Pet object
 * @param {InventoryManager} inventory - Inventory manager
 * @returns {Object} Result {success, message, effects}
 */
function useItem(itemId, pet, inventory) {
    const item = ITEMS[itemId];
    
    if (!item) {
        return { success: false, message: 'Invalid item' };
    }
    
    if (!inventory.hasItem(itemId)) {
        return { success: false, message: 'Item not in inventory' };
    }
    
    // Apply effects based on item type
    const effects = {};
    
    if (item.effects.hunger) {
        pet.hunger = Math.min(100, pet.hunger + item.effects.hunger);
        effects.hunger = item.effects.hunger;
    }
    
    if (item.effects.health) {
        pet.health = Math.min(100, pet.health + item.effects.health);
        effects.health = item.effects.health;
    }
    
    if (item.effects.happiness) {
        pet.happiness = Math.min(100, pet.happiness + item.effects.happiness);
        effects.happiness = item.effects.happiness;
    }
    
    if (item.effects.energy) {
        pet.energy = Math.min(100, pet.energy + item.effects.energy);
        effects.energy = item.effects.energy;
    }
    
    if (item.effects.cureIllness && pet.isSick) {
        pet.isSick = false;
        effects.curedIllness = true;
    }
    
    if (item.effects.ageBoost) {
        pet.age += item.effects.ageBoost;
        effects.ageBoost = item.effects.ageBoost;
    }
    
    if (item.effects.evolutionPath) {
        pet.evolutionInfluence = pet.evolutionInfluence || {};
        pet.evolutionInfluence[item.effects.evolutionPath] = (pet.evolutionInfluence[item.effects.evolutionPath] || 0) + 1;
        effects.evolutionPath = item.effects.evolutionPath;
    }
    
    if (item.effects.cosmetic) {
        pet.cosmetics = pet.cosmetics || [];
        if (!pet.cosmetics.includes(item.effects.cosmetic)) {
            pet.cosmetics.push(item.effects.cosmetic);
        }
        effects.cosmetic = item.effects.cosmetic;
    }
    
    // Remove item from inventory
    inventory.removeItem(itemId, 1);
    
    // Save pet state
    if (pet.save) {
        pet.save();
    }
    
    return {
        success: true,
        message: `Used ${item.name}!`,
        effects
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ItemCategory,
        ITEMS,
        InventoryManager,
        ShopManager,
        useItem
    };
}
