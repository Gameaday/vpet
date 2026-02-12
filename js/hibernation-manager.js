/**
 * Hibernation Manager Module
 * Handles "cryo sleep" / hibernation feature for VPet
 * Allows users to pause their pet temporarily with tier-based restrictions
 */

class HibernationManager {
    // Critical stat threshold for hibernation checks
    static CRITICAL_STAT_THRESHOLD = 30;

    constructor(premiumManager) {
        this.premiumManager = premiumManager;
        this.isHibernating = false;
        this.hibernationStartTime = null;
        this.hibernationDuration = 0; // in milliseconds
        this.pauseCount = 0; // tracks pauses today for tier restrictions
        this.lastPauseDate = null;
        this.loadHibernationState();
    }

    /**
     * Load hibernation state from localStorage
     */
    loadHibernationState() {
        const saved = localStorage.getItem('hibernationState');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.isHibernating = data.isHibernating || false;
                this.hibernationStartTime = data.hibernationStartTime ? new Date(data.hibernationStartTime) : null;
                this.hibernationDuration = data.hibernationDuration || 0;
                this.pauseCount = data.pauseCount || 0;
                this.lastPauseDate = data.lastPauseDate || null;

                // Reset daily count if it's a new day
                const today = new Date().toDateString();
                if (this.lastPauseDate !== today) {
                    this.pauseCount = 0;
                    this.lastPauseDate = today;
                    this.saveHibernationState();
                }

                // Check if hibernation should end
                if (this.isHibernating && this.hibernationStartTime) {
                    const elapsed = Date.now() - new Date(this.hibernationStartTime).getTime();
                    if (elapsed >= this.hibernationDuration) {
                        this.wakeUp(true); // Auto wake up
                    }
                }
            } catch (error) {
                console.error('Error loading hibernation state:', error);
            }
        }
    }

    /**
     * Save hibernation state to localStorage
     */
    saveHibernationState() {
        const data = {
            isHibernating: this.isHibernating,
            hibernationStartTime: this.hibernationStartTime ? this.hibernationStartTime.toISOString() : null,
            hibernationDuration: this.hibernationDuration,
            pauseCount: this.pauseCount,
            lastPauseDate: this.lastPauseDate
        };
        localStorage.setItem('hibernationState', JSON.stringify(data));
    }

    /**
     * Get hibernation limits based on subscription tier
     * @returns {object} - maxDuration in days, maxPausesPerDay
     */
    getHibernationLimits() {
        const tier = this.premiumManager.subscriptionTier;

        const limits = {
            free: {
                maxDuration: 1, // 1 day
                maxPausesPerDay: 1,
                canUnpauseAnytime: false
            },
            basic: {
                maxDuration: 7, // 1 week
                maxPausesPerDay: Infinity,
                canUnpauseAnytime: true
            },
            premium: {
                maxDuration: Infinity, // unlimited
                maxPausesPerDay: Infinity,
                canUnpauseAnytime: true
            }
        };

        return limits[tier] || limits.free;
    }

    /**
     * Check if pet has critical stats (excluding energy)
     * @param {object} pet - Pet object to check
     * @returns {object} - {hasCriticalStats: boolean, stat: string}
     * @private
     */
    _hasCriticalStats(pet) {
        if (!pet) {
            return { hasCriticalStats: false, stat: null };
        }

        const criticalThreshold = HibernationManager.CRITICAL_STAT_THRESHOLD;
        
        if (pet.hunger < criticalThreshold) {
            return { hasCriticalStats: true, stat: 'hunger' };
        }
        if (pet.health < criticalThreshold) {
            return { hasCriticalStats: true, stat: 'health' };
        }
        if (pet.happiness < criticalThreshold) {
            return { hasCriticalStats: true, stat: 'happiness' };
        }
        if (pet.cleanliness < criticalThreshold) {
            return { hasCriticalStats: true, stat: 'cleanliness' };
        }

        return { hasCriticalStats: false, stat: null };
    }

    /**
     * Check if user can start hibernation
     * @param {object} pet - Optional pet object to check critical stats
     * @returns {object} - {canHibernate: boolean, reason: string}
     */
    canStartHibernation(pet = null) {
        if (this.isHibernating) {
            return {
                canHibernate: false,
                reason: 'Pet is already hibernating'
            };
        }

        // Check if pet has critical stats (excluding energy)
        const criticalCheck = this._hasCriticalStats(pet);
        if (criticalCheck.hasCriticalStats) {
            const statMessages = {
                hunger: 'Pet hunger is too low! Feed your pet before hibernation.',
                health: 'Pet health is too low! Heal your pet before hibernation.',
                happiness: 'Pet happiness is too low! Play with your pet before hibernation.',
                cleanliness: 'Pet cleanliness is too low! Clean your pet before hibernation.'
            };
            return {
                canHibernate: false,
                reason: statMessages[criticalCheck.stat]
            };
        }

        const limits = this.getHibernationLimits();
        const today = new Date().toDateString();

        // Reset count if new day
        if (this.lastPauseDate !== today) {
            this.pauseCount = 0;
            this.lastPauseDate = today;
        }

        // Check daily pause limit
        if (this.pauseCount >= limits.maxPausesPerDay) {
            return {
                canHibernate: false,
                reason: `Daily hibernation limit reached (${limits.maxPausesPerDay} per day)`
            };
        }

        return {
            canHibernate: true,
            reason: null
        };
    }

    /**
     * Start hibernation (cryo sleep)
     * @param {number} durationDays - Duration in days
     * @param {object} pet - Optional pet object to check critical stats
     * @returns {boolean} - Success status
     */
    startHibernation(durationDays, pet = null) {
        const check = this.canStartHibernation(pet);
        if (!check.canHibernate) {
            if (typeof showToast === 'function') {
                showToast(`❌ ${check.reason}`, 'error', 3000);
            }
            return false;
        }

        const limits = this.getHibernationLimits();

        // Validate duration
        if (durationDays > limits.maxDuration) {
            if (typeof showToast === 'function') {
                const tierName = this.premiumManager.subscriptionTier;
                const maxDaysText = limits.maxDuration === Infinity ? 'unlimited' : `${limits.maxDuration} day${limits.maxDuration > 1 ? 's' : ''}`;
                showToast(
                    `❌ Maximum hibernation is ${maxDaysText} for ${tierName} tier`,
                    'error',
                    4000
                );
            }
            return false;
        }

        if (durationDays <= 0) {
            if (typeof showToast === 'function') {
                showToast('❌ Duration must be at least 1 day', 'error', 3000);
            }
            return false;
        }

        // Start hibernation
        this.isHibernating = true;
        this.hibernationStartTime = new Date();
        this.hibernationDuration = durationDays * 24 * 60 * 60 * 1000; // Convert to milliseconds
        this.pauseCount++;
        this.lastPauseDate = new Date().toDateString();
        this.saveHibernationState();

        if (typeof showToast === 'function') {
            showToast(
                `❄️ Pet entering cryo sleep for ${durationDays} day${durationDays > 1 ? 's' : ''}...`,
                'info',
                3000
            );
        }

        return true;
    }

    /**
     * Wake up from hibernation
     * @param {boolean} autoWakeup - True if waking up automatically
     * @param {object} pet - Optional pet object to update hibernation time
     * @returns {boolean} - Success status
     */
    wakeUp(autoWakeup = false, pet = null) {
        if (!this.isHibernating) {
            return false;
        }

        // Check if user can wake up early
        if (!autoWakeup) {
            const limits = this.getHibernationLimits();
            if (!limits.canUnpauseAnytime) {
                const elapsed = Date.now() - new Date(this.hibernationStartTime).getTime();
                const remaining = this.hibernationDuration - elapsed;
                
                if (remaining > 0) {
                    const hoursRemaining = Math.ceil(remaining / (1000 * 60 * 60));
                    if (typeof showToast === 'function') {
                        showToast(
                            `❌ Free tier cannot unpause early. ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''} remaining`,
                            'error',
                            4000
                        );
                    }
                    return false;
                }
            }
        }

        this.isHibernating = false;
        const startTime = new Date(this.hibernationStartTime);
        const duration = Date.now() - startTime.getTime();
        
        // Update pet's total hibernation time if pet object is provided
        if (pet && typeof pet.addHibernationTime === 'function') {
            pet.addHibernationTime(duration);
        }
        
        this.hibernationStartTime = null;
        this.hibernationDuration = 0;
        this.saveHibernationState();

        const durationHours = Math.floor(duration / (1000 * 60 * 60));
        const durationMinutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

        if (typeof showToast === 'function') {
            const message = autoWakeup 
                ? `🌅 Pet woke up after ${durationHours}h ${durationMinutes}m`
                : `🌅 Pet woke up early after ${durationHours}h ${durationMinutes}m`;
            showToast(message, 'success', 3000);
        }

        return true;
    }

    /**
     * Get remaining hibernation time
     * @returns {object} - {days, hours, minutes}
     */
    getRemainingTime() {
        if (!this.isHibernating || !this.hibernationStartTime) {
            return { days: 0, hours: 0, minutes: 0, total: 0 };
        }

        const elapsed = Date.now() - new Date(this.hibernationStartTime).getTime();
        const remaining = Math.max(0, this.hibernationDuration - elapsed);

        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

        return { days, hours, minutes, total: remaining };
    }

    /**
     * Get formatted remaining time string
     * @returns {string}
     */
    getRemainingTimeFormatted() {
        const time = this.getRemainingTime();
        
        if (time.total === 0) {
            return 'Waking up...';
        }

        if (time.days > 0) {
            return `${time.days}d ${time.hours}h ${time.minutes}m`;
        } else if (time.hours > 0) {
            return `${time.hours}h ${time.minutes}m`;
        } else {
            return `${time.minutes}m`;
        }
    }

    /**
     * Get hibernation status for UI
     * @param {object} pet - Optional pet object to check critical stats
     * @returns {object}
     */
    getStatus(pet = null) {
        const limits = this.getHibernationLimits();
        const remaining = this.getRemainingTime();

        return {
            isHibernating: this.isHibernating,
            canStartHibernation: this.canStartHibernation(pet),
            remainingTime: remaining,
            remainingTimeFormatted: this.getRemainingTimeFormatted(),
            pauseCount: this.pauseCount,
            maxPausesPerDay: limits.maxPausesPerDay,
            maxDuration: limits.maxDuration,
            canUnpauseAnytime: limits.canUnpauseAnytime
        };
    }

    /**
     * Check if pet should be frozen (no stat updates)
     * @returns {boolean}
     */
    shouldFreezePet() {
        return this.isHibernating;
    }

    /**
     * Check if pet needs emergency wake up due to critical stats
     * Note: This is a failsafe for stats that somehow became critical during hibernation
     * @param {object} pet - Pet object to check
     * @returns {boolean} - True if emergency wake up is needed
     */
    needsEmergencyWakeUp(pet) {
        if (!this.isHibernating) {
            return false;
        }

        const criticalCheck = this._hasCriticalStats(pet);
        return criticalCheck.hasCriticalStats;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HibernationManager };
}
