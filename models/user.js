const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    isAdmin: {
        type: Boolean,
        default: false  // By default, users are not admins
    },
    balance: {
        type: Number,
        default: 0  // User balance for deposits
    }
});

// Passport-Local Mongoose will add username and password fields automatically
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
