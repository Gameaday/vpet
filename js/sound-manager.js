/**
 * Sound Manager Module
 * Handles all sound effects using Web Audio API
 */

class SoundManager {
    constructor(config = {}) {
        this.config = config.SOUNDS || {};
        this.enabled = localStorage.getItem(config.THEMES?.storage?.soundKey || 'soundEnabled') !== 'false';
        this.audioContext = null;
    }
    
    /**
     * Initialize or get AudioContext
     * @private
     */
    _getAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }
    
    /**
     * Play a tone sequence
     * @param {Array<number>} frequencies - Array of frequencies to play
     * @param {number} duration - Duration per frequency in ms
     */
    playTone(frequencies, duration) {
        if (!this.enabled) return;
        
        const context = this._getAudioContext();
        const now = context.currentTime;
        
        frequencies.forEach((freq, i) => {
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = this.config.waveform || 'square';
            
            const volume = this.config.volume || 0.1;
            gainNode.gain.setValueAtTime(volume, now + (i * duration / 1000));
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + ((i + 1) * duration / 1000));
            
            oscillator.start(now + (i * duration / 1000));
            oscillator.stop(now + ((i + 1) * duration / 1000));
        });
    }
    
    /**
     * Play a named sound effect
     * @param {string} soundName - Name of sound effect
     */
    play(soundName) {
        const frequencies = this.config.frequencies?.[soundName];
        const duration = this.config.durations?.[soundName];
        
        if (frequencies && duration) {
            this.playTone(frequencies, duration);
        } else {
            console.warn(`Unknown sound: ${soundName}`);
        }
    }
    
    /**
     * Enable sound effects
     */
    enable() {
        this.enabled = true;
        localStorage.setItem('soundEnabled', 'true');
    }
    
    /**
     * Disable sound effects
     */
    disable() {
        this.enabled = false;
        localStorage.setItem('soundEnabled', 'false');
    }
    
    /**
     * Toggle sound effects
     */
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', String(this.enabled));
    }
    
    /**
     * Check if sound is enabled
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundManager;
}
