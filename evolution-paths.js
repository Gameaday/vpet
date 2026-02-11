/**
 * Evolution Paths Module
 * Manages multiple evolution branches based on care style
 */

/**
 * Evolution path types
 */
const EvolutionPath = {
    POWER: 'power',      // Battle-focused path
    CARE: 'care',        // Care-focused path
    BALANCED: 'balanced', // Balanced path
    NEGLECT: 'neglect'   // Neglect path
};

/**
 * Evolution stages with multiple branches
 */
const EVOLUTION_PATHS = {
    egg: {
        name: 'Egg',
        sprite: '🥚',
        minAge: 0,
        nextStages: ['baby']
    },
    
    // Baby stage (universal)
    baby: {
        name: 'Baby',
        sprite: '🐣',
        minAge: 900000, // 15 minutes
        nextStages: ['child_power', 'child_care', 'child_balanced', 'child_neglect']
    },
    
    // Child stage branches
    child_power: {
        name: 'Warrior Child',
        sprite: '⚔️',
        path: EvolutionPath.POWER,
        minAge: 3600000, // 1 hour
        description: 'Battle-focused child with high strength',
        statModifiers: { attack: 1.2, defense: 1.1 },
        requirements: {
            battleWins: 3,
            trainingCount: 5
        },
        nextStages: ['teen_power']
    },
    child_care: {
        name: 'Happy Child',
        sprite: '😊',
        path: EvolutionPath.CARE,
        minAge: 3600000,
        description: 'Well-cared child with high happiness',
        statModifiers: { happiness: 1.2, health: 1.1 },
        requirements: {
            avgHappiness: 70,
            avgHealth: 70
        },
        nextStages: ['teen_care']
    },
    child_balanced: {
        name: 'Smart Child',
        sprite: '🧠',
        path: EvolutionPath.BALANCED,
        minAge: 3600000,
        description: 'Balanced child with all-around stats',
        statModifiers: { all: 1.1 },
        requirements: {
            avgHappiness: 60,
            avgHealth: 60,
            battleWins: 2
        },
        nextStages: ['teen_balanced']
    },
    child_neglect: {
        name: 'Sad Child',
        sprite: '😢',
        path: EvolutionPath.NEGLECT,
        minAge: 3600000,
        description: 'Neglected child with lower stats',
        statModifiers: { all: 0.9 },
        requirements: {
            avgHappiness: 40,
            avgHealth: 40
        },
        nextStages: ['teen_neglect']
    },
    
    // Teen stage branches
    teen_power: {
        name: 'Battle Teen',
        sprite: '🥋',
        path: EvolutionPath.POWER,
        minAge: 8640000, // 2.4 hours
        description: 'Warrior teen ready for intense battles',
        statModifiers: { attack: 1.3, defense: 1.2 },
        requirements: {
            battleWins: 10,
            level: 5
        },
        nextStages: ['adult_power']
    },
    teen_care: {
        name: 'Gentle Teen',
        sprite: '🌸',
        path: EvolutionPath.CARE,
        minAge: 8640000,
        description: 'Caring teen with excellent health',
        statModifiers: { happiness: 1.3, health: 1.2 },
        requirements: {
            avgHappiness: 75,
            avgHealth: 75
        },
        nextStages: ['adult_care']
    },
    teen_balanced: {
        name: 'Scholar Teen',
        sprite: '📚',
        path: EvolutionPath.BALANCED,
        minAge: 8640000,
        description: 'Well-rounded teen with versatility',
        statModifiers: { all: 1.15 },
        requirements: {
            avgHappiness: 65,
            avgHealth: 65,
            battleWins: 5,
            level: 4
        },
        nextStages: ['adult_balanced']
    },
    teen_neglect: {
        name: 'Lonely Teen',
        sprite: '🌧️',
        path: EvolutionPath.NEGLECT,
        minAge: 8640000,
        description: 'Neglected teen seeking care',
        statModifiers: { all: 0.85 },
        requirements: {
            avgHappiness: 35,
            avgHealth: 35
        },
        nextStages: ['adult_neglect']
    },
    
    // Adult stage branches
    adult_power: {
        name: 'Battle Master',
        sprite: '🏆',
        path: EvolutionPath.POWER,
        minAge: 18000000, // 5 hours
        description: 'Ultimate warrior with devastating power',
        statModifiers: { attack: 1.5, defense: 1.3 },
        requirements: {
            battleWins: 25,
            level: 10
        },
        nextStages: ['mega_power']
    },
    adult_care: {
        name: 'Angel Pet',
        sprite: '😇',
        path: EvolutionPath.CARE,
        minAge: 18000000,
        description: 'Perfect companion with maximum happiness',
        statModifiers: { happiness: 1.5, health: 1.3 },
        requirements: {
            avgHappiness: 80,
            avgHealth: 80
        },
        nextStages: ['mega_care']
    },
    adult_balanced: {
        name: 'Wise Guardian',
        sprite: '🦉',
        path: EvolutionPath.BALANCED,
        minAge: 18000000,
        description: 'Perfectly balanced in all aspects',
        statModifiers: { all: 1.25 },
        requirements: {
            avgHappiness: 70,
            avgHealth: 70,
            battleWins: 15,
            level: 8
        },
        nextStages: ['mega_balanced']
    },
    adult_neglect: {
        name: 'Shadow Pet',
        sprite: '👻',
        path: EvolutionPath.NEGLECT,
        minAge: 18000000,
        description: 'Transformed by neglect into a mysterious form',
        statModifiers: { all: 0.8 },
        requirements: {
            // No specific requirements - default for neglect
        },
        nextStages: ['mega_neglect']
    },
    
    // Mega/Ultimate stages (optional end-game forms)
    mega_power: {
        name: 'Dragon Warrior',
        sprite: '🐉',
        path: EvolutionPath.POWER,
        minAge: 36000000, // 10 hours
        description: 'Legendary battle champion',
        statModifiers: { attack: 2.0, defense: 1.5 },
        requirements: {
            battleWins: 50,
            level: 20
        },
        nextStages: []
    },
    mega_care: {
        name: 'Divine Guardian',
        sprite: '✨',
        path: EvolutionPath.CARE,
        minAge: 36000000,
        description: 'Transcended to ultimate happiness',
        statModifiers: { happiness: 2.0, health: 1.5 },
        requirements: {
            avgHappiness: 90,
            avgHealth: 90,
            daysAlive: 3
        },
        nextStages: []
    },
    mega_balanced: {
        name: 'Phoenix Master',
        sprite: '🔥',
        path: EvolutionPath.BALANCED,
        minAge: 36000000,
        description: 'Perfect harmony of all attributes',
        statModifiers: { all: 1.5 },
        requirements: {
            avgHappiness: 80,
            avgHealth: 80,
            battleWins: 35,
            level: 18
        },
        nextStages: []
    },
    mega_neglect: {
        name: 'Void Entity',
        sprite: '🌑',
        path: EvolutionPath.NEGLECT,
        minAge: 36000000,
        description: 'Mysterious being from the darkness',
        statModifiers: { all: 1.0 },
        requirements: {
            // Exists as alternative mega form
        },
        nextStages: []
    }
};

