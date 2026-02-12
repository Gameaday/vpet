// Pet class managing the virtual pet's state and behavior
class Pet {
    // Appearance trait options (single source of truth)
    static APPEARANCE_OPTIONS = {
        eyeShapes: ['round', 'oval', 'star', 'heart'],
        eyeColors: ['black', 'blue', 'green', 'brown', 'purple'],
        mouthShapes: ['happy', 'neutral', 'sad', 'surprised'],
        bodyColors: ['default', 'golden', 'crimson', 'azure', 'emerald', 'violet'],
        bodySizes: ['normal', 'small', 'large']
    };
    
    constructor() {
        this.name = '???'; // Egg starts with unknown name
        this.stage = 'egg'; // egg, baby, child, teen, adult
        this.health = 100;
        this.hunger = 100;
        this.happiness = 100;
        this.energy = 100;
        this.age = 0; // in days
        this.level = 1;
        this.wins = 0;
        this.isSleeping = false;
        this.birthTime = Date.now();
        this.lastUpdateTime = Date.now();
        this.battleHistory = []; // Track last 10 battles
        this.statsHistory = []; // Track stats over time for graphs
        this.isSick = false; // Illness system
        this.sicknessDuration = 0; // How long pet has been sick
        this.personalityTraits = {
            brave: 50,
            friendly: 50,
            energetic: 50,
            disciplined: 50
        }; // Personality system (0-100 scale)
        this.discipline = 100; // New stat for training effectiveness
        this.cleanliness = 100; // New stat for hygiene
        
        // Egg incubation system
        this.warmth = 0; // Warmth stat for eggs (0-100) - starts cold
        this.incubationTime = 0; // Time in milliseconds with proper warmth
        this.hasHatched = false; // Track if egg has hatched
        this.isIncubating = false; // Track if egg is currently being incubated
        
        // Hibernation tracking (for age calculation)
        this.totalHibernationTime = 0; // Total time spent in hibernation (milliseconds)
        
        // Visual appearance traits - initialized on first hatch
        this.appearance = {
            eyeShape: 'round', // round, oval, star, heart
            eyeColor: 'black', // black, blue, green, brown, purple
            mouthShape: 'happy', // happy, neutral, sad, surprised
            bodyColor: 'default', // default, golden, crimson, azure, emerald, violet
            bodySize: 'normal' // normal, small, large (relative to stage)
        };
        
        // Load saved pet or create new one
        this.load();
    }

    // Validate and clamp stat values to ensure they're in valid range
    validateStats() {
        this.health = Math.max(0, Math.min(100, this.health));
        this.hunger = Math.max(0, Math.min(100, this.hunger));
        this.happiness = Math.max(0, Math.min(100, this.happiness));
        this.energy = Math.max(0, Math.min(100, this.energy));
        this.discipline = Math.max(0, Math.min(100, this.discipline));
        this.cleanliness = Math.max(0, Math.min(100, this.cleanliness));
        this.warmth = Math.max(0, Math.min(100, this.warmth));
        this.level = Math.max(1, this.level);
        this.wins = Math.max(0, this.wins);
        this.incubationTime = Math.max(0, this.incubationTime);
        
        // Validate stage
        const validStages = ['egg', 'baby', 'child', 'teen', 'adult'];
        if (!validStages.includes(this.stage)) {
            this.stage = 'egg';
        }
    }

