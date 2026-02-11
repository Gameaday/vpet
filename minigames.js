/**
 * Mini-Games Module
 * Provides interactive mini-games for earning coins and boosting stats
 */

/**
 * Mini-Game Manager
 * Manages mini-game state, scoring, and rewards
 */
class MiniGameManager {
    constructor() {
        this.currentGame = null;
        this.highScores = this.loadHighScores();
    }
    
    /**
     * Load high scores from localStorage
     */
    loadHighScores() {
        const saved = localStorage.getItem('miniGameScores');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (error) {
                console.error('Error loading high scores:', error);
            }
        }
        return {
            reaction: 0,
            memory: 0,
            rhythm: 0
        };
    }
    
    /**
     * Save high scores to localStorage
     */
    saveHighScores() {
        localStorage.setItem('miniGameScores', JSON.stringify(this.highScores));
    }
    
    /**
     * Update high score for a game
     * @param {string} gameType - Game type
     * @param {number} score - New score
     * @returns {boolean} True if new high score
     */
    updateHighScore(gameType, score) {
        if (score > (this.highScores[gameType] || 0)) {
            this.highScores[gameType] = score;
            this.saveHighScores();
            return true;
        }
        return false;
    }
    
    /**
     * Get high score for a game
     * @param {string} gameType - Game type
     * @returns {number} High score
     */
    getHighScore(gameType) {
        return this.highScores[gameType] || 0;
    }
    
    /**
     * Calculate rewards based on score
     * @param {string} gameType - Game type
     * @param {number} score - Score achieved
     * @returns {Object} Rewards {coins, statBoosts}
     */
    calculateRewards(gameType, score) {
        const baseCoins = 10;
        const bonusCoins = Math.floor(score / 10);
        const coins = baseCoins + bonusCoins;
        
        // Stat boosts based on game type
        const statBoosts = {};
        
        switch (gameType) {
            case 'reaction':
                statBoosts.energy = Math.min(10, Math.floor(score / 20));
                break;
            case 'memory':
                statBoosts.happiness = Math.min(10, Math.floor(score / 15));
                break;
            case 'rhythm':
                statBoosts.happiness = Math.min(10, Math.floor(score / 10));
                statBoosts.energy = Math.min(5, Math.floor(score / 20));
                break;
        }
        
        return { coins, statBoosts };
    }
}

/**
 * Reaction Game
 * Catch falling items before they hit the ground
 */
class ReactionGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.isPlaying = false;
        this.score = 0;
        this.missed = 0;
        this.maxMissed = 3;
        this.items = [];
        this.spawnRate = 1000; // ms
        this.lastSpawn = 0;
        this.gameTime = 30000; // 30 seconds
        this.startTime = 0;
        
        // Bind event handler
        this.handleClick = this.handleClick.bind(this);
    }
    
    /**
     * Start the game
     */
    start() {
        this.isPlaying = true;
        this.score = 0;
        this.missed = 0;
        this.items = [];
        this.startTime = Date.now();
        this.lastSpawn = Date.now();
        
        // Add click listener
        this.canvas.addEventListener('click', this.handleClick);
        
        // Start game loop
        this.gameLoop();
    }
    
    /**
     * Stop the game
     */
    stop() {
        this.isPlaying = false;
        this.canvas.removeEventListener('click', this.handleClick);
    }
    
    /**
     * Handle canvas click
     */
    handleClick(event) {
        if (!this.isPlaying) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check if clicked on any item
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            const dx = x - item.x;
            const dy = y - item.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < item.radius) {
                // Hit!
                this.score += 10;
                this.items.splice(i, 1);
                return;
            }
        }
    }
    
    /**
     * Spawn new falling item
     */
    spawnItem() {
        const emojis = ['🍎', '🍖', '🍰', '🎮', '⚔️', '💎', '🌸'];
        const item = {
            x: Math.random() * (this.canvas.width - 40) + 20,
            y: 0,
            speed: 2 + Math.random() * 2,
            radius: 20,
            emoji: emojis[Math.floor(Math.random() * emojis.length)]
        };
        this.items.push(item);
    }
    
    /**
     * Update game state
     */
    update() {
        const now = Date.now();
        
        // Check if game time is up
        if (now - this.startTime >= this.gameTime) {
            this.stop();
            return false;
        }
        
        // Spawn new items
        if (now - this.lastSpawn >= this.spawnRate) {
            this.spawnItem();
            this.lastSpawn = now;
        }
        
        // Update item positions
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.y += item.speed;
            
            // Check if item hit the ground
            if (item.y > this.canvas.height) {
                this.items.splice(i, 1);
                this.missed++;
                
                // Check if too many missed
                if (this.missed >= this.maxMissed) {
                    this.stop();
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * Render game
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw items
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        for (const item of this.items) {
            this.ctx.fillText(item.emoji, item.x, item.y);
        }
        
        // Draw score and missed
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        this.ctx.fillText(`Missed: ${this.missed}/${this.maxMissed}`, 10, 60);
        
        // Draw time remaining
        const timeRemaining = Math.ceil((this.gameTime - (Date.now() - this.startTime)) / 1000);
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Time: ${timeRemaining}s`, this.canvas.width - 10, 30);
    }
    
    /**
     * Game loop
     */
    gameLoop() {
        if (!this.isPlaying) return;
        
        const continuing = this.update();
        this.render();
        
        if (continuing && typeof window !== 'undefined' && window.requestAnimationFrame) {
            window.requestAnimationFrame(() => this.gameLoop());
        }
    }
}

/**
 * Memory Game
 * Match pairs of cards
 */
class MemoryGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.isPlaying = false;
        this.score = 0;
        this.moves = 0;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 6;
        this.cardSize = 60;
        this.cardMargin = 10;
        this.cols = 4;
        this.rows = 3;
        
        // Bind event handler
        this.handleClick = this.handleClick.bind(this);
    }
    
    /**
     * Initialize cards
     */
    initializeCards() {
        const emojis = ['🍎', '🍖', '🍰', '💊', '⚔️', '💎'];
        const cardPairs = [...emojis, ...emojis];
        
        // Shuffle
        for (let i = cardPairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
        }
        
        // Create card objects
        this.cards = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const index = row * this.cols + col;
                if (index < cardPairs.length) {
                    this.cards.push({
                        emoji: cardPairs[index],
                        x: col * (this.cardSize + this.cardMargin) + this.cardMargin + 20,
                        y: row * (this.cardSize + this.cardMargin) + this.cardMargin + 80,
                        flipped: false,
                        matched: false,
                        index
                    });
                }
            }
        }
    }
    
    /**
     * Start the game
     */
    start() {
        this.isPlaying = true;
        this.score = 0;
        this.moves = 0;
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.initializeCards();
        
        // Add click listener
        this.canvas.addEventListener('click', this.handleClick);
        
        // Render initial state
        this.render();
    }
    
    /**
     * Stop the game
     */
    stop() {
        this.isPlaying = false;
        this.canvas.removeEventListener('click', this.handleClick);
    }
    
    /**
     * Handle canvas click
     */
    handleClick(event) {
        if (!this.isPlaying || this.flippedCards.length >= 2) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Find clicked card
        for (const card of this.cards) {
            if (card.matched || card.flipped) continue;
            
            if (x >= card.x && x <= card.x + this.cardSize &&
                y >= card.y && y <= card.y + this.cardSize) {
                
                // Flip card
                card.flipped = true;
                this.flippedCards.push(card);
                this.render();
                
                // Check for match if 2 cards flipped
                if (this.flippedCards.length === 2) {
                    this.moves++;
                    setTimeout(() => this.checkMatch(), 500);
                }
                
                return;
            }
        }
    }
    
    /**
     * Check if flipped cards match
     */
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.emoji === card2.emoji) {
            // Match!
            card1.matched = true;
            card2.matched = true;
            this.matchedPairs++;
            this.score += 20;
            
            // Check if game complete
            if (this.matchedPairs === this.totalPairs) {
                this.score += Math.max(0, (50 - this.moves) * 5); // Bonus for efficiency
                this.stop();
            }
        } else {
            // No match
            card1.flipped = false;
            card2.flipped = false;
        }
        
        this.flippedCards = [];
        this.render();
    }
    
    /**
     * Render game
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw score and moves
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        this.ctx.fillText(`Moves: ${this.moves}`, 10, 60);
        
        // Draw cards
        for (const card of this.cards) {
            // Card background
            if (card.matched) {
                this.ctx.fillStyle = '#4CAF50';
            } else if (card.flipped) {
                this.ctx.fillStyle = '#2196F3';
            } else {
                this.ctx.fillStyle = '#555';
            }
            
            this.ctx.fillRect(card.x, card.y, this.cardSize, this.cardSize);
            
            // Card border
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(card.x, card.y, this.cardSize, this.cardSize);
            
            // Card content
            if (card.flipped || card.matched) {
                this.ctx.font = '30px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(card.emoji, card.x + this.cardSize / 2, card.y + this.cardSize / 2);
            } else {
                // Card back
                this.ctx.fillStyle = '#888';
                this.ctx.font = '40px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('?', card.x + this.cardSize / 2, card.y + this.cardSize / 2);
            }
        }
    }
}

/**
 * Rhythm Game
 * Hit notes at the right time
 */
class RhythmGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.isPlaying = false;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.notes = [];
        this.targetY = this.canvas.height - 80;
        this.lanes = 4;
        this.laneWidth = this.canvas.width / this.lanes;
        this.gameTime = 30000; // 30 seconds
        this.startTime = 0;
        this.spawnInterval = 800; // ms
        this.lastSpawn = 0;
        
        // Bind event handler
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }
    
    /**
     * Start the game
     */
    start() {
        this.isPlaying = true;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.notes = [];
        this.startTime = Date.now();
        this.lastSpawn = Date.now();
        
        // Add key listener
        document.addEventListener('keydown', this.handleKeyPress);
        
        // Start game loop
        this.gameLoop();
    }
    
    /**
     * Stop the game
     */
    stop() {
        this.isPlaying = false;
        document.removeEventListener('keydown', this.handleKeyPress);
    }
    
    /**
     * Handle key press
     */
    handleKeyPress(event) {
        if (!this.isPlaying) return;
        
        let lane = -1;
        switch (event.key) {
            case 'd':
            case 'D':
                lane = 0;
                break;
            case 'f':
            case 'F':
                lane = 1;
                break;
            case 'j':
            case 'J':
                lane = 2;
                break;
            case 'k':
            case 'K':
                lane = 3;
                break;
        }
        
        if (lane === -1) return;
        
        // Find closest note in lane
        let closestNote = null;
        let closestDistance = Infinity;
        
        for (let i = 0; i < this.notes.length; i++) {
            const note = this.notes[i];
            if (note.lane === lane && !note.hit) {
                const distance = Math.abs(note.y - this.targetY);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestNote = { note, index: i };
                }
            }
        }
        
        // Check if hit was accurate
        if (closestNote && closestDistance < 30) {
            // Good hit!
            const accuracy = Math.max(0, 100 - closestDistance * 3);
            const points = Math.floor(10 + accuracy / 10);
            this.score += points * (1 + this.combo / 10);
            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
            closestNote.note.hit = true;
            this.notes.splice(closestNote.index, 1);
        } else if (closestNote && closestDistance < 60) {
            // Okay hit
            this.score += 5;
            closestNote.note.hit = true;
            this.notes.splice(closestNote.index, 1);
        } else {
            // Miss
            this.combo = 0;
        }
    }
    
    /**
     * Spawn new note
     */
    spawnNote() {
        const lane = Math.floor(Math.random() * this.lanes);
        const note = {
            lane,
            y: 0,
            speed: 3,
            hit: false
        };
        this.notes.push(note);
    }
    
    /**
     * Update game state
     */
    update() {
        const now = Date.now();
        
        // Check if game time is up
        if (now - this.startTime >= this.gameTime) {
            this.stop();
            return false;
        }
        
        // Spawn new notes
        if (now - this.lastSpawn >= this.spawnInterval) {
            this.spawnNote();
            this.lastSpawn = now;
        }
        
        // Update note positions
        for (let i = this.notes.length - 1; i >= 0; i--) {
            const note = this.notes[i];
            note.y += note.speed;
            
            // Remove if off screen
            if (note.y > this.canvas.height) {
                this.notes.splice(i, 1);
                this.combo = 0; // Break combo on miss
            }
        }
        
        return true;
    }
    
    /**
     * Render game
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw lanes
        this.ctx.strokeStyle = '#444';
        this.ctx.lineWidth = 2;
        for (let i = 1; i < this.lanes; i++) {
            const x = i * this.laneWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw target line
        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.targetY);
        this.ctx.lineTo(this.canvas.width, this.targetY);
        this.ctx.stroke();
        
        // Draw notes
        this.ctx.fillStyle = '#2196F3';
        for (const note of this.notes) {
            const x = note.lane * this.laneWidth + this.laneWidth / 2;
            this.ctx.beginPath();
            this.ctx.arc(x, note.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw key hints
        const keys = ['D', 'F', 'J', 'K'];
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        for (let i = 0; i < keys.length; i++) {
            const x = i * this.laneWidth + this.laneWidth / 2;
            this.ctx.fillText(keys[i], x, this.canvas.height - 30);
        }
        
        // Draw score and combo
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${Math.floor(this.score)}`, 10, 30);
        this.ctx.fillText(`Combo: ${this.combo}x`, 10, 60);
        
        // Draw time remaining
        const timeRemaining = Math.ceil((this.gameTime - (Date.now() - this.startTime)) / 1000);
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`Time: ${timeRemaining}s`, this.canvas.width - 10, 30);
    }
    
    /**
     * Game loop
     */
    gameLoop() {
        if (!this.isPlaying) return;
        
        const continuing = this.update();
        this.render();
        
        if (continuing && typeof window !== 'undefined' && window.requestAnimationFrame) {
            window.requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MiniGameManager,
        ReactionGame,
        MemoryGame,
        RhythmGame
    };
}
