// Main application logic
let pet = null;
let currentBattle = null;
let serverConnection = null;
let premiumManager = null;
let updateInterval = null;
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false'; // Default true
let currentTheme = localStorage.getItem('theme') || 'dark'; // dark, light, or retro

// Reusable AudioContext for sound effects
let audioContext = null;

// Simple 8-bit sound effects using Web Audio API
const soundEffects = {
    feed: () => playTone([440, 523, 659], 100), // C-E-G chord
    play: () => playTone([523, 659, 784], 120), // E-G-B happy sound
    sleep: () => playTone([330, 294, 262], 200), // Descending calm
    train: () => playTone([392, 523, 659, 784], 80), // Rising power-up
    battle: () => playTone([196, 220, 247], 150), // Battle start
    hit: () => playTone([130], 80), // Impact sound
    win: () => playTone([523, 659, 784, 1047], 100), // Victory fanfare
    lose: () => playTone([392, 330, 262], 150), // Defeat sound
    evolution: () => playTone([523, 659, 784, 1047, 1319], 120), // Evolution fanfare
    click: () => playTone([880], 30), // Quick blip
};

function playTone(frequencies, duration) {
    if (!soundEnabled) return;
    
    // Create or reuse AudioContext
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const now = audioContext.currentTime;
    
    frequencies.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'square'; // 8-bit style
        
        gainNode.gain.setValueAtTime(0.1, now + (i * duration / 1000));
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + ((i + 1) * duration / 1000));
        
        oscillator.start(now + (i * duration / 1000));
        oscillator.stop(now + ((i + 1) * duration / 1000));
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    applyTheme(currentTheme);
    
    // Create pet instance
    pet = new Pet();
    
    // Create premium manager
    premiumManager = new PremiumManager();
    
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
    updateInterval = setInterval(() => {
        pet.updateStatsFromTimePassed();
        pet.checkSickness(); // Check for illness
        pet.recordStatsSnapshot(); // Record stats for history
        updateUI();
    }, 10000); // Update every 10 seconds
    
    // Set up event listeners
    setupEventListeners();
    
    // Try to connect to server in background
    tryConnectToServer();
});

// Set up all event listeners
function setupEventListeners() {
    // Action buttons
    document.getElementById('feedBtn').addEventListener('click', handleFeed);
    document.getElementById('playBtn').addEventListener('click', handlePlay);
    document.getElementById('sleepBtn').addEventListener('click', handleSleep);
    document.getElementById('trainBtn').addEventListener('click', handleTrain);
    
    // Battle buttons
    document.getElementById('battleBtn').addEventListener('click', handleLocalBattle);
    document.getElementById('onlineBattleBtn').addEventListener('click', handleOnlineBattle);
    
    // Settings buttons
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('helpBtn').addEventListener('click', openHelp);
    document.getElementById('resetBtn').addEventListener('click', handleReset);
    document.getElementById('premiumCtaBtn').addEventListener('click', () => {
        premiumManager.openPremiumModal();
    });
    
    // Modal close buttons
    document.getElementById('closeBattleModal').addEventListener('click', closeBattleModal);
    document.getElementById('closeSettingsModal').addEventListener('click', closeSettingsModal);
    document.getElementById('closeHelpModal').addEventListener('click', closeHelp);
    document.getElementById('closeHelpBtn').addEventListener('click', closeHelp);
    
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
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcut);
    
    // Show tutorial on first visit
    checkFirstVisit();
}