    // Save pet to localStorage
    save() {
        try {
            // Validate stats before saving
            this.validateStats();
            
            const petData = {
                name: this.name,
                stage: this.stage,
                health: this.health,
                hunger: this.hunger,
                happiness: this.happiness,
                energy: this.energy,
                age: this.age,
                level: this.level,
                wins: this.wins,
                isSleeping: this.isSleeping,
                birthTime: this.birthTime,
                lastUpdateTime: this.lastUpdateTime,
                battleHistory: this.battleHistory || [],
                statsHistory: this.statsHistory || [],
                isSick: this.isSick || false,
                sicknessDuration: this.sicknessDuration || 0,
                personalityTraits: this.personalityTraits || {brave: 50, friendly: 50, energetic: 50, disciplined: 50},
                discipline: this.discipline || 100,
                cleanliness: this.cleanliness || 100,
                warmth: this.warmth || 50,
                incubationTime: this.incubationTime || 0,
                hasHatched: this.hasHatched || false,
                isIncubating: this.isIncubating || false,
                totalHibernationTime: this.totalHibernationTime || 0,
                appearance: this.appearance || {eyeShape: 'round', eyeColor: 'black', mouthShape: 'happy', bodyColor: 'default', bodySize: 'normal'}
            };
            
            // Check if localStorage is available and has space
            const dataString = JSON.stringify(petData);
            try {
                localStorage.setItem('vpet_data', dataString);
            } catch {
                // Handle quota exceeded error
                console.error('localStorage quota exceeded. Clearing old data...');
                // Keep only last 10 battles and last 24 hours of stats
                if (this.battleHistory.length > 10) {
                    this.battleHistory = this.battleHistory.slice(-10);
                }
                const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
                if (this.statsHistory.length > 0) {
                    this.statsHistory = this.statsHistory.filter(s => s.timestamp > oneDayAgo);
                }
                // Try again with reduced data
                petData.battleHistory = this.battleHistory;
                petData.statsHistory = this.statsHistory;
                localStorage.setItem('vpet_data', JSON.stringify(petData));
            }
        } catch (error) {
            console.error('Error saving pet data:', error);
            // Fail gracefully - continue running with in-memory state
        }
    }

    // Load pet from localStorage
    load() {
        try {
            const savedData = localStorage.getItem('vpet_data');
            if (savedData) {
                try {
                    const petData = JSON.parse(savedData);
                    
                    // Validate and sanitize pet name
                    if (petData.name && typeof petData.name === 'string') {
                        // Remove HTML tags and dangerous characters, limit length
                        // Use multiple passes to ensure all HTML is removed
                        let safeName = petData.name;
                        // Remove all < and > characters to prevent any HTML injection
                        safeName = safeName.replace(/[<>]/g, '');
                        // Trim and limit length
                        safeName = safeName.trim().substring(0, 50);
                        this.name = safeName || 'My Pet';
                    }
                    
                    this.stage = petData.stage || 'egg';
                    this.health = Number(petData.health) || 100;
                    this.hunger = Number(petData.hunger) || 100;
                    this.happiness = Number(petData.happiness) || 100;
                    this.energy = Number(petData.energy) || 100;
                    this.age = Number(petData.age) || 0;
                    this.level = Number(petData.level) || 1;
                    this.wins = Number(petData.wins) || 0;
                    this.isSleeping = Boolean(petData.isSleeping);
                    this.birthTime = Number(petData.birthTime) || Date.now();
                    this.lastUpdateTime = Number(petData.lastUpdateTime) || Date.now();
                    this.battleHistory = Array.isArray(petData.battleHistory) ? petData.battleHistory : [];
                    this.statsHistory = Array.isArray(petData.statsHistory) ? petData.statsHistory : [];
                    this.isSick = Boolean(petData.isSick);
                    this.sicknessDuration = Number(petData.sicknessDuration) || 0;
                    this.personalityTraits = petData.personalityTraits || {brave: 50, friendly: 50, energetic: 50, disciplined: 50};
                    this.discipline = Number(petData.discipline) || 100;
                    this.cleanliness = Number(petData.cleanliness) || 100;
                    this.warmth = Number(petData.warmth) || 50;
                    this.incubationTime = Number(petData.incubationTime) || 0;
                    this.hasHatched = Boolean(petData.hasHatched);
                    this.isIncubating = Boolean(petData.isIncubating);
                    this.totalHibernationTime = Number(petData.totalHibernationTime) || 0;
                    
                    // Load appearance traits or set defaults
                    if (petData.appearance && typeof petData.appearance === 'object') {
                        this.appearance = {
                            eyeShape: petData.appearance.eyeShape || 'round',
                            eyeColor: petData.appearance.eyeColor || 'black',
                            mouthShape: petData.appearance.mouthShape || 'happy',
                            bodyColor: petData.appearance.bodyColor || 'default',
                            bodySize: petData.appearance.bodySize || 'normal'
                        };
                    }
                    
                    // Validate all stats are in proper ranges
                    this.validateStats();
                    
                    // Update stats based on time passed
                    this.updateStatsFromTimePassed();
                } catch (parseError) {
                    console.error('Error parsing pet data. Starting fresh:', parseError);
                    // Data is corrupted, start fresh but keep localStorage key for future saves
                }
            }
        } catch (error) {
            console.error('Error accessing localStorage:', error);
            // localStorage not available or blocked - continue with default values
        }
    }

