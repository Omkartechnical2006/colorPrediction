const WebSocket = require('ws');
const Cycle = require('./models/cycle');
const WingoBetResult = require('./models/WingoBetResult');
function startWebSocketServer(port) {
    const wss = new WebSocket.Server({ port });

    wss.on('connection', (ws) => {
        console.log('Client connected');
        // Send the initial state to the newly connected client
        ws.send(JSON.stringify({ timeLeft: 30, cycleCount: 1, cycleId: 'initial' }));
        // Optionally send initial data to the client
        sendInitialResults(ws);//my remove
        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });

    return wss;
}

async function saveCycleToDB(cycleId) {
    try {
        // Delete any existing cycle document
        await Cycle.deleteMany({});
        // Now save the new cycle ID
        const newCycle = new Cycle({ cycleId });
        await newCycle.save();

        // console.log(`Cycle saved: ${cycleId}`);
    } catch (err) {
        console.error("Error saving cycle to DB:", err);
    }
}
//remove funciton
// Function to send all created results to the newly connected client
function sendInitialResults(ws) {
    WingoBetResult.find({})
        .then(results => {
            ws.send(JSON.stringify(results)); // Send all results to the client
        })
        .catch(err => {
            console.error("Error fetching results:", err);
        });
}


module.exports = { startWebSocketServer, saveCycleToDB };
