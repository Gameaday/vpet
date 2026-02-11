// Main application logic - Refactored with Modular Architecture
/* global SoundManager, VibrationManager, UIManager, BattleUIManager, MilestoneManager, SocialFeatures, AppConfig, BackupManager, HibernationManager, ParticleEffects */
/* global initializePhase34Features, awardCoins */

let pet = null;
let currentBattle = null;
let serverConnection = null;
let premiumManager = null;
let backupManager = null;
let hibernationManager = null;
let updateInterval = null;

// Initialize managers
let soundManager = null;
let vibrationManager = null;
let uiManager = null;
let battleUIManager = null;
let milestoneManager = null;
let socialFeatures = null;
let particleEffects = null;

// Theme management
let currentTheme = localStorage.getItem('theme') || 'dark';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all managers
    soundManager = new SoundManager(AppConfig);
    vibrationManager = new VibrationManager(AppConfig);
    uiManager = new UIManager(AppConfig);
    battleUIManager = new BattleUIManager(AppConfig);
    milestoneManager = new MilestoneManager(AppConfig);
    socialFeatures = new SocialFeatures();
    particleEffects = new ParticleEffects(AppConfig);
    
    // Initialize accessibility and input validation
    const accessibilityManager = new AccessibilityManager();
    window.accessibilityManager = accessibilityManager;
    window.InputValidator = InputValidator;
    
    // Make particleEffects globally accessible for pet.js
    window.particleEffects = particleEffects;
    
    // Apply saved theme
    uiManager.applyTheme(currentTheme);
    
    // Apply saved stat display mode
    const savedStatMode = localStorage.getItem('statDisplayMode') || 'bars';
    applyStatDisplayMode(savedStatMode);
    document.getElementById('statDisplaySelect').value = savedStatMode;
    
    // Create pet instance
    pet = new Pet();
    
    // Create premium manager
    premiumManager = new PremiumManager();
    
    // Create backup manager
    backupManager = new BackupManager(premiumManager);
    
    // Create hibernation manager
    hibernationManager = new HibernationManager(premiumManager);
    
    // Create server connection
    serverConnection = new ServerConnection();
    
    // Check for time away and show modal if needed
    const timeAwayInfo = pet.updateStatsFromTimePassed();
    if (timeAwayInfo) {
        showTimeAwayModal(timeAwayInfo);
    }
    
    // Initial UI update
    updateUI();
    
    // Set up periodic updates
    const updateFrequency = AppConfig.TIMERS?.statsUpdate || 10000;
    updateInterval = setInterval(() => {
        // Skip updates if pet is hibernating
        if (!hibernationManager.shouldFreezePet()) {
            pet.updateStatsFromTimePassed();
            pet.checkSickness();
            pet.recordStatsSnapshot();
        }
        updateUI();
    }, updateFrequency);
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize Phase 3-4 features
    if (typeof initializePhase34Features === 'function') {
        initializePhase34Features();
    }
    
    // Try to connect to server in background
    tryConnectToServer();
});

