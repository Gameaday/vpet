// Server connection manager for online battles
class ServerConnection {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.serverUrl = this.getServerUrl();
        this.onBattleRequest = null;
        this.onBattleUpdate = null;
        this.currentBattleId = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.reconnectTimer = null;
        this.manualDisconnect = false; // Track intentional disconnects
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
                    this.reconnectAttempts = 0; // Reset on successful connection
                    this.manualDisconnect = false; // Reset manual disconnect flag
                    this.updateConnectionStatus(true);
                    console.log('Connected to server');
                    resolve();
                };
                
                this.ws.onclose = () => {
                    this.connected = false;
                    this.updateConnectionStatus(false);
                    console.log('Disconnected from server');
                    
                    // Only attempt reconnection if not manually disconnected
                    if (!this.manualDisconnect) {
                        this.attemptReconnect();
                    }
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

    // Attempt to reconnect with exponential backoff
    attemptReconnect() {
        // Clear any existing reconnect timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }

        // Don't reconnect if we've exceeded max attempts
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached. Manual reconnection required.');
            this.updateConnectionStatus(false, true); // Show max attempts reached
            return;
        }

        // Calculate delay with exponential backoff
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
        this.reconnectAttempts++;

        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.updateConnectionStatus(false, false, true); // Show reconnecting state

        this.reconnectTimer = setTimeout(() => {
            console.log('Attempting to reconnect...');
            this.connect().then(() => {
                // Connection successful, status will be updated by onopen handler
                console.log('Reconnected successfully');
            }).catch((error) => {
                console.error('Reconnection failed:', error);
                // The onclose handler will trigger another reconnect attempt
            });
        }, delay);
    }

    // Cancel reconnection attempts
    cancelReconnect() {
        console.log('Reconnection cancelled by user');
        
        // Mark as manual disconnect to prevent auto-reconnect
        this.manualDisconnect = true;
        
        // Clear any existing timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        // Reset reconnect attempts
        this.reconnectAttempts = 0;
        
        // Update UI to show cancelled/offline state
        this.updateConnectionStatus(false, false, false);
    }

    // Manual retry connection (e.g., from user click)
    manualRetry() {
        // Reset reconnect attempts
        this.reconnectAttempts = 0;
        this.manualDisconnect = false;
        
        // Clear any existing timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        // Try to connect
        this.updateConnectionStatus(false, false, true);
        this.connect().then(() => {
            console.log('Manual reconnection successful');
        }).catch((error) => {
            console.error('Manual reconnection failed:', error);
            // Will trigger auto-reconnect via onclose handler
        });
    }

    // Disconnect from server
    disconnect() {
        // Mark as manual disconnect to prevent auto-reconnect
        this.manualDisconnect = true;
        
        // Clear reconnect timer when manually disconnecting
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
        this.updateConnectionStatus(false);
    }

    // Update connection status in UI
    updateConnectionStatus(connected, maxAttemptsReached = false, reconnecting = false) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status-text');
        const statusRetry = document.querySelector('.status-retry');
        const serverStatus = document.getElementById('serverStatus');
        const onlineBattleBtn = document.getElementById('onlineBattleBtn');
        
        // Guard against missing DOM elements (e.g., in tests)
        if (!statusDot || !statusText || !serverStatus || 
            !statusDot.classList || !serverStatus.classList) {
            return;
        }
        
        if (connected) {
            statusDot.classList.remove('offline', 'reconnecting');
            statusDot.classList.add('online');
            serverStatus.classList.remove('reconnecting');
            statusText.textContent = 'Online';
            if (statusRetry) statusRetry.style.display = 'none';
            if (onlineBattleBtn) onlineBattleBtn.disabled = false;
            serverStatus.title = 'Connected to server';
        } else if (reconnecting) {
            statusDot.classList.remove('online', 'offline');
            statusDot.classList.add('reconnecting');
            serverStatus.classList.add('reconnecting');
            statusText.textContent = 'Connecting...';
            if (statusRetry) statusRetry.style.display = 'inline';
            if (onlineBattleBtn) onlineBattleBtn.disabled = true;
            serverStatus.title = 'Attempting to reconnect... Click to cancel';
        } else {
            statusDot.classList.remove('online', 'reconnecting');
            statusDot.classList.add('offline');
            serverStatus.classList.remove('reconnecting');
            statusText.textContent = maxAttemptsReached ? 'Offline' : 'Offline';
            if (statusRetry) statusRetry.style.display = 'none';
            if (onlineBattleBtn) onlineBattleBtn.disabled = true;
            serverStatus.title = maxAttemptsReached ? 'Click to retry connection' : 'Not connected to server';
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
        // Update UI connection status
        const statusIndicator = document.querySelector('.server-status');
        if (statusIndicator) {
            statusIndicator.textContent = connected ? 'Online' : 'Offline';
            statusIndicator.style.color = connected ? '#10b981' : '#ef4444';
        }
    }

    requestBattle(petData) {
        // Simulate finding an opponent - in a real implementation, 
        // this would send the request to the server via WebSocket
        if (!this.connected) {
            console.log('Not connected to server');
            return false;
        }
        
        // Mock: simulate successful matchmaking
        console.log('Requesting battle with pet data:', petData);
        return true;
    }

    sendBattleAction(action) {
        // Send battle action to server
        // In a real implementation, this would send via WebSocket
        if (!this.connected) {
            console.log('Not connected to server');
            return false;
        }
        
        console.log('Sending battle action:', action);
        return true;
    }

    leaveBattle() {
        // Notify server that player is leaving battle
        if (this.connected) {
            console.log('Leaving battle');
        }
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ServerConnection, MockServer };
}
