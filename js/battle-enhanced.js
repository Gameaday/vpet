/**
 * Enhanced Battle System - Config-Driven Implementation
 * Professional, extensible battle mechanics
 */

// Load configuration
/* global BattleConfig */
let CONFIG;
try {
    CONFIG = typeof BattleConfig !== 'undefined' ? BattleConfig : require('./battle-config.js');
} catch {
    // Fallback config
    CONFIG = {
        DAMAGE: { baseMultiplier: 1.0, randomVariance: 0.2, criticalChance: 0.1 },
        TIMING: { turnDelay: 1000 },
        AI: { strategies: { balanced: { attackChance: 0.5, defendChance: 0.3, specialChance: 0.2 } } }
    };
}

class EnhancedBattle {
    constructor(playerPet, opponentPet, config = CONFIG) {
        this.playerPet = playerPet;
        this.opponentPet = opponentPet;
        this.playerStats = playerPet.getBattleStats();
        this.opponentStats = opponentPet.getBattleStats();
        this.turn = 'player';
        this.isActive = true;
        this.log = [];
        this.playerDefending = false;
        this.opponentDefending = false;
        this.onTurnComplete = null;
        this.config = config;
    }

    /**
     * Calculate damage with config-driven mechanics
     * @private
     */
    _calculateDamage(attack, defense, isDefending, isSpecial = false, isCritical = false) {
        const damageConfig = this.config.DAMAGE || {};
        
        // Base damage calculation
        let baseDamage = Math.max(1, attack - defense);
        
        // Apply multipliers
        let multiplier = damageConfig.baseMultiplier || 1.0;
        
        if (isSpecial) {
            multiplier *= damageConfig.specialMultiplier || 1.3;
        }
        
        if (isCritical) {
            multiplier *= damageConfig.criticalMultiplier || 1.5;
        }
        
        if (isDefending) {
            multiplier *= damageConfig.defendMultiplier || 0.5;
        }
        
        // Apply random variance
        const variance = damageConfig.randomVariance || 0.2;
        const randomFactor = 1 + ((Math.random() * 2 - 1) * variance);
        
        return Math.max(1, Math.floor(baseDamage * multiplier * randomFactor));
    }

    /**
     * Check for critical hit
     * @private
     */
    _isCriticalHit() {
        const critChance = this.config.DAMAGE?.criticalChance || 0.1;
        return Math.random() < critChance;
    }

    /**
     * Add message to battle log
     * @private
     */
    _addLog(message) {
        this.log.push(message);
    }

    /**
     * Get message template and replace placeholders
     * @private
     */
    _getMessage(category, type, data = {}) {
        const messages = this.config.MESSAGES || {};
        const template = messages[category]?.[type] || '';
        
        // Replace placeholders
        return template.replace(/\{(\w+)\}/g, (match, key) => data[key] || match);
    }

    /**
     * Player attacks
     */
    playerAttack() {
        if (this.turn !== 'player' || !this.isActive) return;
        
        const isCrit = this._isCriticalHit();
        const damage = this._calculateDamage(
            this.playerStats.attack,
            this.opponentStats.defense,
            this.opponentDefending,
            false,
            isCrit
        );
        
        this.opponentStats.currentHP = Math.max(0, this.opponentStats.currentHP - damage);
        
        const messageType = isCrit ? 'playerCrit' : 'player';
        this._addLog(this._getMessage('attack', messageType, { damage }));
        
        this.opponentDefending = false;
        
        if (this.checkBattleEnd()) return;
        
        this._nextTurn('opponent');
    }

    /**
     * Player defends
     */
    playerDefend() {
        if (this.turn !== 'player' || !this.isActive) return;
        
        this.playerDefending = true;
        this._addLog(this._getMessage('defend', 'player'));
        
        this._nextTurn('opponent');
    }

    /**
     * Player uses special attack
     */
    playerSpecial() {
        if (this.turn !== 'player' || !this.isActive) return;
        
        const isCrit = this._isCriticalHit();
        const damage = this._calculateDamage(
            this.playerStats.attack,
            this.opponentStats.defense,
            this.opponentDefending,
            true,
            isCrit
        );
        
        this.opponentStats.currentHP = Math.max(0, this.opponentStats.currentHP - damage);
        
        const messageType = isCrit ? 'playerCrit' : 'player';
        this._addLog(this._getMessage('special', messageType, { damage }));
        
        this.opponentDefending = false;
        
        if (this.checkBattleEnd()) return;
        
        this._nextTurn('opponent');
    }

    /**
     * Advance to next turn
     * @private
     */
    _nextTurn(nextTurn) {
        this.turn = nextTurn;
        const turnDelay = this.config.TIMING?.turnDelay || 1000;
        
        if (nextTurn === 'opponent') {
            setTimeout(() => this.opponentTurn(), turnDelay);
        }
        
        if (this.onTurnComplete) {
            this.onTurnComplete();
        }
    }

