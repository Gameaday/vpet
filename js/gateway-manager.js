/**
 * Gateway Interaction System
 * Transforms main action buttons into gateways for deeper interactions
 */

class GatewayManager {
    constructor() {
        this.modals = {
            kitchen: document.getElementById('kitchenModal'),
            activities: document.getElementById('activitiesModal'),
            rest: document.getElementById('restModal'),
            grooming: document.getElementById('groomingModal'),
            training: document.getElementById('trainingModal')
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Close buttons for all gateway modals
        document.getElementById('closeKitchenModal')?.addEventListener('click', () => this.closeModal('kitchen'));
        document.getElementById('closeActivitiesModal')?.addEventListener('click', () => this.closeModal('activities'));
        document.getElementById('closeRestModal')?.addEventListener('click', () => this.closeModal('rest'));
        document.getElementById('closeGroomingModal')?.addEventListener('click', () => this.closeModal('grooming'));
        document.getElementById('closeTrainingModal')?.addEventListener('click', () => this.closeModal('training'));
        
        // Quick action buttons
        document.getElementById('quickFeedBtn')?.addEventListener('click', () => this.quickFeed());
        document.getElementById('quickPlayBtn')?.addEventListener('click', () => this.quickPlay());
        document.getElementById('quickSleepBtn')?.addEventListener('click', () => this.quickSleep());
        document.getElementById('quickCleanBtn')?.addEventListener('click', () => this.quickClean());
        document.getElementById('quickTrainBtn')?.addEventListener('click', () => this.quickTrain());
        
        // Kitchen/Feed actions
        document.getElementById('openShopFromKitchen')?.addEventListener('click', () => {
            this.closeModal('kitchen');
            document.getElementById('shopBtn')?.click();
        });
        
        // Activities Hub actions
        document.getElementById('playMinigamesBtn')?.addEventListener('click', () => {
            this.closeModal('activities');
            document.getElementById('minigamesBtn')?.click();
        });
        
        document.getElementById('playExploreBtn')?.addEventListener('click', () => {
            this.exploreWorld();
        });
        
        document.getElementById('playSocialBtn')?.addEventListener('click', () => {
            this.closeModal('activities');
            document.getElementById('friendsBtn')?.click();
        });
        
        document.getElementById('playToysBtn')?.addEventListener('click', () => {
            this.useInventoryToys();
        });
        
        // Rest Menu actions
        document.getElementById('normalSleepBtn')?.addEventListener('click', () => this.normalSleep());
        document.getElementById('deepSleepBtn')?.addEventListener('click', () => this.deepSleep());
        document.getElementById('cryoSleepBtn')?.addEventListener('click', () => {
            this.closeModal('rest');
            document.getElementById('hibernateBtn')?.click();
        });
        document.getElementById('dreamActivityBtn')?.addEventListener('click', () => this.dreamActivity());
        
        // Grooming actions
        document.getElementById('bathGameBtn')?.addEventListener('click', () => this.bathGame());
        document.getElementById('brushGameBtn')?.addEventListener('click', () => this.brushGame());
        document.getElementById('spaBtn')?.addEventListener('click', () => this.spaTreatment());
        document.getElementById('cosmeticsBtn')?.addEventListener('click', () => this.openCosmetics());
        
        // Training Center actions
        document.getElementById('strengthTrainBtn')?.addEventListener('click', () => this.trainStrength());
        document.getElementById('defenseTrainBtn')?.addEventListener('click', () => this.trainDefense());
        document.getElementById('speedTrainBtn')?.addEventListener('click', () => this.trainSpeed());
        document.getElementById('balancedTrainBtn')?.addEventListener('click', () => this.trainBalanced());
        document.getElementById('battlePrepBtn')?.addEventListener('click', () => {
            this.closeModal('training');
            document.getElementById('battleBtn')?.click();
        });
        
        // Close modals on outside click
        Object.values(this.modals).forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.closeAllModals();
                    }
                });
            }
        });
        
        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }
    
    // Modal Management
    openModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            this.updateModalStats(modalName);
            modal.style.display = 'flex';
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 10);
        }
    }
    
    closeModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 200);
        }
    }
    
    closeAllModals() {
        Object.keys(this.modals).forEach(key => this.closeModal(key));
    }
    
    updateModalStats(modalName) {
        if (!window.pet) return;
        
        switch(modalName) {
            case 'kitchen':
                const hungerValue = document.getElementById('kitchenHungerValue');
                if (hungerValue) hungerValue.textContent = Math.round(window.pet.hunger);
                this.populateFoodGrid();
                break;
            case 'activities':
                const happinessValue = document.getElementById('activitiesHappinessValue');
                if (happinessValue) happinessValue.textContent = Math.round(window.pet.happiness);
                break;
            case 'rest':
                const energyValue = document.getElementById('restEnergyValue');
                if (energyValue) energyValue.textContent = Math.round(window.pet.energy);
                break;
            case 'grooming':
                const cleanValue = document.getElementById('groomingCleanValue');
                if (cleanValue) cleanValue.textContent = Math.round(window.pet.cleanliness);
                break;
            case 'training':
                const levelValue = document.getElementById('trainingLevelValue');
                const xpValue = document.getElementById('trainingXPValue');
                const attackValue = document.getElementById('trainingAttackValue');
                const defenseValue = document.getElementById('trainingDefenseValue');
                const speedValue = document.getElementById('trainingSpeedValue');
                
                if (levelValue) levelValue.textContent = window.pet.level || 1;
                if (xpValue) xpValue.textContent = window.pet.experience || 0;
                if (attackValue) attackValue.textContent = window.pet.attack || 10;
                if (defenseValue) defenseValue.textContent = window.pet.defense || 10;
                if (speedValue) speedValue.textContent = window.pet.speed || 10;
                break;
        }
    }
    
    populateFoodGrid() {
        const foodGrid = document.getElementById('foodGrid');
        if (!foodGrid) return;
        
        // Get food items from inventory
        const inventory = window.itemSystem?.inventory || {};
        const foodItems = Object.entries(inventory).filter(([id, data]) => {
            const item = window.itemSystem?.items?.[id];
            return item && item.category === 'food' && data.quantity > 0;
        });
        
        if (foodItems.length === 0) {
            foodGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">🍽️</div>
                    <h3>No Food Items</h3>
                    <p>Visit the shop to buy food for your pet!</p>
                </div>
            `;
            return;
        }
        
        foodGrid.innerHTML = foodItems.map(([id, data]) => {
            const item = window.itemSystem.items[id];
            const safeId = id.replace(/['"<>&]/g, ''); // Sanitize ID
            return `
                <div class="food-item-card" data-item-id="${safeId}">
                    <div class="food-item-icon">${item.icon}</div>
                    <div class="food-item-name">${item.name}</div>
                    <div class="food-item-effect">+${item.hunger || 20} Hunger</div>
                    <div class="food-item-count">${data.quantity}</div>
                </div>
            `;
        }).join('');
        
        // Add event delegation for food item clicks
        foodGrid.querySelectorAll('.food-item-card').forEach(card => {
            card.addEventListener('click', () => {
                const itemId = card.dataset.itemId;
                if (itemId) {
                    this.useFood(itemId);
                }
            });
        });
    }
    
    useFood(itemId) {
        if (window.itemSystem && window.pet) {
            const success = window.itemSystem.useItem(itemId, window.pet);
            if (success) {
                this.updateModalStats('kitchen');
                window.updateDisplay?.();
            }
        }
    }
    
    // Quick Actions (same as original buttons)
    quickFeed() {
        this.closeModal('kitchen');
        window.handleFeed?.();
    }
    
    quickPlay() {
        this.closeModal('activities');
        window.handlePlay?.();
    }
    
    quickSleep() {
        this.closeModal('rest');
        window.handleSleep?.();
    }
    
    quickClean() {
        this.closeModal('grooming');
        window.handleClean?.();
    }
    
    quickTrain() {
        this.closeModal('training');
        window.handleTrain?.();
    }
    
    // Advanced Actions
    exploreWorld() {
        this.closeModal('activities');
        if (window.showNotification) {
            window.showNotification('🗺️ Exploration feature coming soon!', 'info');
        }
    }
    
    useInventoryToys() {
        this.closeModal('activities');
        if (window.showNotification) {
            window.showNotification('🎾 Toy system coming soon!', 'info');
        }
    }
    
    normalSleep() {
        if (window.pet && window.handleSleep) {
            window.handleSleep();
            this.closeModal('rest');
        }
    }
    
    deepSleep() {
        if (window.pet) {
            const maxEnergy = 100;
            window.pet.energy = Math.min(maxEnergy, window.pet.energy + maxEnergy);
            window.pet.isSleeping = true;
            // Wake up after a timeout
            setTimeout(() => {
                if (window.pet) {
                    window.pet.isSleeping = false;
                    window.updateDisplay?.();
                }
            }, 2000); // Wake up after 2 seconds
            window.updateDisplay?.();
            this.closeModal('rest');
            if (window.showNotification) {
                window.showNotification('😴 Deep sleep initiated - full energy restoration!', 'success');
            }
        }
    }
    
    dreamActivity() {
        if (window.pet) {
            window.pet.energy = Math.min(100, window.pet.energy + 30);
            window.pet.happiness = Math.min(100, window.pet.happiness + 10);
            window.updateDisplay?.();
            this.closeModal('rest');
            if (window.showNotification) {
                window.showNotification('✨ Enjoying dream activities!', 'success');
            }
        }
    }
    
    bathGame() {
        this.closeModal('grooming');
        if (window.showNotification) {
            window.showNotification('🛁 Bath mini-game coming soon!', 'info');
        }
        // For now, just do a quick clean
        window.handleClean?.();
    }
    
    brushGame() {
        this.closeModal('grooming');
        if (window.pet) {
            window.pet.cleanliness = Math.min(100, window.pet.cleanliness + 25);
            window.pet.happiness = Math.min(100, window.pet.happiness + 5);
            window.updateDisplay?.();
            if (window.showNotification) {
                window.showNotification('✨ Looking shiny and clean!', 'success');
            }
        }
    }
    
    spaTreatment() {
        if (window.pet) {
            const cost = 50;
            if ((window.pet.coins || 0) >= cost) {
                window.pet.coins -= cost;
                window.pet.cleanliness = 100;
                window.pet.happiness = Math.min(100, window.pet.happiness + 20);
                window.updateDisplay?.();
                this.closeModal('grooming');
                if (window.showNotification) {
                    window.showNotification('🌸 Spa treatment complete! Feeling pampered!', 'success');
                }
            } else {
                if (window.showNotification) {
                    window.showNotification('💰 Need 50 coins for spa treatment', 'warning');
                }
            }
        }
    }
    
    openCosmetics() {
        this.closeModal('grooming');
        if (window.showNotification) {
            window.showNotification('💄 Cosmetics system coming soon!', 'info');
        }
    }
    
    trainStrength() {
        this.trainStat('attack', 'Strength');
    }
    
    trainDefense() {
        this.trainStat('defense', 'Defense');
    }
    
    trainSpeed() {
        this.trainStat('speed', 'Speed');
    }
    
    trainBalanced() {
        if (window.pet && window.pet.energy >= 30) {
            window.pet.energy -= 30;
            window.pet.attack = (window.pet.attack || 10) + 1;
            window.pet.defense = (window.pet.defense || 10) + 1;
            window.pet.speed = (window.pet.speed || 10) + 1;
            window.pet.addExperience?.(15);
            window.updateDisplay?.();
            this.updateModalStats('training');
            if (window.showNotification) {
                window.showNotification('🎯 Balanced training complete!', 'success');
            }
        } else {
            if (window.showNotification) {
                window.showNotification('😴 Not enough energy to train', 'warning');
            }
        }
    }
    
    trainStat(statName, displayName) {
        if (window.pet && window.pet.energy >= 20) {
            window.pet.energy -= 20;
            window.pet[statName] = (window.pet[statName] || 10) + 2;
            window.pet.addExperience?.(10);
            window.updateDisplay?.();
            this.updateModalStats('training');
            if (window.showNotification) {
                window.showNotification(`💪 ${displayName} training complete! +2 ${displayName}`, 'success');
            }
        } else {
            if (window.showNotification) {
                window.showNotification('😴 Not enough energy to train', 'warning');
            }
        }
    }
}

// Initialize gateway manager when DOM is ready
let gatewayManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        gatewayManager = new GatewayManager();
    });
} else {
    gatewayManager = new GatewayManager();
}
