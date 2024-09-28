// utils.js
// Function to calculate when to declare the result (createdAt + 30 seconds)
function calculateResultTime(createdAt) {
    return new Date(createdAt.getTime() + 30 * 1000); // Add 30 seconds to createdAt
}

module.exports = { calculateResultTime };
