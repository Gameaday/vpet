/**
 * Battle UI Manager Module
 * Handles battle-specific UI operations
 */

class BattleUIManager {
    constructor(config = {}) {
        this.config = config;
        this.currentBattle = null;
        this.onBattleEnd = null; // Callback for when battle ends
    }
    
    /**
     * Set current battle
     * @param {Battle} battle - Battle instance
     */
    setBattle(battle) {
        this.currentBattle = battle;
    }
    
    /**
     * Open battle modal with opponent
     * @param {object} opponent - Opponent pet data
     */
    openModal(opponent) {
        const modal = document.getElementById('battleModal');
        if (!modal) return;
        
        // Set opponent info
        document.getElementById('battleOpponentName').textContent = opponent.name;
        document.getElementById('battleYourName').textContent = this.currentBattle?.playerPet?.name || 'Your Pet';
        
        // Reset HP bars
        document.getElementById('battleYourHp').style.width = '100%';
        document.getElementById('battleOpponentHp').style.width = '100%';
        
        // Set battle stats
        if (this.currentBattle) {
            document.getElementById('battleYourAttack').textContent = this.currentBattle.playerStats.attack;
            document.getElementById('battleYourDefense').textContent = this.currentBattle.playerStats.defense;
            document.getElementById('battleOpponentAttack').textContent = this.currentBattle.opponentStats.attack;
            document.getElementById('battleOpponentDefense').textContent = this.currentBattle.opponentStats.defense;
        }
        
        // Clear log
        const logElement = document.getElementById('battleLog');
        if (logElement) logElement.innerHTML = '<p>Battle started!</p>';
        
        // Hide finish button, show action buttons
        document.getElementById('finishBattleBtn').style.display = 'none';
        const battleActions = document.getElementById('battleActions');
        if (battleActions) battleActions.style.display = 'grid';
        this.enableActionButtons();
        
        // Show modal
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
    
    /**
     * Close battle modal
     * @param {Function} onClose - Optional callback to execute on close (for backward compatibility)
     */
    closeModal(onClose) {
        const modal = document.getElementById('battleModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
        
        // Execute callbacks if battle ended
        // onClose is for inline callbacks (backward compatibility)
        // onBattleEnd is for registered callbacks (preferred for reusable logic)
        if (this.currentBattle && !this.currentBattle.isActive) {
            if (onClose) {
                onClose(this.currentBattle);
            }
            if (this.onBattleEnd && this.onBattleEnd !== onClose) {
                this.onBattleEnd(this.currentBattle);
            }
        }
        
        this.currentBattle = null;
    }
    
    /**
     * Update battle UI with current state
     * @param {object} soundManager - Sound manager instance for audio (optional)
     * @param {object} milestoneManager - Milestone manager for achievements (optional)
     * @param {object} uiManager - UI manager for showing achievements (optional)
     * @param {object} pet - Player's pet for milestone checking (optional)
     */
    update(soundManager, milestoneManager, uiManager, pet) {
        if (!this.currentBattle) return;
        
        this._updateHealthBarsWithEffects(soundManager);
        this._updateBattleLog();
        this._checkBattleEnd(soundManager, milestoneManager, uiManager, pet);
    }
    
    /**
     * Update health bars with damage effects and animations
     * @param {object} soundManager - Sound manager for audio (optional)
     * @private
     */
    _updateHealthBarsWithEffects(soundManager) {
        const playerHPPercent = (this.currentBattle.playerStats.currentHP / 
                                this.currentBattle.playerStats.maxHP) * 100;
        const opponentHPPercent = (this.currentBattle.opponentStats.currentHP / 
                                   this.currentBattle.opponentStats.maxHP) * 100;
        
        const playerBar = document.getElementById('battleYourHp');
        const opponentBar = document.getElementById('battleOpponentHp');
        
        if (!playerBar || !opponentBar) return;
        
        // Initialize HP tracking on first update
        if (!playerBar.dataset.hp) {
            playerBar.dataset.hp = 100;
            opponentBar.dataset.hp = 100;
        }
        
        // Track previous HP for damage calculation
        const prevPlayerHP = parseFloat(playerBar.dataset.hp);
        const prevOpponentHP = parseFloat(opponentBar.dataset.hp);
        
        // Check for damage and add flash animation + damage numbers
        if (prevPlayerHP > playerHPPercent) {
            const damage = this.calculateDamage(prevPlayerHP, playerHPPercent, this.currentBattle.playerStats.maxHP);
            playerBar.classList.add('damage-flash');
            this.showDamageNumber(damage, true);
            if (soundManager) soundManager.play('hit');
            setTimeout(() => playerBar.classList.remove('damage-flash'), 300);
            
            // Add shake to player sprite
            const playerSprite = document.querySelector('.battle-pet:first-child .battle-sprite');
            if (playerSprite) {
                playerSprite.classList.add('taking-damage');
                setTimeout(() => playerSprite.classList.remove('taking-damage'), 300);
            }
        }
        
        if (prevOpponentHP > opponentHPPercent) {
            const damage = this.calculateDamage(prevOpponentHP, opponentHPPercent, this.currentBattle.opponentStats.maxHP);
            opponentBar.classList.add('damage-flash');
            this.showDamageNumber(damage, false);
            if (soundManager) soundManager.play('hit');
            setTimeout(() => opponentBar.classList.remove('damage-flash'), 300);
            
            // Add shake to opponent sprite
            const opponentSprite = document.querySelector('.battle-pet:last-child .battle-sprite');
            if (opponentSprite) {
                opponentSprite.classList.add('taking-damage');
                setTimeout(() => opponentSprite.classList.remove('taking-damage'), 300);
            }
        }
        
        playerBar.style.width = Math.max(0, playerHPPercent) + '%';
        opponentBar.style.width = Math.max(0, opponentHPPercent) + '%';
        
        // Store current HP for next comparison
        playerBar.dataset.hp = playerHPPercent;
        opponentBar.dataset.hp = opponentHPPercent;
    }
    
    /**
     * Update battle log
     * @private
     */
    _updateBattleLog() {
        const logElement = document.getElementById('battleLog');
        if (!logElement) return;
        
        const logs = this.currentBattle.getLog ? this.currentBattle.getLog() : this.currentBattle.log;
        if (Array.isArray(logs)) {
            logElement.innerHTML = logs.map(log => `<p>${log}</p>`).join('');
            logElement.scrollTop = logElement.scrollHeight;
        }
    }
    
    /**
     * Check if battle has ended and handle victory/defeat
     * @param {object} soundManager - Sound manager for audio (optional)
     * @param {object} milestoneManager - Milestone manager for achievements (optional)
     * @param {object} uiManager - UI manager for showing achievements (optional)
     * @param {object} pet - Player's pet for milestone checking (optional)
     * @private
     */
    _checkBattleEnd(soundManager, milestoneManager, uiManager, pet) {
        if (!this.currentBattle.isActive) {
            this.disableActionButtons();
            
            // Hide action buttons, show finish button
            const battleActions = document.getElementById('battleActions');
            if (battleActions) battleActions.style.display = 'none';
            
            const finishBtn = document.getElementById('finishBattleBtn');
            if (finishBtn) finishBtn.style.display = 'block';
            
            // Add victory animation to winner
            if (this.currentBattle.playerWon()) {
                const playerSprite = document.querySelector('.battle-pet:first-child .battle-sprite');
                if (playerSprite) {
                    playerSprite.classList.add('victory');
                }
                if (soundManager) soundManager.play('win');
                if (milestoneManager && uiManager && pet) {
                    milestoneManager.check('battle', pet, uiManager.showAchievement.bind(uiManager));
                    milestoneManager.check('win', pet, uiManager.showAchievement.bind(uiManager));
                }
            } else {
                const opponentSprite = document.querySelector('.battle-pet:last-child .battle-sprite');
                if (opponentSprite) {
                    opponentSprite.classList.add('victory');
                }
                if (soundManager) soundManager.play('lose');
            }
        }
    }
    
    /**
     * Enable battle action buttons
     */
    enableActionButtons() {
        ['attackBtn', 'defendBtn', 'specialBtn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = false;
        });
    }
    
    /**
     * Disable battle action buttons
     */
    disableActionButtons() {
        ['attackBtn', 'defendBtn', 'specialBtn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = true;
        });
    }
    
