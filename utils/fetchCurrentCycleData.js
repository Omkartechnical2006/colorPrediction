// services/fetchCurrentCycleData.js
const Cycle = require('../models/cycle'); // Adjust the path as needed

async function fetchCurrentCycleData() {
    return await Cycle.findOne().sort({ createdAt: -1 }).exec(); // Get the most recent cycle
}

module.exports = fetchCurrentCycleData;