// Show achievement notification
function showAchievement(title, message, emoji = '🏆') {
    const achievement = document.createElement('div');
    achievement.className = 'achievement-popup';
    achievement.innerHTML = `
        <div class="achievement-content">
            <div class="achievement-emoji">${emoji}</div>
            <div class="achievement-text">
                <div class="achievement-title">${title}</div>
                <div class="achievement-message">${message}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(achievement);
    
    // Trigger animation
    setTimeout(() => achievement.classList.add('show'), 10);
    
    // Remove after animation
    setTimeout(() => {
        achievement.classList.remove('show');
        setTimeout(() => achievement.remove(), 500);
    }, 4000);
    
    // Play achievement sound
    if (soundEnabled) {
        playTone([659, 784, 1047, 1319], 100);
    }
}

// Check for milestones and show achievements
function checkMilestones(action) {
    // First action achievements
    const firstActions = localStorage.getItem('vpet_first_actions') || '{}';
    const actions = JSON.parse(firstActions);
    
    if (!actions[action]) {
        actions[action] = true;
        localStorage.setItem('vpet_first_actions', JSON.stringify(actions));
        
        const messages = {
            feed: { title: 'First Meal!', message: 'You fed your pet for the first time!', emoji: '🍖' },
            play: { title: 'Playtime!', message: 'Your pet had fun playing!', emoji: '🎮' },
            train: { title: 'Training Starts!', message: 'Your pet is getting stronger!', emoji: '💪' },
            battle: { title: 'First Battle!', message: 'You entered your first battle!', emoji: '⚔️' }
        };
        
        if (messages[action]) {
            showAchievement(messages[action].title, messages[action].message, messages[action].emoji);
        }
    }
    
    // Level milestones
    if (action === 'level' && pet.level >= 5 && Number.isInteger(pet.level) && pet.level % 5 === 0) {
        showAchievement('Level Up!', `Your pet reached level ${pet.level}!`, '⭐');
    }
    
    // Win milestones
    if (action === 'win') {
        if (pet.wins === 1) {
            showAchievement('First Victory!', 'You won your first battle!', '🏆');
        } else if (pet.wins === 10) {
            showAchievement('Battle Master!', '10 battles won!', '👑');
        } else if (pet.wins === 50) {
            showAchievement('Champion!', '50 battles won!', '🌟');
        }
    }
    
    // Evolution milestones
    if (action === 'evolve') {
        const stageMessages = {
            baby: { title: 'Born!', message: 'Your egg hatched into a baby!', emoji: '🐣' },
            child: { title: 'Growing Up!', message: 'Your pet evolved to a child!', emoji: '🌱' },
            teen: { title: 'Teenager!', message: 'Your pet is now a teen!', emoji: '🌿' },
            adult: { title: 'Fully Grown!', message: 'Your pet reached adulthood!', emoji: '🌳' }
        };
        
        const msg = stageMessages[pet.stage];
        if (msg) {
            showAchievement(msg.title, msg.message, msg.emoji);
            soundEffects.evolution();
        }
    }
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
        case 'escape':
            const battleModal = document.getElementById('battleModal');
            if (battleModal.classList.contains('active')) {
                closeBattleModal();
            }
            break;
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
    if (pet.isSleeping) {
        petAnimation.classList.add('sleeping');
    }
    
    // Update stats
    updateStat('health', pet.health);
    updateStat('hunger', pet.hunger);
    updateStat('happiness', pet.happiness);
    updateStat('energy', pet.energy);
    
    // Update info
    document.getElementById('petAge').textContent = pet.age;
    document.getElementById('petLevel').textContent = Math.floor(pet.level);
    document.getElementById('petWins').textContent = pet.wins;
    
    // Update sleep button text
    const sleepBtn = document.getElementById('sleepBtn');
    const sleepBtnText = sleepBtn.querySelector('span:last-child');
    sleepBtnText.textContent = pet.isSleeping ? 'Wake' : 'Sleep';
    
    // Disable actions if sleeping
    const actionsDisabled = pet.isSleeping;
    document.getElementById('feedBtn').disabled = actionsDisabled;
    document.getElementById('playBtn').disabled = actionsDisabled;
    document.getElementById('trainBtn').disabled = actionsDisabled;
    document.getElementById('battleBtn').disabled = actionsDisabled;
    
    // Update evolution preview
    updateEvolutionPreview();
    
    // Update mood indicator
    updateMoodIndicator();
    
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
    let timeText = '';
    if (hours > 0) {
        timeText = `${hours}h ${minutes}m until ${evolutionInfo.nextStage}`;
    } else {
        timeText = `${minutes}m until ${evolutionInfo.nextStage}`;
    }
    document.getElementById('evolutionTime').textContent = timeText;
}

// Update mood indicator based on pet stats
function updateMoodIndicator() {
    const moodElement = document.getElementById('moodIndicator');
    
    if (pet.isSleeping) {
        moodElement.textContent = '😴';
        return;
    }
    
    // Calculate average stat level
    const avgStats = (pet.health + pet.hunger + pet.happiness + pet.energy) / 4;
    
    // Determine mood based on stats
    if (avgStats >= 80) {
        moodElement.textContent = '😊'; // Happy
    } else if (avgStats >= 60) {
        moodElement.textContent = '🙂'; // Okay
    } else if (avgStats >= 40) {
        moodElement.textContent = '😐'; // Neutral
    } else if (avgStats >= 20) {
        moodElement.textContent = '😢'; // Sad
    } else {
        moodElement.textContent = '😰'; // Critical
    }
}

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
        }
    ];
    
    stats.forEach(stat => {
        const statBar = document.querySelector(`.stat-bar[data-tooltip]`);
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
function updateStat(statName, value) {
    const valueElement = document.getElementById(`${statName}Value`);
    const barElement = document.getElementById(`${statName}Bar`);
    
    const clampedValue = Math.max(0, Math.min(100, value));
    valueElement.textContent = Math.floor(clampedValue);
    barElement.style.width = clampedValue + '%';
    
    // Add warning classes based on value
    barElement.classList.remove('critical', 'warning', 'excellent');
    if (clampedValue < 30) {
        barElement.classList.add('critical');
    } else if (clampedValue < 50) {
        barElement.classList.add('warning');
    } else if (clampedValue >= 90) {
        barElement.classList.add('excellent');
    }
}

// Handle feed action
function handleFeed() {
    if (pet.feed()) {
        soundEffects.feed();
        checkMilestones('feed');
        updateUI();
        showSaveIndicator();
    }
}

// Handle play action
function handlePlay() {
    if (pet.play()) {
        pet.updatePersonality('play'); // Update personality based on action
        soundEffects.play();
        checkMilestones('play');
        updateUI();
        showSaveIndicator();
    }
}

// Handle sleep action
function handleSleep() {
    soundEffects.sleep();
    pet.sleep();
    updateUI();
    showSaveIndicator();
}

// Handle train action
function handleTrain() {
    const prevLevel = Math.floor(pet.level);
    if (pet.train()) {
        pet.updatePersonality('train'); // Update personality based on action
        soundEffects.train();
        checkMilestones('train');
        
        // Check for level up
        const newLevel = Math.floor(pet.level);
        if (newLevel > prevLevel) {
            checkMilestones('level');
        }
        
        updateUI();
        showSaveIndicator();
    }
}

// Handle local battle
function handleLocalBattle() {
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
    
    // Set callback for turn completion
    currentBattle.onTurnComplete = () => {
        updateBattleUI();
        if (currentBattle.turn === 'player' && currentBattle.isActive) {
            enableBattleButtons();
        }
    };
    
    // Show battle modal
    openBattleModal(opponent);
}

// Handle online battle
function handleOnlineBattle() {
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

// Open battle modal
function openBattleModal(opponent) {
    const modal = document.getElementById('battleModal');
    modal.classList.add('active');
    
    // Set pet names
    document.getElementById('battleYourName').textContent = pet.name;
    document.getElementById('battleOpponentName').textContent = opponent.name;
    
    // Reset HP bars
    document.getElementById('battleYourHp').style.width = '100%';
    document.getElementById('battleOpponentHp').style.width = '100%';
    
    // Clear battle log
    const battleLog = document.getElementById('battleLog');
    battleLog.innerHTML = '<p>Battle started!</p>';
    
    // Show action buttons
    document.getElementById('battleActions').style.display = 'grid';
    document.getElementById('finishBattleBtn').style.display = 'none';
    
    // Enable buttons
    enableBattleButtons();
}

// Close battle modal
function closeBattleModal() {
    const modal = document.getElementById('battleModal');
    modal.classList.remove('active');
    
    if (currentBattle && !currentBattle.isActive) {
        // Battle ended, update pet with opponent name
        const opponentName = currentBattle.opponentPet.name || 'Opponent';
        pet.updatePersonality('battle'); // Update personality based on battle
        pet.updateAfterBattle(currentBattle.playerWon(), opponentName);
        updateUI();
    }
    
    currentBattle = null;
}

// Handle battle action
function handleBattleAction(action) {
    if (!currentBattle || !currentBattle.isActive) return;
    if (currentBattle.turn !== 'player') return;
    
    // Disable buttons during action
    disableBattleButtons();
    
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
    
    // Update battle UI
    updateBattleUI();
    
    // Enable buttons if it's player's turn
    if (currentBattle.turn === 'player' && currentBattle.isActive) {
        enableBattleButtons();
    }
}

// Calculate damage from HP change
function calculateDamage(prevHP, currentHP, maxHP) {
    return Math.round((prevHP - currentHP) / 100 * maxHP);
}

// Show damage number in battle
function showDamageNumber(damage, isPlayer, isCrit = false) {
    const container = isPlayer ? document.querySelector('.battle-your-pet') : document.querySelector('.battle-opponent-pet');
    if (!container) return;
    
    const damageNum = document.createElement('div');
    damageNum.className = `damage-number ${isCrit ? 'crit' : ''}`;
    damageNum.textContent = `-${damage}`;
    
    container.style.position = 'relative';
    container.appendChild(damageNum);
    
    // Remove after animation
    setTimeout(() => damageNum.remove(), 1000);
}

// Update battle UI
function updateBattleUI() {
    // Update HP bars with animation
    const playerHPPercent = (currentBattle.playerStats.currentHP / currentBattle.playerStats.maxHP) * 100;
    const opponentHPPercent = (currentBattle.opponentStats.currentHP / currentBattle.opponentStats.maxHP) * 100;
    
    const playerHPBar = document.getElementById('battleYourHp');
    const opponentHPBar = document.getElementById('battleOpponentHp');
    
    // Initialize HP tracking on first update
    if (!playerHPBar.dataset.hp) {
        playerHPBar.dataset.hp = 100;
        opponentHPBar.dataset.hp = 100;
    }
    
    // Track previous HP for damage calculation
    const prevPlayerHP = parseFloat(playerHPBar.dataset.hp);
    const prevOpponentHP = parseFloat(opponentHPBar.dataset.hp);
    
    // Check for damage and add flash animation + damage numbers
    if (prevPlayerHP > playerHPPercent) {
        const damage = calculateDamage(prevPlayerHP, playerHPPercent, currentBattle.playerStats.maxHP);
        playerHPBar.classList.add('damage-flash');
        showDamageNumber(damage, true);
        soundEffects.hit();
        setTimeout(() => playerHPBar.classList.remove('damage-flash'), 300);
        
        // Add shake to player sprite
        const playerSprite = document.querySelector('.battle-pet:first-child .battle-sprite');
        if (playerSprite) {
            playerSprite.classList.add('taking-damage');
            setTimeout(() => playerSprite.classList.remove('taking-damage'), 300);
        }
    }
    
    if (prevOpponentHP > opponentHPPercent) {
        const damage = calculateDamage(prevOpponentHP, opponentHPPercent, currentBattle.opponentStats.maxHP);
        opponentHPBar.classList.add('damage-flash');
        showDamageNumber(damage, false);
        soundEffects.hit();
        setTimeout(() => opponentHPBar.classList.remove('damage-flash'), 300);
        
        // Add shake to opponent sprite
        const opponentSprite = document.querySelector('.battle-pet:last-child .battle-sprite');
        if (opponentSprite) {
            opponentSprite.classList.add('taking-damage');
            setTimeout(() => opponentSprite.classList.remove('taking-damage'), 300);
        }
    }
    
    playerHPBar.style.width = playerHPPercent + '%';
    opponentHPBar.style.width = opponentHPPercent + '%';
    
    // Store current HP for next comparison
    playerHPBar.dataset.hp = playerHPPercent;
    opponentHPBar.dataset.hp = opponentHPPercent;
    
    // Update battle log
    const battleLog = document.getElementById('battleLog');
    const logs = currentBattle.getLog();
    battleLog.innerHTML = logs.map(log => `<p>${log}</p>`).join('');
    battleLog.scrollTop = battleLog.scrollHeight;
    
    // Check if battle ended
    if (!currentBattle.isActive) {
        document.getElementById('battleActions').style.display = 'none';
        document.getElementById('finishBattleBtn').style.display = 'block';
        
        // Add victory animation to winner
        if (currentBattle.playerWon()) {
            const playerSprite = document.querySelector('.battle-pet:first-child .battle-sprite');
            if (playerSprite) {
                playerSprite.classList.add('victory');
            }
            soundEffects.win();
            checkMilestones('battle');
            checkMilestones('win');
        } else {
            const opponentSprite = document.querySelector('.battle-pet:last-child .battle-sprite');
            if (opponentSprite) {
                opponentSprite.classList.add('victory');
            }
            soundEffects.lose();
        }
    }
}

// Enable battle buttons
function enableBattleButtons() {
    document.getElementById('attackBtn').disabled = false;
    document.getElementById('defendBtn').disabled = false;
    document.getElementById('specialBtn').disabled = false;
}

// Disable battle buttons
function disableBattleButtons() {
    document.getElementById('attackBtn').disabled = true;
    document.getElementById('defendBtn').disabled = true;
    document.getElementById('specialBtn').disabled = true;
}

// Open settings modal
function openSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.add('active');
    
    // Load current settings
    document.getElementById('petNameInput').value = pet.name;
    document.getElementById('serverUrlInput').value = serverConnection.serverUrl;
    document.getElementById('soundToggle').checked = soundEnabled;
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
    const newTheme = document.getElementById('themeSelect').value;
    
    if (newName && newName !== pet.name) {
        pet.name = newName;
        pet.save();
        showNotification('✅ Pet name updated!');
    }
    
    if (newServerUrl && newServerUrl !== serverConnection.serverUrl) {
        serverConnection.disconnect();
        serverConnection.setServerUrl(newServerUrl);
        showNotification('✅ Server URL updated!');
        
        // Try to reconnect
        setTimeout(() => tryConnectToServer(), 500);
    }
    
    // Save sound preference
    if (newSoundEnabled !== soundEnabled) {
        soundEnabled = newSoundEnabled;
        localStorage.setItem('soundEnabled', soundEnabled);
        showNotification(`🔊 Sound ${soundEnabled ? 'enabled' : 'disabled'}`);
    }
    
    // Save theme preference
    if (newTheme !== currentTheme) {
        currentTheme = newTheme;
        localStorage.setItem('theme', currentTheme);
        applyTheme(currentTheme);
        showNotification(`🎨 Theme changed to ${currentTheme}`);
    }
    
    updateUI();
    closeSettingsModal();
}

// Apply theme to document
function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
}

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

// Show save indicator
function showSaveIndicator() {
    const indicator = document.getElementById('saveIndicator');
    indicator.classList.add('show');
    
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 2000);
}

// Show toast notification (used by premium system and other features)
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

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    if (serverConnection) {
        serverConnection.disconnect();
    }
});
