/**
 * Enhanced Pet Class - Professional, Extensible Implementation
 * 
 * Features:
 * - Configuration-driven (no magic numbers)
 * - Tier-based feature support
 * - Plugin/module system ready
 * - Comprehensive error handling
 * - Full validation
 * - Extensible for monetization
 * 
 * @version 2.0.0
 */

// Load configuration (or use embedded defaults if module not available)
/* global PetConfig */
let CONFIG;
try {
    CONFIG = typeof PetConfig !== 'undefined' ? PetConfig : require('./pet-config.js');
} catch {
    // Fallback to inline config if needed
    CONFIG = {
        DECAY_RATES: { hunger: 0.5, happiness: 0.3, energy: 0.2, cleanliness: 0.4, discipline: 0.1 },
        // ... minimal defaults
    };
}

class EnhancedPet {
    /**
     * Initialize pet with optional tier for feature access
     * @param {string} tier - Subscription tier ('free', 'basic', 'premium')
     */
    constructor(tier = 'free') {
        // Core stats
        this.name = 'My Pet';
        this.stage = 'egg';
        this.health = 100;
        this.hunger = 100;
        this.happiness = 100;
        this.energy = 100;
        this.age = 0;
        this.level = 1;
        this.wins = 0;
        
        // Extended stats
        this.discipline = 100;
        this.cleanliness = 100;
        
        // State flags
        this.isSleeping = false;
        this.isSick = false;
        this.sicknessDuration = 0;
        
        // Timestamps
        this.birthTime = Date.now();
        this.lastUpdateTime = Date.now();
        
        // Collections
        this.battleHistory = [];
        this.statsHistory = [];
        this.personalityTraits = this._initializePersonality();
        
        // Tier and features
        this.tier = tier;
        this.features = this._getFeatures(tier);
        
        // Load saved data
        this.load();
    }

    /**
     * Initialize personality traits from config
     * @private
     */
    _initializePersonality() {
        const traits = {};
        CONFIG.PERSONALITY?.traits?.forEach(trait => {
            traits[trait] = CONFIG.PERSONALITY.defaultValue || 50;
        });
        return traits;
    }

    /**
     * Get feature set for current tier
     * @private
     */
    _getFeatures(tier) {
        return CONFIG.FEATURES?.[tier] || CONFIG.FEATURES?.free || {};
    }

    /**
     * Update subscription tier
     * @param {string} newTier - New subscription tier
     */
    updateTier(newTier) {
        this.tier = newTier;
        this.features = this._getFeatures(newTier);
        this.save();
    }

    /**
     * Validate stat value against configured ranges
     * @private
     */
    _validateStat(value, _statName = 'default') {
        const validation = CONFIG.VALIDATION?.stats || { min: 0, max: 100 };
        return Math.max(validation.min, Math.min(validation.max, value));
    }

    /**
     * Validate all stats
     */
    validateStats() {
        this.health = this._validateStat(this.health);
        this.hunger = this._validateStat(this.hunger);
        this.happiness = this._validateStat(this.happiness);
        this.energy = this._validateStat(this.energy);
        this.discipline = this._validateStat(this.discipline);
        this.cleanliness = this._validateStat(this.cleanliness);
        
        const levelValidation = CONFIG.VALIDATION?.level || { min: 1, max: 999 };
        this.level = Math.max(levelValidation.min, Math.min(levelValidation.max, this.level));
        this.wins = Math.max(0, this.wins);
        
        // Validate stage
        const validStages = Object.keys(CONFIG.EVOLUTION?.stages || { egg: true });
        if (!validStages.includes(this.stage)) {
            this.stage = 'egg';
        }
    }

