/**
 * PWA Installation Helper for Android & Chrome
 * Handles PWA install prompts and provides native app-like experience
 */

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }

    /**
     * Initialize PWA installation features
     */
    init() {
        // Check if already installed
        if (this.isInstalled()) {
            console.log('PWA already installed');
            return;
        }

        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            
            // Show install button/prompt
            this.showInstallPromotion();
        });

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallPromotion();
            this.deferredPrompt = null;
        });

        // Check if launched from home screen
        this.detectDisplayMode();
    }

    /**
     * Check if PWA is already installed
     * @returns {boolean}
     */
    isInstalled() {
        // Check if running in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return true;
        }
        
        // Check if running as PWA on iOS
        if (window.navigator.standalone === true) {
            return true;
        }
        
        return false;
    }

    /**
     * Show install promotion banner
     */
    showInstallPromotion() {
        // Don't show if user dismissed it recently
        const dismissed = localStorage.getItem('pwa_install_dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed);
            const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 7) {
                return; // Don't show for 7 days after dismissal
            }
        }

        // Create install prompt UI
        let promptDiv = document.getElementById('pwa-install-prompt');
        if (!promptDiv) {
            promptDiv = document.createElement('div');
            promptDiv.id = 'pwa-install-prompt';
            promptDiv.className = 'pwa-install-prompt';
            promptDiv.innerHTML = `
                <div class="pwa-prompt-content">
                    <span class="pwa-prompt-icon">📱</span>
                    <span class="pwa-prompt-text">Install VPet for better experience</span>
                    <button class="pwa-install-btn" id="pwa-install-btn">Install</button>
                    <button class="pwa-dismiss-btn" id="pwa-dismiss-btn">×</button>
                </div>
            `;
            document.body.appendChild(promptDiv);

            // Add event listeners
            document.getElementById('pwa-install-btn').addEventListener('click', () => {
                this.installPWA();
            });

            document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
                this.dismissInstallPromotion();
            });
        }

        // Show with animation
        setTimeout(() => {
            promptDiv.classList.add('show');
        }, 2000); // Show after 2 seconds
    }

    /**
     * Hide install promotion banner
     */
    hideInstallPromotion() {
        const promptDiv = document.getElementById('pwa-install-prompt');
        if (promptDiv) {
            promptDiv.classList.remove('show');
            setTimeout(() => {
                promptDiv.remove();
            }, 300);
        }
    }

    /**
     * Dismiss install promotion and remember choice
     */
    dismissInstallPromotion() {
        this.hideInstallPromotion();
        localStorage.setItem('pwa_install_dismissed', Date.now().toString());
    }

    /**
     * Trigger PWA installation
     */
    async installPWA() {
        if (!this.deferredPrompt) {
            console.log('No install prompt available');
            return;
        }

        // Show the install prompt
        this.deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await this.deferredPrompt.userChoice;
        
        console.log(`User response to install prompt: ${outcome}`);

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
            localStorage.setItem('pwa_install_dismissed', Date.now().toString());
        }

        // Clear the deferredPrompt
        this.deferredPrompt = null;
        this.hideInstallPromotion();
    }

    /**
     * Detect display mode and apply appropriate styles
     */
    detectDisplayMode() {
        const displayMode = this.getDisplayMode();
        document.documentElement.setAttribute('data-display-mode', displayMode);

        if (displayMode === 'standalone' || displayMode === 'fullscreen') {
            // Add standalone mode styles
            document.body.classList.add('pwa-standalone');
            
            // Remove browser chrome hints
            this.optimizeForStandalone();
        }
    }

    /**
     * Get current display mode
     * @returns {string}
     */
    getDisplayMode() {
        if (window.matchMedia('(display-mode: fullscreen)').matches) {
            return 'fullscreen';
        }
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return 'standalone';
        }
        if (window.matchMedia('(display-mode: minimal-ui)').matches) {
            return 'minimal-ui';
        }
        return 'browser';
    }

    /**
     * Optimize UI for standalone mode
     */
    optimizeForStandalone() {
        // Hide elements that are only relevant in browser
        const browserOnlyElements = document.querySelectorAll('.browser-only');
        browserOnlyElements.forEach(el => el.style.display = 'none');

        // Show elements that are only relevant in standalone
        const standaloneElements = document.querySelectorAll('.standalone-only');
        standaloneElements.forEach(el => el.style.display = 'block');

        // Adjust layout for standalone mode
        document.body.style.paddingTop = 'env(safe-area-inset-top)';
        document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';
    }

    /**
     * Check if device is Android
     * @returns {boolean}
     */
    static isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    /**
     * Check if browser is Chrome
     * @returns {boolean}
     */
    static isChrome() {
        return /Chrome/i.test(navigator.userAgent) && !/Edge/i.test(navigator.userAgent);
    }

    /**
     * Get Android version
     * @returns {number|null}
     */
    static getAndroidVersion() {
        const match = navigator.userAgent.match(/Android (\d+(\.\d+)?)/);
        return match ? parseFloat(match[1]) : null;
    }
}

// Initialize PWA installer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pwaInstaller = new PWAInstaller();
    });
} else {
    window.pwaInstaller = new PWAInstaller();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAInstaller;
}