    // Update stats based on time that passed since last update
    updateStatsFromTimePassed(hibernationManager = null) {
        const now = Date.now();
        const timePassed = now - this.lastUpdateTime;
        const minutesPassed = timePassed / (1000 * 60);
        
        // Store old stats for comparison
        const oldStats = {
            health: this.health,
            hunger: this.hunger,
            happiness: this.happiness,
            energy: this.energy
        };
        
        // Skip stat updates if pet is hibernating
        if (hibernationManager && hibernationManager.shouldFreezePet()) {
            // Only update lastUpdateTime, no stat decay or aging during hibernation
            this.lastUpdateTime = now;
            this.save();
            return null;
        }
        
        // Eggs only decay warmth, not other stats
        if (this.stage === 'egg' && !this.hasHatched) {
            if (this.isIncubating) {
                // Gradually increase warmth when incubating
                // 0.33 per second = 20 per minute (reaches 100 from 0 in 5 minutes)
                const warmthIncreaseRate = (typeof GLOBAL_CONSTANTS !== 'undefined' && GLOBAL_CONSTANTS?.INCUBATION?.WARMTH_INCREASE_RATE) || 0.33;
                const warmthIncrease = (timePassed / 1000) * warmthIncreaseRate;
                this.warmth = Math.min(100, this.warmth + warmthIncrease);
            } else {
                // Warmth decays when not incubating (1.5 per minute)
                const warmthDecay = 1.5;
                this.warmth = Math.max(0, this.warmth - (minutesPassed * warmthDecay));
            }
            
            // Track incubation time if warmth is adequate (>= 60)
            if (this.warmth >= 60) {
                this.incubationTime += timePassed;
            }
            
            this.lastUpdateTime = now;
            this.save();
            return null;
        }
        
        // Base decay rates per minute (for non-egg pets)
        const hungerDecay = 0.5;
        const happinessDecay = 0.3;
        const energyDecay = 0.2;
        const cleanlinessDecay = 0.4;
        const disciplineDecay = 0.1;
        
        // Calculate diminishing decay factor for long absences
        // This makes the game more forgiving when users are away for extended periods
        // After 60 minutes, decay starts to slow down logarithmically
        let decayMultiplier = 1.0;
        if (minutesPassed > 60) {
            // Use logarithmic decay reduction: starts at 1.0, approaches 0.2 for very long periods
            // The coefficient 0.35 was chosen to balance meaningful short-term gameplay
            // with forgiveness for 8-10 hour absences (sleep, work, school)
            // At 60 min: multiplier = 1.0
            // At 120 min: multiplier ≈ 0.76
            // At 360 min (6h): multiplier ≈ 0.37
            // At 600 min (10h): multiplier ≈ 0.20 (minimum)
            // At 1440 min (24h): multiplier ≈ 0.20 (minimum)
            decayMultiplier = Math.max(0.2, 1.0 - (Math.log(minutesPassed / 60) * 0.35));
        }
        
        if (!this.isSleeping) {
            this.hunger = Math.max(0, this.hunger - (minutesPassed * hungerDecay * decayMultiplier));
            this.happiness = Math.max(0, this.happiness - (minutesPassed * happinessDecay * decayMultiplier));
            this.energy = Math.max(0, this.energy - (minutesPassed * energyDecay * decayMultiplier));
            this.cleanliness = Math.max(0, this.cleanliness - (minutesPassed * cleanlinessDecay * decayMultiplier));
            this.discipline = Math.max(0, this.discipline - (minutesPassed * disciplineDecay * decayMultiplier));
        } else {
            // Restore energy while sleeping, but slower during long periods away
            // After 2 hours (120 min), reduce restore rate from 1.0 to 0.5 per minute
            // This simulates the pet naturally waking up and not sleeping continuously
            // for the entire extended absence (prevents energy from maxing out unrealistically)
            const sleepRestoreRate = minutesPassed > 120 ? 0.5 : 1.0;
            this.energy = Math.min(100, this.energy + (minutesPassed * sleepRestoreRate));
            
            // When sleeping, other stats decay at 50% rate (pet is resting, not as active)
            this.hunger = Math.max(0, this.hunger - (minutesPassed * hungerDecay * 0.5 * decayMultiplier));
            this.happiness = Math.max(0, this.happiness - (minutesPassed * happinessDecay * 0.5 * decayMultiplier));
            this.cleanliness = Math.max(0, this.cleanliness - (minutesPassed * cleanlinessDecay * 0.5 * decayMultiplier));
            this.discipline = Math.max(0, this.discipline - (minutesPassed * disciplineDecay * 0.5 * decayMultiplier));
        }
        
        // Health decreases if hunger is too low
        if (this.hunger < 30) {
            this.health = Math.max(0, this.health - (minutesPassed * 0.5 * decayMultiplier));
        }
        
        // Update age (keep as decimal for accurate evolution tracking)
        // Subtract total hibernation time from age calculation
        const totalLifetime = now - this.birthTime;
        let hibernationTime = this.totalHibernationTime || 0;
        
        // Validate hibernation time doesn't exceed total lifetime
        if (hibernationTime > totalLifetime) {
            console.warn('Hibernation time exceeds total lifetime. Resetting hibernation time.');
            this.totalHibernationTime = 0;
            hibernationTime = 0;
        }
        
        const totalLiveTime = totalLifetime - hibernationTime;
        const daysPassed = totalLiveTime / (1000 * 60 * 60 * 24);
        this.age = Math.max(0, daysPassed); // Don't floor - evolution needs precise age
        
        // Check for evolution
        this.checkEvolution();
        
        this.lastUpdateTime = now;
        this.save();
        
        // Return time away info if significant time passed (>5 minutes)
        if (minutesPassed > 5) {
            return {
                timePassed: minutesPassed,
                oldStats: oldStats,
                needsAttention: this.health < 50 || this.hunger < 50 || this.happiness < 50
            };
        }
        return null;
    }

