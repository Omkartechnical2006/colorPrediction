const mongoose = require('mongoose');

const cycleSchema = new mongoose.Schema({
    cycleId: { type: String, required: true }, // e.g., "2024092001"
    createdAt: { type: Date, default: Date.now } // Automatically sets the date when the document is created
});

const Cycle = mongoose.model('Cycle', cycleSchema);

module.exports = Cycle;
