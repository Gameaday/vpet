/**
 * Battle Configuration Module
 * Centralized configuration for battle system
 */

const BattleConfig = {
    // Damage calculation
    DAMAGE: {
        baseMultiplier: 1.0,
        randomVariance: 0.2,      // ±20% variance
        criticalChance: 0.1,      // 10% critical hit chance
        criticalMultiplier: 1.5,  // 1.5x damage on crit
        defendMultiplier: 0.5,    // 50% damage reduction when defending
        specialMultiplier: 1.3    // 1.3x damage for special attacks
    },
    
    // Turn timing
    TIMING: {
        turnDelay: 1000,          // 1 second between turns
        actionDelay: 500,         // 0.5 second action animation
        battleEndDelay: 2000      // 2 seconds before closing after end
    },
    
    // AI behavior
    AI: {
        strategies: {
            aggressive: {
                attackChance: 0.7,
                defendChance: 0.1,
                specialChance: 0.2
            },
            balanced: {
                attackChance: 0.5,
                defendChance: 0.3,
                specialChance: 0.2
            },
            defensive: {
                attackChance: 0.3,
                defendChance: 0.5,
                specialChance: 0.2
            }
        },
        defaultStrategy: 'balanced',
        lowHPThreshold: 0.3,      // Switch to defensive below 30% HP
        lowHPStrategy: 'defensive'
    },
    
    // Opponent generation
    OPPONENT: {
        levelVariance: 1,         // ±1 level from player
        names: [
            'Wild Digimon',
            'Rival Pet',
            'Shadow Beast',
            'Digital Monster',
            'Pixel Creature',
            'Cyber Pet',
            'Tech Beast',
            'Byte Buddy',
            'Data Dragon',
            'Code Companion'
        ]
    },
    
    // Battle log messages
    MESSAGES: {
        attack: {
            player: 'Your pet attacks for {damage} damage!',
            opponent: 'Opponent attacks for {damage} damage!',
            playerCrit: 'Critical hit! Your pet deals {damage} damage!',
            opponentCrit: 'Critical hit! Opponent deals {damage} damage!'
        },
        defend: {
            player: 'Your pet takes a defensive stance!',
            opponent: 'Opponent is defending!'
        },
        special: {
            player: 'Your pet uses a special attack for {damage} damage!',
            opponent: 'Opponent uses a special attack for {damage} damage!',
            playerCrit: 'Devastating special! Your pet deals {damage} damage!',
            opponentCrit: 'Devastating special! Opponent deals {damage} damage!'
        },
        victory: 'Victory! Your pet won the battle!',
        defeat: 'Defeat! Your pet lost the battle.',
        draw: 'The battle ended in a draw!'
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BattleConfig;
}