    // Check and handle evolution
    checkEvolution() {
        const oldStage = this.stage;
        
        if (this.stage === 'egg' && this.age >= 0.01) { // ~15 minutes
            this.stage = 'baby';
        } else if (this.stage === 'baby' && this.age >= 0.05) { // ~1 hour
            this.stage = 'child';
        } else if (this.stage === 'child' && this.age >= 0.1) { // ~2.4 hours
            this.stage = 'teen';
        } else if (this.stage === 'teen' && this.age >= 0.2) { // ~5 hours
            this.stage = 'adult';
        }
        
        if (oldStage !== this.stage) {
            this.onEvolution();
        }
    }

    // Handle evolution event
    onEvolution() {
        this.level++;
        
        // Enhanced notification with visual change description
        const stageDescriptions = {
            'baby': '🐣 Your egg hatched into a baby! It\'s small and adorable.',
            'child': '🌱 Your baby grew into a child! It\'s getting bigger and more active.',
            'teen': '⚡ Your child became a teen! It\'s developing its unique personality.',
            'adult': '👑 Your teen evolved into an adult! It has reached full maturity!'
        };
        
        const description = stageDescriptions[this.stage] || `🎉 Your pet evolved to ${this.stage}!`;
        showNotification(description, 'success');
        
        // Trigger evolution particle effects
        if (typeof window !== 'undefined' && window.particleEffects) {
            const petSprite = document.getElementById('petSprite');
            if (petSprite) {
                const rect = petSprite.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                window.particleEffects.showEvolution(x, y);
            }
        }
        
        this.save();
    }

    // Get evolution progress information
    getEvolutionProgress() {
        const daysPassed = (Date.now() - this.birthTime) / (1000 * 60 * 60 * 24);
        
        const stages = {
            'egg': { next: 'baby', threshold: 0.01, name: 'Baby' },
            'baby': { next: 'child', threshold: 0.05, name: 'Child' },
            'child': { next: 'teen', threshold: 0.1, name: 'Teen' },
            'teen': { next: 'adult', threshold: 0.2, name: 'Adult' },
            'adult': { next: null, threshold: null, name: null }
        };
        
        const currentStage = stages[this.stage];
        if (!currentStage.next) {
            return null; // Already at final stage
        }
        
        const previousThreshold = this.stage === 'egg' ? 0 : 
            this.stage === 'baby' ? 0.01 : 
            this.stage === 'child' ? 0.05 : 0.1;
        
        const progress = ((daysPassed - previousThreshold) / (currentStage.threshold - previousThreshold)) * 100;
        const timeRemaining = (currentStage.threshold - daysPassed) * 24 * 60; // in minutes
        
        return {
            nextStage: currentStage.name,
            progress: Math.min(100, Math.max(0, progress)),
            timeRemaining: Math.max(0, timeRemaining)
        };
    }

