/**
 * Phase 3-4 Features Integration
 * Integrates item system, mini-games, evolution paths, friends, and tournaments into the main app
 */

/* global premiumManager, soundManager, updateUI */
/* global InventoryManager, ShopManager, useItem, ITEMS */
/* global MiniGameManager, ReactionGame, MemoryGame, RhythmGame */
/* global EvolutionManager */
/* global FriendManager, FriendChallengeManager */
/* global TournamentManager */

// Initialize new managers (not global state)
let inventoryManager = null;
let shopManager = null;
let miniGameManager = null;
let evolutionManager = null;
let friendManager = null;
let friendChallengeManager = null;

// Unused but will be needed for future tournament UI integration
// eslint-disable-next-line no-unused-vars
let tournamentManager = null;

// Current active mini-game
let currentMiniGame = null;

/**
 * Initialize Phase 3-4 features
 */
function initializePhase34Features() {
    // Initialize managers
    inventoryManager = new InventoryManager();
    shopManager = new ShopManager(inventoryManager);
    miniGameManager = new MiniGameManager();
    evolutionManager = new EvolutionManager();
    friendManager = new FriendManager();
    friendChallengeManager = new FriendChallengeManager();
    tournamentManager = new TournamentManager();
    
    // Set up event listeners
    setupPhase34EventListeners();
    
    // Update UI with coin balance
    updateCoinsDisplay();
    
    console.log('Phase 3-4 features initialized');
}

/**
 * Set up event listeners for Phase 3-4 features
 */
function setupPhase34EventListeners() {
    // Shop button
    document.getElementById('shopBtn').addEventListener('click', openShop);
    document.getElementById('closeShopModal').addEventListener('click', closeShop);
    
    // Inventory button
    document.getElementById('inventoryBtn').addEventListener('click', openInventory);
    document.getElementById('closeInventoryModal').addEventListener('click', closeInventory);
    
    // Mini-games button
    document.getElementById('minigamesBtn').addEventListener('click', openMiniGames);
    document.getElementById('closeMinigamesModal').addEventListener('click', closeMiniGames);
    document.getElementById('playReactionBtn').addEventListener('click', () => startMiniGame('reaction'));
    document.getElementById('playMemoryBtn').addEventListener('click', () => startMiniGame('memory'));
    document.getElementById('playRhythmBtn').addEventListener('click', () => startMiniGame('rhythm'));
    document.getElementById('endGameBtn').addEventListener('click', endMiniGame);
    
    // Friends button
    document.getElementById('friendsBtn').addEventListener('click', openFriends);
    document.getElementById('closeFriendsModal').addEventListener('click', closeFriends);
    document.getElementById('sendFriendRequestBtn').addEventListener('click', sendFriendRequest);
    
    // Friend tabs
    document.querySelectorAll('.friend-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchFriendTab(e.target.dataset.tab));
    });
    
    // Tournament button
    document.getElementById('tournamentBtn').addEventListener('click', openTournament);
    document.getElementById('closeTournamentModal').addEventListener('click', closeTournament);
    
    // Shop category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => filterShopCategory(e.target.dataset.category));
    });
}

// ============================================
// Shop Functions
// ============================================

function openShop() {
    const modal = document.getElementById('shopModal');
    modal.classList.add('show');
    updateCoinsDisplay();
    populateShop('all');
}

function closeShop() {
    const modal = document.getElementById('shopModal');
    modal.classList.remove('show');
}

function filterShopCategory(category) {
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    populateShop(category);
}

