// Simple WebSocket server for VPet battles
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Create HTTP server for serving static files
const server = http.createServer((req, res) => {
    // Health check endpoint
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'ok', 
            uptime: process.uptime(),
            connections: wss ? wss.clients.size : 0
        }));
        return;
    }
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Serve static files from parent directory
    // Sanitize URL to prevent path traversal attacks
    const sanitizedUrl = req.url === '/' ? 'index.html' : req.url.split('?')[0];
    let filePath = path.join(__dirname, '..', sanitizedUrl);
    
    // Ensure the resolved path is within the allowed directory
    const parentDir = path.join(__dirname, '..');
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(parentDir)) {
        res.writeHead(403);
        res.end('403 Forbidden');
        return;
    }
    
    const extname = path.extname(filePath);
    
    const contentTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };
    
    const contentType = contentTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('500 Internal Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients and pending battles
const clients = new Map();
const battleQueue = [];
const activeBattles = new Map();

wss.on('connection', (ws) => {
    const clientId = generateId();
    clients.set(clientId, ws);
    
    console.log(`Client ${clientId} connected. Total clients: ${clients.size}`);
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(clientId, data);
        } catch (error) {
            console.error('Error parsing message:', error);
            sendError(ws, 'Invalid message format');
        }
    });
    
    ws.on('close', () => {
        clients.delete(clientId);
        
        // Remove from queue if waiting
        const queueIndex = battleQueue.findIndex(item => item.clientId === clientId);
        if (queueIndex !== -1) {
            battleQueue.splice(queueIndex, 1);
        }
        
        // Handle disconnection from active battle
        for (const [battleId, battle] of activeBattles.entries()) {
            if (battle.player1 === clientId || battle.player2 === clientId) {
                // Notify other player
                const otherClientId = battle.player1 === clientId ? battle.player2 : battle.player1;
                const otherWs = clients.get(otherClientId);
                if (otherWs) {
                    send(otherWs, {
                        type: 'battle_end',
                        data: {
                            winner: otherClientId,
                            reason: 'Opponent disconnected'
                        }
                    });
                }
                activeBattles.delete(battleId);
            }
        }
        
        console.log(`Client ${clientId} disconnected. Total clients: ${clients.size}`);
    });
    
    ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
    });
});

// Handle incoming messages
function handleMessage(clientId, data) {
    const ws = clients.get(clientId);
    
    switch (data.type) {
        case 'request_battle':
            handleBattleRequest(clientId, data.petData);
            break;
            
        case 'battle_action':
            handleBattleAction(clientId, data.battleId, data.action);
            break;
            
        case 'leave_battle':
            handleLeaveBattle(clientId, data.battleId);
            break;
            
        default:
            sendError(ws, 'Unknown message type');
    }
}

// Handle battle request
function handleBattleRequest(clientId, petData) {
    // Add to queue
    battleQueue.push({ clientId, petData, timestamp: Date.now() });
    
    console.log(`Client ${clientId} joined battle queue. Queue size: ${battleQueue.length}`);
    
    // Try to match
    if (battleQueue.length >= 2) {
        const player1 = battleQueue.shift();
        const player2 = battleQueue.shift();
        
        startBattle(player1, player2);
    } else {
        const ws = clients.get(clientId);
        if (ws) {
            send(ws, {
                type: 'waiting',
                message: 'Waiting for opponent...'
            });
        }
    }
}

// Start a battle between two players
function startBattle(player1, player2) {
    const battleId = generateId();
    
    const battle = {
        battleId,
        player1: player1.clientId,
        player2: player2.clientId,
        pet1: player1.petData,
        pet2: player2.petData,
        turn: player1.clientId
    };
    
    activeBattles.set(battleId, battle);
    
    // Notify both players
    const ws1 = clients.get(player1.clientId);
    const ws2 = clients.get(player2.clientId);
    
    if (ws1) {
        send(ws1, {
            type: 'battle_start',
            battleId,
            data: {
                yourPet: player1.petData,
                opponentPet: player2.petData,
                yourTurn: true
            }
        });
    }
    
    if (ws2) {
        send(ws2, {
            type: 'battle_start',
            battleId,
            data: {
                yourPet: player2.petData,
                opponentPet: player1.petData,
                yourTurn: false
            }
        });
    }
    
    console.log(`Battle ${battleId} started between ${player1.clientId} and ${player2.clientId}`);
}

// Handle battle action
function handleBattleAction(clientId, battleId, action) {
    const battle = activeBattles.get(battleId);
    
    if (!battle) {
        const ws = clients.get(clientId);
        sendError(ws, 'Battle not found');
        return;
    }
    
    if (battle.turn !== clientId) {
        const ws = clients.get(clientId);
        sendError(ws, 'Not your turn');
        return;
    }
    
    // Switch turn
    battle.turn = battle.turn === battle.player1 ? battle.player2 : battle.player1;
    
    // Notify both players
    const ws1 = clients.get(battle.player1);
    const ws2 = clients.get(battle.player2);
    
    if (ws1) {
        send(ws1, {
            type: 'battle_action',
            battleId,
            data: {
                action,
                yourTurn: battle.turn === battle.player1
            }
        });
    }
    
    if (ws2) {
        send(ws2, {
            type: 'battle_action',
            battleId,
            data: {
                action,
                yourTurn: battle.turn === battle.player2
            }
        });
    }
}

// Handle leave battle
function handleLeaveBattle(clientId, battleId) {
    const battle = activeBattles.get(battleId);
    
    if (!battle) return;
    
    // Notify other player
    const otherClientId = battle.player1 === clientId ? battle.player2 : battle.player1;
    const otherWs = clients.get(otherClientId);
    
    if (otherWs) {
        send(otherWs, {
            type: 'battle_end',
            data: {
                winner: otherClientId,
                reason: 'Opponent left the battle'
            }
        });
    }
    
    activeBattles.delete(battleId);
    console.log(`Battle ${battleId} ended - player left`);
}

// Helper functions
function send(ws, data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

function sendError(ws, message) {
    send(ws, {
        type: 'error',
        message
    });
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Start server
server.listen(PORT, () => {
    console.log(`VPet server running on port ${PORT}`);
    console.log(`WebSocket server ready for connections`);
    console.log(`HTTP server serving files from ${path.join(__dirname, '..')}`);
});