    /**
     * Show damage number animation
     * @param {number} damage - Damage amount
     * @param {boolean} isPlayer - Whether damage is to player
     * @param {boolean} isCrit - Whether it's a critical hit
     */
    showDamageNumber(damage, isPlayer, isCrit = false) {
        // Try primary selectors first, then fallback selectors
        const container = isPlayer ? 
            (document.querySelector('.battle-your-pet') || document.querySelector('.battle-pet:first-child')) : 
            (document.querySelector('.battle-opponent-pet') || document.querySelector('.battle-pet:last-child'));
        
        if (!container) return;
        
        const damageNum = document.createElement('div');
        damageNum.className = `damage-number ${isCrit ? 'crit' : ''}`;
        if (isPlayer) damageNum.classList.add('player-damage');
        if (!isPlayer) damageNum.classList.add('opponent-damage');
        damageNum.textContent = `-${damage}`;
        
        // Ensure container is positioned for absolute positioning of damage numbers
        if (window.getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }
        container.appendChild(damageNum);
        
        // Remove after animation
        setTimeout(() => damageNum.remove(), 1000);
    }
    
    /**
     * Calculate damage from HP change
     * @param {number} prevHP - Previous HP percentage
     * @param {number} currentHP - Current HP percentage
     * @param {number} maxHP - Maximum HP value
     * @returns {number} Damage amount
     */
    calculateDamage(prevHP, currentHP, maxHP) {
        return Math.round((prevHP - currentHP) / 100 * maxHP);
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BattleUIManager;
}
