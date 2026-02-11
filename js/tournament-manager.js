/**
 * Tournament Mode Module
 * Handles tournament creation, matchmaking, and bracket management
 */

class TournamentManager {
    constructor() {
        this.currentTournament = null;
        this.tournaments = this.loadTournaments();
    }

    /**
     * Load tournaments from localStorage
     * @returns {Array} Tournament history
     */
    loadTournaments() {
        try {
            const data = localStorage.getItem('vpet_tournaments');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load tournaments:', error);
            return [];
        }
    }

    /**
     * Save tournaments to localStorage
     */
    saveTournaments() {
        try {
            localStorage.setItem('vpet_tournaments', JSON.stringify(this.tournaments));
        } catch (error) {
            console.error('Failed to save tournaments:', error);
        }
    }

    /**
     * Create a new tournament
     * @param {object} options - Tournament options
     * @returns {object} Tournament instance
     */
    createTournament(options = {}) {
        const tournament = {
            id: Date.now(),
            name: options.name || 'Daily Tournament',
            entryFee: options.entryFee || 0,
            prize: options.prize || 100,
            maxParticipants: options.maxParticipants || 8,
            participants: [],
            bracket: [],
            currentRound: 0,
            status: 'open', // open, in_progress, completed
            createdAt: Date.now()
        };

        this.currentTournament = tournament;
        return tournament;
    }

    /**
     * Enter tournament
     * @param {Pet} pet - Pet instance
     * @returns {boolean} Success status
     */
    enterTournament(pet) {
        if (!this.currentTournament) {
            console.error('No active tournament');
            return false;
        }

        if (this.currentTournament.status !== 'open') {
            console.error('Tournament is not open for entry');
            return false;
        }

        if (this.currentTournament.participants.length >= this.currentTournament.maxParticipants) {
            console.error('Tournament is full');
            return false;
        }

        // Check if already entered
        if (this.currentTournament.participants.some(p => p.name === pet.name)) {
            console.error('Already entered in tournament');
            return false;
        }

        // Add participant
        this.currentTournament.participants.push({
            name: pet.name,
            level: pet.level,
            stage: pet.stage,
            stats: {
                attack: pet.attack,
                defense: pet.defense,
                maxHP: pet.maxHP
            }
        });

        return true;
    }

    /**
     * Generate tournament bracket
     * @returns {Array} Bracket matches
     */
    generateBracket() {
        if (!this.currentTournament) return [];

        const participants = [...this.currentTournament.participants];
        
        // Pad with AI opponents if needed
        while (participants.length < this.currentTournament.maxParticipants) {
            participants.push(this.generateAIOpponent(participants.length + 1));
        }

        // Shuffle participants for random seeding
        this.shuffleArray(participants);

        // Generate first round matches
        const bracket = [];
        for (let i = 0; i < participants.length; i += 2) {
            bracket.push({
                round: 1,
                match: Math.floor(i / 2) + 1,
                player1: participants[i],
                player2: participants[i + 1],
                winner: null,
                completed: false
            });
        }

        this.currentTournament.bracket = bracket;
        this.currentTournament.status = 'in_progress';
        this.currentTournament.currentRound = 1;

        return bracket;
    }

    /**
     * Generate AI opponent
     * @param {number} seed - Seed number
     * @returns {object} AI opponent data
     */
    generateAIOpponent(seed) {
        const names = ['Shadow', 'Thunder', 'Blaze', 'Frost', 'Storm', 'Nova', 'Titan', 'Phoenix'];
        const stages = ['baby', 'child', 'teen', 'adult'];
        
        const level = Math.floor(Math.random() * 5) + 1;
        const stage = stages[Math.min(Math.floor(level / 2), stages.length - 1)];
        
        return {
            name: `${names[seed % names.length]} (AI)`,
            level: level,
            stage: stage,
            stats: {
                attack: 10 + level * 2,
                defense: 8 + level * 2,
                maxHP: 100 + level * 10
            },
            isAI: true
        };
    }

