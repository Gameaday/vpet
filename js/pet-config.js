/**
 * Pet Configuration Module
 * Centralized configuration for pet stats, evolution, and features
 * Supports tiered features and easy extensibility
 */

const PetConfig = {
    // Stat decay rates (per minute)
    DECAY_RATES: {
        hunger: 0.5,
        happiness: 0.3,
        energy: 0.2,
        cleanliness: 0.4,
        discipline: 0.1,
        health: {
            lowHunger: 0.5  // Applied when hunger < 30
        }
    },
    
    // Stat restoration rates
    RESTORATION_RATES: {
        energy: {
            sleeping: 1.0  // Per minute while sleeping
        }
    },
    
    // Action effects
    ACTIONS: {
        feed: {
            hunger: 30,
            happiness: 5,
            health: 5,
            minHunger: 90,  // Won't feed if hunger >= this
            sleepingBlocked: true
        },
        play: {
            happiness: 20,
            energy: -15,
            hunger: -10,
            minEnergy: 20,  // Need at least this much energy
            sleepingBlocked: true
        },
        train: {
            level: 0.1,
            energy: -25,
            hunger: -20,
            happiness: -5,
            minEnergy: 30,
            sleepingBlocked: true
        },
        clean: {
            cleanliness: 100,  // Sets to max
            happiness: 5,
            sleepingBlocked: false
        },
        sleep: {
            toggle: true  // Special case - toggles sleeping state
        }
    },
    
    // Evolution thresholds (in days)
    EVOLUTION: {
        stages: {
            egg: {
                next: 'baby',
                threshold: 0.01,  // ~15 minutes
                displayName: 'Egg'
            },
            baby: {
                next: 'child',
                threshold: 0.05,  // ~1 hour
                displayName: 'Baby'
            },
            child: {
                next: 'teen',
                threshold: 0.1,  // ~2.4 hours
                displayName: 'Child'
            },
            teen: {
                next: 'adult',
                threshold: 0.2,  // ~5 hours
                displayName: 'Teen'
            },
            adult: {
                next: null,
                threshold: null,
                displayName: 'Adult'
            }
        },
        onEvolution: {
            levelBonus: 1
        }
    },
    
    // Battle stat calculations
    BATTLE: {
        baseStats: {
            attack: {
                base: 10,
                perLevel: 5
            },
            defense: {
                base: 5,
                perLevel: 3
            },
            hp: {
                base: 50,
                perLevel: 10
            }
        },
        conditionMultiplier: true,  // Battle stats affected by pet condition
        victory: {
            winsIncrement: 1,
            levelBonus: 0.5,
            happiness: 10,
            energy: -30
        },
        defeat: {
            happiness: -10,
            health: -10,
            energy: -30
        }
    },
    
    // Sickness system
    SICKNESS: {
        chances: {
            veryLowStats: {
                threshold: 20,  // Average stats < this
                chance: 0.3
            },
            lowStats: {
                threshold: 30,
                chance: 0.1
            },
            lowCleanliness: {
                threshold: 30,
                chance: 0.15  // Added to base chance
            }
        },
        recovery: {
            minAvgStats: 70,
            minDuration: 10  // Check intervals
        }
    },
    
    // Personality system
    PERSONALITY: {
        traits: ['brave', 'friendly', 'energetic', 'disciplined'],
        defaultValue: 50,
        range: [0, 100],
        updates: {
            play: { friendly: 2, energetic: 1 },
            train: { disciplined: 2, brave: 1 },
            battle: { brave: 2 }
        }
    },
    
    // Storage limits
    STORAGE: {
        battleHistory: 10,  // Keep last N battles
        statsHistory: 24 * 60 * 60 * 1000  // Keep last 24 hours (ms)
    },
    
    // Feature tiers (for monetization)
    FEATURES: {
        free: {
            maxPets: 1,
            customNames: true,
            emojiInNames: false,
            themes: ['dark', 'light'],
            coinMultiplier: 1.0,
            priorityMatchmaking: false,
            exclusiveEvolutions: false,
            statsHistory: true,
            cloudSync: false
        },
        basic: {
            maxPets: 3,
            customNames: true,
            emojiInNames: true,
            themes: ['dark', 'light', 'retro', 'neon'],
            coinMultiplier: 2.0,
            priorityMatchmaking: true,
            exclusiveEvolutions: false,
            statsHistory: true,
            cloudSync: false
        },
        premium: {
            maxPets: 10,
            customNames: true,
            emojiInNames: true,
            themes: 'all',
            coinMultiplier: 3.0,
            priorityMatchmaking: true,
            exclusiveEvolutions: true,
            statsHistory: true,
            cloudSync: true
        }
    },
    
    // Validation rules
    VALIDATION: {
        stats: {
            min: 0,
            max: 100
        },
        level: {
            min: 1,
            max: 999
        },
        name: {
            maxLength: 50,
            minLength: 1,
            allowedPattern: /^[a-zA-Z0-9\s-_]+$/,  // Basic names for free tier
            premiumPattern: null  // In production, use server-side validation for emojis
        }
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PetConfig;
}
