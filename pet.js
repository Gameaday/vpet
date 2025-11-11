// Pet class managing the virtual pet's state and behavior
class Pet {
    constructor() {
        this.name = 'My Pet';
        this.stage = 'egg'; // egg, baby, child, teen, adult
        this.health = 100;
        this.hunger = 100;
        this.happiness = 100;
        this.energy = 100;
        this.age = 0; // in days
        this.level = 1;
        this.wins = 0;
        this.isSleeping = false;
        this.birthTime = Date.now();
        this.lastUpdateTime = Date.now();
        
        // Load saved pet or create new one
        this.load();
    }

    // Save pet to localStorage
    save() {
        const petData = {
            name: this.name,
            stage: this.stage,
            health: this.health,
            hunger: this.hunger,
            happiness: this.happiness,
            energy: this.energy,
            age: this.age,
            level: this.level,
            wins: this.wins,
            isSleeping: this.isSleeping,
            birthTime: this.birthTime,
            lastUpdateTime: this.lastUpdateTime
        };
        localStorage.setItem('vpet_data', JSON.stringify(petData));
    }

    // Load pet from localStorage
    load() {
        const savedData = localStorage.getItem('vpet_data');
        if (savedData) {
            try {
                const petData = JSON.parse(savedData);
                this.name = petData.name || 'My Pet';
                this.stage = petData.stage || 'egg';
                this.health = petData.health || 100;
                this.hunger = petData.hunger || 100;
                this.happiness = petData.happiness || 100;
                this.energy = petData.energy || 100;
                this.age = petData.age || 0;
                this.level = petData.level || 1;
                this.wins = petData.wins || 0;
                this.isSleeping = petData.isSleeping || false;
                this.birthTime = petData.birthTime || Date.now();
                this.lastUpdateTime = petData.lastUpdateTime || Date.now();
                
                // Update stats based on time passed
                this.updateStatsFromTimePassed();
            } catch (e) {
                console.error('Error loading pet data:', e);
            }
        }
    }

    // Update stats based on time that passed since last update
    updateStatsFromTimePassed() {
        const now = Date.now();
        const timePassed = now - this.lastUpdateTime;
        const minutesPassed = timePassed / (1000 * 60);
        
        // Decay rates per minute
        const hungerDecay = 0.5;
        const happinessDecay = 0.3;
        const energyDecay = 0.2;
        
        if (!this.isSleeping) {
            this.hunger = Math.max(0, this.hunger - (minutesPassed * hungerDecay));
            this.happiness = Math.max(0, this.happiness - (minutesPassed * happinessDecay));
            this.energy = Math.max(0, this.energy - (minutesPassed * energyDecay));
        } else {
            // Restore energy while sleeping
            this.energy = Math.min(100, this.energy + (minutesPassed * 1));
        }
        
        // Health decreases if hunger is too low
        if (this.hunger < 30) {
            this.health = Math.max(0, this.health - (minutesPassed * 0.5));
        }
        
        // Update age
        const daysPassed = (now - this.birthTime) / (1000 * 60 * 60 * 24);
        this.age = Math.floor(daysPassed);
        
        // Check for evolution
        this.checkEvolution();
        
        this.lastUpdateTime = now;
        this.save();
    }

    // Check and handle evolution
    checkEvolution() {
        const oldStage = this.stage;
        
        if (this.stage === 'egg' && this.age >= 0.01) { // ~15 minutes
            this.stage = 'baby';
        } else if (this.stage === 'baby' && this.age >= 0.05) { // ~1 hour
            this.stage = 'child';
        } else if (this.stage === 'child' && this.age >= 0.1) { // ~2.4 hours
            this.stage = 'teen';
        } else if (this.stage === 'teen' && this.age >= 0.2) { // ~5 hours
            this.stage = 'adult';
        }
        
        if (oldStage !== this.stage) {
            this.onEvolution();
        }
    }

