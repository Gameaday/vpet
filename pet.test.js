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

// Import Pet class
const { Pet } = await import('./pet.js');

describe('Pet Class', () => {
  let pet;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    pet = new Pet();
  });

  describe('Constructor and Initialization', () => {
    it('should create a new pet with default values', () => {
      expect(pet.name).toBe('My Pet');
      expect(pet.stage).toBe('egg');
      expect(pet.health).toBe(100);
      expect(pet.hunger).toBe(100);
      expect(pet.happiness).toBe(100);
      expect(pet.energy).toBe(100);
      expect(pet.level).toBe(1);
      expect(pet.wins).toBe(0);
      expect(pet.isSleeping).toBe(false);
      expect(pet.isSick).toBe(false);
      expect(pet.cleanliness).toBe(100);
      expect(pet.discipline).toBe(100);
    });

    it('should initialize personality traits', () => {
      expect(pet.personalityTraits).toEqual({
        brave: 50,
        friendly: 50,
        energetic: 50,
        disciplined: 50
      });
    });

    it('should have empty battle and stats history', () => {
      expect(pet.battleHistory).toEqual([]);
      expect(pet.statsHistory).toEqual([]);
    });
  });

  describe('Save and Load', () => {
    it('should save pet data to localStorage', () => {
      pet.name = 'Test Pet';
      pet.level = 5;
      pet.save();
      
      const savedData = JSON.parse(localStorage.getItem('vpet_data'));
      expect(savedData.name).toBe('Test Pet');
      expect(savedData.level).toBe(5);
    });

    it('should load pet data from localStorage', () => {
      const testData = {
        name: 'Loaded Pet',
        stage: 'child',
        level: 3,
        health: 80,
        hunger: 60,
        happiness: 90,
        energy: 70,
        wins: 5,
        birthTime: Date.now(),
        lastUpdateTime: Date.now()
      };
      localStorage.setItem('vpet_data', JSON.stringify(testData));
      
      const loadedPet = new Pet();
      expect(loadedPet.name).toBe('Loaded Pet');
      expect(loadedPet.stage).toBe('child');
      expect(loadedPet.level).toBe(3);
      expect(loadedPet.wins).toBe(5);
    });
  });

  describe('Feed Action', () => {
    it('should increase hunger and health when fed', () => {
      pet.hunger = 50;
      pet.health = 80;
      
      const result = pet.feed();
      
      expect(result).toBe(true);
      expect(pet.hunger).toBeGreaterThan(50);
      expect(pet.health).toBeGreaterThan(80);
    });

    it('should not feed when pet is sleeping', () => {
      pet.isSleeping = true;
      const result = pet.feed();
      
      expect(result).toBe(false);
      // Note: showNotification is not called in test environment due to DOM check
    });

    it('should cap hunger at 100', () => {
      pet.hunger = 90;
      pet.feed();
      
      expect(pet.hunger).toBeLessThanOrEqual(100);
    });
  });

  describe('Play Action', () => {
    it('should increase happiness when playing', () => {
      pet.happiness = 50;
      pet.energy = 50;
      pet.hunger = 50;
      
      const result = pet.play();
      
      expect(result).toBe(true);
      expect(pet.happiness).toBeGreaterThan(50);
    });

    it('should consume energy and hunger', () => {
      pet.energy = 50;
      pet.hunger = 50;
      const initialEnergy = pet.energy;
      const initialHunger = pet.hunger;
      
      pet.play();
      
      expect(pet.energy).toBeLessThan(initialEnergy);
      expect(pet.hunger).toBeLessThan(initialHunger);
    });

    it('should not play when energy or hunger is too low', () => {
      pet.energy = 5;
      const result = pet.play();
      
      expect(result).toBe(false);
    });
  });

  describe('Train Action', () => {
    it('should increase level when training', () => {
      pet.level = 1;
      pet.energy = 50;
      pet.hunger = 50;
      
      const result = pet.train();
      
      expect(result).toBe(true);
      expect(pet.level).toBeGreaterThan(1);
    });

    it('should not train when stats are too low', () => {
      pet.energy = 5;
      const result = pet.train();
      
      expect(result).toBe(false);
    });

    it('should increase discipline stat', () => {
      pet.energy = 50;
      pet.hunger = 50;
      pet.discipline = 50; // Start with a non-maxed value
      const initialDiscipline = pet.discipline;
      
      pet.train();
      
      expect(pet.discipline).toBeGreaterThan(initialDiscipline);
    });

    it('should cap discipline at 100', () => {
      pet.energy = 50;
      pet.hunger = 50;
      pet.discipline = 98;
      
      pet.train();
      
      expect(pet.discipline).toBeLessThanOrEqual(100);
    });
  });

  describe('Sleep', () => {
    it('should put pet to sleep', () => {
      pet.sleep();
      expect(pet.isSleeping).toBe(true);
    });

    it('should wake up pet', () => {
      pet.isSleeping = true;
      pet.wakeUp();
      expect(pet.isSleeping).toBe(false);
    });
  });

  describe('Evolution System', () => {
    it('should evolve from egg to baby', () => {
      pet.stage = 'egg';
      pet.age = 0.01; // Meets evolution threshold
      pet.checkEvolution();
      
      expect(pet.stage).toBe('baby');
    });

    it('should evolve from baby to child', () => {
      pet.stage = 'baby';
      pet.age = 0.05;
      pet.checkEvolution();
      
      expect(pet.stage).toBe('child');
    });

    it('should evolve from child to teen', () => {
      pet.stage = 'child';
      pet.age = 0.1;
      pet.checkEvolution();
      
      expect(pet.stage).toBe('teen');
    });

    it('should evolve from teen to adult', () => {
      pet.stage = 'teen';
      pet.age = 0.2;
      pet.checkEvolution();
      
      expect(pet.stage).toBe('adult');
    });

    it('should not evolve if age threshold not met', () => {
      pet.stage = 'egg';
      pet.age = 0.001; // Below threshold
      pet.checkEvolution();
      
      expect(pet.stage).toBe('egg');
    });
  });

  describe('Illness System', () => {
    it('should get sick when stats are very low', () => {
      pet.health = 15;
      pet.hunger = 15;
      pet.happiness = 15;
      pet.energy = 15;
      
      // Run check multiple times since it's probabilistic
      let gotSick = false;
      for (let i = 0; i < 10; i++) {
        pet.isSick = false; // Reset to ensure each iteration is a real check
        pet.checkSickness();
        if (pet.isSick) {
          gotSick = true;
          break;
        }
      }
      
      expect(gotSick).toBe(true);
    });

    it('should cure sickness with medicine', () => {
      pet.isSick = true;
      const result = pet.giveMedicine();
      
      expect(result).toBe(true);
      expect(pet.isSick).toBe(false);
    });

    it('should not give medicine when not sick', () => {
      pet.isSick = false;
      const result = pet.giveMedicine();
      
      expect(result).toBe(false);
    });

    it('should increase sickness chance when cleanliness is low', () => {
      pet.health = 25;
      pet.hunger = 25;
      pet.happiness = 25;
      pet.energy = 25;
      pet.cleanliness = 20; // Very low cleanliness
      
      let gotSick = false;
      for (let i = 0; i < 20; i++) {
        pet.isSick = false; // Reset to ensure each iteration is a real check
        pet.checkSickness();
        if (pet.isSick) {
          gotSick = true;
          break;
        }
      }
      
      expect(gotSick).toBe(true);
    });
  });

  describe('Personality System', () => {
    it('should increase brave trait after battle', () => {
      const initialBrave = pet.personalityTraits.brave;
      pet.updatePersonality('battle');
      
      expect(pet.personalityTraits.brave).toBeGreaterThan(initialBrave);
    });

    it('should increase friendly and energetic traits when playing', () => {
      const initialFriendly = pet.personalityTraits.friendly;
      const initialEnergetic = pet.personalityTraits.energetic;
      
      pet.updatePersonality('play');
      
      expect(pet.personalityTraits.friendly).toBeGreaterThan(initialFriendly);
      expect(pet.personalityTraits.energetic).toBeGreaterThan(initialEnergetic);
    });

    it('should increase disciplined trait when training', () => {
      const initialDisciplined = pet.personalityTraits.disciplined;
      pet.updatePersonality('train');
      
      expect(pet.personalityTraits.disciplined).toBeGreaterThan(initialDisciplined);
    });

    it('should not exceed 100 for any trait', () => {
      pet.personalityTraits.brave = 99;
      
      pet.updatePersonality('battle');
      pet.updatePersonality('battle');
      pet.updatePersonality('battle');
      
      expect(pet.personalityTraits.brave).toBeLessThanOrEqual(100);
    });
  });

  describe('Stats Decay', () => {
    it('should decay stats over time', () => {
      pet.hunger = 100;
      pet.happiness = 100;
      pet.energy = 100;
      pet.cleanliness = 100;
      pet.discipline = 100;
      pet.lastUpdateTime = Date.now() - (60 * 1000); // 1 minute ago
      
      pet.updateStatsFromTimePassed();
      
      expect(pet.hunger).toBeLessThan(100);
      expect(pet.happiness).toBeLessThan(100);
      expect(pet.energy).toBeLessThan(100);
      expect(pet.cleanliness).toBeLessThan(100);
      expect(pet.discipline).toBeLessThan(100);
    });

    it('should restore energy when sleeping', () => {
      pet.isSleeping = true;
      pet.energy = 50;
      pet.lastUpdateTime = Date.now() - (60 * 1000); // 1 minute ago
      
      pet.updateStatsFromTimePassed();
      
      expect(pet.energy).toBeGreaterThan(50);
    });

    it('should reduce decay rate when sleeping', () => {
      pet.isSleeping = true;
      pet.hunger = 100;
      pet.happiness = 100;
      pet.cleanliness = 100;
      pet.lastUpdateTime = Date.now() - (60 * 1000); // 1 minute ago
      
      pet.updateStatsFromTimePassed();
      
      // When sleeping, decay is 50% of normal rate
      // Normal hunger decay: 1.5/min, sleeping: 0.75/min
      expect(pet.hunger).toBeGreaterThan(99); // Should be ~99.25
      expect(pet.happiness).toBeGreaterThan(99.4); // Should be ~99.5
      expect(pet.cleanliness).toBeGreaterThan(99.2); // Should be ~99.4
    });

    it('should have diminishing decay for long absences', () => {
      pet.hunger = 100;
      pet.happiness = 100;
      pet.energy = 100;
      pet.lastUpdateTime = Date.now() - (600 * 60 * 1000); // 10 hours ago
      
      pet.updateStatsFromTimePassed();
      
      // After 10 hours with diminishing decay, stats should be heavily depleted
      // With new decay rates (1.5/min) and diminishing decay (multiplier ~0.2), hunger loss = 600 * 1.5 * 0.2 = 180
      // Stats will be at or near 0 for long absences with new faster decay rates
      expect(pet.hunger).toBeLessThan(10); // Very low or 0
      expect(pet.happiness).toBeLessThan(10); // Very low or 0
      expect(pet.energy).toBeLessThan(10); // Very low or 0
    });

    it('should decrease health when hunger is too low', () => {
      pet.hunger = 20;
      pet.health = 100;
      pet.lastUpdateTime = Date.now() - (60 * 1000); // 1 minute ago
      
      pet.updateStatsFromTimePassed();
      
      expect(pet.health).toBeLessThan(100);
    });
  });

  describe('Clean Action', () => {
    it('should restore cleanliness to 100', () => {
      pet.cleanliness = 50;
      pet.clean();
      
      expect(pet.cleanliness).toBe(100);
    });

    it('should increase happiness when cleaned', () => {
      pet.happiness = 50;
      pet.clean();
      
      expect(pet.happiness).toBeGreaterThan(50);
    });
  });

  describe('Stats History', () => {
    it('should record stats snapshot', () => {
      pet.recordStatsSnapshot();
      
      expect(pet.statsHistory.length).toBe(1);
      expect(pet.statsHistory[0]).toHaveProperty('timestamp');
      expect(pet.statsHistory[0]).toHaveProperty('health');
      expect(pet.statsHistory[0]).toHaveProperty('hunger');
    });

    it('should limit stats history to 144 entries', () => {
      // Add 150 snapshots
      for (let i = 0; i < 150; i++) {
        pet.recordStatsSnapshot();
      }
      
      expect(pet.statsHistory.length).toBe(144);
    });
  });

  describe('Battle Stats', () => {
    it('should calculate battle stats based on level and stats', () => {
      pet.level = 5;
      pet.health = 80;
      pet.happiness = 90;
      pet.energy = 70;
      
      const battleStats = pet.getBattleStats();
      
      expect(battleStats).toHaveProperty('maxHP');
      expect(battleStats).toHaveProperty('currentHP');
      expect(battleStats).toHaveProperty('attack');
      expect(battleStats).toHaveProperty('defense');
      expect(battleStats.maxHP).toBeGreaterThan(0);
      expect(battleStats.attack).toBeGreaterThan(0);
    });
  });

  describe('After Battle Update', () => {
    it('should increase wins when winning', () => {
      const initialWins = pet.wins;
      pet.updateAfterBattle(true, 'Opponent');
      
      expect(pet.wins).toBe(initialWins + 1);
    });

    it('should decrease energy after battle', () => {
      pet.energy = 100;
      pet.updateAfterBattle(true, 'Opponent');
      
      expect(pet.energy).toBeLessThan(100);
    });

    it('should record battle in history', () => {
      pet.updateAfterBattle(true, 'Test Opponent');
      
      expect(pet.battleHistory.length).toBe(1);
      expect(pet.battleHistory[0].won).toBe(true);
      expect(pet.battleHistory[0].opponent).toBe('Test Opponent');
    });

    it('should limit battle history to 10 entries', () => {
      for (let i = 0; i < 15; i++) {
        pet.updateAfterBattle(true, `Opponent ${i}`);
      }
      
      expect(pet.battleHistory.length).toBe(10);
    });
  });
});