    // Get human-readable age display (shows largest non-zero unit)
    getAgeDisplay() {
        const ageInDays = this.age;
        
        // If less than 1 day, show in hours or minutes
        if (ageInDays < 1) {
            const ageInHours = ageInDays * 24;
            
            // If less than 1 hour, show in minutes
            if (ageInHours < 1) {
                const ageInMinutes = Math.floor(ageInHours * 60);
                if (ageInMinutes < 1) {
                    return '< 1 minute';
                }
                return ageInMinutes === 1 ? '1 minute' : `${ageInMinutes} minutes`;
            }
            
            // Show in hours
            const hours = Math.floor(ageInHours);
            return hours === 1 ? '1 hour' : `${hours} hours`;
        }
        
        // Show in days
        const days = Math.floor(ageInDays);
        return days === 1 ? '1 day' : `${days} days`;
    }

    // Warm the egg (only for egg stage) - toggles incubation
    warm() {
        if (this.stage !== 'egg' || this.hasHatched) {
            showNotification('This action is only for eggs!', 'warning');
            return false;
        }
        
        // Toggle incubation state
        this.isIncubating = !this.isIncubating;
        
        if (this.isIncubating) {
            showNotification('🔥 Started incubating! Warmth will increase gradually.', 'success');
        } else {
            showNotification('❄️ Stopped incubating. Warmth will start to decay.', 'info');
        }
        
        this.save();
        return true;
    }

    // Check if egg is ready to hatch
    canHatch() {
        // Egg can hatch when warmth reaches 100%
        return this.stage === 'egg' && 
               !this.hasHatched && 
               this.warmth >= 100;
    }

    // Hatch the egg
    hatch() {
        if (!this.canHatch()) {
            if (this.stage !== 'egg') {
                showNotification('Your pet has already hatched!', 'info');
            } else if (this.warmth < 100) {
                const percentRemaining = Math.ceil(100 - this.warmth);
                showNotification(`🌡️ Keep incubating! Warmth needs to reach 100% (${percentRemaining}% remaining)`, 'warning');
            }
            return false;
        }
        
        // Stop incubating when hatching
        this.isIncubating = false;
        
        // Hatch the egg!
        this.hasHatched = true;
        this.stage = 'baby';
        this.birthTime = Date.now(); // Reset birth time for accurate age tracking
        this.age = 0;
        
        // Generate random appearance traits for the newly hatched pet
        this.generateRandomAppearance();
        
        // Initialize stats for the hatched pet
        this.health = 100;
        this.hunger = 100;
        this.happiness = 100;
        this.energy = 100;
        this.cleanliness = 100;
        this.discipline = 100;
        
        showNotification('🎉 Your egg hatched into a baby pet!', 'success');
        this.save();
        return true;
    }
    
    // Generate random appearance traits for the pet
    generateRandomAppearance() {
        const options = Pet.APPEARANCE_OPTIONS;
        
        this.appearance = {
            eyeShape: options.eyeShapes[Math.floor(Math.random() * options.eyeShapes.length)],
            eyeColor: options.eyeColors[Math.floor(Math.random() * options.eyeColors.length)],
            mouthShape: options.mouthShapes[Math.floor(Math.random() * options.mouthShapes.length)],
            bodyColor: options.bodyColors[Math.floor(Math.random() * options.bodyColors.length)],
            bodySize: options.bodySizes[Math.floor(Math.random() * options.bodySizes.length)]
        };
    }

    // Feed the pet
    feed() {
        if (this.isSleeping) {
            showNotification('💤 Your pet is sleeping!', 'warning');
            return false;
        }
        
        if (this.hunger >= 90) {
            showNotification('🍖 Your pet is not hungry!', 'info');
            return false;
        }
        
        this.hunger = Math.min(100, this.hunger + 30);
        this.happiness = Math.min(100, this.happiness + 5);
        this.health = Math.min(100, this.health + 5);
        showNotification('🍖 Fed your pet!', 'success');
        this.save();
        return true;
    }

