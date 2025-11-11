// Server connection manager for online battles
class ServerConnection {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.serverUrl = this.getServerUrl();
        this.onBattleRequest = null;
        this.onBattleUpdate = null;
        this.currentBattleId = null;
    }

    // Get server URL from localStorage or default
    getServerUrl() {
        return localStorage.getItem('vpet_server_url') || 'ws://localhost:3000';
    }

    // Set server URL
    setServerUrl(url) {
        localStorage.setItem('vpet_server_url', url);
        this.serverUrl = url;
    }

    // Connect to server
    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.serverUrl);
                
                this.ws.onopen = () => {
                    this.connected = true;
                    this.updateConnectionStatus(true);
                    console.log('Connected to server');
                    resolve();
                };
                
                this.ws.onclose = () => {
                    this.connected = false;
                    this.updateConnectionStatus(false);
                    console.log('Disconnected from server');
                };
                
                this.ws.onerror = (error) => {
                    this.connected = false;
                    this.updateConnectionStatus(false);
                    console.error('WebSocket error:', error);
                    reject(error);
                };
                
                this.ws.onmessage = (event) => {
                    this.handleMessage(event.data);
                };
                
                // Timeout after 5 seconds
                setTimeout(() => {
                    if (!this.connected) {
                        this.ws.close();
                        reject(new Error('Connection timeout'));
                    }
                }, 5000);
                
            } catch (error) {
                reject(error);
            }
        });
    }

    // Disconnect from server
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
        this.updateConnectionStatus(false);
    }

    // Update connection status in UI
    updateConnectionStatus(connected) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.server-status span:last-child');
        const onlineBattleBtn = document.getElementById('onlineBattleBtn');
        
        if (connected) {
            statusDot.classList.remove('offline');
            statusDot.classList.add('online');
            statusText.textContent = 'Online';
            onlineBattleBtn.disabled = false;
        } else {
            statusDot.classList.remove('online');
            statusDot.classList.add('offline');
            statusText.textContent = 'Offline';
            onlineBattleBtn.disabled = true;
        }
    }

    // Send message to server
    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
            return true;
        }
        return false;
    }

    // Handle incoming messages
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'battle_request':
                    if (this.onBattleRequest) {
                        this.onBattleRequest(message.data);
                    }
                    break;
                    
                case 'battle_start':
                    this.currentBattleId = message.battleId;
                    if (this.onBattleUpdate) {
                        this.onBattleUpdate('start', message.data);
                    }
                    break;
                    
                case 'battle_action':
                    if (this.onBattleUpdate) {
                        this.onBattleUpdate('action', message.data);
                    }
                    break;
                    
                case 'battle_end':
                    if (this.onBattleUpdate) {
                        this.onBattleUpdate('end', message.data);
                    }
                    this.currentBattleId = null;
                    break;
                    
                case 'error':
                    console.error('Server error:', message.message);
                    showNotification('❌ Server error: ' + message.message);
                    break;
                    
                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    }

    // Request online battle
    requestBattle(petData) {
        return this.send({
            type: 'request_battle',
            petData: petData
        });
    }

    // Send battle action
    sendBattleAction(action) {
        return this.send({
            type: 'battle_action',
            battleId: this.currentBattleId,
            action: action
        });
    }

    // Leave battle
    leaveBattle() {
        if (this.currentBattleId) {
            this.send({
                type: 'leave_battle',
                battleId: this.currentBattleId
            });
            this.currentBattleId = null;
        }
    }
}

// Mock server for testing when real server is not available
class MockServer {
    constructor() {
        this.connected = false;
    }

    connect() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.connected = true;
                resolve();
            }, 500);
        });
    }

    disconnect() {
        this.connected = false;
    }

    updateConnectionStatus(connected) {
        // Mock implementation
    }

    requestBattle(petData) {
        // Mock implementation - would simulate finding an opponent
        return true;
    }

    sendBattleAction(action) {
        // Mock implementation
        return true;
    }

    leaveBattle() {
        // Mock implementation
    }
}
