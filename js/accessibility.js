/**
 * Accessibility Enhancement Module
 * Adds ARIA labels, roles, and keyboard navigation for professional accessibility
 */

class AccessibilityManager {
    constructor() {
        this.announcementRegion = null;
        this.init();
    }

    /**
     * Initialize accessibility features
     */
    init() {
        this.createAnnouncementRegion();
        this.enhanceStatBars();
        this.enhanceButtons();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
    }

    /**
     * Create ARIA live region for screen reader announcements
     */
    createAnnouncementRegion() {
        this.announcementRegion = document.createElement('div');
        this.announcementRegion.id = 'aria-live-region';
        this.announcementRegion.setAttribute('aria-live', 'polite');
        this.announcementRegion.setAttribute('aria-atomic', 'true');
        this.announcementRegion.className = 'sr-only';
        this.announcementRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(this.announcementRegion);
    }

    /**
     * Announce message to screen readers
     * @param {string} message - Message to announce
     */
    announce(message) {
        if (this.announcementRegion) {
            this.announcementRegion.textContent = '';
            setTimeout(() => {
                this.announcementRegion.textContent = message;
            }, 100);
        }
    }

    /**
     * Enhance stat bars with ARIA attributes
     */
    enhanceStatBars() {
        const statBars = document.querySelectorAll('.stat-bar');
        statBars.forEach(statBar => {
            const label = statBar.querySelector('.stat-label span:first-child');
            const value = statBar.querySelector('.stat-label span:last-child');
            const progressBar = statBar.querySelector('.progress-bar');
            
            if (label && value && progressBar) {
                const statName = label.textContent.replace(/[^\w\s]/g, '').trim();
                const statValue = parseInt(value.textContent) || 0;
                
                // Add role and ARIA attributes to progress bar
                progressBar.setAttribute('role', 'progressbar');
                progressBar.setAttribute('aria-valuenow', statValue);
                progressBar.setAttribute('aria-valuemin', '0');
                progressBar.setAttribute('aria-valuemax', '100');
                progressBar.setAttribute('aria-label', `${statName}: ${statValue} out of 100`);
                
                // Add group role to stat bar
                statBar.setAttribute('role', 'group');
                statBar.setAttribute('aria-labelledby', `${statName.toLowerCase()}-label`);
                label.parentElement.id = `${statName.toLowerCase()}-label`;
            }
        });
    }

    /**
     * Update stat bar ARIA values when stats change
     * @param {string} statName - Name of the stat (health, hunger, etc.)
     * @param {number} value - New value (0-100)
     */
    updateStatAria(statName, value) {
        const progressBar = document.getElementById(`${statName}BarContainer`);
        if (progressBar) {
            progressBar.setAttribute('aria-valuenow', value);
            progressBar.setAttribute('aria-label', `${statName}: ${value} out of 100`);
            
            // Announce critical stat changes
            if (value <= 20) {
                this.announce(`Warning: ${statName} is critically low at ${value}`);
            }
        }
    }