/**
 * Evolution Manager
 * Handles evolution path tracking and determination
 */
class EvolutionManager {
    constructor() {
        this.evolutionHistory = [];
        this.evolutionInfluence = {
            power: 0,
            care: 0,
            balanced: 0
        };
        this.loadEvolutionData();
    }
    
    /**
     * Load evolution data from localStorage
     */
    loadEvolutionData() {
        const saved = localStorage.getItem('evolutionData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.evolutionHistory = data.history || [];
                this.evolutionInfluence = data.influence || { power: 0, care: 0, balanced: 0 };
            } catch (error) {
                console.error('Error loading evolution data:', error);
            }
        }
    }
    
    /**
     * Save evolution data to localStorage
     */
    saveEvolutionData() {
        const data = {
            history: this.evolutionHistory,
            influence: this.evolutionInfluence
        };
        localStorage.setItem('evolutionData', JSON.stringify(data));
    }
    
    /**
     * Record evolution event
     * @param {string} from - Previous stage
     * @param {string} to - New stage
     */
    recordEvolution(from, to) {
        this.evolutionHistory.push({
            from,
            to,
            timestamp: Date.now()
        });
        this.saveEvolutionData();
    }
    
    /**
     * Increase evolution influence
     * @param {string} pathType - Evolution path type
     * @param {number} amount - Amount to increase
     */
    addInfluence(pathType, amount = 1) {
        if (this.evolutionInfluence.hasOwnProperty(pathType)) {
            this.evolutionInfluence[pathType] += amount;
            this.saveEvolutionData();
        }
    }
    
    /**
     * Determine next evolution stage based on pet stats and care style
     * @param {Object} pet - Pet object with stats
     * @param {string} currentStage - Current evolution stage
     * @returns {string} Next evolution stage ID
     */
    determineNextStage(pet, currentStage) {
        const current = EVOLUTION_PATHS[currentStage];
        if (!current || current.nextStages.length === 0) {
            return currentStage; // No more evolutions
        }
        
        // If only one option, return it (like egg -> baby)
        if (current.nextStages.length === 1) {
            return current.nextStages[0];
        }
        
        // Calculate scores for each possible evolution
        const scores = {};
        
        for (const stageId of current.nextStages) {
            const stage = EVOLUTION_PATHS[stageId];
            let score = 0;
            
            // Check requirements
            const reqs = stage.requirements || {};
            
            // Battle wins requirement
            if (reqs.battleWins !== undefined) {
                const wins = pet.battleWins || 0;
                if (wins >= reqs.battleWins) {
                    score += 30;
                } else {
                    score -= 20;
                }
            }
            
            // Training count requirement
            if (reqs.trainingCount !== undefined) {
                const trainings = pet.trainingCount || 0;
                if (trainings >= reqs.trainingCount) {
                    score += 20;
                }
            }
            
            // Average happiness requirement
            if (reqs.avgHappiness !== undefined) {
                const happiness = pet.happiness || 50;
                if (happiness >= reqs.avgHappiness) {
                    score += 25;
                } else if (happiness < reqs.avgHappiness - 20) {
                    score -= 15;
                }
            }
            
            // Average health requirement
            if (reqs.avgHealth !== undefined) {
                const health = pet.health || 50;
                if (health >= reqs.avgHealth) {
                    score += 25;
                } else if (health < reqs.avgHealth - 20) {
                    score -= 15;
                }
            }
            
            // Level requirement
            if (reqs.level !== undefined) {
                const level = pet.level || 1;
                if (level >= reqs.level) {
                    score += 20;
                } else {
                    score -= 10;
                }
            }
            
            // Days alive requirement
            if (reqs.daysAlive !== undefined) {
                const days = (pet.age || 0) / (24 * 60 * 60 * 1000);
                if (days >= reqs.daysAlive) {
                    score += 30;
                }
            }
            
            // Add influence bonus
            if (stage.path) {
                const influence = this.evolutionInfluence[stage.path] || 0;
                score += influence * 5;
            }
            
            scores[stageId] = score;
        }
        
        // Find stage with highest score
        let bestStage = current.nextStages[0];
        let bestScore = scores[bestStage];
        
        for (const stageId of current.nextStages) {
            if (scores[stageId] > bestScore) {
                bestScore = scores[stageId];
                bestStage = stageId;
            }
        }
        
        return bestStage;
    }
    
    /**
     * Get evolution stage details
     * @param {string} stageId - Evolution stage ID
     * @returns {Object} Stage details
     */
    getStageDetails(stageId) {
        return EVOLUTION_PATHS[stageId] || null;
    }
    
    /**
     * Get all possible evolutions from current stage
     * @param {string} currentStage - Current stage ID
     * @returns {Array} Array of possible next stages
     */
    getPossibleEvolutions(currentStage) {
        const current = EVOLUTION_PATHS[currentStage];
        if (!current) return [];
        
        return current.nextStages.map(id => ({
            id,
            ...EVOLUTION_PATHS[id]
        }));
    }
    
    /**
     * Check if pet can evolve to specific stage
     * @param {Object} pet - Pet object
     * @param {string} stageId - Target stage ID
     * @returns {boolean} Can evolve
     */
    canEvolveToStage(pet, stageId) {
        const stage = EVOLUTION_PATHS[stageId];
        if (!stage) return false;
        
        // Check age requirement
        if (pet.age < stage.minAge) return false;
        
        // Check requirements
        const reqs = stage.requirements || {};
        
        if (reqs.battleWins && (pet.battleWins || 0) < reqs.battleWins) return false;
        if (reqs.trainingCount && (pet.trainingCount || 0) < reqs.trainingCount) return false;
        if (reqs.level && (pet.level || 1) < reqs.level) return false;
        if (reqs.avgHappiness && pet.happiness < reqs.avgHappiness) return false;
        if (reqs.avgHealth && pet.health < reqs.avgHealth) return false;
        
        return true;
    }
    
    /**
     * Get evolution history
     * @returns {Array} Evolution history
     */
    getHistory() {
        return [...this.evolutionHistory];
    }
    
    /**
     * Clear evolution data
     */
    clearData() {
        this.evolutionHistory = [];
        this.evolutionInfluence = { power: 0, care: 0, balanced: 0 };
        this.saveEvolutionData();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EvolutionPath,
        EVOLUTION_PATHS,
        EvolutionManager
    };
}
