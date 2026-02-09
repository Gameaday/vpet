/**
 * Social Features Module
 * Handles social sharing, leaderboards, and friend system
 */

class SocialFeatures {
    constructor() {
        this.leaderboard = this.loadLeaderboard();
    }

    /**
     * Load leaderboard from localStorage
     * @returns {Array} Leaderboard entries
     */
    loadLeaderboard() {
        try {
            const data = localStorage.getItem('vpet_leaderboard');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            return [];
        }
    }

    /**
     * Save leaderboard to localStorage
     */
    saveLeaderboard() {
        try {
            localStorage.setItem('vpet_leaderboard', JSON.stringify(this.leaderboard));
        } catch (error) {
            console.error('Failed to save leaderboard:', error);
        }
    }

    /**
     * Update leaderboard with current pet stats
     * @param {Pet} pet - Pet instance
     */
    updateLeaderboard(pet) {
        if (!pet || !pet.name) return;

        const entry = {
            name: pet.name,
            level: pet.level,
            stage: pet.stage,
            wins: pet.battleStats?.wins || 0,
            timestamp: Date.now()
        };

        // Remove old entry for this pet if exists
        this.leaderboard = this.leaderboard.filter(e => e.name !== pet.name);

        // Add new entry
        this.leaderboard.push(entry);

        // Sort by level (descending), then by wins
        this.leaderboard.sort((a, b) => {
            if (b.level !== a.level) return b.level - a.level;
            return b.wins - a.wins;
        });

        // Keep top 100
        this.leaderboard = this.leaderboard.slice(0, 100);

        this.saveLeaderboard();
    }

    /**
     * Get leaderboard entries
     * @param {number} limit - Number of entries to return
     * @returns {Array} Top leaderboard entries
     */
    getLeaderboard(limit = 10) {
        return this.leaderboard.slice(0, limit);
    }

    /**
     * Get pet rank
     * @param {string} petName - Pet name
     * @returns {number} Rank (1-indexed), or -1 if not found
     */
    getPetRank(petName) {
        const index = this.leaderboard.findIndex(e => e.name === petName);
        return index === -1 ? -1 : index + 1;
    }

    /**
     * Generate shareable text for pet
     * @param {Pet} pet - Pet instance
     * @returns {string} Shareable text
     */
    generateShareText(pet) {
        if (!pet) return '';

        const rank = this.getPetRank(pet.name);
        const rankText = rank > 0 ? `#${rank}` : '';

        return `🐾 Check out my ${pet.stage} ${pet.name}!
Level: ${pet.level} ${rankText}
Wins: ${pet.battleStats?.wins || 0}
Age: ${Math.floor(pet.age / 60)} hours
Play VPet: https://gameaday.github.io/vpet/`;
    }

    /**
     * Copy share text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textArea);
                return success;
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    /**
     * Share pet stats
     * @param {Pet} pet - Pet instance
     * @returns {Promise<boolean>} Success status
     */
    async sharePet(pet) {
        const text = this.generateShareText(pet);

        // Try Web Share API first (mobile-friendly)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `My ${pet.name}!`,
                    text: text
                });
                return true;
            } catch (error) {
                // User cancelled or error occurred
                if (error.name !== 'AbortError') {
                    console.error('Share failed:', error);
                }
            }
        }

        // Fallback to clipboard
        return await this.copyToClipboard(text);
    }

    /**
     * Generate pet profile image data (simple text-based for now)
     * @param {Pet} pet - Pet instance
     * @returns {object} Profile data
     */
    generateProfileData(pet) {
        return {
            name: pet.name,
            stage: pet.stage,
            level: pet.level,
            age: Math.floor(pet.age / 60),
            stats: {
                health: pet.health,
                happiness: pet.happiness,
                energy: pet.energy
            },
            battleStats: {
                wins: pet.battleStats?.wins || 0,
                losses: pet.battleStats?.losses || 0,
                winRate: pet.battleStats?.wins > 0 
                    ? Math.round((pet.battleStats.wins / (pet.battleStats.wins + pet.battleStats.losses)) * 100)
                    : 0
            },
            personality: pet.getPersonalityDescription(),
            timestamp: Date.now()
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SocialFeatures;
}
