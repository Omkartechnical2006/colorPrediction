const WebSocket = require('ws');
const Cycle = require('./models/cycle');

function startWebSocketServer(port) {
    const wss = new WebSocket.Server({ port });

    wss.on('connection', (ws) => {
        console.log('Client connected');
        // Send the initial state to the newly connected client
        ws.send(JSON.stringify({ timeLeft: 30, cycleCount: 1, cycleId: 'initial' }));

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });

    return wss;
}

async function saveCycleToDB(cycleId) {
    try {
        await Cycle.findOneAndUpdate(
            { cycleId },
            { cycleId },
            { upsert: true, new: true }
        );
        console.log(`Cycle saved: ${cycleId}`);
    } catch (err) {
        console.error("Error saving cycle to DB:", err);
    }
}

module.exports = { startWebSocketServer, saveCycleToDB };