    // Play with the pet
    play() {
        if (this.isSleeping) {
            showNotification('💤 Your pet is sleeping!', 'warning');
            return false;
        }
        
        if (this.energy < 20) {
            showNotification('😴 Your pet is too tired to play!', 'warning');
            return false;
        }
        
        this.happiness = Math.min(100, this.happiness + 20);
        this.energy = Math.max(0, this.energy - 15);
        this.hunger = Math.max(0, this.hunger - 10);
        showNotification('🎮 Played with your pet!', 'success');
        this.save();
        return true;
    }

    // Put pet to sleep
    sleep() {
        if (this.isSleeping) {
            // Wake up
            this.isSleeping = false;
            showNotification('☀️ Your pet woke up!');
        } else {
            // Go to sleep
            this.isSleeping = true;
            showNotification('💤 Your pet is now sleeping...');
        }
        this.save();
        return true;
    }

    // Wake up the pet (explicit method for clarity)
    wakeUp() {
        if (this.isSleeping) {
            this.isSleeping = false;
            showNotification('☀️ Your pet woke up!');
            this.save();
        }
        return true;
    }

    // Train the pet
    train() {
        if (this.isSleeping) {
            showNotification('💤 Your pet is sleeping!');
            return false;
        }
        
        if (this.energy < 30) {
            showNotification('😴 Your pet is too tired to train!');
            return false;
        }
        
        this.level += 0.1;
        this.discipline = Math.min(100, this.discipline + 5);
        this.energy = Math.max(0, this.energy - 25);
        this.hunger = Math.max(0, this.hunger - 20);
        this.happiness = Math.max(0, this.happiness - 5);
        showNotification('💪 Your pet trained hard!');
        this.save();
        return true;
    }

    // Get battle stats
    getBattleStats() {
        const baseAttack = 10 + (this.level * 5);
        const baseDefense = 5 + (this.level * 3);
        const baseHP = 50 + (this.level * 10);
        
        // Stats are affected by pet's condition
        const conditionMultiplier = (this.health + this.hunger + this.happiness + this.energy) / 400;
        
        return {
            maxHP: Math.floor(baseHP),
            currentHP: Math.floor(baseHP),
            attack: Math.floor(baseAttack * conditionMultiplier),
            defense: Math.floor(baseDefense * conditionMultiplier),
            level: Math.floor(this.level)
        };
    }

    // Update stats after battle
    updateAfterBattle(won, opponentName = 'Opponent') {
        if (won) {
            this.wins++;
            this.level += 0.5;
            this.happiness = Math.min(100, this.happiness + 10);
            showNotification('🏆 Victory! Your pet gained experience!', 'success');
        } else {
            this.happiness = Math.max(0, this.happiness - 10);
            this.health = Math.max(0, this.health - 10);
            showNotification('💔 Defeat! Your pet needs care.', 'error');
        }
        
        this.energy = Math.max(0, this.energy - 30);
        
        // Record battle in history
        this.recordBattle(won, opponentName);
        
        this.save();
    }
    
    // Record battle in history (keep last 10)
    recordBattle(won, opponentName) {
        const battleRecord = {
            date: Date.now(),
            won: won,
            opponent: opponentName,
            petLevel: Math.floor(this.level),
            timestamp: new Date().toLocaleString()
        };
        
        this.battleHistory.unshift(battleRecord);
        
        // Keep only last 10 battles
        if (this.battleHistory.length > 10) {
            this.battleHistory = this.battleHistory.slice(0, 10);
        }
    }

    // Reset pet
    reset() {
        this.name = 'My Pet';
        this.stage = 'egg';
        this.health = 100;
        this.hunger = 100;
        this.happiness = 100;
        this.energy = 100;
        this.age = 0;
        this.level = 1;
        this.wins = 0;
        this.isSleeping = false;
        this.birthTime = Date.now();
        this.lastUpdateTime = Date.now();
        this.battleHistory = [];
        this.statsHistory = [];
        this.isSick = false;
        this.sicknessDuration = 0;
        this.personalityTraits = {brave: 50, friendly: 50, energetic: 50, disciplined: 50};
        this.discipline = 100;
        this.cleanliness = 100;
        this.save();
    }
    
