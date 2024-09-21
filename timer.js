const WebSocket = require('ws'); // Add this line at the top

let timeLeft = 30;      // Timer starts from 30 seconds
let cycleCount = 1;     // Start cycle count from 1
let currentDate = createDateId(); // Create initial date ID
let currentCycleId = `${currentDate}${String(cycleCount).padStart(2, '0')}`; // Initialize cycle ID

function createDateId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

function startTimer(wss, saveCycleToDB) {
    setInterval(() => {
        timeLeft--;

        // Broadcast the current timeLeft, cycleCount, and currentCycleId to all connected clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ timeLeft, cycleCount, cycleId: currentCycleId }));
            }
        });

        // When time reaches 0, reset the timer and save the new cycle ID
        if (timeLeft === 0) {
            timeLeft = 30; // Reset timer
            cycleCount++; // Increment cycle count
            currentCycleId = `${currentDate}${String(cycleCount).padStart(2, '0')}`; // Update cycle ID

            saveCycleToDB(currentCycleId); // Save the current cycle to MongoDB

            // Broadcast the updated cycleId to all clients
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ timeLeft, cycleCount, cycleId: currentCycleId }));
                }
            });
        }
    }, 1000); // 1-second interval
}

module.exports = { startTimer, timeLeft, cycleCount, currentCycleId };