// Set up all event listeners
function setupEventListeners() {
    // Server status click handler for manual retry or cancel reconnect
    document.getElementById('serverStatus').addEventListener('click', () => {
        if (serverConnection) {
            const serverStatus = document.getElementById('serverStatus');
            const isReconnecting = serverStatus && serverStatus.classList.contains('reconnecting');
            
            if (isReconnecting) {
                // Cancel ongoing reconnection attempts
                serverConnection.cancelReconnect();
            } else if (!serverConnection.connected) {
                // Retry connection when offline
                serverConnection.manualRetry();
            }
        }
    });
    
    // Action buttons - now open gateway modals
    document.getElementById('feedBtn').addEventListener('click', () => {
        if (gatewayManager) {
            gatewayManager.openModal('kitchen');
        } else {
            handleFeed();
        }
    });
    
    document.getElementById('playBtn').addEventListener('click', () => {
        if (gatewayManager) {
            gatewayManager.openModal('activities');
        } else {
            handlePlay();
        }
    });
    
    document.getElementById('sleepBtn').addEventListener('click', () => {
        if (gatewayManager) {
            gatewayManager.openModal('rest');
        } else {
            handleSleep();
        }
    });
    
    document.getElementById('trainBtn').addEventListener('click', () => {
        if (gatewayManager) {
            gatewayManager.openModal('training');
        } else {
            handleTrain();
        }
    });
    
    document.getElementById('cleanBtn').addEventListener('click', () => {
        if (gatewayManager) {
            gatewayManager.openModal('grooming');
        } else {
            handleClean();
        }
    });
    
    // Egg-specific buttons
    document.getElementById('warmBtn').addEventListener('click', handleWarm);
    document.getElementById('hatchBtn').addEventListener('click', handleHatch);
    
    // Battle buttons
    document.getElementById('battleBtn').addEventListener('click', handleLocalBattle);
    document.getElementById('onlineBattleBtn').addEventListener('click', handleOnlineBattle);
    
    // Social buttons
    document.getElementById('shareBtn').addEventListener('click', handleShare);
    document.getElementById('leaderboardBtn').addEventListener('click', showLeaderboard);
    
    // QoL buttons
    document.getElementById('hibernateBtn').addEventListener('click', openHibernationModal);
    document.getElementById('backupBtn').addEventListener('click', openBackupModal);
    
    // Settings buttons
    document.getElementById('settingsBtn')?.addEventListener('click', openSettings);
    document.getElementById('helpBtn')?.addEventListener('click', openHelp);
    document.getElementById('resetBtn')?.addEventListener('click', handleReset);
    document.getElementById('premiumCtaBtn')?.addEventListener('click', () => {
        premiumManager.openPremiumModal();
    });
    
    // Settings modal quick action buttons
    document.getElementById('settingsBackupBtn')?.addEventListener('click', () => {
        closeSettingsModal();
        openBackupModal();
    });
    document.getElementById('settingsHelpBtn')?.addEventListener('click', () => {
        closeSettingsModal();
        openHelp();
    });
    
    // Modal close buttons
    document.getElementById('closeBattleModal').addEventListener('click', closeBattleModal);
    document.getElementById('closeSettingsModal').addEventListener('click', closeSettingsModal);
    document.getElementById('closeHelpModal').addEventListener('click', closeHelp);
    document.getElementById('closeHelpBtn').addEventListener('click', closeHelp);
    document.getElementById('closeLeaderboardModal').addEventListener('click', closeLeaderboard);
    document.getElementById('closeHibernationModal').addEventListener('click', closeHibernationModal);
    document.getElementById('closeBackupModal').addEventListener('click', closeBackupModal);
    
    // Backup modal buttons
    document.getElementById('exportBackupBtn').addEventListener('click', handleExportBackup);
    document.getElementById('importBackupBtnTrigger').addEventListener('click', () => {
        document.getElementById('importBackupInput').click();
    });
    document.getElementById('importBackupInput').addEventListener('change', handleImportBackup);
    document.getElementById('saveToCloudBtn').addEventListener('click', handleSaveToCloud);
    document.getElementById('loadFromCloudBtn').addEventListener('click', handleLoadFromCloud);
    document.getElementById('autoCloudBackupToggle').addEventListener('change', handleAutoCloudBackupToggle);
    
    // Settings save
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    
    // Time away modal
    document.getElementById('closeTimeAwayBtn').addEventListener('click', closeTimeAwayModal);
    
    // Battle actions
    document.getElementById('attackBtn').addEventListener('click', () => handleBattleAction('attack'));
    document.getElementById('defendBtn').addEventListener('click', () => handleBattleAction('defend'));
    document.getElementById('specialBtn').addEventListener('click', () => handleBattleAction('special'));
    document.getElementById('finishBattleBtn').addEventListener('click', closeBattleModal);
    
    // Click outside modal to close
    document.getElementById('battleModal').addEventListener('click', (e) => {
        if (e.target.id === 'battleModal') {
            closeBattleModal();
        }
    });
    
    document.getElementById('settingsModal').addEventListener('click', (e) => {
        if (e.target.id === 'settingsModal') {
            closeSettingsModal();
        }
    });
    
    document.getElementById('helpModal').addEventListener('click', (e) => {
        if (e.target.id === 'helpModal') {
            closeHelp();
        }
    });
    
    document.getElementById('premiumModal').addEventListener('click', (e) => {
        if (e.target.id === 'premiumModal') {
            premiumManager.closePremiumModal();
        }
    });
    
    document.getElementById('hibernationModal').addEventListener('click', (e) => {
        if (e.target.id === 'hibernationModal') {
            closeHibernationModal();
        }
    });
    
    document.getElementById('backupModal').addEventListener('click', (e) => {
        if (e.target.id === 'backupModal') {
            closeBackupModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcut);
    
    // Touch gestures for mobile
    setupTouchGestures();
    
    // Show tutorial on first visit
    checkFirstVisit();
}

// Setup touch gestures for mobile devices
function setupTouchGestures() {
    let touchStartY = 0;
    let touchStartX = 0;
    const swipeThreshold = 50; // minimum distance for swipe
    
    // Handle swipe down to close modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        // Use passive: true to improve scrolling performance
        // This means we cannot call preventDefault() but we don't need to for gesture detection
        modal.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        
        modal.addEventListener('touchend', (e) => {
            if (e.target.classList.contains('modal')) {
                const touchEndY = e.changedTouches[0].clientY;
                const touchEndX = e.changedTouches[0].clientX;
                const deltaY = touchEndY - touchStartY;
                const deltaX = touchEndX - touchStartX;
                
                // Swipe down to close (more vertical than horizontal)
                if (deltaY > swipeThreshold && Math.abs(deltaY) > Math.abs(deltaX)) {
                    // Close the appropriate modal
                    if (modal.id === 'battleModal') closeBattleModal();
                    else if (modal.id === 'settingsModal') closeSettingsModal();
                    else if (modal.id === 'helpModal') closeHelp();
                    else if (modal.id === 'premiumModal') premiumManager.closePremiumModal();
                }
            }
        }, { passive: true });
    });
}


// Check if this is the user's first visit
function checkFirstVisit() {
    const hasVisited = localStorage.getItem('vpet_has_visited');
    if (!hasVisited) {
        localStorage.setItem('vpet_has_visited', 'true');
        // Show tutorial after a short delay
        setTimeout(() => {
            openHelp();
        }, 1000);
    }
}

// Handle keyboard shortcuts
function handleKeyboardShortcut(e) {
    // Don't trigger shortcuts if typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // Don't trigger if a modal is open (except battle)
    const settingsModal = document.getElementById('settingsModal');
    const timeAwayModal = document.getElementById('timeAwayModal');
    if (settingsModal.classList.contains('active') || timeAwayModal.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeSettingsModal();
            closeTimeAwayModal();
        }
        return;
    }
    
    switch(e.key.toLowerCase()) {
        case 'f':
            e.preventDefault();
            handleFeed();
            break;
        case 'p':
            e.preventDefault();
            handlePlay();
            break;
        case 's':
            e.preventDefault();
            handleSleep();
            break;
        case 't':
            e.preventDefault();
            handleTrain();
            break;
        case 'b':
            e.preventDefault();
            handleLocalBattle();
            break;
        case 'escape': {
            const battleModal = document.getElementById('battleModal');
            if (battleModal.classList.contains('active')) {
                closeBattleModal();
            }
            break;
        }
    }
}

