// services/resetResultDb.js
const WingoBetResult = require('../models/WingoBetResult'); // Adjust the path as needed

async function resetResultDb() {
    await WingoBetResult.deleteMany({});
    // console.log("Reset the result db");
}

module.exports = resetResultDb;