    // Handle evolution event
    onEvolution() {
        this.level++;
        showNotification(`🎉 Your pet evolved to ${this.stage}!`);
        this.save();
    }

    // Feed the pet
    feed() {
        if (this.isSleeping) {
            showNotification('💤 Your pet is sleeping!');
            return false;
        }
        
        if (this.hunger >= 90) {
            showNotification('🍖 Your pet is not hungry!');
            return false;
        }
        
        this.hunger = Math.min(100, this.hunger + 30);
        this.happiness = Math.min(100, this.happiness + 5);
        this.health = Math.min(100, this.health + 5);
        showNotification('🍖 Fed your pet!');
        this.save();
        return true;
    }

    // Play with the pet
    play() {
        if (this.isSleeping) {
            showNotification('💤 Your pet is sleeping!');
            return false;
        }
        
        if (this.energy < 20) {
            showNotification('😴 Your pet is too tired to play!');
            return false;
        }
        
        this.happiness = Math.min(100, this.happiness + 20);
        this.energy = Math.max(0, this.energy - 15);
        this.hunger = Math.max(0, this.hunger - 10);
        showNotification('🎮 Played with your pet!');
        this.save();
        return true;
    }

    // Put pet to sleep
    sleep() {
        if (this.isSleeping) {
            // Wake up
            this.isSleeping = false;
            showNotification('☀️ Your pet woke up!');
        } else {
            // Go to sleep
            this.isSleeping = true;
            showNotification('💤 Your pet is now sleeping...');
        }
        this.save();
        return true;
    }

    // Train the pet
    train() {
        if (this.isSleeping) {
            showNotification('💤 Your pet is sleeping!');
            return false;
        }
        
        if (this.energy < 30) {
            showNotification('😴 Your pet is too tired to train!');
            return false;
        }
        
        this.level += 0.1;
        this.energy = Math.max(0, this.energy - 25);
        this.hunger = Math.max(0, this.hunger - 20);
        this.happiness = Math.max(0, this.happiness - 5);
        showNotification('💪 Your pet trained hard!');
        this.save();
        return true;
    }

    // Get battle stats
    getBattleStats() {
        const baseAttack = 10 + (this.level * 5);
        const baseDefense = 5 + (this.level * 3);
        const baseHP = 50 + (this.level * 10);
        
        // Stats are affected by pet's condition
        const conditionMultiplier = (this.health + this.hunger + this.happiness + this.energy) / 400;
        
        return {
            maxHP: Math.floor(baseHP),
            currentHP: Math.floor(baseHP),
            attack: Math.floor(baseAttack * conditionMultiplier),
            defense: Math.floor(baseDefense * conditionMultiplier),
            level: Math.floor(this.level)
        };
    }

    // Update stats after battle
    updateAfterBattle(won) {
        if (won) {
            this.wins++;
            this.level += 0.5;
            this.happiness = Math.min(100, this.happiness + 10);
            showNotification('🏆 Victory! Your pet gained experience!');
        } else {
            this.happiness = Math.max(0, this.happiness - 10);
            this.health = Math.max(0, this.health - 10);
            showNotification('💔 Defeat! Your pet needs care.');
        }
        
        this.energy = Math.max(0, this.energy - 30);
        this.save();
    }

    // Reset pet
    reset() {
        this.name = 'My Pet';
        this.stage = 'egg';
        this.health = 100;
        this.hunger = 100;
        this.happiness = 100;
        this.energy = 100;
        this.age = 0;
        this.level = 1;
        this.wins = 0;
        this.isSleeping = false;
        this.birthTime = Date.now();
        this.lastUpdateTime = Date.now();
        this.save();
    }

    // Get pet data for serialization
    toJSON() {
        return {
            name: this.name,
            stage: this.stage,
            health: this.health,
            hunger: this.hunger,
            happiness: this.happiness,
            energy: this.energy,
            age: this.age,
            level: Math.floor(this.level),
            wins: this.wins
        };
    }
}

// Notification helper function
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
