// Battle system for virtual pets
class Battle {
    constructor(playerPet, opponentPet) {
        this.playerPet = playerPet;
        this.opponentPet = opponentPet;
        this.playerStats = playerPet.getBattleStats();
        this.opponentStats = opponentPet.getBattleStats();
        this.turn = 'player';
        this.isActive = true;
        this.log = [];
        this.playerDefending = false;
        this.opponentDefending = false;
        this.onTurnComplete = null; // Callback for when a turn completes
    }

    // Player attacks
    playerAttack() {
        if (this.turn !== 'player' || !this.isActive) return;
        
        const damage = this.calculateDamage(
            this.playerStats.attack,
            this.opponentStats.defense,
            this.opponentDefending
        );
        
        this.opponentStats.currentHP = Math.max(0, this.opponentStats.currentHP - damage);
        this.addLog(`Your pet attacks for ${damage} damage!`);
        this.opponentDefending = false;
        
        if (this.checkBattleEnd()) return;
        
        this.turn = 'opponent';
        setTimeout(() => this.opponentTurn(), 1000);
    }

    // Player defends
    playerDefend() {
        if (this.turn !== 'player' || !this.isActive) return;
        
        this.playerDefending = true;
        this.addLog('Your pet takes a defensive stance!');
        
        this.turn = 'opponent';
        setTimeout(() => this.opponentTurn(), 1000);
    }

    // Player uses special attack
    playerSpecial() {
        if (this.turn !== 'player' || !this.isActive) return;
        
        const damage = this.calculateDamage(
            this.playerStats.attack * 1.5,
            this.opponentStats.defense,
            this.opponentDefending
        );
        
        this.opponentStats.currentHP = Math.max(0, this.opponentStats.currentHP - damage);
        this.addLog(`Your pet uses special attack for ${damage} damage!`);
        this.opponentDefending = false;
        
        if (this.checkBattleEnd()) return;
        
        this.turn = 'opponent';
        setTimeout(() => this.opponentTurn(), 1000);
    }

    // Opponent's turn (AI)
    opponentTurn() {
        if (!this.isActive) return;
        
        // Simple AI: Random choice weighted by HP
        const hpPercentage = this.opponentStats.currentHP / this.opponentStats.maxHP;
        let action;
        
        if (hpPercentage < 0.3) {
            // Low HP: more likely to defend
            action = Math.random() < 0.5 ? 'defend' : 'attack';
        } else if (hpPercentage > 0.7) {
            // High HP: more likely to use special
            action = Math.random() < 0.3 ? 'special' : 'attack';
        } else {
            // Normal: mostly attack
            const rand = Math.random();
            if (rand < 0.7) action = 'attack';
            else if (rand < 0.9) action = 'defend';
            else action = 'special';
        }
        
        switch (action) {
            case 'attack':
                const damage = this.calculateDamage(
                    this.opponentStats.attack,
                    this.playerStats.defense,
                    this.playerDefending
                );
                this.playerStats.currentHP = Math.max(0, this.playerStats.currentHP - damage);
                this.addLog(`Opponent attacks for ${damage} damage!`);
                this.playerDefending = false;
                break;
                
            case 'defend':
                this.opponentDefending = true;
                this.addLog('Opponent takes a defensive stance!');
                break;
                
            case 'special':
                const specialDamage = this.calculateDamage(
                    this.opponentStats.attack * 1.5,
                    this.playerStats.defense,
                    this.playerDefending
                );
                this.playerStats.currentHP = Math.max(0, this.playerStats.currentHP - specialDamage);
                this.addLog(`Opponent uses special attack for ${specialDamage} damage!`);
                this.playerDefending = false;
                break;
        }
        
        if (this.checkBattleEnd()) return;
        
        this.turn = 'player';
        
        // Notify that turn is complete
        if (this.onTurnComplete) {
            this.onTurnComplete();
        }
    }

    // Calculate damage with defense and variance
    calculateDamage(attack, defense, isDefending) {
        let baseDamage = attack - (defense / 2);
        if (isDefending) {
            baseDamage = baseDamage / 2;
        }
        
        // Add variance (80-120%)
        const variance = 0.8 + (Math.random() * 0.4);
        const damage = Math.floor(Math.max(1, baseDamage * variance));
        
        return damage;
    }

    // Check if battle has ended
    checkBattleEnd() {
        if (this.playerStats.currentHP <= 0) {
            this.addLog('💔 Your pet was defeated!');
            this.isActive = false;
            return true;
        }
        
        if (this.opponentStats.currentHP <= 0) {
            this.addLog('🏆 Victory! Your pet won the battle!');
            this.isActive = false;
            return true;
        }
        
        return false;
    }

    // Add message to battle log
    addLog(message) {
        this.log.push(message);
    }

    // Get battle log
    getLog() {
        return this.log;
    }

    // Check if player won
    playerWon() {
        return !this.isActive && this.playerStats.currentHP > 0;
    }
}

// Generate AI opponent based on player's level
function generateOpponent(playerLevel) {
    const levelVariance = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    const opponentLevel = Math.max(1, playerLevel + levelVariance);
    
    const names = [
        'Wild Digimon', 'Rival Pet', 'Shadow Beast', 
        'Digital Monster', 'Pixel Creature', 'Cyber Pet',
        'Tech Beast', 'Byte Buddy', 'Data Dragon'
    ];
    
    const opponentName = names[Math.floor(Math.random() * names.length)];
    
    // Create a fake pet object for the opponent
    return {
        name: opponentName,
        stage: playerLevel < 5 ? 'baby' : playerLevel < 10 ? 'child' : playerLevel < 15 ? 'teen' : 'adult',
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
                level: this.level
            };
        }
    };
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Battle };
}
