/**
 * Feature Gate Module
 * Handles feature gating for free vs premium users with upgrade prompts
 */

class FeatureGate {
    constructor(premiumManager) {
        this.premiumManager = premiumManager;
    }

    /**
     * Check if feature is accessible (freemium model - all features accessible)
     * This is the core principle: free users can access everything, premium enhances the experience
     * @param {string} featureName - Name of the feature to check
     * @param {string} featureDisplayName - Human-readable feature name for prompts
     * @returns {boolean} - Always true (freemium model - no hard gates)
     */
    checkAccess(featureName, featureDisplayName) {
        // Freemium model: All features are accessible to everyone
        // Premium users get enhanced versions (multipliers, extended limits, etc.)
        // This ensures no frustration for free users while providing value for premium
        return true;
    }

    /**
     * Check premium access and show upgrade prompt if needed
     * @param {string} featureName - Name of the premium feature
     * @param {string} featureDisplayName - Human-readable feature name
     * @returns {boolean} - True if user has premium access
     */
    checkPremiumAccess(featureName, featureDisplayName) {
        if (this.premiumManager.canAccessFeature(featureName)) {
            return true;
        }

        this.showUpgradePrompt(featureName, featureDisplayName);
        return false;
    }

    /**
     * Show upgrade prompt for a specific feature
     * @param {string} featureName - Name of the feature
     * @param {string} featureDisplayName - Human-readable feature name
     */
    showUpgradePrompt(featureName, featureDisplayName) {
        const tierInfo = this.getFeatureTierInfo(featureName);
        const message = `${featureDisplayName} is a ${tierInfo.tier} feature.\n\nUpgrade to ${tierInfo.name} for ${tierInfo.price}/month to unlock this and more!`;
        
        if (typeof showNotification === 'function') {
            showNotification(`⭐ ${featureDisplayName} requires ${tierInfo.name}`, 'info');
        } else {
            console.log(message);
        }

        // Show upgrade button in notification
        setTimeout(() => {
            if (this.premiumManager && typeof this.premiumManager.openPremiumModal === 'function') {
                const upgradeBtn = document.createElement('button');
                upgradeBtn.textContent = 'View Premium Plans';
                upgradeBtn.className = 'premium-upgrade-quick-btn';
                upgradeBtn.onclick = () => this.premiumManager.openPremiumModal();
                
                const notification = document.getElementById('notification');
                if (notification && notification.style.display !== 'none') {
                    notification.appendChild(upgradeBtn);
                }
            }
        }, 100);
    }

    /**
     * Get tier information for a feature
     * @param {string} featureName - Name of the feature
     * @returns {object} - Tier information
     */
    getFeatureTierInfo(featureName) {
        const basicFeatures = [
            'coin_multiplier',
            'exclusive_themes',
            'priority_matchmaking',
            'no_ads',
            'custom_names',
            'cloud_save',
            'hibernation_extended'
        ];

        const premiumFeatures = [
            'exclusive_evolutions',
            'rare_cosmetics',
            'tournament_priority',
            'early_access',
            'vip_discord',
            'analytics',
            'hibernation_unlimited'
        ];

        if (basicFeatures.includes(featureName)) {
            return {
                tier: 'Basic Premium',
                name: 'Basic Premium',
                price: '$2.99'
            };
        }

        if (premiumFeatures.includes(featureName)) {
            return {
                tier: 'Premium Plus',
                name: 'Premium Plus',
                price: '$4.99'
            };
        }

        return {
            tier: 'Premium',
            name: 'Premium',
            price: '$2.99'
        };
    }

    /**
     * Get multiplier for premium features (e.g., coin earning)
     * @param {string} featureName - Name of the feature
     * @returns {number} - Multiplier value
     */
    getMultiplier(featureName) {
        if (!this.premiumManager.isPremium) {
            return 1;
        }

        switch (featureName) {
            case 'coin_earning':
                return this.premiumManager.getCoinMultiplier();
            case 'exp_earning':
                return this.premiumManager.subscriptionTier === 'premium' ? 1.5 : 1.2;
            case 'hibernation_time':
                if (this.premiumManager.subscriptionTier === 'premium') {
                    return Infinity; // Unlimited
                }
                return this.premiumManager.subscriptionTier === 'basic' ? 7 : 1; // 7 days for basic, 1 day for free
            default:
                return 1;
        }
    }

    /**
     * Add premium badge to UI elements
     * @param {HTMLElement} element - Element to add badge to
     * @param {string} tier - Tier required ('basic' or 'premium')
     */
    addPremiumBadge(element, tier = 'basic') {
        if (!element) return;

        const badge = document.createElement('span');
        badge.className = `premium-badge-inline ${tier}`;
        badge.textContent = tier === 'premium' ? '⭐⭐' : '⭐';
        badge.title = tier === 'premium' ? 'Premium Plus Feature' : 'Premium Feature';
        
        element.appendChild(badge);
    }

    /**
     * Show feature comparison table
     * @returns {string} - HTML for comparison table
     */
    getComparisonTable() {
        return `
            <div class="premium-comparison">
                <h3>🎮 Feature Comparison</h3>
                <table class="feature-table">
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Free</th>
                            <th>Basic Premium<br><small>$2.99/mo</small></th>
                            <th>Premium Plus<br><small>$4.99/mo</small></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Pet Care & Evolution</td>
                            <td>✅</td>
                            <td>✅</td>
                            <td>✅</td>
                        </tr>
                        <tr>
                            <td>Local Battles</td>
                            <td>✅</td>
                            <td>✅</td>
                            <td>✅</td>
                        </tr>
                        <tr>
                            <td>Online Battles</td>
                            <td>✅</td>
                            <td>✅</td>
                            <td>✅</td>
                        </tr>
                        <tr>
                            <td>Mini-Games</td>
                            <td>✅</td>
                            <td>✅</td>
                            <td>✅</td>
                        </tr>
                        <tr>
                            <td>Coin Earning Rate</td>
                            <td>1x</td>
                            <td>2x</td>
                            <td>3x</td>
                        </tr>
                        <tr>
                            <td>Exclusive Themes</td>
                            <td>❌</td>
                            <td>✅</td>
                            <td>✅</td>
                        </tr>
                        <tr>
                            <td>Priority Matchmaking</td>
                            <td>❌</td>
                            <td>✅</td>
                            <td>✅</td>
                        </tr>
                        <tr>
                            <td>Cloud Backup</td>
                            <td>❌</td>
                            <td>✅</td>
                            <td>✅</td>
                        </tr>
                        <tr>
                            <td>Cryo Sleep Duration</td>
                            <td>1 day</td>
                            <td>1 week</td>
                            <td>Unlimited</td>
                        </tr>
                        <tr>
                            <td>Exclusive Evolution Paths</td>
                            <td>❌</td>
                            <td>❌</td>
                            <td>✅</td>
                        </tr>
                        <tr>
                            <td>Rare Cosmetics</td>
                            <td>❌</td>
                            <td>❌</td>
                            <td>✅</td>
                        </tr>
                        <tr>
                            <td>Tournament Priority</td>
                            <td>❌</td>
                            <td>❌</td>
                            <td>✅</td>
                        </tr>
                        <tr>
                            <td>Pet Analytics Dashboard</td>
                            <td>❌</td>
                            <td>❌</td>
                            <td>✅</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeatureGate;
}
