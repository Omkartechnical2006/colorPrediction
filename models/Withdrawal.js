const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Store the user ID
    username: { type: String, required: true },  // Optional: Keep username for easy reference
    amount: { type: Number, required: true },
    accountDetails: { type: String, required: true },
    status: { type: String, enum: ['pending', 'paid', 'rejected'], default: 'pending' },
    date: { type: Date, default: Date.now }
});

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

module.exports = Withdrawal;
