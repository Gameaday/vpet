/**
 * Vibration Manager Module
 * Handles haptic feedback for mobile devices
 */

class VibrationManager {
    constructor(config = {}) {
        this.config = config.VIBRATION || {};
        this.enabled = localStorage.getItem(config.THEMES?.storage?.vibrationKey || 'vibrationEnabled') !== 'false';
    }
    
    /**
     * Trigger vibration pattern
     * @param {string|number|Array} pattern - Pattern name or custom pattern
     */
    vibrate(pattern = 'light') {
        if (!this.enabled) return;
        
        // Check if vibration API is available
        if (!('vibrate' in navigator)) return;
        
        // Get pattern from config or use directly
        const vibrationPattern = typeof pattern === 'string' 
            ? this.config.patterns?.[pattern] || pattern
            : pattern;
            
        navigator.vibrate(vibrationPattern);
    }
    
    /**
     * Enable vibration
     */
    enable() {
        this.enabled = true;
        localStorage.setItem('vibrationEnabled', 'true');
    }
    
    /**
     * Disable vibration
     */
    disable() {
        this.enabled = false;
        localStorage.setItem('vibrationEnabled', 'false');
    }
    
    /**
     * Toggle vibration
     */
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('vibrationEnabled', String(this.enabled));
    }
    
    /**
     * Check if vibration is enabled
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VibrationManager;
}
