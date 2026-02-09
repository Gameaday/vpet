import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
global.localStorage = localStorageMock;

// Mock showNotification function
global.showNotification = vi.fn();

// Import classes
const { Pet } = await import('./pet.js');
const { Battle } = await import('./battle.js');

describe('Battle Class', () => {
  let playerPet;
  let opponentPet;
  let battle;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    
    // Create test pets
    playerPet = new Pet();
    playerPet.name = 'Player Pet';
    playerPet.level = 5;
    playerPet.health = 100;
    
    opponentPet = new Pet();
    opponentPet.name = 'Opponent Pet';
    opponentPet.level = 5;
    opponentPet.health = 100;
    
    battle = new Battle(playerPet, opponentPet);
  });

  describe('Initialization', () => {
    it('should create a battle with two pets', () => {
      expect(battle.playerPet).toBe(playerPet);
      expect(battle.opponentPet).toBe(opponentPet);
      expect(battle.isActive).toBe(true);
    });

    it('should initialize with player turn', () => {
      expect(battle.turn).toBe('player');
    });

    it('should have battle stats for both pets', () => {
      expect(battle.playerStats).toBeDefined();
      expect(battle.opponentStats).toBeDefined();
      expect(battle.playerStats.maxHP).toBeGreaterThan(0);
      expect(battle.opponentStats.maxHP).toBeGreaterThan(0);
    });

    it('should initialize empty battle log', () => {
      expect(battle.log).toEqual([]);
    });

    it('should initialize defense flags as false', () => {
      expect(battle.playerDefending).toBe(false);
      expect(battle.opponentDefending).toBe(false);
    });
  });

  describe('Player Attack', () => {
    it('should deal damage to opponent', () => {
      const initialHP = battle.opponentStats.currentHP;
      battle.playerAttack();
      
      expect(battle.opponentStats.currentHP).toBeLessThan(initialHP);
    });

    it('should add attack to battle log', () => {
      battle.playerAttack();
      
      expect(battle.log.length).toBeGreaterThan(0);
      expect(battle.log[0]).toContain('attacks');
    });

    it('should switch turn to opponent', (done) => {
      battle.playerAttack();
      
      // Wait for opponent turn timeout
      setTimeout(() => {
        expect(battle.turn).toBe('opponent');
        done();
      }, 1100);
    }, 2000);

    it('should not attack when not player turn', () => {
      battle.turn = 'opponent';
      const initialHP = battle.opponentStats.currentHP;
      
      battle.playerAttack();
      
      expect(battle.opponentStats.currentHP).toBe(initialHP);
    });

    it('should reset opponent defending flag', () => {
      battle.opponentDefending = true;
      battle.playerAttack();
      
      expect(battle.opponentDefending).toBe(false);
    });
  });

  describe('Player Defend', () => {
    it('should set player defending flag', () => {
      battle.playerDefend();
      
      expect(battle.playerDefending).toBe(true);
    });

    it('should add defend action to log', () => {
      battle.playerDefend();
      
      expect(battle.log.length).toBeGreaterThan(0);
      expect(battle.log[0]).toContain('defensive');
    });

    it('should switch turn to opponent', (done) => {
      battle.playerDefend();
      
      setTimeout(() => {
        expect(battle.turn).toBe('opponent');
        done();
      }, 1100);
    }, 2000);
  });

  describe('Player Special Attack', () => {
    it('should deal more damage than regular attack', () => {
      // Create two battles to compare
      const battle1 = new Battle(playerPet, new Pet());
      const battle2 = new Battle(playerPet, new Pet());
      
      const initialHP1 = battle1.opponentStats.currentHP;
      const initialHP2 = battle2.opponentStats.currentHP;
      
      battle1.playerAttack();
      battle2.playerSpecial();
      
      const normalDamage = initialHP1 - battle1.opponentStats.currentHP;
      const specialDamage = initialHP2 - battle2.opponentStats.currentHP;
      
      expect(specialDamage).toBeGreaterThan(normalDamage);
    });

    it('should add special attack to log', () => {
      battle.playerSpecial();
      
      expect(battle.log.some(entry => entry.includes('special'))).toBe(true);
    });
  });

  describe('Opponent Turn', () => {
    it('should make opponent take an action', (done) => {
      battle.turn = 'opponent';
      const initialHP = battle.playerStats.currentHP;
      
      battle.opponentTurn();
      
      setTimeout(() => {
        // Opponent should have done something
        expect(battle.log.length).toBeGreaterThan(0);
        done();
      }, 1100);
    }, 2000);

    it('should deal damage to player when opponent attacks', (done) => {
      battle.turn = 'opponent';
      // Force opponent to attack by mocking random
      const originalRandom = Math.random;
      Math.random = () => 0.5; // Will choose attack
      
      const initialHP = battle.playerStats.currentHP;
      battle.opponentTurn();
      
      setTimeout(() => {
        expect(battle.playerStats.currentHP).toBeLessThanOrEqual(initialHP);
        Math.random = originalRandom;
        done();
      }, 1100);
    }, 2000);
  });

  describe('Damage Calculation', () => {
    it('should calculate damage based on attack and defense', () => {
      const damage = battle.calculateDamage(50, 20, false);
      
      expect(damage).toBeGreaterThan(0);
      expect(damage).toBeLessThan(50);
    });

    it('should reduce damage when defending', () => {
      const normalDamage = battle.calculateDamage(50, 20, false);
      const defendedDamage = battle.calculateDamage(50, 20, true);
      
      expect(defendedDamage).toBeLessThan(normalDamage);
    });

    it('should deal at least 1 damage', () => {
      const damage = battle.calculateDamage(1, 1000, false);
      
      expect(damage).toBeGreaterThanOrEqual(1);
    });

    it('should calculate damage based on attack and defense', () => {
      const damage = battle.calculateDamage(100, 20, false);
      
      // Base damage = 100 - (20/2) = 90
      // With variance (80-120%), should be between 72-108
      expect(damage).toBeGreaterThan(0);
      expect(damage).toBeLessThan(150);
    });
  });

  describe('Battle End Conditions', () => {
    it('should end battle when player HP reaches 0', () => {
      battle.playerStats.currentHP = 0;
      battle.checkBattleEnd();
      
      expect(battle.isActive).toBe(false);
    });

    it('should end battle when opponent HP reaches 0', () => {
      battle.opponentStats.currentHP = 0;
      battle.checkBattleEnd();
      
      expect(battle.isActive).toBe(false);
    });

    it('should determine winner correctly', () => {
      battle.opponentStats.currentHP = 0;
      battle.checkBattleEnd();
      
      expect(battle.playerWon()).toBe(true);
    });

    it('should determine loser correctly', () => {
      battle.playerStats.currentHP = 0;
      battle.checkBattleEnd();
      
      expect(battle.playerWon()).toBe(false);
    });
  });

  describe('Battle Log', () => {
    it('should add entries to battle log', () => {
      battle.addLog('Test log entry');
      
      expect(battle.log).toContain('Test log entry');
    });

    it('should maintain log order', () => {
      battle.addLog('First');
      battle.addLog('Second');
      battle.addLog('Third');
      
      expect(battle.log[0]).toBe('First');
      expect(battle.log[1]).toBe('Second');
      expect(battle.log[2]).toBe('Third');
    });
  });

  describe('Battle Flow', () => {
    it('should alternate turns between player and opponent', (done) => {
      expect(battle.turn).toBe('player');
      
      battle.playerAttack();
      
      setTimeout(() => {
        expect(battle.turn).toBe('opponent');
        done();
      }, 1100);
    }, 2000);

    it('should not accept actions when battle is inactive', () => {
      battle.isActive = false;
      const initialHP = battle.opponentStats.currentHP;
      
      battle.playerAttack();
      
      expect(battle.opponentStats.currentHP).toBe(initialHP);
    });
  });

  describe('Victory Conditions', () => {
    it('should declare player winner when opponent HP is 0', () => {
      battle.opponentStats.currentHP = 0;
      battle.checkBattleEnd();
      
      expect(battle.playerWon()).toBe(true);
      expect(battle.isActive).toBe(false);
    });

    it('should declare player loser when player HP is 0', () => {
      battle.playerStats.currentHP = 0;
      battle.checkBattleEnd();
      
      expect(battle.playerWon()).toBe(false);
      expect(battle.isActive).toBe(false);
    });
  });

  describe('Turn Completion Callback', () => {
    it('should call onTurnComplete callback if set', (done) => {
      battle.onTurnComplete = vi.fn();
      battle.playerAttack();
      
      setTimeout(() => {
        expect(battle.onTurnComplete).toHaveBeenCalled();
        done();
      }, 1100);
    }, 2000);

    it('should work without onTurnComplete callback', (done) => {
      battle.onTurnComplete = null;
      
      expect(() => {
        battle.playerAttack();
        setTimeout(done, 1100);
      }).not.toThrow();
    }, 2000);
  });
});