// Try to connect to server
function tryConnectToServer() {
    serverConnection.connect()
        .then(() => {
            showNotification('🌐 Connected to server!');
        })
        .catch((error) => {
            console.log('Could not connect to server:', error);
            // This is expected if server is not running
        });
}

// Update UI with current pet state
function updateUI() {
    // Update pet name and stage
    document.getElementById('petName').textContent = pet.name;
    document.getElementById('petStage').textContent = pet.stage.charAt(0).toUpperCase() + pet.stage.slice(1);
    
    // Update pet sprite
    const petAnimation = document.querySelector('.pet-animation');
    petAnimation.className = `pet-animation ${pet.stage}`;
    
    // Check hibernation status
    const isHibernating = hibernationManager && hibernationManager.shouldFreezePet();
    
    if (isHibernating) {
        petAnimation.classList.add('hibernating');
        // Show hibernation status on pet
        const petDisplay = document.querySelector('.pet-display');
        if (!document.getElementById('hibernationIndicator')) {
            const indicator = document.createElement('div');
            indicator.id = 'hibernationIndicator';
            indicator.className = 'hibernation-indicator';
            indicator.innerHTML = '❄️ Cryo Sleep';
            petDisplay.appendChild(indicator);
        }
    } else {
        petAnimation.classList.remove('hibernating');
        const indicator = document.getElementById('hibernationIndicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    if (pet.isSleeping) {
        petAnimation.classList.add('sleeping');
    }
    
    // Handle egg-specific UI
    const isEgg = pet.stage === 'egg' && !pet.hasHatched;
    
    // Show/hide egg-specific elements
    document.getElementById('warmthStat').style.display = isEgg ? 'block' : 'none';
    document.getElementById('eggActionPanel').style.display = isEgg ? 'flex' : 'none';
    document.getElementById('normalActionPanel').style.display = isEgg ? 'none' : 'flex';
    
    // Hide normal stats for eggs
    const normalStats = ['health', 'hunger', 'happiness', 'energy', 'cleanliness'];
    normalStats.forEach(stat => {
        const statBar = document.getElementById(`${stat}Value`).closest('.stat-bar');
        if (statBar) {
            statBar.style.display = isEgg ? 'none' : 'block';
        }
    });
    
    if (isEgg) {
        // Update warmth stat
        uiManager.updateStat('warmth', pet.warmth);
        document.getElementById('warmthValue').textContent = Math.floor(pet.warmth);
        updateCircularGauge('warmth', pet.warmth);
        
        // Add warmth-based visual classes to egg
        petAnimation.classList.remove('warm', 'very-warm', 'hot');
        if (pet.warmth >= 80) {
            petAnimation.classList.add('hot');
        } else if (pet.warmth >= 60) {
            petAnimation.classList.add('very-warm');
        } else if (pet.warmth >= 40) {
            petAnimation.classList.add('warm');
        }
        
        // Update warmth status display
        const warmthStatus = document.getElementById('warmthStatus');
        if (warmthStatus) {
            warmthStatus.className = 'warmth-status';
            if (pet.warmth >= 90) {
                warmthStatus.textContent = '🔥 Very Hot - Perfect for hatching!';
                warmthStatus.classList.add('very-hot');
            } else if (pet.warmth >= 70) {
                warmthStatus.textContent = '🌡️ Hot - Good warmth level';
                warmthStatus.classList.add('hot');
            } else if (pet.warmth >= 50) {
                warmthStatus.textContent = '☀️ Warm - Keep warming';
                warmthStatus.classList.add('warm');
            } else if (pet.warmth >= 30) {
                warmthStatus.textContent = '🌤️ Cool - Needs more warmth';
                warmthStatus.classList.add('cool');
            } else {
                warmthStatus.textContent = '❄️ Cold - Warm up quickly!';
                warmthStatus.classList.add('cold');
            }
        }
        
        // Update hatch button state
        const hatchBtn = document.getElementById('hatchBtn');
        if (pet.canHatch()) {
            hatchBtn.disabled = false;
            hatchBtn.classList.add('ready-to-hatch');
        } else {
            hatchBtn.disabled = true;
            hatchBtn.classList.remove('ready-to-hatch');
        }
    } else {
        // Update stats using UI manager (for non-eggs)
        uiManager.updateStat('health', pet.health);
        uiManager.updateStat('hunger', pet.hunger);
        uiManager.updateStat('happiness', pet.happiness);
        uiManager.updateStat('energy', pet.energy);
        uiManager.updateStat('cleanliness', pet.cleanliness);
        
        // Update circular gauges if in circular mode
        updateCircularGauge('health', pet.health);
        updateCircularGauge('hunger', pet.hunger);
        updateCircularGauge('happiness', pet.happiness);
        updateCircularGauge('energy', pet.energy);
        updateCircularGauge('cleanliness', pet.cleanliness);
    }
    
    // Update info
    document.getElementById('petAge').textContent = isEgg ? 'Egg' : (pet.getAgeDisplay ? pet.getAgeDisplay() : pet.age + ' days');
    document.getElementById('petLevel').textContent = Math.floor(pet.level);
    document.getElementById('petWins').textContent = pet.wins;
    
    // Update sleep button text (only for non-eggs)
    if (!isEgg) {
        const sleepBtn = document.getElementById('sleepBtn');
        const sleepBtnText = sleepBtn.querySelector('span:last-child');
        sleepBtnText.textContent = pet.isSleeping ? 'Wake' : 'Sleep';
        
        // Disable actions if sleeping or hibernating
        const actionsDisabled = pet.isSleeping || isHibernating;
        document.getElementById('feedBtn').disabled = actionsDisabled;
        document.getElementById('playBtn').disabled = actionsDisabled;
        document.getElementById('trainBtn').disabled = actionsDisabled;
        document.getElementById('cleanBtn').disabled = actionsDisabled;
        document.getElementById('battleBtn').disabled = actionsDisabled;
        document.getElementById('sleepBtn').disabled = isHibernating;
    }
    
    // Update evolution preview (hide for eggs)
    const evolutionPreview = document.getElementById('evolutionPreview');
    if (isEgg) {
        evolutionPreview.style.display = 'none';
    } else {
        updateEvolutionPreview();
    }
    
    // Update mood indicator (only for non-eggs)
    if (!isEgg) {
        const avgStats = (pet.health + pet.hunger + pet.happiness + pet.energy) / 4;
        uiManager.updateMoodIndicator(avgStats);
    }
    
    // Update stat tooltips
    updateStatTooltips();
    
    // Update idle animation
    updateIdleAnimation();
}

// Update evolution preview display
function updateEvolutionPreview() {
    const evolutionInfo = pet.getEvolutionProgress();
    const previewElement = document.getElementById('evolutionPreview');
    
    if (!evolutionInfo) {
        previewElement.style.display = 'none';
        return;
    }
    
    previewElement.style.display = 'block';
    document.getElementById('evolutionProgressFill').style.width = evolutionInfo.progress + '%';
    
    const hours = Math.floor(evolutionInfo.timeRemaining / 60);
    const minutes = Math.floor(evolutionInfo.timeRemaining % 60);
    const timeText = hours > 0
        ? `${hours}h ${minutes}m until ${evolutionInfo.nextStage}`
        : `${minutes}m until ${evolutionInfo.nextStage}`;
    document.getElementById('evolutionTime').textContent = timeText;
}

// Update mood indicator based on pet stats

// Update idle animation based on pet stats
function updateIdleAnimation() {
    const petAnimation = document.querySelector('.pet-animation');
    if (!petAnimation) return;
    
    // Remove all idle animation classes
    petAnimation.classList.remove('idle-high-energy', 'idle-medium-energy', 'idle-low-energy', 'idle-critical');
    
    // Skip if pet is sleeping (has its own animation)
    if (pet.isSleeping) return;
    
    // Calculate average stats
    const avgStats = (pet.health + pet.hunger + pet.happiness + pet.energy) / 4;
    
    // Apply animation based on stats
    if (avgStats < 20) {
        petAnimation.classList.add('idle-critical');
    } else if (pet.energy < 30) {
        petAnimation.classList.add('idle-low-energy');
    } else if (pet.energy < 60) {
        petAnimation.classList.add('idle-medium-energy');
    } else {
        petAnimation.classList.add('idle-high-energy');
    }
}

// Update stat tooltips with helpful information
function updateStatTooltips() {
    const stats = [
        {
            name: 'health',
            decay: 'Decreases when hunger is low',
            critical: 30
        },
        {
            name: 'hunger',
            decay: '~0.5 per minute',
            critical: 30
        },
        {
            name: 'happiness',
            decay: '~0.3 per minute',
            critical: 30
        },
        {
            name: 'energy',
            decay: '~0.2 per minute (restores while sleeping)',
            critical: 20
        },
        {
            name: 'cleanliness',
            decay: '~0.4 per minute',
            critical: 30
        }
    ];
    
    stats.forEach(stat => {
        const value = pet[stat.name];
        const barContainer = document.getElementById(`${stat.name}BarContainer`);
        
        if (barContainer && barContainer.parentElement) {
            let tooltip = `Decay: ${stat.decay}`;
            if (value < stat.critical) {
                tooltip += ` | ⚠️ CRITICAL!`;
            }
            barContainer.parentElement.setAttribute('data-tooltip', tooltip);
        }
    });
}

// Update individual stat bar

// Handle warm egg action
function handleWarm() {
    if (pet.warm()) {
        vibrationManager.vibrate('medium');
        soundManager.play('feed');
        
        // Add warming animation to egg
        const petAnimation = document.querySelector('.pet-animation');
        if (petAnimation) {
            petAnimation.classList.add('warming-up');
            setTimeout(() => {
                petAnimation.classList.remove('warming-up');
            }, 800);
        }
        
        // Show particle effects
        const petSprite = document.getElementById('petSprite');
        if (petSprite && particleEffects) {
            const rect = petSprite.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            particleEffects.showHearts(x, y);
        }
        
        updateUI();
        uiManager.showSaveIndicator();
    }
}

// Handle hatch egg action
function handleHatch() {
    if (pet.hatch()) {
        vibrationManager.vibrate('heavy');
        soundManager.play('evolution');
        
        // Show evolution particle effects
        const petSprite = document.getElementById('petSprite');
        if (petSprite && particleEffects) {
            const rect = petSprite.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            particleEffects.showEvolution(x, y);
        }
        
        // Prompt for pet name
        setTimeout(() => {
            const newName = prompt('🎉 Your egg has hatched!\n\nWhat would you like to name your pet?', 'My Pet');
            if (newName && newName.trim()) {
                // Validate the name
                const validation = InputValidator.validatePetName(newName);
                if (validation.valid) {
                    pet.name = validation.sanitized;
                    pet.save();
                    showToast(`Welcome, ${pet.name}! 🐾`, 'success', 3000);
                } else {
                    showToast(validation.error, 'error', 3000);
                    // Keep "???" or default if validation fails
                    if (pet.name === '???') {
                        pet.name = 'My Pet';
                        pet.save();
                    }
                }
            } else if (pet.name === '???') {
                // User cancelled or provided empty name, set default
                pet.name = 'My Pet';
                pet.save();
            }
            updateUI();
        }, 1000); // Delay to let the evolution animation play
        
        updateUI();
        uiManager.showSaveIndicator();
    }
}

// Handle feed action
function handleFeed() {
    // Prevent actions during hibernation
    if (hibernationManager && hibernationManager.shouldFreezePet()) {
        showNotification('❄️ Pet is in cryo sleep!');
        return;
    }
    
    if (pet.feed()) {
        vibrationManager.vibrate('medium');
        soundManager.play('feed');
        milestoneManager.check('feed', pet, uiManager.showAchievement.bind(uiManager));
        
        // Show particle effects
        const petSprite = document.getElementById('petSprite');
        if (petSprite && particleEffects) {
            const rect = petSprite.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            particleEffects.showFood(x, y);
            setTimeout(() => particleEffects.showHearts(x, y), 300);
        }
        
        updateUI();
        uiManager.showSaveIndicator();
    }
}

// Handle play action
function handlePlay() {
    // Prevent actions during hibernation
    if (hibernationManager && hibernationManager.shouldFreezePet()) {
        showNotification('❄️ Pet is in cryo sleep!');
        return;
    }
    
    if (pet.play()) {
        vibrationManager.vibrate('medium');
        pet.updatePersonality('play');
        soundManager.play('play');
        milestoneManager.check('play', pet, uiManager.showAchievement.bind(uiManager));
        
        // Show particle effects
        const petSprite = document.getElementById('petSprite');
        if (petSprite && particleEffects) {
            const rect = petSprite.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            particleEffects.showPlay(x, y);
        }
        
        updateUI();
        uiManager.showSaveIndicator();
    }
}

// Handle sleep action
function handleSleep() {
    // Prevent actions during hibernation
    if (hibernationManager && hibernationManager.shouldFreezePet()) {
        showNotification('❄️ Pet is in cryo sleep!');
        return;
    }
    
    vibrationManager.vibrate('light');
    soundManager.play('sleep');
    pet.sleep();
    
    // Show particle effects
    const petSprite = document.getElementById('petSprite');
    if (petSprite && particleEffects) {
        const rect = petSprite.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        particleEffects.showSleep(x, y);
    }
    
    updateUI();
    uiManager.showSaveIndicator();
}

// Handle train action
function handleTrain() {
    // Prevent actions during hibernation
    if (hibernationManager && hibernationManager.shouldFreezePet()) {
        showNotification('❄️ Pet is in cryo sleep!');
        return;
    }
    
    const prevLevel = Math.floor(pet.level);
    if (pet.train()) {
        vibrationManager.vibrate('heavy');
        pet.updatePersonality('train');
        soundManager.play('train');
        milestoneManager.check('train', pet, uiManager.showAchievement.bind(uiManager));
        
        // Show particle effects
        const petSprite = document.getElementById('petSprite');
        if (petSprite && particleEffects) {
            const rect = petSprite.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            particleEffects.showTraining(x, y);
        }
        
        // Check for level up
        const newLevel = Math.floor(pet.level);
        if (newLevel > prevLevel) {
            vibrationManager.vibrate('success');
            milestoneManager.check('level', pet, uiManager.showAchievement.bind(uiManager));
            
            // Show star burst for level up
            if (petSprite && particleEffects) {
                const rect = petSprite.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                setTimeout(() => particleEffects.showStarBurst(x, y), 500);
            }
        }
        
        updateUI();
        uiManager.showSaveIndicator();
    }
}

// Handle clean action
function handleClean() {
    // Prevent actions during hibernation
    if (hibernationManager && hibernationManager.shouldFreezePet()) {
        showNotification('❄️ Pet is in cryo sleep!');
        return;
    }
    
    if (pet.clean()) {
        vibrationManager.vibrate('medium');
        soundManager.play('play'); // Play success sound effect for cleaning action
        milestoneManager.check('clean', pet, uiManager.showAchievement.bind(uiManager));
        
        // Show particle effects (sparkles for cleaning)
        const petSprite = document.getElementById('petSprite');
        if (petSprite && particleEffects) {
            const rect = petSprite.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            particleEffects.showSparkles(x, y);
        }
        
        updateUI();
        uiManager.showSaveIndicator();
    }
}

// Handle local battle
function handleLocalBattle() {
    // Prevent actions during hibernation
    if (hibernationManager && hibernationManager.shouldFreezePet()) {
        showNotification('❄️ Pet is in cryo sleep!');
        return;
    }
    
    if (pet.isSleeping) {
        showNotification('💤 Your pet is sleeping!');
        return;
    }
    
    if (pet.energy < 30) {
        showNotification('😴 Your pet is too tired to battle!');
        return;
    }
    
    // Generate opponent
    const opponent = generateOpponent(Math.floor(pet.level));
    
    // Start battle
    currentBattle = new Battle(pet, opponent);
    
    // Set battle in UI manager
    battleUIManager.setBattle(currentBattle);
    
    // Set callback for turn completion
    currentBattle.onTurnComplete = () => {
        battleUIManager.update(soundManager, milestoneManager, uiManager, pet);
        if (currentBattle.turn === 'player' && currentBattle.isActive) {
            battleUIManager.enableActionButtons();
        }
    };
    
    // Show battle modal using manager
    battleUIManager.openModal(opponent);
}

// Handle online battle
function handleOnlineBattle() {
    // Prevent actions during hibernation
    if (hibernationManager && hibernationManager.shouldFreezePet()) {
        showNotification('❄️ Pet is in cryo sleep!');
        return;
    }
    
    if (!serverConnection.connected) {
        showNotification('❌ Not connected to server!');
        return;
    }
    
    if (pet.isSleeping) {
        showNotification('💤 Your pet is sleeping!');
        return;
    }
    
    if (pet.energy < 30) {
        showNotification('😴 Your pet is too tired to battle!');
        return;
    }
    
    showNotification('🔍 Searching for opponent...');
    serverConnection.requestBattle(pet.toJSON());
}

// Close battle modal
function closeBattleModal() {
    // Use BattleUIManager's closeModal with business logic callback
    battleUIManager.closeModal((battle) => {
        // Battle ended, update pet with opponent name
        const opponentName = battle.opponentPet.name || 'Opponent';
        pet.updatePersonality('battle'); // Update personality based on battle
        pet.updateAfterBattle(battle.playerWon(), opponentName);
        
        // Award coins for battle win
        if (battle.playerWon() && typeof awardCoins === 'function') {
            const baseReward = 10 + (battle.opponentPet.level || 1) * 2;
            const coinsEarned = awardCoins(baseReward, 'battle');
            showNotification(`+${coinsEarned} coins! 💰`, 'success');
        }
        
        // Update leaderboard after battle
        if (socialFeatures) {
            socialFeatures.updateLeaderboard(pet);
        }
        
        updateUI();
    });
    
    currentBattle = null;
}

// Handle battle action
function handleBattleAction(action) {
    if (!currentBattle || !currentBattle.isActive) return;
    if (currentBattle.turn !== 'player') return;
    
    // Disable buttons during action
    battleUIManager.disableActionButtons();
    
    // Execute action
    switch (action) {
        case 'attack':
            currentBattle.playerAttack();
            break;
        case 'defend':
            currentBattle.playerDefend();
            break;
        case 'special':
            currentBattle.playerSpecial();
            break;
    }
    
    // Update battle UI using manager
    battleUIManager.update(soundManager, milestoneManager, uiManager, pet);
    
    // Enable buttons if it's player's turn
    if (currentBattle.turn === 'player' && currentBattle.isActive) {
        battleUIManager.enableActionButtons();
    }
}

// Open settings modal
function openSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.add('active');
    
    // Load current settings
    document.getElementById('petNameInput').value = pet.name;
    document.getElementById('serverUrlInput').value = serverConnection.serverUrl;
    document.getElementById('soundToggle').checked = soundManager.isEnabled();
    document.getElementById('vibrationToggle').checked = vibrationManager.isEnabled();
    document.getElementById('themeSelect').value = currentTheme;
    
    // Update battle history
    updateBattleHistory();
}

