// utils.js
// Function to calculate when to declare the result (createdAt + 60 seconds)
function calculateResultTime(createdAt) {
    return new Date(createdAt.getTime() + 60 * 1000); // Add 60 seconds to createdAt
}

module.exports = { calculateResultTime };
