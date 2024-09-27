const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/isLoggedIn.js");
const Cycle = require('../models/cycle');
const User = require("../models/user.js");
const Wingo3Bet = require('../models/wingo3bet');
const { startTimer, timeLeft, cycleCount, currentCycleId } = require('../timer');



router.get("/", isLoggedIn, (req, res) => {
    const { balance } = req.user;
    // console.log("timeleft: ", timeLeft, " cyclecount: ", cycleCount, " cycleid: ", currentCycleId, req.path)
    res.render("games/wingo.ejs", { timeLeft, cycleCount, cycleId: currentCycleId, balance })
});

// req.path 
router.post("/bet", isLoggedIn, async (req, res) => {
    const { balance } = req.user;
    const { betAmount, choosedBet } = req.body;
    let cycle = await Cycle.find({});
    // Validate bet amount
    if (balance < betAmount || betAmount <= 0) {
        req.flash("success", "Insufficient balance or invalid bet amount");
        return res.redirect("/wingo");
    }
    res.locals.currCycleId = cycle[0].cycleId;
    // Check if there are cycles available
    if (cycle.length > 0) {
        let cycleCreatedAtTime = new Date(cycle[0].createdAt);
        const currentTime = new Date();
        const twentyFiveMinutesLater = new Date(cycleCreatedAtTime.getTime() + 25 * 60 * 1000);
        if (currentTime <= twentyFiveMinutesLater) {
            try {
                const user = await User.findById(req.user._id);
                if (user) {
                    user.balance -= betAmount;
                    await user.save();
                    console.log("user payment deducted");
                }
                // Create a new bet
                if (!currentCycleId) {
                    console.log("Error: currentCycleId is not defined");
                    req.flash("success", "No active cycle ID found");
                    return res.redirect("/wingo");
                }
                const newBet = new Wingo3Bet({
                    userId: req.user._id,
                    betAmount,
                    choosedBet: choosedBet.toLowerCase(),
                    currCycleId: res.locals.currCycleId
                });
                let savedbet = await newBet.save();
                // resultRule();

                console.log("Bet placed successfully");
                req.flash('success', 'Bet placed successfully!');
                return res.redirect('/wingo');
            } catch (error) {
                req.flash("error", `${error.message}`);
                return res.redirect("/wingo");
            }
        } else {
            req.flash("success", "You were late!");
            return res.redirect("/wingo");
        }
    } else {
        req.flash("success", "No active cycles found!");
        return res.redirect("/wingo");
    }
});
module.exports = router;