    /**
     * Opponent's turn (AI)
     */
    opponentTurn() {
        if (this.turn !== 'opponent' || !this.isActive) return;
        
        const action = this._determineOpponentAction();
        
        switch (action) {
            case 'attack':
                this._opponentAttack();
                break;
            case 'defend':
                this._opponentDefend();
                break;
            case 'special':
                this._opponentSpecial();
                break;
        }
        
        if (this.checkBattleEnd()) return;
        
        this._nextTurn('player');
    }

    /**
     * Determine AI action based on strategy
     * @private
     */
    _determineOpponentAction() {
        const aiConfig = this.config.AI || {};
        const strategies = aiConfig.strategies || {};
        
        // Check HP and adjust strategy
        const hpPercent = this.opponentStats.currentHP / this.opponentStats.maxHP;
        const lowHPThreshold = aiConfig.lowHPThreshold || 0.3;
        
        const strategyName = hpPercent < lowHPThreshold 
            ? (aiConfig.lowHPStrategy || 'defensive')
            : (aiConfig.defaultStrategy || 'balanced');
        
        const strategy = strategies[strategyName] || strategies.balanced;
        
        // Roll action based on probabilities
        const roll = Math.random();
        if (roll < strategy.attackChance) return 'attack';
        if (roll < strategy.attackChance + strategy.defendChance) return 'defend';
        return 'special';
    }

    /**
     * Opponent attacks
     * @private
     */
    _opponentAttack() {
        const isCrit = this._isCriticalHit();
        const damage = this._calculateDamage(
            this.opponentStats.attack,
            this.playerStats.defense,
            this.playerDefending,
            false,
            isCrit
        );
        
        this.playerStats.currentHP = Math.max(0, this.playerStats.currentHP - damage);
        
        const messageType = isCrit ? 'opponentCrit' : 'opponent';
        this._addLog(this._getMessage('attack', messageType, { damage }));
        
        this.playerDefending = false;
    }

    /**
     * Opponent defends
     * @private
     */
    _opponentDefend() {
        this.opponentDefending = true;
        this._addLog(this._getMessage('defend', 'opponent'));
    }

    /**
     * Opponent uses special
     * @private
     */
    _opponentSpecial() {
        const isCrit = this._isCriticalHit();
        const damage = this._calculateDamage(
            this.opponentStats.attack,
            this.playerStats.defense,
            this.playerDefending,
            true,
            isCrit
        );
        
        this.playerStats.currentHP = Math.max(0, this.playerStats.currentHP - damage);
        
        const messageType = isCrit ? 'opponentCrit' : 'opponent';
        this._addLog(this._getMessage('special', messageType, { damage }));
        
        this.playerDefending = false;
    }

    /**
     * Calculate damage (legacy method for compatibility)
     */
    calculateDamage(attack, defense, isDefending) {
        return this._calculateDamage(attack, defense, isDefending);
    }

    /**
     * Add to battle log (legacy method)
     */
    addLog(message) {
        this._addLog(message);
    }

    /**
     * Check if battle has ended
     */
    checkBattleEnd() {
        if (this.playerStats.currentHP <= 0 && this.opponentStats.currentHP <= 0) {
            this._addLog(this._getMessage('draw', 'draw'));
            this.isActive = false;
            return true;
        }
        
        if (this.playerStats.currentHP <= 0) {
            this._addLog(this.config.MESSAGES?.defeat || 'Defeat!');
            this.isActive = false;
            return true;
        }
        
        if (this.opponentStats.currentHP <= 0) {
            this._addLog(this.config.MESSAGES?.victory || 'Victory!');
            this.isActive = false;
            return true;
        }
        
        return false;
    }

    /**
     * Check if player won
     */
    playerWon() {
        return !this.isActive && this.playerStats.currentHP > 0;
    }
}

// Keep old class name for backward compatibility
const Battle = EnhancedBattle;

/**
 * Generate AI opponent based on player's level
 * Config-driven opponent generation
 */
function generateOpponent(playerLevel) {
    const opponentConfig = CONFIG.OPPONENT || {};
    const levelVariance = opponentConfig.levelVariance || 1;
    const names = opponentConfig.names || ['Wild Digimon', 'Rival Pet'];
    
    const varianceRange = Math.floor(Math.random() * (levelVariance * 2 + 1)) - levelVariance;
    const opponentLevel = Math.max(1, playerLevel + varianceRange);
    const opponentName = names[Math.floor(Math.random() * names.length)];
    
    // Create fake pet object for opponent
    const opponentPet = {
        name: opponentName,
        level: opponentLevel,
        getBattleStats: function() {
            const baseAttack = 10 + (this.level * 5);
            const baseDefense = 5 + (this.level * 3);
            const baseHP = 50 + (this.level * 10);
            
            return {
                maxHP: Math.floor(baseHP),
                currentHP: Math.floor(baseHP),
                attack: Math.floor(baseAttack),
                defense: Math.floor(baseDefense),
                level: Math.floor(this.level)
            };
        }
    };
    
    return opponentPet;
}

// Export for testing and modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Battle, EnhancedBattle, generateOpponent };
}