    /**
     * Validate and sanitize pet name based on tier
     * @param {string} name - Proposed pet name
     * @returns {string} Sanitized name
     */
    validateName(name) {
        if (!name || typeof name !== 'string') {
            return 'My Pet';
        }

        const validation = CONFIG.VALIDATION?.name || {};
        const maxLength = validation.maxLength || 50;
        
        // Remove dangerous characters
        let safeName = name.replace(/[<>]/g, '');
        
        // Check tier-appropriate pattern
        const pattern = this.features.emojiInNames 
            ? validation.premiumPattern 
            : validation.allowedPattern;
            
        if (pattern && !pattern.test(safeName)) {
            // Strip to allowed characters only
            safeName = safeName.replace(/[^a-zA-Z0-9\s-_]/g, '');
        }
        
        // Trim and limit length
        safeName = safeName.trim().substring(0, maxLength);
        
        return safeName || 'My Pet';
    }

    /**
     * Save pet data to localStorage with error handling
     */
    save() {
        try {
            this.validateStats();
            
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
                lastUpdateTime: this.lastUpdateTime,
                battleHistory: this.battleHistory || [],
                statsHistory: this.statsHistory || [],
                isSick: this.isSick || false,
                sicknessDuration: this.sicknessDuration || 0,
                personalityTraits: this.personalityTraits,
                discipline: this.discipline,
                cleanliness: this.cleanliness,
                tier: this.tier,
                version: '2.0.0'  // For future migration support
            };
            
            this._saveToStorage(petData);
        } catch (error) {
            console.error('Error saving pet data:', error);
            this._handleSaveError(error);
        }
    }

    /**
     * Handle localStorage save with quota management
     * @private
     */
    _saveToStorage(petData) {
        const dataString = JSON.stringify(petData);
        
        try {
            localStorage.setItem('vpet_data', dataString);
        } catch {
            console.warn('Storage quota exceeded, pruning old data...');
            
            // Prune battle history
            const historyLimit = CONFIG.STORAGE?.battleHistory || 10;
            if (this.battleHistory.length > historyLimit) {
                this.battleHistory = this.battleHistory.slice(-historyLimit);
            }
            
            // Prune stats history
            const statsAgeLimit = CONFIG.STORAGE?.statsHistory || (24 * 60 * 60 * 1000);
            const cutoff = Date.now() - statsAgeLimit;
            if (this.statsHistory.length > 0) {
                this.statsHistory = this.statsHistory.filter(s => s.timestamp > cutoff);
            }
            
            // Retry with pruned data
            petData.battleHistory = this.battleHistory;
            petData.statsHistory = this.statsHistory;
            localStorage.setItem('vpet_data', JSON.stringify(petData));
        }
    }

    /**
     * Handle save errors with graceful degradation
     * @private
     */
    _handleSaveError(_error) {
        // Continue with in-memory state
        // Could emit event for error tracking in production
        console.warn('Continuing with in-memory state only');
    }

    /**
     * Load pet data from localStorage
     */
    load() {
        try {
            const savedData = localStorage.getItem('vpet_data');
            if (!savedData) return;

            const petData = JSON.parse(savedData);
            this._loadPetData(petData);
            this.validateStats();
            this.updateStatsFromTimePassed();
        } catch (error) {
            console.error('Error loading pet data:', error);
            // Keep default initialized state
        }
    }

    /**
     * Load individual pet data fields with validation
     * @private
     */
    _loadPetData(data) {
        this.name = this.validateName(data.name);
        this.stage = data.stage || 'egg';
        this.health = Number(data.health) || 100;
        this.hunger = Number(data.hunger) || 100;
        this.happiness = Number(data.happiness) || 100;
        this.energy = Number(data.energy) || 100;
        this.age = Number(data.age) || 0;
        this.level = Number(data.level) || 1;
        this.wins = Number(data.wins) || 0;
        this.isSleeping = Boolean(data.isSleeping);
        this.birthTime = Number(data.birthTime) || Date.now();
        this.lastUpdateTime = Number(data.lastUpdateTime) || Date.now();
        this.battleHistory = Array.isArray(data.battleHistory) ? data.battleHistory : [];
        this.statsHistory = Array.isArray(data.statsHistory) ? data.statsHistory : [];
        this.isSick = Boolean(data.isSick);
        this.sicknessDuration = Number(data.sicknessDuration) || 0;
        this.personalityTraits = data.personalityTraits || this._initializePersonality();
        this.discipline = Number(data.discipline) || 100;
        this.cleanliness = Number(data.cleanliness) || 100;
        this.tier = data.tier || 'free';
        this.features = this._getFeatures(this.tier);
    }

    /**
     * Update stats based on elapsed time
     * @returns {object|null} Time away info if significant time passed
     */
    updateStatsFromTimePassed() {
        const now = Date.now();
        const timePassed = now - this.lastUpdateTime;
        const minutesPassed = timePassed / (1000 * 60);
        
        const oldStats = {
            health: this.health,
            hunger: this.hunger,
            happiness: this.happiness,
            energy: this.energy
        };
        
        this._applyStatDecay(minutesPassed);
        this._updateAge();
        this.checkEvolution();
        
        this.lastUpdateTime = now;
        this.save();
        
        // Return time away summary if needed
        if (minutesPassed > 5) {
            return {
                timePassed: minutesPassed,
                oldStats: oldStats,
                needsAttention: this.health < 50 || this.hunger < 50 || this.happiness < 50
            };
        }
        
        return null;
    }

    /**
     * Apply stat decay based on config rates
     * @private
     */
    _applyStatDecay(minutesPassed) {
        const rates = CONFIG.DECAY_RATES || {};
        
        if (!this.isSleeping) {
            this.hunger = Math.max(0, this.hunger - (minutesPassed * (rates.hunger || 0.5)));
            this.happiness = Math.max(0, this.happiness - (minutesPassed * (rates.happiness || 0.3)));
            this.energy = Math.max(0, this.energy - (minutesPassed * (rates.energy || 0.2)));
            this.cleanliness = Math.max(0, this.cleanliness - (minutesPassed * (rates.cleanliness || 0.4)));
            this.discipline = Math.max(0, this.discipline - (minutesPassed * (rates.discipline || 0.1)));
        } else {
            // Restore energy while sleeping
            const sleepRate = CONFIG.RESTORATION_RATES?.energy?.sleeping || 1.0;
            this.energy = Math.min(100, this.energy + (minutesPassed * sleepRate));
        }
        
        // Health affected by low hunger
        if (this.hunger < 30) {
            const healthDecay = rates.health?.lowHunger || 0.5;
            this.health = Math.max(0, this.health - (minutesPassed * healthDecay));
        }
    }

    /**
     * Update pet age
     * @private
     */
    _updateAge() {
        const daysPassed = (Date.now() - this.birthTime) / (1000 * 60 * 60 * 24);
        this.age = Math.floor(daysPassed);
    }

    /**
     * Check and handle evolution based on config
     */
    checkEvolution() {
        const stages = CONFIG.EVOLUTION?.stages || {};
        const currentStageData = stages[this.stage];
        
        if (!currentStageData || !currentStageData.next) {
            return; // Already at final stage or invalid stage
        }
        
        const daysPassed = (Date.now() - this.birthTime) / (1000 * 60 * 60 * 24);
        
        if (daysPassed >= currentStageData.threshold) {
            const oldStage = this.stage;
            this.stage = currentStageData.next;
            this.onEvolution(oldStage, this.stage);
        }
    }

    /**
     * Handle evolution event
     * @param {string} fromStage - Previous stage
     * @param {string} toStage - New stage
     */
    onEvolution(fromStage, toStage) {
        const bonus = CONFIG.EVOLUTION?.onEvolution?.levelBonus || 1;
        this.level += bonus;
        
        showNotification(`🎉 Your pet evolved from ${fromStage} to ${toStage}!`, 'success');
        this.save();
        
        // Extensibility point: emit event for listeners
        this._emitEvent('evolution', { fromStage, toStage });
    }

    /**
     * Emit custom event for extensibility
     * @private
     */
    _emitEvent(eventName, data) {
        if (typeof window !== 'undefined' && typeof window.CustomEvent === 'function') {
            const event = new window.CustomEvent(`pet:${eventName}`, { detail: data });
            window.dispatchEvent(event);
        }
    }

    /**
     * Get evolution progress information
     * @returns {object|null} Evolution progress data
     */
    getEvolutionProgress() {
        const stages = CONFIG.EVOLUTION?.stages || {};
        const currentStageData = stages[this.stage];
        
        if (!currentStageData || !currentStageData.next) {
            return null; // Already at final stage
        }
        
        const daysPassed = (Date.now() - this.birthTime) / (1000 * 60 * 60 * 24);
        
        // Find previous threshold
        const stageOrder = Object.keys(stages);
        const currentIndex = stageOrder.indexOf(this.stage);
        const previousThreshold = currentIndex > 0 
            ? stages[stageOrder[currentIndex - 1]].threshold 
            : 0;
        
        const progress = ((daysPassed - previousThreshold) / 
                         (currentStageData.threshold - previousThreshold)) * 100;
        const timeRemaining = (currentStageData.threshold - daysPassed) * 24 * 60; // in minutes
        
        return {
            nextStage: currentStageData.next,
            nextStageName: stages[currentStageData.next]?.displayName || currentStageData.next,
            progress: Math.min(100, Math.max(0, progress)),
            timeRemaining: Math.max(0, timeRemaining)
        };
    }

    /**
     * Perform action with config-driven effects
     * @param {string} actionName - Name of action from config
     * @returns {boolean} Success status
     */
    performAction(actionName) {
        const action = CONFIG.ACTIONS?.[actionName];
        if (!action) {
            console.error(`Unknown action: ${actionName}`);
            return false;
        }
        
        // Check if sleeping blocks this action
        if (this.isSleeping && action.sleepingBlocked) {
            showNotification('💤 Your pet is sleeping!', 'warning');
            return false;
        }
        
        // Check minimum requirements
        if (action.minEnergy && this.energy < action.minEnergy) {
            showNotification('😴 Your pet is too tired!', 'warning');
            return false;
        }
        
        if (action.minHunger && this.hunger >= action.minHunger) {
            showNotification('🍖 Your pet is not hungry!', 'info');
            return false;
        }
        
        // Apply effects
        this._applyActionEffects(action);
        this.save();
        
        return true;
    }

    /**
     * Apply action effects from config
     * @private
     */
    _applyActionEffects(action) {
        if (action.hunger !== undefined) {
            this.hunger = this._validateStat(this.hunger + action.hunger);
        }
        if (action.happiness !== undefined) {
            this.happiness = this._validateStat(this.happiness + action.happiness);
        }
        if (action.health !== undefined) {
            this.health = this._validateStat(this.health + action.health);
        }
        if (action.energy !== undefined) {
            this.energy = this._validateStat(this.energy + action.energy);
        }
        if (action.cleanliness !== undefined) {
            this.cleanliness = typeof action.cleanliness === 'number' && action.cleanliness === 100
                ? 100  // Set to max
                : this._validateStat(this.cleanliness + action.cleanliness);
        }
        if (action.level !== undefined) {
            this.level += action.level;
        }
    }

    // Legacy method wrappers for backward compatibility
    feed() {
        const success = this.performAction('feed');
        if (success) showNotification('🍖 Fed your pet!', 'success');
        return success;
    }

    play() {
        const success = this.performAction('play');
        if (success) showNotification('🎮 Played with your pet!', 'success');
        return success;
    }

    train() {
        const success = this.performAction('train');
        if (success) showNotification('💪 Your pet trained hard!', 'success');
        return success;
    }

    clean() {
        const success = this.performAction('clean');
        if (success) showNotification('🧹 Your pet is clean and happy!', 'success');
        return success;
    }

    sleep() {
        this.isSleeping = !this.isSleeping;
        showNotification(
            this.isSleeping ? '💤 Your pet is now sleeping...' : '☀️ Your pet woke up!'
        );
        this.save();
        return true;
    }

    wakeUp() {
        if (this.isSleeping) {
            this.isSleeping = false;
            showNotification('☀️ Your pet woke up!');
            this.save();
        }
        return true;
    }

    /**
     * Get battle stats with config-driven calculations
     * @returns {object} Battle stats
     */
    getBattleStats() {
        const battleConfig = CONFIG.BATTLE?.baseStats || {};
        
        const attackConfig = battleConfig.attack || { base: 10, perLevel: 5 };
        const defenseConfig = battleConfig.defense || { base: 5, perLevel: 3 };
        const hpConfig = battleConfig.hp || { base: 50, perLevel: 10 };
        
        const baseAttack = attackConfig.base + (this.level * attackConfig.perLevel);
        const baseDefense = defenseConfig.base + (this.level * defenseConfig.perLevel);
        const baseHP = hpConfig.base + (this.level * hpConfig.perLevel);
        
        // Apply condition multiplier if configured
        let multiplier = 1.0;
        if (CONFIG.BATTLE?.conditionMultiplier) {
            multiplier = (this.health + this.hunger + this.happiness + this.energy) / 400;
        }
        
        // Apply premium tier multiplier if applicable
        const tierMultiplier = this.features.coinMultiplier || 1.0;
        
        return {
            maxHP: Math.floor(baseHP),
            currentHP: Math.floor(baseHP),
            attack: Math.floor(baseAttack * multiplier),
            defense: Math.floor(baseDefense * multiplier),
            level: Math.floor(this.level),
            tierMultiplier: tierMultiplier
        };
    }

    /**
     * Update stats after battle using config
     * @param {boolean} won - Whether battle was won
     * @param {string} opponentName - Opponent's name
     */
    updateAfterBattle(won, opponentName = 'Opponent') {
        const battleConfig = CONFIG.BATTLE || {};
        
        if (won) {
            const victory = battleConfig.victory || {};
            this.wins += victory.winsIncrement || 1;
            this.level += victory.levelBonus || 0.5;
            this.happiness = Math.min(100, this.happiness + (victory.happiness || 10));
            this.energy = Math.max(0, this.energy + (victory.energy || -30));
            showNotification('🏆 Victory! Your pet gained experience!', 'success');
        } else {
            const defeat = battleConfig.defeat || {};
            this.happiness = Math.max(0, this.happiness + (defeat.happiness || -10));
            this.health = Math.max(0, this.health + (defeat.health || -10));
            this.energy = Math.max(0, this.energy + (defeat.energy || -30));
            showNotification('💔 Defeat! Your pet needs care.', 'error');
        }
        
        this.recordBattle(won, opponentName);
        this.save();
    }

    /**
     * Record battle in history with limits from config
     */
    recordBattle(won, opponentName) {
        const battleRecord = {
            date: Date.now(),
            won: won,
            opponent: opponentName,
            petLevel: Math.floor(this.level),
            timestamp: new Date().toLocaleString()
        };
        
        this.battleHistory.unshift(battleRecord);
        
        const limit = CONFIG.STORAGE?.battleHistory || 10;
        if (this.battleHistory.length > limit) {
            this.battleHistory = this.battleHistory.slice(0, limit);
        }
    }

    /**
     * Record stats snapshot for history
     */
    recordStatsSnapshot() {
        const snapshot = {
            timestamp: Date.now(),
            health: this.health,
            hunger: this.hunger,
            happiness: this.happiness,
            energy: this.energy,
            level: this.level
        };
        
        this.statsHistory.push(snapshot);
        
        // Limit based on time, not count
        const ageLimit = CONFIG.STORAGE?.statsHistory || (24 * 60 * 60 * 1000);
        const cutoff = Date.now() - ageLimit;
        this.statsHistory = this.statsHistory.filter(s => s.timestamp > cutoff);
    }

    /**
     * Get stats history
     * @returns {Array} Stats history array
     */
    getStatsHistory() {
        return this.statsHistory;
    }

    /**
     * Check for sickness using config-driven probabilities
     */
    checkSickness() {
        const sickConfig = CONFIG.SICKNESS || {};
        const chances = sickConfig.chances || {};
        
        if (!this.isSick) {
            const avgStats = (this.health + this.hunger + this.happiness + this.energy) / 4;
            
            let sicknessChance = 0;
            
            if (avgStats < (chances.veryLowStats?.threshold || 20)) {
                sicknessChance = chances.veryLowStats?.chance || 0.3;
            } else if (avgStats < (chances.lowStats?.threshold || 30)) {
                sicknessChance = chances.lowStats?.chance || 0.1;
            }
            
            if (this.cleanliness < (chances.lowCleanliness?.threshold || 30)) {
                sicknessChance += chances.lowCleanliness?.chance || 0.15;
            }
            
            if (Math.random() < sicknessChance) {
                this.isSick = true;
                this.sicknessDuration = 0;
                showNotification('🤒 Your pet is sick! Give it medicine or improve stats.', 'warning');
            }
        } else {
            this.sicknessDuration++;
            const avgStats = (this.health + this.hunger + this.happiness + this.energy) / 4;
            
            const recovery = sickConfig.recovery || {};
            if (avgStats > (recovery.minAvgStats || 70) && 
                this.sicknessDuration > (recovery.minDuration || 10)) {
                this.isSick = false;
                this.sicknessDuration = 0;
                showNotification('✨ Your pet has recovered!', 'success');
            }
        }
    }

    /**
     * Give medicine to cure sickness
     * @returns {boolean} Success status
     */
    giveMedicine() {
        if (this.isSick) {
            this.isSick = false;
            this.sicknessDuration = 0;
            this.health = Math.min(100, this.health + 20);
            showNotification('💊 Medicine administered! Your pet is recovering.', 'success');
            this.save();
            return true;
        } else {
            showNotification('ℹ️ Your pet is not sick!', 'info');
            return false;
        }
    }

    /**
     * Update personality based on config-driven changes
     * @param {string} actionType - Type of action
     */
    updatePersonality(actionType) {
        const updates = CONFIG.PERSONALITY?.updates?.[actionType];
        if (!updates) return;
        
        Object.entries(updates).forEach(([trait, change]) => {
            if (this.personalityTraits[trait] !== undefined) {
                this.personalityTraits[trait] = this._validateStat(
                    this.personalityTraits[trait] + change
                );
            }
        });
    }

    /**
     * Get personality description
     * @returns {string} Personality description
     */
    getPersonalityDescription() {
        const traits = this.personalityTraits;
        const description = [];
        
        Object.entries(traits).forEach(([trait, value]) => {
            if (value > 70) {
                description.push(trait.charAt(0).toUpperCase() + trait.slice(1));
            }
        });
        
        return description.length > 0 ? description.join(', ') : 'Balanced';
    }

    /**
     * Reset pet to initial state
     */
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
        this.battleHistory = [];
        this.statsHistory = [];
        this.isSick = false;
        this.sicknessDuration = 0;
        this.personalityTraits = this._initializePersonality();
        this.discipline = 100;
        this.cleanliness = 100;
        this.save();
    }

    /**
     * Export pet data for serialization
     * @returns {object} Pet data object
     */
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
            wins: this.wins,
            tier: this.tier
        };
    }
}

// Keep old class name for compatibility
const Pet = EnhancedPet;

// Notification helper (preserved from original)
function showNotification(message, type = 'info') {
    if (typeof document === 'undefined') return;
    
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.classList.remove('success', 'warning', 'error', 'info');
    notification.classList.add(type, 'show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Export for testing and modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Pet, EnhancedPet };
}
