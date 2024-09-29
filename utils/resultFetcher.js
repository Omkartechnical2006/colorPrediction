// resultFetcher.js

const Wingo3Bet = require('../models/wingo3bet'); // Import your Wingo3Bet model here
const fetchCurrentCycleData = require('./fetchCurrentCycleData'); // Import your function to fetch cycle data

// result fetcher 
async function resultRule() {
    try {
        // Fetch the current cycle data to get createdAt
        const cycleData = await fetchCurrentCycleData();
        const createdAt = cycleData.createdAt;

        // Calculate the upper limit for the date range (createdAt + 25 seconds)
        const upperLimit = new Date(createdAt.getTime() + 55 * 1000);

        // Fetch WingoThreeBet records within the specified date range
        const WingoThreeBet = await Wingo3Bet.find({
            date: {
                $gt: createdAt,
                $lte: upperLimit
            }
        });

        if (WingoThreeBet.length === 0) {
            return null;
        }

        // Track bet amounts for numbers, colors, and sizes
        const numberBetTracker = {
            '0': 0, '1': 0, '2': 0, '3': 0, '4': 0,
            '5': 0, '6': 0, '7': 0, '8': 0, '9': 0
        };
        const colorBetTracker = { 'red': 0, 'green': 0, 'violet': 0 };
        const sizeBetTracker = { 'big': 0, 'small': 0 };

        WingoThreeBet.forEach(bet => {
            const chosenBet = bet.choosedBet;
            const betAmount = bet.betAmount;

            // Track number bets
            if (numberBetTracker.hasOwnProperty(chosenBet)) {
                numberBetTracker[chosenBet] += betAmount;
            }

            // Track color bets
            if (colorBetTracker.hasOwnProperty(chosenBet)) {
                colorBetTracker[chosenBet] += betAmount;
            }

            // Track size bets
            if (sizeBetTracker.hasOwnProperty(chosenBet)) {
                sizeBetTracker[chosenBet] += betAmount;
            }
        });

        const numberResults = [];
        const colorResults = [];
        const sizeResults = [];

        for (const [bet, totalAmount] of Object.entries(numberBetTracker)) {
            numberResults.push({ choosedBet: bet, totalAmount: totalAmount || '0' });
        }

        for (const [bet, totalAmount] of Object.entries(colorBetTracker)) {
            colorResults.push({ choosedBet: bet, totalAmount: totalAmount || '0' });
        }

        for (const [bet, totalAmount] of Object.entries(sizeBetTracker)) {
            sizeResults.push({ choosedBet: bet, totalAmount: totalAmount || '0' });
        }

        return {
            numberResults,
            colorResults,
            sizeResults,
            WingoThreeBet
        };

    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Export the function
module.exports = { resultRule };
