/**
 * Battle UI Manager Module
 * Handles battle-specific UI operations
 */

class BattleUIManager {
    constructor(config = {}) {
        this.config = config;
        this.currentBattle = null;
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
        
        // Clear log
        const logElement = document.getElementById('battleLog');
        if (logElement) logElement.innerHTML = '';
        
        // Hide finish button, show action buttons
        document.getElementById('finishBattleBtn').style.display = 'none';
        this.enableActionButtons();
        
        // Show modal
        modal.style.display = 'flex';
    }
    
    /**
     * Close battle modal
     */
    closeModal() {
        const modal = document.getElementById('battleModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentBattle = null;
    }
    
    /**
     * Update battle UI with current state
     */
    update() {
        if (!this.currentBattle) return;
        
        this._updateHealthBars();
        this._updateBattleLog();
        this._checkBattleEnd();
    }
    
    /**
     * Update health bars
     * @private
     */
    _updateHealthBars() {
        const playerHPPercent = (this.currentBattle.playerStats.currentHP / 
                                this.currentBattle.playerStats.maxHP) * 100;
        const opponentHPPercent = (this.currentBattle.opponentStats.currentHP / 
                                   this.currentBattle.opponentStats.maxHP) * 100;
        
        const playerBar = document.getElementById('battleYourHp');
        const opponentBar = document.getElementById('battleOpponentHp');
        
        if (playerBar) playerBar.style.width = Math.max(0, playerHPPercent) + '%';
        if (opponentBar) opponentBar.style.width = Math.max(0, opponentHPPercent) + '%';
    }
    
    /**
     * Update battle log
     * @private
     */
    _updateBattleLog() {
        const logElement = document.getElementById('battleLog');
        if (!logElement) return;
        
        const lastEntry = this.currentBattle.log[this.currentBattle.log.length - 1];
        if (lastEntry && !logElement.textContent.includes(lastEntry)) {
            const logEntry = document.createElement('div');
            logEntry.className = 'battle-log-entry';
            logEntry.textContent = lastEntry;
            logElement.appendChild(logEntry);
            logElement.scrollTop = logElement.scrollHeight;
        }
    }
    
    /**
     * Check if battle has ended
     * @private
     */
    _checkBattleEnd() {
        if (!this.currentBattle.isActive) {
            this.disableActionButtons();
            const finishBtn = document.getElementById('finishBattleBtn');
            if (finishBtn) finishBtn.style.display = 'block';
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
        const damageDiv = document.createElement('div');
        damageDiv.className = `damage-number ${isPlayer ? 'player-damage' : 'opponent-damage'} ${isCrit ? 'critical' : ''}`;
        damageDiv.textContent = `-${damage}`;
        
        const targetClass = isPlayer ? '.your-pet' : '.opponent-pet';
        const target = document.querySelector(targetClass);
        
        if (target) {
            target.appendChild(damageDiv);
            setTimeout(() => damageDiv.remove(), 1000);
        }
    }
    
    /**
     * Calculate damage from HP change
     * @param {number} prevHP - Previous HP
     * @param {number} currentHP - Current HP
     * @param {number} maxHP - Maximum HP
     * @returns {number} Damage amount
     */
    calculateDamage(prevHP, currentHP, maxHP) {
        const prevHPValue = (prevHP / 100) * maxHP;
        const currentHPValue = (currentHP / 100) * maxHP;
        return Math.round(prevHPValue - currentHPValue);
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BattleUIManager;
}
