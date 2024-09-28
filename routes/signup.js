const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const generateUniqueUid = require("../utils/generateUid");


router.route("/")
    .get((req, res) => {
        let { invitationCode = "98712341" } = req.query;  // Use req.query instead of req.params
        res.render("accounts/register.ejs", { invitationCode });
    })
    .post(async (req, res) => {
        let { username, mobile, password } = req.body;
        const phoneRegex = /^[0-9]{10}$/;  // Regular expression for exactly 10 digits
        if (!username || !mobile || !password) {
            req.flash("error", "All fields are required.");
            return res.redirect("/signup");
        }
        if (!phoneRegex.test(mobile)) {
            req.flash("error", "Invalid phone number. It should be exactly 10 digits.");
            return res.redirect("/signup");
        }
            
        // Dynamically import nanoid

        try {
            const uid = await generateUniqueUid(User); // Generate an 8-character UID
            const newUser = new User({ username, mobile, uid });
            const registeredUser = await User.register(newUser, password);
            req.login(registeredUser, (err) => {
                if (err) {
                    return next(err);
                }
                req.flash("success", "Welcome to BigMumbai");
                res.redirect("/home");
            });
        } catch (e) {
            // Error handling for duplicate username or mobile number
            req.flash("error", e.message);
            res.redirect("/signup");
        }
    });

module.exports = router;
