// Main application logic
let pet = null;
let currentBattle = null;
let serverConnection = null;
let updateInterval = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Create pet instance
    pet = new Pet();
    
    // Create server connection
    serverConnection = new ServerConnection();
    
    // Initial UI update
    updateUI();
    
    // Set up periodic updates
    updateInterval = setInterval(() => {
        pet.updateStatsFromTimePassed();
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
    document.getElementById('resetBtn').addEventListener('click', handleReset);
    
    // Modal close buttons
    document.getElementById('closeBattleModal').addEventListener('click', closeBattleModal);
    document.getElementById('closeSettingsModal').addEventListener('click', closeSettingsModal);
    
    // Settings save
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    
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
}

// Update individual stat bar
function updateStat(statName, value) {
    const valueElement = document.getElementById(`${statName}Value`);
    const barElement = document.getElementById(`${statName}Bar`);
    
    const clampedValue = Math.max(0, Math.min(100, value));
    valueElement.textContent = Math.floor(clampedValue);
    barElement.style.width = clampedValue + '%';
}

// Handle feed action
function handleFeed() {
    if (pet.feed()) {
        updateUI();
    }
}

// Handle play action
function handlePlay() {
    if (pet.play()) {
        updateUI();
    }
}

// Handle sleep action
function handleSleep() {
    pet.sleep();
    updateUI();
}

// Handle train action
function handleTrain() {
    if (pet.train()) {
        updateUI();
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
        // Battle ended, update pet
        pet.updateAfterBattle(currentBattle.playerWon());
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

// Update battle UI
function updateBattleUI() {
    // Update HP bars
    const playerHPPercent = (currentBattle.playerStats.currentHP / currentBattle.playerStats.maxHP) * 100;
    const opponentHPPercent = (currentBattle.opponentStats.currentHP / currentBattle.opponentStats.maxHP) * 100;
    
    document.getElementById('battleYourHp').style.width = playerHPPercent + '%';
    document.getElementById('battleOpponentHp').style.width = opponentHPPercent + '%';
    
    // Update battle log
    const battleLog = document.getElementById('battleLog');
    const logs = currentBattle.getLog();
    battleLog.innerHTML = logs.map(log => `<p>${log}</p>`).join('');
    battleLog.scrollTop = battleLog.scrollHeight;
    
    // Check if battle ended
    if (!currentBattle.isActive) {
        document.getElementById('battleActions').style.display = 'none';
        document.getElementById('finishBattleBtn').style.display = 'block';
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
}

// Close settings modal
function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('active');
}

// Save settings
function saveSettings() {
    const newName = document.getElementById('petNameInput').value.trim();
    const newServerUrl = document.getElementById('serverUrlInput').value.trim();
    
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
    
    updateUI();
    closeSettingsModal();
}

// Handle reset
function handleReset() {
    if (confirm('Are you sure you want to reset your pet? This cannot be undone!')) {
        pet.reset();
        updateUI();
        showNotification('🔄 Pet has been reset!');
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
