/**
 * Backup Manager Module
 * Handles local and cloud backups for VPet save data
 */

class BackupManager {
    constructor(premiumManager) {
        this.premiumManager = premiumManager;
        this.cloudBackupEnabled = false;
        this.lastBackupTime = null;
        this.loadBackupSettings();
    }

    /**
     * Load backup settings from localStorage
     */
    loadBackupSettings() {
        const saved = localStorage.getItem('backupSettings');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.cloudBackupEnabled = data.cloudBackupEnabled || false;
                this.lastBackupTime = data.lastBackupTime ? new Date(data.lastBackupTime) : null;
            } catch (error) {
                console.error('Error loading backup settings:', error);
            }
        }
    }

    /**
     * Save backup settings to localStorage
     */
    saveBackupSettings() {
        const data = {
            cloudBackupEnabled: this.cloudBackupEnabled,
            lastBackupTime: this.lastBackupTime ? this.lastBackupTime.toISOString() : null
        };
        localStorage.setItem('backupSettings', JSON.stringify(data));
    }

    /**
     * Export local backup as JSON file
     * Available to all users
     */
    exportLocalBackup() {
        try {
            // Gather all pet data from localStorage
            const petData = localStorage.getItem('vpet_data');
            const premiumStatus = localStorage.getItem('premiumStatus');
            const backupSettings = localStorage.getItem('backupSettings');
            const theme = localStorage.getItem('theme');
            const serverUrl = localStorage.getItem('vpet_server_url');
            const firstActions = localStorage.getItem('vpet_first_actions');

            const backup = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                data: {
                    vpet_data: petData ? JSON.parse(petData) : null,
                    premiumStatus: premiumStatus ? JSON.parse(premiumStatus) : null,
                    backupSettings: backupSettings ? JSON.parse(backupSettings) : null,
                    theme: theme,
                    vpet_server_url: serverUrl,
                    vpet_first_actions: firstActions ? JSON.parse(firstActions) : null
                }
            };

            // Create downloadable file
            const dataStr = JSON.stringify(backup, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `vpet-backup-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            this.lastBackupTime = new Date();
            this.saveBackupSettings();

            if (typeof showToast === 'function') {
                showToast('✅ Backup exported successfully!', 'success', 3000);
            }

            return true;
        } catch (error) {
            console.error('Error exporting backup:', error);
            if (typeof showToast === 'function') {
                showToast('❌ Failed to export backup', 'error', 3000);
            }
            return false;
        }
    }

    /**
     * Import local backup from JSON file
     * Available to all users
     */
    importLocalBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new window.FileReader();
            
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    
                    // Validate backup format
                    if (!backup.version || !backup.data) {
                        throw new Error('Invalid backup format');
                    }

                    // Confirm with user
                    const confirmed = confirm(
                        'This will replace your current pet data with the backup.\n\n' +
                        `Backup from: ${new Date(backup.timestamp).toLocaleString()}\n\n` +
                        'Are you sure you want to continue?'
                    );

                    if (!confirmed) {
                        resolve(false);
                        return;
                    }

                    // Restore data
                    if (backup.data.vpet_data) {
                        localStorage.setItem('vpet_data', JSON.stringify(backup.data.vpet_data));
                    }
                    if (backup.data.premiumStatus) {
                        localStorage.setItem('premiumStatus', JSON.stringify(backup.data.premiumStatus));
                    }
                    if (backup.data.backupSettings) {
                        localStorage.setItem('backupSettings', JSON.stringify(backup.data.backupSettings));
                    }
                    if (backup.data.theme) {
                        localStorage.setItem('theme', backup.data.theme);
                    }
                    if (backup.data.vpet_server_url) {
                        localStorage.setItem('vpet_server_url', backup.data.vpet_server_url);
                    }
                    if (backup.data.vpet_first_actions) {
                        localStorage.setItem('vpet_first_actions', JSON.stringify(backup.data.vpet_first_actions));
                    }

                    if (typeof showToast === 'function') {
                        showToast('✅ Backup restored! Reloading...', 'success', 2000);
                    }

                    // Reload page to apply changes
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);

                    resolve(true);
                } catch (error) {
                    console.error('Error importing backup:', error);
                    if (typeof showToast === 'function') {
                        showToast('❌ Failed to import backup', 'error', 3000);
                    }
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Save to cloud backup (premium feature)
     * Simulated for now - would connect to backend in production
     */
    async saveToCloud() {
        if (!this.premiumManager.canAccessFeature('cloud_save')) {
            if (typeof showToast === 'function') {
                showToast('☁️ Cloud backup requires premium subscription', 'info', 3000);
            }
            return false;
        }

        try {
            // Gather all pet data
            const petData = localStorage.getItem('vpet_data');
            const premiumStatus = localStorage.getItem('premiumStatus');
            const theme = localStorage.getItem('theme');

            const backup = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                data: {
                    vpet_data: petData ? JSON.parse(petData) : null,
                    premiumStatus: premiumStatus ? JSON.parse(premiumStatus) : null,
                    theme: theme
                }
            };

            // Simulate cloud upload (in production, this would be an API call)
            if (typeof showToast === 'function') {
                showToast('☁️ Uploading to cloud...', 'info', 1500);
            }

            await new Promise(resolve => setTimeout(resolve, 1500));

            // Store in localStorage with cloud prefix for simulation
            localStorage.setItem('vpet_cloud_backup', JSON.stringify(backup));

            this.lastBackupTime = new Date();
            this.saveBackupSettings();

            if (typeof showToast === 'function') {
                showToast('✅ Saved to cloud successfully!', 'success', 3000);
            }

            return true;
        } catch (error) {
            console.error('Error saving to cloud:', error);
            if (typeof showToast === 'function') {
                showToast('❌ Failed to save to cloud', 'error', 3000);
            }
            return false;
        }
    }

    /**
     * Load from cloud backup (premium feature)
     */
    async loadFromCloud() {
        if (!this.premiumManager.canAccessFeature('cloud_save')) {
            if (typeof showToast === 'function') {
                showToast('☁️ Cloud backup requires premium subscription', 'info', 3000);
            }
            return false;
        }

        try {
            // Simulate cloud download (in production, this would be an API call)
            if (typeof showToast === 'function') {
                showToast('☁️ Downloading from cloud...', 'info', 1500);
            }

            await new Promise(resolve => setTimeout(resolve, 1500));

            // Retrieve from localStorage cloud backup
            const cloudBackup = localStorage.getItem('vpet_cloud_backup');
            
            if (!cloudBackup) {
                if (typeof showToast === 'function') {
                    showToast('❌ No cloud backup found', 'info', 3000);
                }
                return false;
            }

            const backup = JSON.parse(cloudBackup);

            // Confirm with user
            const confirmed = confirm(
                'This will replace your current pet data with the cloud backup.\n\n' +
                `Backup from: ${new Date(backup.timestamp).toLocaleString()}\n\n` +
                'Are you sure you want to continue?'
            );

            if (!confirmed) {
                return false;
            }

            // Restore data
            if (backup.data.vpet_data) {
                localStorage.setItem('vpet_data', JSON.stringify(backup.data.vpet_data));
            }
            if (backup.data.premiumStatus) {
                localStorage.setItem('premiumStatus', JSON.stringify(backup.data.premiumStatus));
            }
            if (backup.data.theme) {
                localStorage.setItem('theme', backup.data.theme);
            }

            if (typeof showToast === 'function') {
                showToast('✅ Cloud backup restored! Reloading...', 'success', 2000);
            }

            // Reload page to apply changes
            setTimeout(() => {
                window.location.reload();
            }, 2000);

            return true;
        } catch (error) {
            console.error('Error loading from cloud:', error);
            if (typeof showToast === 'function') {
                showToast('❌ Failed to load from cloud', 'error', 3000);
            }
            return false;
        }
    }

    /**
     * Enable automatic cloud backups (premium feature)
     */
    enableCloudBackups() {
        if (!this.premiumManager.canAccessFeature('cloud_save')) {
            if (typeof showToast === 'function') {
                showToast('☁️ Cloud backup requires premium subscription', 'info', 3000);
            }
            return false;
        }

        this.cloudBackupEnabled = true;
        this.saveBackupSettings();
        
        if (typeof showToast === 'function') {
            showToast('✅ Automatic cloud backups enabled', 'success', 3000);
        }

        return true;
    }

    /**
     * Disable automatic cloud backups
     */
    disableCloudBackups() {
        this.cloudBackupEnabled = false;
        this.saveBackupSettings();
        
        if (typeof showToast === 'function') {
            showToast('Cloud backups disabled', 'info', 2000);
        }
    }

    /**
     * Get last backup time formatted
     */
    getLastBackupTimeFormatted() {
        if (!this.lastBackupTime) {
            return 'Never';
        }

        const now = new Date();
        const diff = now - this.lastBackupTime;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BackupManager };
}
