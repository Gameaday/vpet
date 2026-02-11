/**
 * UI Utilities Module
 * Handles common UI operations and notifications
 */

class UIManager {
    constructor(config = {}) {
        this.config = config.UI || {};
    }
    
    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, warning, error, info)
     * @param {number} duration - How long to show notification
     */
    showNotification(message, type = 'info', duration = null) {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        const displayDuration = duration || this.config.notifications?.duration || 3000;
        
        notification.textContent = message;
        notification.classList.remove(...(this.config.notifications?.types || ['success', 'warning', 'error', 'info']));
        notification.classList.add(type, 'show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, displayDuration);
    }
    
    /**
     * Show achievement notification
     * @param {string} title - Achievement title
     * @param {string} message - Achievement message
     * @param {string} emoji - Achievement emoji
     */
    showAchievement(title, message, emoji = '🏆') {
        const achievementDiv = document.createElement('div');
        achievementDiv.className = 'achievement-popup';
        achievementDiv.innerHTML = `
            <div class="achievement-emoji">${emoji}</div>
            <div class="achievement-title">${title}</div>
            <div class="achievement-message">${message}</div>
        `;
        
        document.body.appendChild(achievementDiv);
        
        setTimeout(() => achievementDiv.classList.add('show'), 10);
        
        const duration = this.config.achievements?.duration || 5000;
        setTimeout(() => {
            achievementDiv.classList.remove('show');
            setTimeout(() => achievementDiv.remove(), 300);
        }, duration);
    }
    
    /**
     * Update individual stat bar
     * @param {string} statName - Name of stat
     * @param {number} value - Stat value (0-100)
     */
    updateStat(statName, value) {
        const valueElement = document.getElementById(`${statName}Value`);
        const barElement = document.getElementById(`${statName}Bar`);
        
        if (!valueElement || !barElement) return;
        
        const clampedValue = Math.max(0, Math.min(100, value));
        valueElement.textContent = Math.floor(clampedValue);
        barElement.style.width = clampedValue + '%';
        
        // Add warning classes based on value
        const thresholds = this.config.stats || { criticalThreshold: 30, warningThreshold: 50, excellentThreshold: 90 };
        barElement.classList.remove('critical', 'warning', 'excellent');
        
        if (clampedValue < thresholds.criticalThreshold) {
            barElement.classList.add('critical');
        } else if (clampedValue < thresholds.warningThreshold) {
            barElement.classList.add('warning');
        } else if (clampedValue >= thresholds.excellentThreshold) {
            barElement.classList.add('excellent');
        }
    }
    
    /**
     * Show modal
     * @param {string} modalId - ID of modal to show
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    /**
     * Hide modal
     * @param {string} modalId - ID of modal to hide
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    /**
     * Update mood indicator based on average stats
     * @param {number} avgStats - Average of pet stats
     */
    updateMoodIndicator(avgStats) {
        const moodIndicator = document.getElementById('moodIndicator');
        if (!moodIndicator) return;
        
        const moods = this.config.moods || {
            excellent: { threshold: 80, emoji: '😊' },
            good: { threshold: 60, emoji: '🙂' },
            okay: { threshold: 40, emoji: '😐' },
            bad: { threshold: 20, emoji: '😟' },
            critical: { threshold: 0, emoji: '😢' }
        };
        
        let selectedMood = moods.critical;
        for (const [, mood] of Object.entries(moods)) {
            if (avgStats >= mood.threshold && mood.threshold > selectedMood.threshold) {
                selectedMood = mood;
            }
        }
        
        moodIndicator.textContent = selectedMood.emoji;
    }
    
    /**
     * Show save indicator briefly
     */
    showSaveIndicator() {
        const indicator = document.getElementById('autoSaveIndicator');
        if (!indicator) return;
        
        indicator.classList.add('show');
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }
    
    /**
     * Apply theme to document
     * @param {string} themeName - Theme name
     */
    applyTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('theme', themeName);
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
