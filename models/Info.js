// models/Info.js
const mongoose = require('mongoose');

// Define the schema for the Info model
const infoSchema = new mongoose.Schema({
  telegramLink: {
    type: String,
    required: true,  // Marked as required
  },
  qrCodeLink: {
    type: String,
    required: true,  // Marked as required
  },
});

// Create the model from the schema
const Info = mongoose.model('Info', infoSchema);

// Export the model
module.exports = Info;
