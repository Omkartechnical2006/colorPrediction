// utils/initializeData.js
const Info = require('../models/Info'); 

const initializeDefaultData = async () => {
    try {
        // Check if there are existing entries in the Info collection
        const count = await Info.countDocuments();

        if (count === 0) {
            const defaultData = new Info({
                telegramLink: 'https://t.me/your_channel',
                qrCodeLink: 'https://example.com/path_to_qrcode',
            });
            await defaultData.save();
            console.log('Default data initialized');
        } else {
            console.log('Data already exists in the database, no initialization needed');
        }
    } catch (error) {
        console.error('Error initializing default data:', error);
    }
};

module.exports = initializeDefaultData;