    // Record stats snapshot for history tracking
    recordStatsSnapshot() {
        const snapshot = {
            timestamp: Date.now(),
            health: this.health,
            hunger: this.hunger,
            happiness: this.happiness,
            energy: this.energy,
            level: this.level
        };
        
        this.statsHistory.push(snapshot);
        
        // Keep only last 24 hours of data (144 snapshots at 10-minute intervals)
        if (this.statsHistory.length > 144) {
            this.statsHistory = this.statsHistory.slice(-144);
        }
    }
    
    // Get stats history for graphing
    getStatsHistory() {
        return this.statsHistory;
    }
    
    // Check for and handle sickness
    checkSickness() {
        // Pet can get sick if stats are very low or if cleanliness is very low
        if (!this.isSick) {
            const avgStats = (this.health + this.hunger + this.happiness + this.energy) / 4;
            // Low cleanliness increases sickness chance
            const cleanlinessModifier = this.cleanliness < 30 ? 0.15 : 0;
            const sicknessChance = (avgStats < 20 ? 0.3 : avgStats < 30 ? 0.1 : 0) + cleanlinessModifier;
            
            if (Math.random() < sicknessChance) {
                this.isSick = true;
                this.sicknessDuration = 0;
                showNotification('🤒 Your pet is sick! Give it medicine or improve stats.', 'warning');
            }
        } else {
            // Recover from sickness if stats are good and time has passed
            this.sicknessDuration++;
            const avgStats = (this.health + this.hunger + this.happiness + this.energy) / 4;
            
            if (avgStats > 70 && this.sicknessDuration > 10) {
                this.isSick = false;
                this.sicknessDuration = 0;
                showNotification('✨ Your pet has recovered!', 'success');
            }
        }
    }
    
    // Give medicine to cure sickness
    giveMedicine() {
        if (this.isSick) {
            this.isSick = false;
            this.sicknessDuration = 0;
            this.health = Math.min(100, this.health + 20);
            showNotification('💊 Medicine administered! Your pet is recovering.', 'success');
            this.save();
            return true;
        } else {
            showNotification('ℹ️ Your pet is not sick!', 'info');
            return false;
        }
    }
    
    // Clean pet (hygiene system)
    clean() {
        this.cleanliness = 100;
        this.happiness = Math.min(100, this.happiness + 5);
        showNotification('🧹 Your pet is clean and happy!', 'success');
        this.save();
    }
    
    // Update personality based on actions
    updatePersonality(actionType) {
        switch (actionType) {
            case 'battle':
                this.personalityTraits.brave = Math.min(100, this.personalityTraits.brave + 1);
                break;
            case 'play':
                this.personalityTraits.friendly = Math.min(100, this.personalityTraits.friendly + 1);
                this.personalityTraits.energetic = Math.min(100, this.personalityTraits.energetic + 1);
                break;
            case 'train':
                this.personalityTraits.disciplined = Math.min(100, this.personalityTraits.disciplined + 1);
                break;
            case 'neglect':
                this.personalityTraits.friendly = Math.max(0, this.personalityTraits.friendly - 2);
                break;
        }
    }
    
    // Get personality description
    getPersonalityDescription() {
        const traits = this.personalityTraits;
        let description = [];
        
        if (traits.brave > 70) description.push('Brave');
        if (traits.friendly > 70) description.push('Friendly');
        if (traits.energetic > 70) description.push('Energetic');
        if (traits.disciplined > 70) description.push('Disciplined');
        
        if (description.length === 0) description.push('Balanced');
        
        return description.join(', ');
    }

    // Get pet data for serialization
    toJSON() {
        return {
            name: this.name,
            stage: this.stage,
            health: this.health,
            hunger: this.hunger,
            happiness: this.happiness,
            energy: this.energy,
            age: this.age,
            level: Math.floor(this.level),
            wins: this.wins
        };
    }

    /**
     * Add hibernation time to track total time spent hibernating
     * @param {number} milliseconds - Time in milliseconds to add
     */
    addHibernationTime(milliseconds) {
        this.totalHibernationTime = (this.totalHibernationTime || 0) + milliseconds;
        this.save();
    }
}

// Notification helper function
function showNotification(message, type = 'info') {
    // Check if DOM element exists (for testing environment compatibility)
    if (typeof document === 'undefined') return;
    
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    
    // Remove previous type classes
    notification.classList.remove('success', 'warning', 'error', 'info');
    
    // Add new type class
    notification.classList.add(type);
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Pet };
}
