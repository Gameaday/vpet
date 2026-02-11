/**
 * Application Configuration Module
 * Centralized configuration for UI, sound, vibration, and themes
 */

const AppConfig = {
    // Sound effects configuration
    SOUNDS: {
        enabled: true,  // Default state
        frequencies: {
            feed: [440, 523, 659],      // C-E-G chord
            play: [523, 659, 784],      // E-G-B happy sound
            sleep: [330, 294, 262],     // Descending calm
            train: [392, 523, 659, 784], // Rising power-up
            battle: [196, 220, 247],    // Battle start
            hit: [130],                 // Impact sound
            win: [523, 659, 784, 1047], // Victory fanfare
            lose: [392, 330, 262],      // Defeat sound
            evolution: [523, 659, 784, 1047, 1319], // Evolution fanfare
            click: [880]                // Quick blip
        },
        durations: {
            feed: 100,
            play: 120,
            sleep: 200,
            train: 80,
            battle: 150,
            hit: 80,
            win: 100,
            lose: 150,
            evolution: 120,
            click: 30
        },
        waveform: 'square',  // 8-bit style
        volume: 0.1          // Gain level
    },
    
    // Vibration patterns
    VIBRATION: {
        enabled: true,  // Default state
        patterns: {
            light: 10,              // Quick tap
            medium: 25,             // Button press
            heavy: 50,              // Important action
            success: [10, 50, 10],  // Pattern for success
            error: [50, 50, 50]     // Pattern for error
        }
    },
    
    // Theme configuration
    THEMES: {
        default: 'dark',
        available: ['dark', 'light', 'retro'],
        storage: {
            key: 'theme',
            soundKey: 'soundEnabled',
            vibrationKey: 'vibrationEnabled'
        }
    },
    
    // Update intervals
    TIMERS: {
        statsUpdate: 10000,      // 10 seconds
        idleAnimation: 5000,     // 5 seconds
        autoSave: 30000,         // 30 seconds
        battleTurn: 1000,        // 1 second between turns
        notificationDuration: 3000  // 3 seconds
    },
    
    // UI Configuration
    UI: {
        achievements: {
            duration: 5000,  // How long achievement notification shows
            emoji: '🏆'      // Default achievement emoji
        },
        notifications: {
            duration: 3000,
            types: ['success', 'warning', 'error', 'info']
        },
        modal: {
            closeOnOutsideClick: true,
            animationDuration: 300
        },
        stats: {
            criticalThreshold: 30,
            warningThreshold: 50,
            excellentThreshold: 90
        }
    },
    
    // Milestone tracking
    MILESTONES: {
        feed: [1, 10, 50, 100],
        play: [1, 10, 50, 100],
        train: [1, 10, 50, 100],
        battle: [1, 5, 10, 25, 50],
        level: [5, 10, 20, 50, 100],
        evolution: ['baby', 'child', 'teen', 'adult'],
        clean: [1, 10, 50]
    },
    
    // Keyboard shortcuts
    SHORTCUTS: {
        feed: 'f',
        play: 'p',
        sleep: 's',
        train: 't',
        battle: 'b',
        clean: 'c',
        settings: 'Escape'
    },
    
    // Mood indicator thresholds
    MOODS: {
        excellent: { threshold: 80, emoji: '😊' },
        good: { threshold: 60, emoji: '🙂' },
        okay: { threshold: 40, emoji: '😐' },
        bad: { threshold: 20, emoji: '😟' },
        critical: { threshold: 0, emoji: '😢' }
    },
    
    // Animation configuration
    ANIMATIONS: {
        idle: {
            enabled: true,
            frequency: 5000,  // Change animation every 5s
            types: ['bounce', 'wiggle', 'wave']
        },
        battle: {
            shakeIntensity: 5,
            flashDuration: 200
        }
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
}
