/**
 * Premium Features Module
 * Handles premium subscriptions and features for VPet
 */

class PremiumManager {
    constructor() {
        this.isPremium = false;
        this.subscriptionTier = 'free'; // 'free', 'basic', 'premium'
        this.premiumExpiry = null;
        this.loadPremiumStatus();
    }

    /**
     * Load premium status from localStorage
     */
    loadPremiumStatus() {
        const saved = localStorage.getItem('premiumStatus');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.isPremium = data.isPremium || false;
                this.subscriptionTier = data.subscriptionTier || 'free';
                this.premiumExpiry = data.premiumExpiry ? new Date(data.premiumExpiry) : null;
                
                // Check if premium has expired
                if (this.premiumExpiry && new Date() > this.premiumExpiry) {
                    this.expirePremium();
                }
            } catch (error) {
                console.error('Error loading premium status:', error);
            }
        }
    }

    /**
     * Save premium status to localStorage
     */
    savePremiumStatus() {
        const data = {
            isPremium: this.isPremium,
            subscriptionTier: this.subscriptionTier,
            premiumExpiry: this.premiumExpiry ? this.premiumExpiry.toISOString() : null
        };
        localStorage.setItem('premiumStatus', JSON.stringify(data));
    }

    /**
     * Activate premium subscription
     * @param {string} tier - 'basic' or 'premium'
     * @param {number} durationDays - Duration in days
     */
    activatePremium(tier = 'basic', durationDays = 30) {
        this.isPremium = true;
        this.subscriptionTier = tier;
        
        // Set expiry date
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + durationDays);
        this.premiumExpiry = expiry;
        
        this.savePremiumStatus();
        this.applyPremiumFeatures();
        this.showPremiumWelcome();
    }

    /**
     * Expire premium subscription
     */
    expirePremium() {
        this.isPremium = false;
        this.subscriptionTier = 'free';
        this.premiumExpiry = null;
        this.savePremiumStatus();
        this.removePremiumFeatures();
    }

    /**
     * Check if user has premium
     * @returns {boolean}
     */
    hasPremium() {
        return this.isPremium;
    }

    /**
     * Get premium features list
     * @returns {object}
     */
    getPremiumFeatures() {
        return {
            basic: {
                name: 'Basic Premium',
                price: '$2.99/month',
                features: [
                    '2x Coin Earning Rate',
                    'Exclusive Pet Themes',
                    'Priority Matchmaking',
                    'Remove Ads',
                    'Custom Pet Names with Emojis',
                    'Cloud Save Backup',
                    'Cryo Sleep (1 week, unlimited pauses)'
                ]
            },
            premium: {
                name: 'Premium Plus',
                price: '$4.99/month',
                features: [
                    'All Basic Features',
                    '3x Coin Earning Rate',
                    'Exclusive Evolution Paths',
                    'Rare Pet Cosmetics',
                    'Tournament Entry Priority',
                    'Early Access to New Features',
                    'VIP Discord Role',
                    'Pet History Analytics',
                    'Unlimited Cryo Sleep'
                ]
            }
        };
    }

    /**
     * Apply premium features to the game
     */
    applyPremiumFeatures() {
        // Add premium badge to UI
        const header = document.querySelector('header');
        if (header && !document.getElementById('premiumBadge')) {
            const badge = document.createElement('div');
            badge.id = 'premiumBadge';
            badge.className = 'premium-badge';
            badge.innerHTML = '⭐ Premium';
            header.appendChild(badge);
        }

        // Apply premium styling
        document.body.classList.add('premium-user');

        // Unlock premium themes in settings if they exist
        const premiumThemes = document.querySelectorAll('.theme-option.premium');
        premiumThemes.forEach(theme => {
            theme.classList.remove('locked');
        });
    }

    /**
     * Remove premium features from the game
     */
    removePremiumFeatures() {
        const badge = document.getElementById('premiumBadge');
        if (badge) {
            badge.remove();
        }
        
        document.body.classList.remove('premium-user');

        // Lock premium themes
        const premiumThemes = document.querySelectorAll('.theme-option.premium');
        premiumThemes.forEach(theme => {
            theme.classList.add('locked');
        });
    }

    /**
     * Show premium welcome message
     */
    showPremiumWelcome() {
        const message = `🎉 Welcome to VPet Premium!\n\nYour premium features are now active.`;
        if (typeof showToast === 'function') {
            showToast(message, 'success', 5000);
        } else {
            alert(message);
        }
    }

    /**
     * Get coin multiplier based on premium status
     * @returns {number}
     */
    getCoinMultiplier() {
        if (!this.isPremium) return 1;
        if (this.subscriptionTier === 'premium') return 3;
        if (this.subscriptionTier === 'basic') return 2;
        return 1;
    }

    /**
     * Check if user can access a premium feature
     * @param {string} featureName - Name of the feature
     * @returns {boolean}
     */
    canAccessFeature(featureName) {
        if (!this.isPremium) return false;

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
            return true;
        }

        if (premiumFeatures.includes(featureName)) {
            return this.subscriptionTier === 'premium';
        }

        return false;
    }

    /**
     * Open premium purchase modal
     */
    openPremiumModal() {
        const modal = document.getElementById('premiumModal');
        if (modal) {
            modal.style.display = 'block';
            this.updatePremiumModalContent();
        }
    }

    /**
     * Close premium purchase modal
     */
    closePremiumModal() {
        const modal = document.getElementById('premiumModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Update premium modal content
     */
    updatePremiumModalContent() {
        const features = this.getPremiumFeatures();
        const modalContent = document.getElementById('premiumModalContent');
        
        if (!modalContent) return;

        let html = '<div class="premium-modal-header">';
        html += '<h2>⭐ Upgrade to Premium</h2>';
        html += '<p>Unlock exclusive features and support VPet development!</p>';
        html += '<button class="modal-close-btn" onclick="premiumManager.closePremiumModal()">×</button>';
        html += '</div>';
        
        // Premium tiers container
        html += '<div class="premium-tiers-container">';
        
        // Basic tier
        html += '<div class="premium-tier">';
        html += `<h3>${features.basic.name}</h3>`;
        html += `<div class="premium-price">${features.basic.price}</div>`;
        html += '<ul class="premium-features">';
        features.basic.features.forEach(feature => {
            html += `<li>✓ ${feature}</li>`;
        });
        html += '</ul>';
        html += '<button class="premium-purchase-btn" data-tier="basic">Get Basic Premium</button>';
        html += '</div>';

        // Premium tier
        html += '<div class="premium-tier premium-plus">';
        html += '<div class="popular-badge">🏆 Most Popular</div>';
        html += `<h3>${features.premium.name}</h3>`;
        html += `<div class="premium-price">${features.premium.price}</div>`;
        html += '<ul class="premium-features">';
        features.premium.features.forEach(feature => {
            html += `<li>✓ ${feature}</li>`;
        });
        html += '</ul>';
        html += '<button class="premium-purchase-btn premium-btn" data-tier="premium">Get Premium Plus</button>';
        html += '</div>';
        
        html += '</div>'; // Close tiers container
        
        // Add feature comparison table
        html += '<div class="premium-comparison-section">';
        html += this.getComparisonTable();
        html += '</div>';
        
        // Add benefits and FAQ
        html += '<div class="premium-benefits">';
        html += '<h3>💎 Why Go Premium?</h3>';
        html += '<div class="benefits-grid">';
        html += '<div class="benefit-item">🚀 <strong>Faster Progress</strong><br>Earn coins and XP faster</div>';
        html += '<div class="benefit-item">🎨 <strong>Exclusive Content</strong><br>Unique themes and evolutions</div>';
        html += '<div class="benefit-item">☁️ <strong>Never Lose Progress</strong><br>Cloud backup protection</div>';
        html += '<div class="benefit-item">💤 <strong>Extended Breaks</strong><br>Pause your pet worry-free</div>';
        html += '</div>';
        html += '<p class="premium-note">✨ All core features remain free forever. Premium just enhances your experience!</p>';
        html += '</div>';

        modalContent.innerHTML = html;
        
        // Attach event listeners to purchase buttons
        const purchaseButtons = modalContent.querySelectorAll('.premium-purchase-btn');
        purchaseButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tier = button.getAttribute('data-tier');
                this.initiatePurchase(tier);
            });
        });
    }

    /**
     * Initiate purchase flow
     * @param {string} tier - 'basic' or 'premium'
     */
    async initiatePurchase(tier) {
        // For demo purposes, we'll simulate a successful purchase
        // In production, this would integrate with Stripe
        
        const prices = {
            basic: 2.99,
            premium: 4.99
        };

        const confirmed = confirm(
            `Purchase ${tier === 'premium' ? 'Premium Plus' : 'Basic Premium'} for $${prices[tier]}/month?\n\n` +
            'This is a demo - no actual payment will be processed.'
        );

        if (confirmed) {
            // Simulate payment processing
            if (typeof showToast === 'function') {
                showToast('Processing payment...', 'info', 2000);
            }

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Activate premium
            this.activatePremium(tier, 30);
            this.closePremiumModal();

            if (typeof showToast === 'function') {
                showToast('✨ Premium activated successfully!', 'success', 3000);
            }
        }
    }

    /**
     * Get days remaining in premium subscription
     * @returns {number}
     */
    getDaysRemaining() {
        if (!this.isPremium || !this.premiumExpiry) return 0;
        
        const now = new Date();
        const diff = this.premiumExpiry - now;
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    /**
     * Get comparison table HTML
     * @returns {string}
     */
    getComparisonTable() {
        return `
            <div class="premium-comparison">
                <h3>📊 Feature Comparison</h3>
                <table class="feature-table">
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Free</th>
                            <th>Basic<br><small>$2.99/mo</small></th>
                            <th>Plus<br><small>$4.99/mo</small></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>Pet Care & Evolution</td><td>✅</td><td>✅</td><td>✅</td></tr>
                        <tr><td>All Battles & Mini-Games</td><td>✅</td><td>✅</td><td>✅</td></tr>
                        <tr><td>Coin Earning Rate</td><td>1x</td><td>2x</td><td>3x</td></tr>
                        <tr><td>Exclusive Themes</td><td>❌</td><td>✅</td><td>✅</td></tr>
                        <tr><td>Cloud Backup</td><td>❌</td><td>✅</td><td>✅</td></tr>
                        <tr><td>Cryo Sleep Duration</td><td>1 day</td><td>1 week</td><td>Unlimited</td></tr>
                        <tr><td>Exclusive Evolutions</td><td>❌</td><td>❌</td><td>✅</td></tr>
                        <tr><td>Rare Cosmetics</td><td>❌</td><td>❌</td><td>✅</td></tr>
                        <tr><td>Analytics Dashboard</td><td>❌</td><td>❌</td><td>✅</td></tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Show premium status in UI
     */
    showPremiumStatus() {
        if (this.isPremium) {
            const daysLeft = this.getDaysRemaining();
            alert(
                `Premium Status: Active\n` +
                `Tier: ${this.subscriptionTier.charAt(0).toUpperCase() + this.subscriptionTier.slice(1)}\n` +
                `Days Remaining: ${daysLeft}\n` +
                `Coin Multiplier: ${this.getCoinMultiplier()}x`
            );
        } else {
            this.openPremiumModal();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PremiumManager;
}
