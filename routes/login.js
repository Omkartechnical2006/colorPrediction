const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

router.route("/")
    .get((req, res) => {
        res.render("accounts/login.ejs");
    })
    .post(passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), async (req, res) => {
        await User.findByIdAndUpdate(req.user._id, { lastLogin: new Date() });
        req.flash("success", "Welcome back to BigMumbai");
        res.redirect("/home");
    });

module.exports = router;