// Close settings modal
function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('active');
}

// Update battle history display
function updateBattleHistory() {
    const historyList = document.getElementById('battleHistoryList');
    
    if (!pet.battleHistory || pet.battleHistory.length === 0) {
        historyList.innerHTML = '<p class="no-history">No battles yet</p>';
        return;
    }
    
    historyList.innerHTML = pet.battleHistory.map(battle => {
        const resultClass = battle.won ? 'won' : 'lost';
        const resultText = battle.won ? '🏆 Victory' : '💔 Defeat';
        return `
            <div class="battle-history-item ${resultClass}">
                <div class="battle-result">${resultText}</div>
                <div class="battle-details">
                    vs ${battle.opponent} (Lv.${battle.petLevel})<br>
                    ${battle.timestamp}
                </div>
            </div>
        `;
    }).join('');
}

// Open help modal
function openHelp() {
    const modal = document.getElementById('helpModal');
    modal.classList.add('active');
}

// Close help modal
function closeHelp() {
    const modal = document.getElementById('helpModal');
    modal.classList.remove('active');
}

// Save settings
function saveSettings() {
    const newName = document.getElementById('petNameInput').value.trim();
    const newServerUrl = document.getElementById('serverUrlInput').value.trim();
    const newSoundEnabled = document.getElementById('soundToggle').checked;
    const newVibrationEnabled = document.getElementById('vibrationToggle').checked;
    const newTheme = document.getElementById('themeSelect').value;
    
    // Validate and update pet name
    if (newName && newName !== pet.name) {
        const validation = InputValidator.validatePetName(newName);
        
        if (!validation.valid) {
            showNotification(`❌ ${validation.error}`, 'error');
            // Restore previous name in input
            document.getElementById('petNameInput').value = pet.name;
        } else {
            pet.name = validation.sanitized;
            pet.save();
            showNotification('✅ Pet name updated!', 'success');
            
            // Announce to screen readers
            if (window.accessibilityManager) {
                window.accessibilityManager.announce(`Pet renamed to ${validation.sanitized}`);
            }
        }
    }
    
    if (newServerUrl && newServerUrl !== serverConnection.serverUrl) {
        serverConnection.disconnect();
        serverConnection.setServerUrl(newServerUrl);
        showNotification('✅ Server URL updated!');
        
        // Try to reconnect
        setTimeout(() => tryConnectToServer(), 500);
    }
    
    // Save sound preference using manager
    if (newSoundEnabled !== soundManager.isEnabled()) {
        if (newSoundEnabled) {
            soundManager.enable();
        } else {
            soundManager.disable();
        }
        showNotification(`🔊 Sound ${newSoundEnabled ? 'enabled' : 'disabled'}`);
    }
    
    // Save vibration preference using manager
    if (newVibrationEnabled !== vibrationManager.isEnabled()) {
        if (newVibrationEnabled) {
            vibrationManager.enable();
        } else {
            vibrationManager.disable();
        }
        showNotification(`📳 Vibration ${newVibrationEnabled ? 'enabled' : 'disabled'}`);
    }
    
    // Save theme preference using manager
    if (newTheme !== currentTheme) {
        currentTheme = newTheme;
        uiManager.applyTheme(currentTheme);
        showNotification(`🎨 Theme changed to ${currentTheme}`);
    }
    
    // Save stat display mode
    const statDisplayMode = document.getElementById('statDisplaySelect').value;
    const previousMode = localStorage.getItem('statDisplayMode') || 'bars';
    if (statDisplayMode !== previousMode) {
        localStorage.setItem('statDisplayMode', statDisplayMode);
        applyStatDisplayMode(statDisplayMode);
        showNotification(`📊 Stat display changed to ${statDisplayMode === 'circular' ? 'circular gauges' : 'horizontal bars'}`);
    }
    
    updateUI();
    closeSettingsModal();
}

