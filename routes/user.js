const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");

router.get("/signup", (req, res) => {
    res.render("accounts/register.ejs");
});

router.post("/signup", async (req, res) => {
    let { username, mobile, password } = req.body;

    try {
        // Create a new user object
        const newUser = new User({ username, mobile });

        // Register the user with Passport's register method
        const registerUser = await User.register(newUser, password);

        // If registration is successful, flash a success message and redirect to /home
        req.flash("success", "Welcome to BigMumbai");
        res.redirect("/home");
    } catch (e) {
        // Error handling for duplicate username or mobile number
        req.flash("error", e.message);
        res.redirect("/signup");
    }
});

// login 
router.get("/login", (req, res) => {
    res.render("accounts/login.ejs");
});
router.post("/login", passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), async (req, res) => {
    // let { mobile, password } = req.body
    req.flash("success","Welcome back to BigMumbai");
    res.redirect("/home");
})
router.get("/logout",(req,res)=>{
req.logout((err)=>{
    if(err){
      return  next(err);
    }
    req.flash("success","you have been loged out");
    res.redirect("/home");

})
});
module.exports = router;
