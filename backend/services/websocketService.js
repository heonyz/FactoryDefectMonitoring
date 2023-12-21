const WebSocket = require('ws');
const redis = require('redis');

const subscriber = redis.createClient();
const publisher = redis.createClient();
const websocketConnections = new Set();

function initializeWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        websocketConnections.add(ws);

        ws.on('message', (message) => {
            publisher.publish('websocket_messages', message);
        });

        ws.on('close', () => {
            websocketConnections.delete(ws);
        });
    });

    subscriber.subscribe('websocket_messages');
    subscriber.on('message', (_, message) => {
        websocketConnections.forEach((ws) => ws.send(message));
    });

    return wss;
}

module.exports = { initializeWebSocket };
