/**
 * Global Constants Module
 * Centralizes all magic numbers and configuration values for maintainability
 */

const GLOBAL_CONSTANTS = {
    // ===== STAT THRESHOLDS =====
    STATS: {
        MIN: 0,
        MAX: 100,
        CRITICAL_THRESHOLD: 30,      // Stats below this are critical
        WARNING_THRESHOLD: 50,        // Stats below this show warning
        HEALTHY_THRESHOLD: 90,        // Stats above this are considered healthy
        DEFAULT_START: 100            // Initial stat values
    },

    // ===== EVOLUTION TIMINGS (in milliseconds) =====
    EVOLUTION: {
        EGG_TO_BABY: 15 * 60 * 1000,        // 15 minutes
        BABY_TO_CHILD: 60 * 60 * 1000,       // 1 hour
        CHILD_TO_TEEN: 144 * 60 * 1000,      // 2.4 hours
        TEEN_TO_ADULT: 300 * 60 * 1000       // 5 hours
    },

    // ===== EGG INCUBATION =====
    INCUBATION: {
        TIME_REQUIRED: 5 * 60 * 1000,        // 5 minutes
        MIN_WARMTH: 60,                       // Minimum warmth needed to incubate
        WARMTH_DECAY_RATE: 0.5,               // Per minute
        WARMTH_INCREASE_PER_ACTION: 10,       // Per warm action (legacy)
        WARMTH_INCREASE_RATE: 0.33,           // Per second when incubating (20 per minute)
        WARMTH_TARGET: 100                    // Target warmth to enable hatching
    },

    // ===== STAT DECAY RATES (per minute) =====
    DECAY_RATES: {
        HUNGER: 0.5,
        HAPPINESS: 0.2,
        ENERGY: 0.15,
        CLEANLINESS: 0.3,
        DISCIPLINE: 0.1,
        HEALTH_FROM_LOW_HUNGER: 0.5          // Health decay when hunger < 30
    },

    // ===== STAT RESTORATION AMOUNTS =====
    RESTORATION: {
        FEED: {
            HUNGER: 30,
            HAPPINESS: 5,
            HEALTH: 5
        },
        PLAY: {
            HAPPINESS: 20,
            ENERGY_COST: 15,
            HUNGER_COST: 10
        },
        TRAIN: {
            ENERGY_COST: 20,
            HUNGER_COST: 15,
            EXP_GAIN: 10
        },
        SLEEP: {
            ENERGY_PER_MINUTE: 1.0,
            ENERGY_PER_MINUTE_LONG_ABSENCE: 0.5  // After 2 hours
        },
        CLEAN: {
            CLEANLINESS: 40,
            HAPPINESS: 5
        },
        MEDICINE: {
            HEALTH: 20
        }
    },

    // ===== ACTION REQUIREMENTS =====
    ACTION_REQUIREMENTS: {
        PLAY_MIN_ENERGY: 20,
        TRAIN_MIN_ENERGY: 30,
        BATTLE_MIN_ENERGY: 30
    },

    // ===== BATTLE CONFIGURATION =====
    BATTLE: {
        BASE_ATTACK: 10,
        ATTACK_PER_LEVEL: 2,
        BASE_DEFENSE: 8,
        DEFENSE_PER_LEVEL: 2,
        BASE_HP: 100,
        HP_PER_LEVEL: 10,
        SPECIAL_MULTIPLIER: 1.5,
        DEFEND_REDUCTION: 0.5,
        CRITICAL_CHANCE: 0.1,
        CRITICAL_MULTIPLIER: 2.0,
        BASE_COIN_REWARD: 10,
        COIN_PER_LEVEL: 2
    },

    // ===== ILLNESS SYSTEM =====
    ILLNESS: {
        BASE_CHANCE_LOW_STATS: 0.1,          // When avg stats < 30
        BASE_CHANCE_VERY_LOW_STATS: 0.3,     // When avg stats < 20
        CLEANLINESS_MODIFIER: 0.15,          // Added when cleanliness < 30
        RECOVERY_STAT_THRESHOLD: 70,        // Avg stats needed for recovery
        RECOVERY_TIME_TICKS: 10             // Number of update cycles before recovery
    },

    // ===== TIMING INTERVALS (in milliseconds) =====
    TIMERS: {
        STATS_UPDATE: 10000,                 // Update stats every 10 seconds
        AUTO_SAVE: 30000,                    // Auto-save every 30 seconds
        LONG_ABSENCE_THRESHOLD: 60,         // Minutes considered "long absence"
        DECAY_REDUCTION_THRESHOLD: 120      // Minutes when decay reduction starts
    },

    // ===== UI CONFIGURATION =====
    UI: {
        NOTIFICATION_DURATION: 3000,         // Notification display time (ms)
        TOAST_DURATION: 3000,                // Toast display time (ms)
        SAVE_INDICATOR_DURATION: 2000,      // Save indicator display time (ms)
        ANIMATION_DURATION: 300,             // Standard animation duration (ms)
        SWIPE_THRESHOLD: 50,                 // Pixels for swipe detection
        TOUCH_TARGET_MIN_SIZE: 44,           // Minimum touch target size (px)
        DEBOUNCE_DELAY: 300,                 // Debounce delay for inputs (ms)
        THROTTLE_DELAY: 100                  // Throttle delay for scroll/resize (ms)
    },

    // ===== VALIDATION LIMITS =====
    VALIDATION: {
        PET_NAME_MIN_LENGTH: 2,
        PET_NAME_MAX_LENGTH: 50,
        MAX_FRIENDS: 100,
        MAX_INVENTORY_SLOTS: 30,
        MAX_BACKUPS: 5,
        MAX_STAT_HISTORY_ENTRIES: 144       // 24 hours at 10-minute intervals
    },

    // ===== PREMIUM TIERS =====
    PREMIUM: {
        FREE: {
            COIN_MULTIPLIER: 1,
            HIBERNATION_DAYS: 1,
            MAX_EVOLUTION_PATHS: 4
        },
        BASIC: {
            COIN_MULTIPLIER: 2,
            HIBERNATION_DAYS: 7,
            MAX_EVOLUTION_PATHS: 6
        },
        PLUS: {
            COIN_MULTIPLIER: 3,
            HIBERNATION_DAYS: Infinity,
            MAX_EVOLUTION_PATHS: 10
        }
    },

    // ===== TOURNAMENT CONFIGURATION =====
    TOURNAMENT: {
        SIZES: [4, 8, 16],
        PRIZES: {
            4: 100,
            8: 250,
            16: 500
        },
        ENTRY_FEES: {
            4: 0,
            8: 0,
            16: 0  // Free for all currently
        }
    },

    // ===== SHOP CONFIGURATION =====
    SHOP: {
        MAX_ITEM_STACK: 99,
        REFRESH_COOLDOWN: 86400000,          // 24 hours
        DISCOUNT_PERCENTAGE: 10              // For premium users
    },

    // ===== MINIGAME CONFIGURATION =====
    MINIGAME: {
        BASE_REWARD: 5,
        PERFECT_SCORE_MULTIPLIER: 2,
        COOLDOWN: 300000                     // 5 minutes between games
    },

    // ===== ACHIEVEMENT THRESHOLDS =====
    ACHIEVEMENTS: {
        PERFECT_PARENT_DAYS: 100,
        NEVER_HUNGRY_FEEDS: 100,
        BEST_FRIENDS_MAX_HAPPINESS: 50,
        FIRST_VICTORY_BATTLES: 1,
        UNDEFEATED_STREAK: 10,
        BATTLE_ADDICT_COUNT: 100,
        SOCIAL_BUTTERFLY_ONLINE: 50,
        TIME_TRAVELER_DAYS: 365
    },

    // ===== SERVER CONFIGURATION =====
    SERVER: {
        DEFAULT_URL: 'ws://localhost:3000',
        RECONNECT_DELAY: 1000,               // Initial reconnect delay (ms)
        MAX_RECONNECT_ATTEMPTS: 5,
        CONNECTION_TIMEOUT: 5000,            // Connection attempt timeout (ms)
        PING_INTERVAL: 30000,                // Keep-alive ping interval (ms)
        MAX_MESSAGE_SIZE: 1048576            // 1MB max message size
    },

    // ===== STORAGE KEYS =====
    STORAGE_KEYS: {
        PET_DATA: 'vpet_data',
        PREMIUM_STATUS: 'premiumStatus',
        SERVER_URL: 'vpet_server_url',
        SETTINGS: 'vpet_settings',
        THEME: 'vpet_theme',
        SOUND_ENABLED: 'soundEnabled',
        VIBRATION_ENABLED: 'vibrationEnabled',
        STAT_DISPLAY: 'statDisplay',
        FRIENDS: 'vpet_friends',
        INVENTORY: 'vpet_inventory',
        TOURNAMENTS: 'vpet_tournaments',
        ACHIEVEMENTS: 'vpet_achievements'
    },

    // ===== PERFORMANCE =====
    PERFORMANCE: {
        LAZY_LOAD_THRESHOLD: 1000,           // ms to wait before lazy loading
        IMAGE_MAX_SIZE: 5242880,             // 5MB max image upload
        ANIMATION_FPS_TARGET: 60,
        PARTICLE_MAX_COUNT: 50
    },

    // ===== CROSS-PLATFORM =====
    MOBILE: {
        BREAKPOINT: 768,                     // px for mobile/desktop switch
        MIN_FONT_SIZE: 14,                   // px
        MAX_FONT_SIZE: 24,                   // px
        SAFE_AREA_INSET_TOP: 44,             // px for iPhone notch
        SAFE_AREA_INSET_BOTTOM: 34          // px for iPhone home indicator
    }
};

// Freeze object to prevent modifications
if (Object.freeze) {
    Object.freeze(GLOBAL_CONSTANTS);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GLOBAL_CONSTANTS;
}
