const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const generateUniqueUid = require("../utils/generateUid"); 


router.route("/")
    .get((req, res) => {
        res.render("accounts/register.ejs");
    })
    .post(async (req, res) => {
        let { username, mobile, password } = req.body;
        // Dynamically import nanoid

        try {
            const uid = await generateUniqueUid(User); // Generate an 8-character UID
            const newUser = new User({ username, mobile, uid });
            const registeredUser = await User.register(newUser, password);
            req.login(registeredUser,(err)=>{
                if(err){
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
