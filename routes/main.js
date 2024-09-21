const express = require("express");
const router = express.Router();
// const passport = require("passport");
const { isLoggedIn } = require("../middleware.js");


router.get("/", isLoggedIn, (req, res) => {
    res.render("accounts/deposit.ejs");
});
router.get("/recharge",(req,res)=>{
    let qrCode="https://rivierainn.in/wp-content/uploads/2021/09/riviera-google-pay.jpeg";
    res.render("accounts/recharge.ejs",{qrCode});
})

module.exports = router;