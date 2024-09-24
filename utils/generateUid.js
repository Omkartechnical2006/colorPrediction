
const generateUniqueUid = async (User) => {
    let uid;
    let isUnique = false;

    while (!isUnique) {
        // Generate a random 8-digit number
        uid = Math.floor(10000000 + Math.random() * 90000000); 

        // Check if the UID already exists in the database
        const existingUser = await User.findOne({ uid });
        if (!existingUser) {
            isUnique = true; // If it's unique, exit the loop
        }
    }
    return uid;
};

module.exports = generateUniqueUid;
