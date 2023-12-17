const WebSocket = require('ws');

const websocketConnections = new Set();

function initializeWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        websocketConnections.add(ws);

        ws.on('message', (message) => {
            // WebSocket 메시지 처리 로직
        });

        ws.on('close', () => {
            websocketConnections.delete(ws);
        });
    });

    return wss;
}

module.exports = { initializeWebSocket };