// Apply stat display mode
function applyStatDisplayMode(mode) {
    const statsPanel = document.querySelector('.stats-panel');
    if (mode === 'circular') {
        statsPanel.classList.add('circular-mode');
    } else {
        statsPanel.classList.remove('circular-mode');
    }
}

// Update circular gauge display
function updateCircularGauge(statName, value) {
    const circle = document.getElementById(`${statName}Circle`);
    const valueDisplay = document.getElementById(`${statName}CircleValue`);
    
    if (circle && valueDisplay) {
        // Calculate stroke-dashoffset for circular progress
        // Circle circumference = 2 * PI * radius = 2 * 3.14159 * 32 ≈ 201
        const circumference = 201;
        const offset = circumference - (value / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        valueDisplay.textContent = Math.round(value);
    }
}

// Apply theme to document

// Handle reset
function handleReset() {
    const confirmText = `Are you sure you want to reset your pet?\n\nThis will permanently delete "${pet.name}" and all progress.\n\nType your pet's name to confirm:`;
    const userInput = prompt(confirmText);
    
    if (userInput === pet.name) {
        pet.reset();
        updateUI();
        showNotification('🔄 Pet has been reset!');
    } else if (userInput !== null) {
        showNotification('❌ Reset cancelled - name did not match');
    }
}


// Show toast notification (used by premium system and other features)
// eslint-disable-next-line no-unused-vars
function showToast(message, type = 'info', duration = 3000) {
    // Create toast if it doesn't exist
    let toast = document.getElementById('globalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'globalToast';
        toast.className = 'global-toast';
        document.body.appendChild(toast);
    }
    
    // Set message and type
    toast.textContent = message;
    toast.className = `global-toast ${type}`;
    toast.classList.add('show');
    
    // Auto-hide after duration
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Show time away modal
function showTimeAwayModal(timeAwayInfo) {
    const modal = document.getElementById('timeAwayModal');
    const content = document.getElementById('timeAwayContent');
    
    const hours = Math.floor(timeAwayInfo.timePassed / 60);
    const minutes = Math.floor(timeAwayInfo.timePassed % 60);
    
    let timeText = 'You were away for ';
    if (hours > 0) {
        timeText += `${hours} hour${hours > 1 ? 's' : ''} and `;
    }
    timeText += `${minutes} minute${minutes > 1 ? 's' : ''}`;
    
    let html = `<h3>${timeText}</h3>`;
    
    // Show stat changes
    const stats = [
        { name: 'Health', key: 'health', icon: '❤️' },
        { name: 'Hunger', key: 'hunger', icon: '🍔' },
        { name: 'Happiness', key: 'happiness', icon: '😊' },
        { name: 'Energy', key: 'energy', icon: '⚡' }
    ];
    
    html += '<div>';
    stats.forEach(stat => {
        const oldValue = Math.floor(timeAwayInfo.oldStats[stat.key]);
        const newValue = Math.floor(pet[stat.key]);
        const change = newValue - oldValue;
        
        if (change !== 0) {
            const changeClass = change < 0 ? 'negative' : 'positive';
            const changeSign = change > 0 ? '+' : '';
            html += `
                <div class="stat-change ${changeClass}">
                    <span>${stat.icon} ${stat.name}</span>
                    <span>${oldValue} → ${newValue} (${changeSign}${change})</span>
                </div>
            `;
        }
    });
    html += '</div>';
    
    if (timeAwayInfo.needsAttention) {
        html += '<p style="color: #fbbf24; margin-top: 15px;">⚠️ Your pet needs attention!</p>';
    }
    
    content.innerHTML = html;
    modal.classList.add('active');
}

// Close time away modal
function closeTimeAwayModal() {
    const modal = document.getElementById('timeAwayModal');
    modal.classList.remove('active');
}

// Handle share button
async function handleShare() {
    if (!pet) return;
    
    // Update leaderboard before sharing
    socialFeatures.updateLeaderboard(pet);
    
    const success = await socialFeatures.sharePet(pet);
    if (success) {
        soundManager.play('success');
        vibrationManager.vibrate('medium');
        if (navigator.share) {
            uiManager.showToast('📤 Shared successfully!', 'success');
        } else {
            uiManager.showToast('📤 Copied to clipboard!', 'success');
        }
    } else {
        uiManager.showToast('❌ Failed to share', 'error');
    }
}

// Show leaderboard modal
function showLeaderboard() {
    if (!pet) return;
    
    // Update leaderboard with current pet
    socialFeatures.updateLeaderboard(pet);
    
    const modal = document.getElementById('leaderboardModal');
    const content = document.getElementById('leaderboardContent');
    
    // Get leaderboard entries
    const entries = socialFeatures.getLeaderboard(20);
    
    if (entries.length === 0) {
        content.innerHTML = '<div class="empty">No entries yet. Be the first!</div>';
    } else {
        let html = '';
        entries.forEach((entry, index) => {
            const rank = index + 1;
            const isCurrentPet = entry.name === pet.name;
            const rankClass = rank <= 3 ? 'top3' : '';
            const highlightClass = isCurrentPet ? 'highlight' : '';
            
            html += `
                <div class="leaderboard-entry ${highlightClass}">
                    <div class="leaderboard-rank ${rankClass}">#${rank}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${entry.name}</div>
                        <div class="leaderboard-stats">
                            <span class="leaderboard-level">Lv ${entry.level}</span>
                            ${entry.stage} | ${entry.wins} wins
                        </div>
                    </div>
                </div>
            `;
        });
        content.innerHTML = html;
    }
    
    modal.classList.add('active');
    soundManager.play('open');
}

// Close leaderboard modal
function closeLeaderboard() {
    const modal = document.getElementById('leaderboardModal');
    modal.classList.remove('active');
}

// Open hibernation modal
function openHibernationModal() {
    if (!pet || !hibernationManager) return;
    
    const modal = document.getElementById('hibernationModal');
    const status = document.getElementById('hibernationStatus');
    const controls = document.getElementById('hibernationControls');
    
    const hibStatus = hibernationManager.getStatus();
    
    // Update status section
    if (hibStatus.isHibernating) {
        status.innerHTML = `
            <div class="hibernating-status">
                <p>❄️ Your pet is in cryo sleep</p>
                <div class="hibernation-timer">
                    <strong>Time Remaining:</strong> ${hibStatus.remainingTimeFormatted}
                </div>
                <p class="hibernation-note">Stats are frozen while hibernating</p>
            </div>
        `;
        
        controls.innerHTML = `
            <button class="action-btn" id="wakeUpBtn" ${!hibStatus.canUnpauseAnytime && hibStatus.remainingTime.total > 0 ? 'disabled' : ''}>
                <span class="btn-icon">🌅</span>
                <span>Wake Up</span>
            </button>
            ${!hibStatus.canUnpauseAnytime && hibStatus.remainingTime.total > 0 ? 
                '<p class="hibernation-warning">⚠️ Free tier cannot wake up early</p>' : ''}
        `;
        
        document.getElementById('wakeUpBtn').addEventListener('click', () => {
            if (hibernationManager.wakeUp()) {
                closeHibernationModal();
                updateUI();
            }
        });
    } else {
        const tierName = premiumManager.subscriptionTier;
        const maxDays = hibStatus.maxDuration === Infinity ? 'Unlimited' : `${hibStatus.maxDuration} day${hibStatus.maxDuration > 1 ? 's' : ''}`;
        
        status.innerHTML = `
            <div class="hibernation-info">
                <p><strong>Subscription Tier:</strong> ${tierName.charAt(0).toUpperCase() + tierName.slice(1)}</p>
                <p><strong>Max Duration:</strong> ${maxDays}</p>
                <p><strong>Pauses Today:</strong> ${hibStatus.pauseCount} / ${hibStatus.maxPausesPerDay === Infinity ? '∞' : hibStatus.maxPausesPerDay}</p>
                <p><strong>Early Wake Up:</strong> ${hibStatus.canUnpauseAnytime ? 'Yes' : 'No'}</p>
            </div>
        `;
        
        if (hibStatus.canStartHibernation.canHibernate) {
            const maxDaysInput = hibStatus.maxDuration === Infinity ? 30 : hibStatus.maxDuration;
            controls.innerHTML = `
                <div class="hibernation-input">
                    <label for="hibernationDays">Sleep Duration (days):</label>
                    <input type="number" id="hibernationDays" min="1" max="${maxDaysInput}" value="1" />
                </div>
                <button class="action-btn" id="startHibernationBtn">
                    <span class="btn-icon">❄️</span>
                    <span>Start Cryo Sleep</span>
                </button>
            `;
            
            document.getElementById('startHibernationBtn').addEventListener('click', () => {
                const days = parseInt(document.getElementById('hibernationDays').value);
                if (hibernationManager.startHibernation(days)) {
                    closeHibernationModal();
                    updateUI();
                }
            });
        } else {
            controls.innerHTML = `
                <p class="hibernation-error">❌ ${hibStatus.canStartHibernation.reason}</p>
                <button class="action-btn" onclick="premiumManager.openPremiumModal()">
                    <span class="btn-icon">⭐</span>
                    <span>Upgrade for More</span>
                </button>
            `;
        }
    }
    
    modal.classList.add('active');
    soundManager.play('open');
}

// Close hibernation modal
function closeHibernationModal() {
    const modal = document.getElementById('hibernationModal');
    modal.classList.remove('active');
}

// Open backup modal
function openBackupModal() {
    if (!backupManager) return;
    
    const modal = document.getElementById('backupModal');
    const lastBackupTime = document.getElementById('lastBackupTime');
    const autoCloudBackupToggle = document.getElementById('autoCloudBackupToggle');
    
    // Update last backup time
    lastBackupTime.textContent = backupManager.getLastBackupTimeFormatted();
    
    // Update auto backup toggle
    autoCloudBackupToggle.checked = backupManager.cloudBackupEnabled;
    
    // Disable cloud features for non-premium users
    const isPremium = premiumManager.canAccessFeature('cloud_save');
    document.getElementById('saveToCloudBtn').disabled = !isPremium;
    document.getElementById('loadFromCloudBtn').disabled = !isPremium;
    document.getElementById('autoCloudBackupToggle').disabled = !isPremium;
    
    modal.classList.add('active');
    soundManager.play('open');
}

// Close backup modal
function closeBackupModal() {
    const modal = document.getElementById('backupModal');
    modal.classList.remove('active');
}

// Handle export backup
function handleExportBackup() {
    if (!backupManager) return;
    backupManager.exportLocalBackup();
}

// Handle import backup
async function handleImportBackup(event) {
    if (!backupManager) return;
    
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        await backupManager.importLocalBackup(file);
    } catch (error) {
        console.error('Error importing backup:', error);
    }
    
    // Reset file input
    event.target.value = '';
}

// Handle save to cloud
async function handleSaveToCloud() {
    if (!backupManager) return;
    await backupManager.saveToCloud();
}

// Handle load from cloud
async function handleLoadFromCloud() {
    if (!backupManager) return;
    await backupManager.loadFromCloud();
}

// Handle auto cloud backup toggle
function handleAutoCloudBackupToggle(event) {
    if (!backupManager) return;
    
    if (event.target.checked) {
        backupManager.enableCloudBackups();
    } else {
        backupManager.disableCloudBackups();
    }
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    if (serverConnection) {
        serverConnection.disconnect();
    }
});
