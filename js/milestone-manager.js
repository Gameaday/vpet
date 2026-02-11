/**
 * Milestone Manager Module
 * Tracks achievements and milestones
 */

class MilestoneManager {
    constructor(config = {}) {
        this.config = config.MILESTONES || {};
        this.firstActions = this._loadFirstActions();
    }
    
    /**
     * Load saved first actions from localStorage
     * @private
     */
    _loadFirstActions() {
        try {
            const saved = localStorage.getItem('vpet_first_actions');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    }
    
    /**
     * Save first actions to localStorage
     * @private
     */
    _saveFirstActions() {
        try {
            localStorage.setItem('vpet_first_actions', JSON.stringify(this.firstActions));
        } catch (error) {
            console.error('Error saving first actions:', error);
        }
    }
    
    /**
     * Check and trigger milestones for an action
     * @param {string} action - Action type
     * @param {object} pet - Pet instance
     * @param {Function} onAchievement - Callback when achievement is unlocked
     */
    check(action, pet, onAchievement) {
        // Check first time action
        if (!this.firstActions[action]) {
            this.firstActions[action] = true;
            this._saveFirstActions();
            this._triggerFirstAction(action, onAchievement);
        }
        
        // Check count-based milestones
        this._checkCountMilestones(action, pet, onAchievement);
        
        // Check level milestones
        if (action === 'level') {
            this._checkLevelMilestones(pet, onAchievement);
        }
        
        // Check evolution milestones
        if (action === 'evolution') {
            this._checkEvolutionMilestones(pet, onAchievement);
        }
    }
    
    /**
     * Trigger first action achievement
     * @private
     */
    _triggerFirstAction(action, onAchievement) {
        const messages = {
            feed: { title: 'First Meal!', message: 'You fed your pet for the first time!', emoji: '🍖' },
            play: { title: 'Play Time!', message: 'You played with your pet for the first time!', emoji: '🎮' },
            train: { title: 'Training Begins!', message: 'Your pet started training!', emoji: '💪' },
            battle: { title: 'First Battle!', message: 'Your pet entered their first battle!', emoji: '⚔️' },
            clean: { title: 'Squeaky Clean!', message: 'You cleaned your pet for the first time!', emoji: '🧹' }
        };
        
        const achievement = messages[action];
        if (achievement && onAchievement) {
            onAchievement(achievement.title, achievement.message, achievement.emoji);
        }
    }
    
    /**
     * Check count-based milestones
     * @private
     */
    _checkCountMilestones(action, pet, onAchievement) {
        const milestones = this.config[action];
        if (!milestones || !Array.isArray(milestones)) return;
        
        // Determine current count based on action
        let currentCount = 0;
        switch (action) {
            case 'battle':
                currentCount = pet.wins || 0;
                break;
            case 'feed':
            case 'play':
            case 'train':
            case 'clean':
                // Would need to track these separately in pet data
                // For now, skip count-based for these
                return;
        }
        
        // Check if current count matches a milestone
        if (milestones.includes(currentCount) && onAchievement) {
            const titles = {
                battle: `Battle Master ${currentCount}!`,
                feed: `Fed ${currentCount} times!`,
                play: `Played ${currentCount} times!`,
                train: `Trained ${currentCount} times!`,
                clean: `Cleaned ${currentCount} times!`
            };
            
            onAchievement(
                titles[action] || `Milestone ${currentCount}!`,
                `You've ${action}ed ${currentCount} times!`,
                '🏆'
            );
        }
    }
    
    /**
     * Check level milestones
     * @private
     */
    _checkLevelMilestones(pet, onAchievement) {
        const milestones = this.config.level || [5, 10, 20, 50, 100];
        const level = Math.floor(pet.level);
        
        if (milestones.includes(level) && onAchievement) {
            onAchievement(
                `Level ${level} Reached!`,
                `Your pet has reached level ${level}!`,
                '⭐'
            );
        }
    }
    
    /**
     * Check evolution milestones
     * @private
     */
    _checkEvolutionMilestones(pet, onAchievement) {
        const milestones = this.config.evolution || ['baby', 'child', 'teen', 'adult'];
        
        if (milestones.includes(pet.stage) && onAchievement) {
            const stageNames = {
                baby: 'Baby',
                child: 'Child',
                teen: 'Teen',
                adult: 'Adult'
            };
            
            onAchievement(
                `Evolved to ${stageNames[pet.stage] || pet.stage}!`,
                `Your pet has evolved to the ${pet.stage} stage!`,
                '🎉'
            );
        }
    }
    
    /**
     * Check if first visit
     * @returns {boolean}
     */
    isFirstVisit() {
        const hasVisited = localStorage.getItem('vpet_has_visited');
        if (!hasVisited) {
            localStorage.setItem('vpet_has_visited', 'true');
            return true;
        }
        return false;
    }
    
    /**
     * Reset all milestones (for testing or reset)
     */
    reset() {
        this.firstActions = {};
        this._saveFirstActions();
        localStorage.removeItem('vpet_has_visited');
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MilestoneManager;
}