function populateShop(category) {
    const container = document.getElementById('shopItems');
    const items = shopManager.getShopItems(category === 'all' ? null : category);
    
    container.innerHTML = '';
    
    if (items.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">🏪</div><p>No items in this category</p></div>';
        return;
    }
    
    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item';
        
        const canAfford = shopManager.getCoins() >= item.price;
        
        itemDiv.innerHTML = `
            <div class="item-name">${item.name}</div>
            <div class="item-description">${item.description}</div>
            <div class="item-price">${item.price} 💰</div>
            <button class="buy-btn" ${!canAfford ? 'disabled' : ''} data-item-id="${item.id}">
                ${canAfford ? 'Buy' : 'Too Expensive'}
            </button>
        `;
        
        const buyBtn = itemDiv.querySelector('.buy-btn');
        if (canAfford) {
            buyBtn.addEventListener('click', () => purchaseItem(item.id));
        }
        
        container.appendChild(itemDiv);
    });
}

function purchaseItem(itemId) {
    if (shopManager.purchaseItem(itemId)) {
        const item = ITEMS[itemId];
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = `✅ Purchased ${item.name}!`;
        document.body.appendChild(notification);
        
        // Show and auto-hide notification
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        updateCoinsDisplay();
        populateShop(document.querySelector('.category-btn.active').dataset.category);
        
        if (soundManager) {
            soundManager.playSound('action');
        }
    } else {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = '❌ Purchase failed';
        document.body.appendChild(notification);
        
        // Show and auto-hide notification
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

function updateCoinsDisplay() {
    const coins = shopManager.getCoins();
    const coinElements = document.querySelectorAll('#coinBalance, #petCoins');
    coinElements.forEach(el => {
        if (el) el.textContent = coins;
    });
}

// ============================================
// Inventory Functions
// ============================================

function openInventory() {
    const modal = document.getElementById('inventoryModal');
    modal.classList.add('show');
    populateInventory();
}

function closeInventory() {
    const modal = document.getElementById('inventoryModal');
    modal.classList.remove('show');
}

function populateInventory() {
    const container = document.getElementById('inventoryItems');
    const inventory = inventoryManager.getAll();
    
    container.innerHTML = '';
    
    const itemIds = Object.keys(inventory);
    if (itemIds.length === 0) {
        container.innerHTML = '<div class="inventory-empty"><div class="empty-icon">🎒</div><p>Your inventory is empty. Visit the shop to buy items!</p></div>';
        return;
    }
    
    itemIds.forEach(itemId => {
        const item = ITEMS[itemId];
        const quantity = inventory[itemId];
        
        if (!item) return;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'inventory-item';
        itemDiv.innerHTML = `
            <div class="item-icon">${item.name.split(' ')[0]}</div>
            <div class="item-name">${item.name.split(' ').slice(1).join(' ')}</div>
            <div class="item-quantity">x${quantity}</div>
        `;
        
        itemDiv.addEventListener('click', () => useInventoryItem(itemId));
        
        container.appendChild(itemDiv);
    });
}

function useInventoryItem(itemId) {
    const result = useItem(itemId, pet, inventoryManager);
    
    if (result.success) {
        showNotification(result.message, 'success');
        updateUI();
        populateInventory();
        
        if (soundManager) {
            soundManager.playSound('action');
        }
    } else {
        showNotification(result.message, 'error');
    }
}

// ============================================
// Mini-Games Functions
// ============================================

function openMiniGames() {
    const modal = document.getElementById('minigamesModal');
    modal.classList.add('show');
    
    // Update high scores
    document.getElementById('reactionHighScore').textContent = miniGameManager.getHighScore('reaction');
    document.getElementById('memoryHighScore').textContent = miniGameManager.getHighScore('memory');
    document.getElementById('rhythmHighScore').textContent = miniGameManager.getHighScore('rhythm');
    
    // Show menu, hide canvas
    document.getElementById('minigamesMenu').style.display = 'grid';
    document.getElementById('gameCanvasContainer').style.display = 'none';
}

function closeMiniGames() {
    if (currentMiniGame) {
        endMiniGame();
    }
    const modal = document.getElementById('minigamesModal');
    modal.classList.remove('show');
}

function startMiniGame(gameType) {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Hide menu, show canvas
    document.getElementById('minigamesMenu').style.display = 'none';
    document.getElementById('gameCanvasContainer').style.display = 'block';
    
    // Create and start game
    switch (gameType) {
        case 'reaction':
            currentMiniGame = new ReactionGame(canvas, ctx);
            break;
        case 'memory':
            currentMiniGame = new MemoryGame(canvas, ctx);
            break;
        case 'rhythm':
            currentMiniGame = new RhythmGame(canvas, ctx);
            break;
    }
    
    currentMiniGame.gameType = gameType;
    currentMiniGame.start();
    
    // Poll for game end
    const checkGameEnd = setInterval(() => {
        if (!currentMiniGame || !currentMiniGame.isPlaying) {
            clearInterval(checkGameEnd);
            finishMiniGame(gameType, currentMiniGame ? currentMiniGame.score : 0);
        }
    }, 100);
}

function endMiniGame() {
    if (currentMiniGame) {
        currentMiniGame.stop();
        finishMiniGame(currentMiniGame.gameType, currentMiniGame.score);
    }
}

function finishMiniGame(gameType, score) {
    const rewards = miniGameManager.calculateRewards(gameType, score);
    const isNewHighScore = miniGameManager.updateHighScore(gameType, score);
    
    // Award coins
    shopManager.addCoins(rewards.coins);
    
    // Apply stat boosts
    if (rewards.statBoosts) {
        Object.keys(rewards.statBoosts).forEach(stat => {
            if (pet[stat] !== undefined) {
                pet[stat] = Math.min(100, pet[stat] + rewards.statBoosts[stat]);
            }
        });
        pet.save();
    }
    
    // Show results
    let message = `Game Over! Score: ${Math.floor(score)}\n`;
    message += `Earned: ${rewards.coins} coins 💰\n`;
    if (isNewHighScore) {
        message += `🏆 New High Score!`;
    }
    
    showNotification(message, 'success');
    
    currentMiniGame = null;
    
    // Return to menu
    document.getElementById('minigamesMenu').style.display = 'grid';
    document.getElementById('gameCanvasContainer').style.display = 'none';
    
    updateUI();
    updateCoinsDisplay();
}

// ============================================
// Friends Functions
// ============================================

function openFriends() {
    const modal = document.getElementById('friendsModal');
    modal.classList.add('show');
    switchFriendTab('list');
}

function closeFriends() {
    const modal = document.getElementById('friendsModal');
    modal.classList.remove('show');
}

function switchFriendTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.friend-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Show correct tab content
    document.getElementById('friendsListTab').style.display = tabName === 'list' ? 'block' : 'none';
    document.getElementById('friendRequestsTab').style.display = tabName === 'requests' ? 'block' : 'none';
    document.getElementById('addFriendTab').style.display = tabName === 'add' ? 'block' : 'none';
    
    // Populate content
    if (tabName === 'list') {
        populateFriendsList();
    } else if (tabName === 'requests') {
        populateFriendRequests();
    }
}

function populateFriendsList() {
    const container = document.getElementById('friendsList');
    const friends = friendManager.getAllFriends();
    
    container.innerHTML = '';
    
    if (friends.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><p>No friends yet. Add some friends to play together!</p></div>';
        return;
    }
    
    friends.forEach(friend => {
        const friendDiv = document.createElement('div');
        friendDiv.className = 'friend-item';
        friendDiv.innerHTML = `
            <div class="friend-info">
                <div class="friend-name">${friend.username}</div>
                <div class="friend-stats">Pet: ${friend.petName} | Battles: ${friend.battlesPlayed}</div>
            </div>
            <div class="friend-actions">
                <button class="challenge-btn" data-friend-id="${friend.id}">⚔️ Challenge</button>
                <button class="remove-btn" data-friend-id="${friend.id}">❌</button>
            </div>
        `;
        
        friendDiv.querySelector('.challenge-btn').addEventListener('click', (e) => {
            challengeFriend(e.target.dataset.friendId);
        });
        
        friendDiv.querySelector('.remove-btn').addEventListener('click', (e) => {
            removeFriend(e.target.dataset.friendId);
        });
        
        container.appendChild(friendDiv);
    });
}

function populateFriendRequests() {
    const container = document.getElementById('friendRequests');
    const requests = friendManager.getPendingRequests();
    
    container.innerHTML = '';
    
    if (requests.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📬</div><p>No pending friend requests</p></div>';
        return;
    }
    
    requests.forEach(request => {
        const requestDiv = document.createElement('div');
        requestDiv.className = 'request-item';
        requestDiv.innerHTML = `
            <div class="request-info">
                <div class="request-username">${request.username}</div>
                <div class="request-time">Pet: ${request.petName}</div>
            </div>
            <div class="request-actions">
                <button class="accept-btn" data-request-id="${request.id}">✓ Accept</button>
                <button class="decline-btn" data-request-id="${request.id}">✗ Decline</button>
            </div>
        `;
        
        requestDiv.querySelector('.accept-btn').addEventListener('click', (e) => {
            acceptFriendRequest(e.target.dataset.requestId);
        });
        
        requestDiv.querySelector('.decline-btn').addEventListener('click', (e) => {
            declineFriendRequest(e.target.dataset.requestId);
        });
        
        container.appendChild(requestDiv);
    });
}

function sendFriendRequest() {
    const input = document.getElementById('friendUsernameInput');
    const username = input.value.trim();
    
    if (!username) {
        showNotification('Please enter a username', 'error');
        return;
    }
    
    const result = friendManager.sendFriendRequest(username, pet.name);
    showNotification(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
        input.value = '';
    }
}

function acceptFriendRequest(requestId) {
    const result = friendManager.acceptFriendRequest(requestId);
    showNotification(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
        populateFriendRequests();
    }
}

function declineFriendRequest(requestId) {
    const result = friendManager.declineFriendRequest(requestId);
    showNotification(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
        populateFriendRequests();
    }
}

function removeFriend(friendId) {
    if (confirm('Remove this friend?')) {
        const result = friendManager.removeFriend(friendId);
        showNotification(result.message, result.success ? 'success' : 'error');
        
        if (result.success) {
            populateFriendsList();
        }
    }
}

function challengeFriend(friendId) {
    const friend = friendManager.getFriend(friendId);
    if (!friend) return;
    
    const result = friendChallengeManager.sendChallenge(friendId, {
        name: pet.name,
        level: pet.level,
        stage: pet.stage,
        health: pet.health
    });
    
    showNotification(result.message, result.success ? 'success' : 'error');
    
    if (result.success) {
        friendManager.updateInteraction(friendId);
    }
}

// ============================================
// Tournament Functions
// ============================================

function openTournament() {
    const modal = document.getElementById('tournamentModal');
    modal.classList.add('show');
    populateTournamentContent();
}

function closeTournament() {
    const modal = document.getElementById('tournamentModal');
    modal.classList.remove('show');
}

function populateTournamentContent() {
    const container = document.getElementById('tournamentContent');
    
    // Check if there's an active tournament
    if (tournamentManager.currentTournament) {
        showActiveTournament(container);
    } else {
        showTournamentLobby(container);
    }
}

function showTournamentLobby(container) {
    // Create tournament options
    container.innerHTML = `
        <div class="tournament-lobby">
            <h3>🏆 Create a Tournament</h3>
            <p>Choose your tournament size and prize pool:</p>
            
            <div class="tournament-options">
                <div class="tournament-option" onclick="createTournament(4)">
                    <div class="option-icon">🥇</div>
                    <h4>Quick Tournament</h4>
                    <p>4 participants</p>
                    <p class="option-prize">Prize: 100 coins</p>
                    <button class="tournament-create-btn">Create (Free)</button>
                </div>
                
                <div class="tournament-option" onclick="createTournament(8)">
                    <div class="option-icon">🏆</div>
                    <h4>Standard Tournament</h4>
                    <p>8 participants</p>
                    <p class="option-prize">Prize: 250 coins</p>
                    <button class="tournament-create-btn">Create (Free)</button>
                </div>
                
                <div class="tournament-option premium-option" onclick="handlePremiumTournament()">
                    <div class="option-icon">⭐</div>
                    <h4>Championship</h4>
                    <p>16 participants</p>
                    <p class="option-prize">Prize: 500 coins</p>
                    <button class="tournament-create-btn premium-btn">Premium Feature</button>
                </div>
            </div>
            
            <div class="tournament-info-box">
                <h4>ℹ️ How Tournaments Work</h4>
                <ul>
                    <li>Single-elimination bracket format</li>
                    <li>Battle against AI opponents</li>
                    <li>Win all matches to claim the prize</li>
                    <li>Your pet's stats and level determine strength</li>
                </ul>
            </div>
        </div>
    `;
}

function createTournament(maxParticipants) {
    // Determine prize based on size
    const prizes = { 4: 100, 8: 250, 16: 500 };
    const prize = prizes[maxParticipants] || 100;
    
    // Create tournament
    tournamentManager.createTournament({
        name: maxParticipants === 4 ? 'Quick Tournament' : maxParticipants === 8 ? 'Standard Tournament' : 'Championship',
        maxParticipants: maxParticipants,
        prize: prize,
        entryFee: 0 // Free for now
    });
    
    // Enter player's pet
    if (tournamentManager.enterTournament(pet)) {
        // Generate bracket
        tournamentManager.generateBracket();
        
        // Show tournament bracket
        populateTournamentContent();
        
        showNotification(`🏆 Entered ${maxParticipants}-participant tournament!`, 'success');
    } else {
        showNotification('❌ Failed to enter tournament', 'error');
    }
}

function handlePremiumTournament() {
    if (premiumManager && premiumManager.canAccessFeature('tournament_priority')) {
        createTournament(16);
    } else {
        showNotification('⭐ Championship tournaments require Premium Plus', 'info');
        setTimeout(() => {
            if (premiumManager) {
                premiumManager.openPremiumModal();
            }
        }, 1000);
    }
}

function showActiveTournament(container) {
    const tournament = tournamentManager.currentTournament;
    const bracket = tournament.bracket;
    
    container.innerHTML = `
        <div class="active-tournament">
            <div class="tournament-header">
                <h3>🏆 ${tournament.name}</h3>
                <p>Round ${tournament.currentRound} - Prize: ${tournament.prize} coins</p>
            </div>
            
            <div class="tournament-bracket" id="tournamentBracket">
                ${renderBracket(bracket, tournament.currentRound)}
            </div>
            
            <div class="tournament-actions">
                <button class="tournament-action-btn" onclick="playNextMatch()">
                    ⚔️ Fight Next Match
                </button>
                <button class="tournament-action-btn forfeit-btn" onclick="forfeitTournament()">
                    🏳️ Forfeit Tournament
                </button>
            </div>
        </div>
    `;
}

function renderBracket(bracket, currentRound) {
    if (!bracket || bracket.length === 0) {
        return '<p>No matches scheduled</p>';
    }
    
    let html = '<div class="bracket-container">';
    
    // Group matches by round
    const rounds = {};
    bracket.forEach(match => {
        if (!rounds[match.round]) {
            rounds[match.round] = [];
        }
        rounds[match.round].push(match);
    });
    
    // Render each round
    Object.keys(rounds).sort().forEach(round => {
        html += `<div class="bracket-round">`;
        html += `<h4>Round ${round}</h4>`;
        
        rounds[round].forEach(match => {
            const isCurrentMatch = !match.completed && match.round === currentRound;
            const matchClass = match.completed ? 'completed' : isCurrentMatch ? 'current' : 'upcoming';
            
            html += `
                <div class="bracket-match ${matchClass}">
                    <div class="match-participant ${match.winner === match.player1.name ? 'winner' : ''}">
                        <span class="participant-name">${match.player1.name}</span>
                        <span class="participant-level">Lv.${match.player1.level}</span>
                    </div>
                    <div class="match-vs">VS</div>
                    <div class="match-participant ${match.winner === match.player2.name ? 'winner' : ''}">
                        <span class="participant-name">${match.player2.name}</span>
                        <span class="participant-level">Lv.${match.player2.level}</span>
                    </div>
                    ${match.completed ? `<div class="match-result">✓ ${match.winner} wins</div>` : ''}
                </div>
            `;
        });
        
        html += '</div>';
    });
    
    html += '</div>';
    return html;
}

function playNextMatch() {
    const nextMatch = tournamentManager.getNextMatch();
    
    if (!nextMatch) {
        // Tournament completed!
        const winner = tournamentManager.currentTournament.bracket
            .filter(m => m.completed)
            .slice(-1)[0]?.winner;
        
        if (winner === pet.name) {
            // Player won!
            const prize = tournamentManager.currentTournament.prize;
            pet.coins += prize;
            pet.save();
            updateCoinsDisplay();
            
            showNotification(`🎉 Tournament Victory! You won ${prize} coins!`, 'success');
            
            // Save tournament to history
            tournamentManager.completeTournament(true);
        } else {
            showNotification('😢 You were eliminated from the tournament', 'info');
            tournamentManager.completeTournament(false);
        }
        
        // Close modal after delay
        setTimeout(() => {
            closeTournament();
        }, 3000);
        
        return;
    }
    
    // Close tournament modal
    closeTournament();
    
    // Start battle with opponent
    if (nextMatch.player2.isAI) {
        // Create AI pet for battle
        const aiPet = {
            name: nextMatch.player2.name,
            level: nextMatch.player2.level,
            stage: nextMatch.player2.stage,
            attack: nextMatch.player2.stats.attack,
            defense: nextMatch.player2.stats.defense,
            maxHP: nextMatch.player2.stats.maxHP
        };
        
        // Start local battle (use window scope for global variables)
        window.currentBattle = new Battle(pet, aiPet);
        
        // Add tournament context to battle
        currentBattle.isTournamentMatch = true;
        currentBattle.tournamentMatch = nextMatch;
        
        // Set up tournament-specific battle end callback via BattleUIManager
        battleUIManager.onBattleEnd = function(battle) {
            // Record match result
            tournamentManager.recordMatchResult(nextMatch, battle.winner);
            
            // Show tournament progress after a delay
            setTimeout(() => {
                openTournament();
            }, 2000);
            
            // Clear the callback after use
            battleUIManager.onBattleEnd = null;
        };
        
        // Show battle modal
        battleUIManager.showBattle(currentBattle, false);
    }
}

function forfeitTournament() {
    if (confirm('Are you sure you want to forfeit the tournament? You will lose your entry.')) {
        tournamentManager.forfeitTournament();
        showNotification('🏳️ Tournament forfeited', 'info');
        populateTournamentContent();
    }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Award coins to player (called from battle wins, etc.)
 */
function awardCoins(amount) {
    // Apply premium multiplier
    if (premiumManager && premiumManager.isPremium) {
        const multiplier = premiumManager.getFeatureValue('coinMultiplier');
        amount = Math.floor(amount * multiplier);
    }
    
    shopManager.addCoins(amount);
    updateCoinsDisplay();
    
    return amount;
}

// Make functions globally accessible
if (typeof window !== 'undefined') {
    window.initializePhase34Features = initializePhase34Features;
    window.awardCoins = awardCoins;
    window.updateCoinsDisplay = updateCoinsDisplay;
    window.inventoryManager = inventoryManager;
    window.shopManager = shopManager;
    window.evolutionManager = evolutionManager;
}