    /**
     * Enhance buttons with proper ARIA labels
     */
    enhanceButtons() {
        // Battle buttons
        const battleBtn = document.getElementById('battleBtn');
        if (battleBtn && !battleBtn.getAttribute('aria-label')) {
            battleBtn.setAttribute('aria-label', 'Start a local battle with AI opponent');
        }

        const onlineBattleBtn = document.getElementById('onlineBattleBtn');
        if (onlineBattleBtn && !onlineBattleBtn.getAttribute('aria-label')) {
            onlineBattleBtn.setAttribute('aria-label', 'Start an online battle with another player');
        }

        // Settings buttons
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn && !settingsBtn.getAttribute('aria-label')) {
            settingsBtn.setAttribute('aria-label', 'Open settings menu');
        }

        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn && !helpBtn.getAttribute('aria-label')) {
            helpBtn.setAttribute('aria-label', 'Open help and instructions');
        }

        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn && !resetBtn.getAttribute('aria-label')) {
            resetBtn.setAttribute('aria-label', 'Reset game (warning: deletes all progress)');
        }

        // Social buttons
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn && !shareBtn.getAttribute('aria-label')) {
            shareBtn.setAttribute('aria-label', 'Share your pet on social media');
        }

        const leaderboardBtn = document.getElementById('leaderboardBtn');
        if (leaderboardBtn && !leaderboardBtn.getAttribute('aria-label')) {
            leaderboardBtn.setAttribute('aria-label', 'View global leaderboard');
        }

        const friendsBtn = document.getElementById('friendsBtn');
        if (friendsBtn && !friendsBtn.getAttribute('aria-label')) {
            friendsBtn.setAttribute('aria-label', 'Manage your friends list');
        }

        // Game buttons
        const shopBtn = document.getElementById('shopBtn');
        if (shopBtn && !shopBtn.getAttribute('aria-label')) {
            shopBtn.setAttribute('aria-label', 'Open item shop to purchase items');
        }

        const inventoryBtn = document.getElementById('inventoryBtn');
        if (inventoryBtn && !inventoryBtn.getAttribute('aria-label')) {
            inventoryBtn.setAttribute('aria-label', 'View your inventory and use items');
        }

        const minigamesBtn = document.getElementById('minigamesBtn');
        if (minigamesBtn && !minigamesBtn.getAttribute('aria-label')) {
            minigamesBtn.setAttribute('aria-label', 'Play mini-games to earn coins');
        }

        // Close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            if (!btn.getAttribute('aria-label')) {
                btn.setAttribute('aria-label', 'Close modal');
            }
        });
    }

    /**
     * Setup keyboard navigation shortcuts
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Modal close with Escape
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.active, .modal[style*="display: flex"]');
                if (openModal) {
                    const closeBtn = openModal.querySelector('.close-btn');
                    if (closeBtn) closeBtn.click();
                    e.preventDefault();
                }
            }

            // Action shortcuts (only if no modal is open)
            const modalOpen = document.querySelector('.modal.active, .modal[style*="display: flex"]');
            if (!modalOpen) {
                switch(e.key.toLowerCase()) {
                    case 'f':
                        document.getElementById('feedBtn')?.click();
                        e.preventDefault();
                        break;
                    case 'p':
                        document.getElementById('playBtn')?.click();
                        e.preventDefault();
                        break;
                    case 's':
                        if (!e.ctrlKey && !e.metaKey) { // Avoid conflict with browser save
                            document.getElementById('sleepBtn')?.click();
                            e.preventDefault();
                        }
                        break;
                    case 't':
                        document.getElementById('trainBtn')?.click();
                        e.preventDefault();
                        break;
                    case 'c':
                        document.getElementById('cleanBtn')?.click();
                        e.preventDefault();
                        break;
                    case 'b':
                        document.getElementById('battleBtn')?.click();
                        e.preventDefault();
                        break;
                    case '?':
                        document.getElementById('helpBtn')?.click();
                        e.preventDefault();
                        break;
                }
            }
        });
    }

    /**
     * Setup focus management for modals
     */
    setupFocusManagement() {
        // Trap focus within modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    const focusableElements = modal.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (e.shiftKey && document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            });
        });
    }

    /**
     * Announce action feedback to screen readers
     * @param {string} action - Action performed (feed, play, etc.)
     * @param {boolean} success - Whether action was successful
     * @param {string} message - Additional message
     */
    announceAction(action, success, message) {
        const status = success ? 'completed' : 'failed';
        const fullMessage = `${action} ${status}. ${message}`;
        this.announce(fullMessage);
    }

    /**
     * Announce stat changes
     * @param {object} statChanges - Object with stat changes {health: +10, hunger: -5}
     */
    announceStatChanges(statChanges) {
        const changes = Object.entries(statChanges)
            .filter(([_, value]) => value !== 0)
            .map(([stat, value]) => {
                const direction = value > 0 ? 'increased' : 'decreased';
                return `${stat} ${direction} by ${Math.abs(value)}`;
            })
            .join(', ');
        
        if (changes) {
            this.announce(changes);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}
