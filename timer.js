const WebSocket = require('ws'); // Add this line at the top

let timeLeft = 60;      // Timer starts from 60 seconds
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

// Broadcast the current state to all clients
function broadcastUpdate(wss) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ timeLeft, cycleCount, cycleId: currentCycleId }));
        }
    });
}

// Start the timer and handle the cycle logic
function startTimer(wss, saveCycleToDB) {
    setInterval(() => {
        timeLeft--;

        // Broadcast updates to all connected clients
        broadcastUpdate(wss);

        // When time reaches 0, reset the timer and save the new cycle ID
        if (timeLeft === 0) {
            timeLeft = 60; // Reset timer
            cycleCount++; // Increment cycle count

            const newDate = createDateId(); // Create new date ID
            // If the date changes (i.e., new day), reset the cycle count
            if (newDate !== currentDate) {
                currentDate = newDate;
                cycleCount = 1; // Reset cycle count for a new day
            }

            // Dynamically calculate padding based on the current cycle count
            const paddingLength = Math.max(2, cycleCount.toString().length); // Ensure a minimum padding of 2 digits
            currentCycleId = `${currentDate}${String(cycleCount).padStart(paddingLength, '0')}`;

            saveCycleToDB(currentCycleId); // Save the current cycle to MongoDB

            // Broadcast the updated cycleId to all clients
            broadcastUpdate(wss);
        }
    }, 1000); // 1-second interval
}

module.exports = { startTimer, timeLeft, cycleCount, currentCycleId };
