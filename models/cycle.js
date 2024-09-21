const mongoose = require('mongoose');

const cycleSchema = new mongoose.Schema({
    cycleId: String // e.g., "2024092001"
});
const Cycle = mongoose.model('Cycle', cycleSchema);


module.exports = Cycle;
