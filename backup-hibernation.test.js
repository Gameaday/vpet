import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
global.localStorage = localStorageMock;

// Mock showToast function
global.showToast = vi.fn();

// Mock PremiumManager
class MockPremiumManager {
  constructor(tier = 'free') {
    this.subscriptionTier = tier;
    this.isPremium = tier !== 'free';
  }

  canAccessFeature(feature) {
    if (!this.isPremium) return false;
    if (feature === 'cloud_save') return true;
    if (feature === 'hibernation_extended') return this.subscriptionTier === 'basic' || this.subscriptionTier === 'premium';
    if (feature === 'hibernation_unlimited') return this.subscriptionTier === 'premium';
    return false;
  }
}

// Import modules
const { BackupManager } = await import('./js/backup-manager.js');
const { HibernationManager } = await import('./js/hibernation-manager.js');

describe('BackupManager', () => {
  let backupManager;
  let premiumManager;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    premiumManager = new MockPremiumManager('free');
    backupManager = new BackupManager(premiumManager);
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(backupManager.cloudBackupEnabled).toBe(false);
      expect(backupManager.lastBackupTime).toBeNull();
    });

    it('should load saved backup settings', () => {
      const settings = {
        cloudBackupEnabled: true,
        lastBackupTime: new Date().toISOString()
      };
      localStorage.setItem('backupSettings', JSON.stringify(settings));
      
      const manager = new BackupManager(premiumManager);
      expect(manager.cloudBackupEnabled).toBe(true);
      expect(manager.lastBackupTime).not.toBeNull();
    });
  });

  describe('Local Backup', () => {
    it('should export local backup successfully', () => {
      // Mock pet data
      localStorage.setItem('vpet_data', JSON.stringify({ name: 'TestPet' }));
      
      // Mock DOM elements
      const mockLink = { click: vi.fn(), href: '', download: '' };
      document.createElement = vi.fn(() => mockLink);
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();
      global.URL.createObjectURL = vi.fn(() => 'blob:test');
      global.URL.revokeObjectURL = vi.fn();
      global.Blob = vi.fn();
      
      const result = backupManager.exportLocalBackup();
      
      expect(result).toBe(true);
      expect(backupManager.lastBackupTime).not.toBeNull();
    });

    it('should format last backup time correctly', () => {
      backupManager.lastBackupTime = null;
      expect(backupManager.getLastBackupTimeFormatted()).toBe('Never');
      
      backupManager.lastBackupTime = new Date(Date.now() - 30000); // 30 seconds ago
      expect(backupManager.getLastBackupTimeFormatted()).toBe('Just now');
      
      backupManager.lastBackupTime = new Date(Date.now() - 300000); // 5 minutes ago
      expect(backupManager.getLastBackupTimeFormatted()).toContain('minute');
      
      backupManager.lastBackupTime = new Date(Date.now() - 7200000); // 2 hours ago
      expect(backupManager.getLastBackupTimeFormatted()).toContain('hour');
    });
  });

  describe('Cloud Backup - Free User', () => {
    it('should block cloud save for free users', async () => {
      const result = await backupManager.saveToCloud();
      expect(result).toBe(false);
      expect(showToast).toHaveBeenCalledWith(
        expect.stringContaining('premium'),
        'info',
        3000
      );
    });

    it('should block cloud load for free users', async () => {
      const result = await backupManager.loadFromCloud();
      expect(result).toBe(false);
      expect(showToast).toHaveBeenCalledWith(
        expect.stringContaining('premium'),
        'info',
        3000
      );
    });

    it('should block cloud backup enable for free users', () => {
      const result = backupManager.enableCloudBackups();
      expect(result).toBe(false);
      expect(backupManager.cloudBackupEnabled).toBe(false);
    });
  });

  describe('Cloud Backup - Premium User', () => {
    beforeEach(() => {
      premiumManager = new MockPremiumManager('basic');
      backupManager = new BackupManager(premiumManager);
    });

    it('should allow cloud save for premium users', async () => {
      localStorage.setItem('vpet_data', JSON.stringify({ name: 'TestPet' }));
      
      const result = await backupManager.saveToCloud();
      
      expect(result).toBe(true);
      expect(backupManager.lastBackupTime).not.toBeNull();
      expect(localStorage.getItem('vpet_cloud_backup')).not.toBeNull();
    });

    it('should enable cloud backups for premium users', () => {
      const result = backupManager.enableCloudBackups();
      
      expect(result).toBe(true);
      expect(backupManager.cloudBackupEnabled).toBe(true);
    });

    it('should disable cloud backups', () => {
      backupManager.cloudBackupEnabled = true;
      backupManager.disableCloudBackups();
      
      expect(backupManager.cloudBackupEnabled).toBe(false);
    });
  });
});