    /**
     * Shuffle array in place
     * @param {Array} array - Array to shuffle
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Record match result (supports both match object and index)
     * @param {object|number} matchOrIndex - Match object or match index
     * @param {string} winner - Winner name
     * @returns {boolean} Success status
     */
    recordMatchResult(matchOrIndex, winner) {
        // Support both new (match object) and old (index) signatures
        let match;
        if (typeof matchOrIndex === 'number') {
            if (!this.currentTournament || !this.currentTournament.bracket[matchOrIndex]) {
                return false;
            }
            match = this.currentTournament.bracket[matchOrIndex];
        } else {
            match = matchOrIndex;
        }

        match.winner = winner;
        match.completed = true;

        // Check if round is complete
        const currentRoundMatches = this.currentTournament.bracket.filter(
            m => m.round === this.currentTournament.currentRound
        );
        const allCompleted = currentRoundMatches.every(m => m.completed);

        if (allCompleted) {
            this.advanceRound();
        }

        this.saveTournaments();
        return true;
    }

    /**
     * Advance to next round
     */
    advanceRound() {
        if (!this.currentTournament) return;

        const currentRound = this.currentTournament.currentRound;
        const winners = this.currentTournament.bracket
            .filter(m => m.round === currentRound && m.completed)
            .map(m => m.winner);

        if (winners.length === 1) {
            // Tournament complete
            this.completeTournament(winners[0]);
            return;
        }

        // Create next round matches
        const nextRound = currentRound + 1;
        for (let i = 0; i < winners.length; i += 2) {
            this.currentTournament.bracket.push({
                round: nextRound,
                match: Math.floor(i / 2) + 1,
                player1: winners[i],
                player2: winners[i + 1],
                winner: null,
                completed: false
            });
        }

        this.currentTournament.currentRound = nextRound;
    }

    /**
     * Complete tournament
     * @param {object} winner - Tournament winner
     */
    completeTournament(winner) {
        if (!this.currentTournament) return;

        this.currentTournament.status = 'completed';
        this.currentTournament.winner = winner;
        this.currentTournament.completedAt = Date.now();

        // Add to history
        this.tournaments.push({
            id: this.currentTournament.id,
            name: this.currentTournament.name,
            winner: winner.name,
            participants: this.currentTournament.participants.length,
            completedAt: this.currentTournament.completedAt
        });

        this.saveTournaments();
    }

    /**
     * Get current tournament status
     * @returns {object|null} Tournament status
     */
    getTournamentStatus() {
        if (!this.currentTournament) return null;

        return {
            name: this.currentTournament.name,
            status: this.currentTournament.status,
            participants: this.currentTournament.participants.length,
            maxParticipants: this.currentTournament.maxParticipants,
            currentRound: this.currentTournament.currentRound,
            totalRounds: Math.log2(this.currentTournament.maxParticipants)
        };
    }

    /**
     * Get tournament bracket
     * @returns {Array} Bracket matches
     */
    getBracket() {
        return this.currentTournament ? this.currentTournament.bracket : [];
    }

    /**
     * Get next unplayed match
     * @returns {object|null} Next match or null if none
     */
    getNextMatch() {
        if (!this.currentTournament || !this.currentTournament.bracket) {
            return null;
        }

        // Find first incomplete match in current round
        const currentRoundMatches = this.currentTournament.bracket.filter(
            m => m.round === this.currentTournament.currentRound && !m.completed
        );

        return currentRoundMatches.length > 0 ? currentRoundMatches[0] : null;
    }

    /**
     * Forfeit current tournament
     */
    forfeitTournament() {
        if (!this.currentTournament) return;

        this.currentTournament.status = 'forfeited';
        this.currentTournament.completedAt = Date.now();

        // Add to history
        this.tournaments.push({...this.currentTournament});
        this.saveTournaments();

        // Clear current tournament
        this.currentTournament = null;
    }

    /**
     * Get tournament history
     * @param {number} limit - Number of entries to return
     * @returns {Array} Tournament history
     */
    getHistory(limit = 10) {
        return this.tournaments.slice(-limit).reverse();
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TournamentManager;
}
