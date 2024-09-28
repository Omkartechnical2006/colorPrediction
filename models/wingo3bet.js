const mongoose = require('mongoose');

const wingo3BetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  betAmount: {
    type: Number,
    required: true
  },
  choosedBet: {
    type: String,
    required: true,
    enum: ['0','1', '2', '3', '4', '5', '6', '7', '8', '9', 'big', 'small', 'green', 'violet', 'red'] // Allowed values for choosedBet
  },
  date: {
    type: Date,
    default: Date.now // Automatically set to the current date/time
  },
  currCycleId: { type: String, required: true }, // Ensure this is present
  status: {
    type: String,
    default: 'pending', // Default status is 'pending'
    enum: ['pending', 'won', 'lost'] // Possible statuses
  }
});

// Create the model
const Wingo3Bet = mongoose.model('Wingo3Bet', wingo3BetSchema);

module.exports = Wingo3Bet;
