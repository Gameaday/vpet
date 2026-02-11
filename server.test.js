import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock WebSocket
class MockWebSocket {
    constructor(url) {
        this.url = url;
        this.readyState = MockWebSocket.CONNECTING;
        this.onopen = null;
        this.onclose = null;
        this.onerror = null;
        this.onmessage = null;
        
        // Simulate connection after a short delay
        setTimeout(() => {
            if (this.readyState === MockWebSocket.CONNECTING) {
                this.readyState = MockWebSocket.OPEN;
                if (this.onopen) {
                    this.onopen();
                }
            }
        }, 10);
    }
    
    close() {
        this.readyState = MockWebSocket.CLOSED;
        if (this.onclose) {
            this.onclose();
        }
    }
    
    send(_data) {
        // Mock send
    }
    
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;
}

// Mock global objects
global.WebSocket = MockWebSocket;
global.localStorage = {
    storage: {},
    getItem(key) {
        return this.storage[key] || null;
    },
    setItem(key, value) {
        this.storage[key] = value;
    },
    removeItem(key) {
        delete this.storage[key];
    },
    clear() {
        this.storage = {};
    }
};
global.showNotification = vi.fn();
global.document = {
    querySelector: vi.fn(() => ({
        classList: {
            add: vi.fn(),
            remove: vi.fn()
        },
        textContent: '',
        disabled: false
    })),
    getElementById: vi.fn(() => ({
        disabled: false
    }))
};

// Import ServerConnection after mocking
const { ServerConnection } = await import('./js/server.js');

describe('ServerConnection', () => {
    let serverConnection;

    beforeEach(() => {
        serverConnection = new ServerConnection();
        global.showNotification.mockClear();
        global.localStorage.clear();
        vi.clearAllTimers();
    });

    afterEach(() => {
        if (serverConnection) {
            serverConnection.disconnect();
        }
    });

    it('should initialize with manualDisconnect flag set to false', () => {
        expect(serverConnection.manualDisconnect).toBe(false);
    });

    it('should set manualDisconnect flag to true when disconnect() is called', () => {
        serverConnection.disconnect();
        expect(serverConnection.manualDisconnect).toBe(true);
    });

    it('should not call attemptReconnect when manually disconnected', async () => {
        // Spy on attemptReconnect
        const attemptReconnectSpy = vi.spyOn(serverConnection, 'attemptReconnect');
        
        // Connect first
        await serverConnection.connect();
        
        // Wait for connection to be established
        await new Promise(resolve => setTimeout(resolve, 20));
        
        // Clear the spy calls from any connection issues
        attemptReconnectSpy.mockClear();
        
        // Manually disconnect
        serverConnection.disconnect();
        
        // Wait a bit to ensure onclose handler is called
        await new Promise(resolve => setTimeout(resolve, 20));
        
        // attemptReconnect should not have been called
        expect(attemptReconnectSpy).not.toHaveBeenCalled();
    });

    it('should call attemptReconnect when connection is lost unexpectedly', async () => {
        // Spy on attemptReconnect
        const attemptReconnectSpy = vi.spyOn(serverConnection, 'attemptReconnect');
        
        // Connect first
        await serverConnection.connect();
        
        // Wait for connection to be established
        await new Promise(resolve => setTimeout(resolve, 20));
        
        // Clear the spy calls
        attemptReconnectSpy.mockClear();
        
        // Simulate unexpected disconnection (not via disconnect() method)
        if (serverConnection.ws) {
            serverConnection.ws.close();
        }
        
        // Wait a bit to ensure onclose handler is called
        await new Promise(resolve => setTimeout(resolve, 20));
        
        // attemptReconnect should have been called
        expect(attemptReconnectSpy).toHaveBeenCalled();
    });

    it('should reset manualDisconnect flag on successful reconnection', async () => {
        // Manually disconnect
        serverConnection.disconnect();
        expect(serverConnection.manualDisconnect).toBe(true);
        
        // Reconnect
        await serverConnection.connect();
        await new Promise(resolve => setTimeout(resolve, 20));
        
        // manualDisconnect should be reset
        expect(serverConnection.manualDisconnect).toBe(false);
    });

    it('should not show "Unable to connect" notification on manual disconnect', async () => {
        // Connect first
        await serverConnection.connect();
        await new Promise(resolve => setTimeout(resolve, 20));
        
        // Clear previous notifications
        global.showNotification.mockClear();
        
        // Set reconnectAttempts to max to trigger the warning if attemptReconnect is called
        serverConnection.reconnectAttempts = serverConnection.maxReconnectAttempts;
        
        // Manually disconnect
        serverConnection.disconnect();
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 20));
        
        // Should not show the "Unable to connect" warning
        expect(global.showNotification).not.toHaveBeenCalledWith(
            expect.stringContaining('Unable to connect'),
            'warning'
        );
    });
});
