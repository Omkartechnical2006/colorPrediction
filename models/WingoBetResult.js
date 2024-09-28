const mongoose = require('mongoose');

const WingoBetResultSchema = new mongoose.Schema({
    bigSmallResult: { 
        type: String, 
        enum: ['big', 'small'],
        required: true 
    },
    numberResult: { 
        type: Number, 
        min: 0, 
        max: 9,
        required: true 
    },
    colorResult: { 
        type: String, 
        enum: ['green', 'red', 'violet'],
        required: true 
    },
    date: { type: Date, default: Date.now }, // Timestamp of the result
    currCycleId: { type: String, required: true } // To associate with a betting cycle
});

const WingoBetResult = mongoose.model('WingoBetResult', WingoBetResultSchema);

module.exports = WingoBetResult;