describe('HibernationManager', () => {
  let hibernationManager;
  let premiumManager;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
    premiumManager = new MockPremiumManager('free');
    hibernationManager = new HibernationManager(premiumManager);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      expect(hibernationManager.isHibernating).toBe(false);
      expect(hibernationManager.hibernationStartTime).toBeNull();
      expect(hibernationManager.pauseCount).toBe(0);
    });

    it('should load saved hibernation state', () => {
      const state = {
        isHibernating: true,
        hibernationStartTime: new Date().toISOString(),
        hibernationDuration: 86400000, // 1 day
        pauseCount: 1,
        lastPauseDate: new Date().toDateString()
      };
      localStorage.setItem('hibernationState', JSON.stringify(state));
      
      const manager = new HibernationManager(premiumManager);
      expect(manager.isHibernating).toBe(true);
      expect(manager.pauseCount).toBe(1);
    });
  });

  describe('Tier Limits', () => {
    it('should return correct limits for free tier', () => {
      const limits = hibernationManager.getHibernationLimits();
      
      expect(limits.maxDuration).toBe(1);
      expect(limits.maxPausesPerDay).toBe(1);
      expect(limits.canUnpauseAnytime).toBe(false);
    });

    it('should return correct limits for basic tier', () => {
      premiumManager = new MockPremiumManager('basic');
      hibernationManager = new HibernationManager(premiumManager);
      const limits = hibernationManager.getHibernationLimits();
      
      expect(limits.maxDuration).toBe(7);
      expect(limits.maxPausesPerDay).toBe(Infinity);
      expect(limits.canUnpauseAnytime).toBe(true);
    });

    it('should return correct limits for premium tier', () => {
      premiumManager = new MockPremiumManager('premium');
      hibernationManager = new HibernationManager(premiumManager);
      const limits = hibernationManager.getHibernationLimits();
      
      expect(limits.maxDuration).toBe(Infinity);
      expect(limits.maxPausesPerDay).toBe(Infinity);
      expect(limits.canUnpauseAnytime).toBe(true);
    });
  });

  describe('Start Hibernation', () => {
    it('should start hibernation for free user with 1 day', () => {
      const result = hibernationManager.startHibernation(1);
      
      expect(result).toBe(true);
      expect(hibernationManager.isHibernating).toBe(true);
      expect(hibernationManager.pauseCount).toBe(1);
    });

    it('should reject hibernation beyond tier limit', () => {
      const result = hibernationManager.startHibernation(2); // Free tier max is 1
      
      expect(result).toBe(false);
      expect(hibernationManager.isHibernating).toBe(false);
    });

    it('should reject hibernation when daily limit reached', () => {
      hibernationManager.startHibernation(1);
      hibernationManager.wakeUp();
      
      const result = hibernationManager.startHibernation(1);
      
      expect(result).toBe(false);
    });

    it('should reject already hibernating pet', () => {
      hibernationManager.startHibernation(1);
      const result = hibernationManager.startHibernation(1);
      
      expect(result).toBe(false);
    });

    it('should allow premium user to hibernate for multiple days', () => {
      premiumManager = new MockPremiumManager('premium');
      hibernationManager = new HibernationManager(premiumManager);
      
      const result = hibernationManager.startHibernation(30);
      
      expect(result).toBe(true);
      expect(hibernationManager.isHibernating).toBe(true);
    });
  });

  describe('Wake Up', () => {
    it('should wake up successfully', () => {
      hibernationManager.startHibernation(1);
      
      // Fast-forward time by 1 day
      vi.advanceTimersByTime(86400000);
      
      const result = hibernationManager.wakeUp(true);
      
      expect(result).toBe(true);
      expect(hibernationManager.isHibernating).toBe(false);
    });

    it('should prevent free user from early wake up', () => {
      hibernationManager.startHibernation(1);
      
      // Try to wake up after 1 hour (not allowed for free)
      vi.advanceTimersByTime(3600000);
      
      const result = hibernationManager.wakeUp(false);
      
      expect(result).toBe(false);
      expect(hibernationManager.isHibernating).toBe(true);
    });

    it('should allow premium user to wake up early', () => {
      premiumManager = new MockPremiumManager('premium');
      hibernationManager = new HibernationManager(premiumManager);
      
      hibernationManager.startHibernation(7);
      
      // Wake up after 1 hour (allowed for premium)
      vi.advanceTimersByTime(3600000);
      
      const result = hibernationManager.wakeUp(false);
      
      expect(result).toBe(true);
      expect(hibernationManager.isHibernating).toBe(false);
    });

    it('should return false when not hibernating', () => {
      const result = hibernationManager.wakeUp();
      expect(result).toBe(false);
    });
  });

  describe('Remaining Time', () => {
    it('should calculate remaining time correctly', () => {
      hibernationManager.startHibernation(1);
      
      const remaining = hibernationManager.getRemainingTime();
      
      expect(remaining.days).toBe(1);
      expect(remaining.hours).toBe(0);
      expect(remaining.minutes).toBe(0);
      expect(remaining.total).toBeGreaterThan(0);
    });

    it('should return zero when not hibernating', () => {
      const remaining = hibernationManager.getRemainingTime();
      
      expect(remaining.days).toBe(0);
      expect(remaining.hours).toBe(0);
      expect(remaining.minutes).toBe(0);
      expect(remaining.total).toBe(0);
    });

    it('should format remaining time correctly', () => {
      hibernationManager.startHibernation(1);
      
      let formatted = hibernationManager.getRemainingTimeFormatted();
      expect(formatted).toContain('d');
      
      // Advance time
      vi.advanceTimersByTime(86400000 - 3600000); // 23 hours later
      formatted = hibernationManager.getRemainingTimeFormatted();
      expect(formatted).toContain('h');
    });
  });

  describe('Status and Freezing', () => {
    it('should return correct status', () => {
      const status = hibernationManager.getStatus();
      
      expect(status.isHibernating).toBe(false);
      expect(status.canStartHibernation.canHibernate).toBe(true);
      expect(status.maxDuration).toBe(1);
      expect(status.maxPausesPerDay).toBe(1);
    });

    it('should freeze pet when hibernating', () => {
      expect(hibernationManager.shouldFreezePet()).toBe(false);
      
      hibernationManager.startHibernation(1);
      
      expect(hibernationManager.shouldFreezePet()).toBe(true);
    });
  });

  describe('Daily Count Reset', () => {
    it('should reset pause count on new day', () => {
      hibernationManager.pauseCount = 1;
      hibernationManager.lastPauseDate = new Date(Date.now() - 86400000).toDateString(); // Yesterday
      
      hibernationManager.loadHibernationState();
      
      // Trigger a check that would reset the count
      const check = hibernationManager.canStartHibernation();
      
      expect(check.canHibernate).toBe(true);
    });
  });
});
