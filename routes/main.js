const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/isLoggedIn.js");
const Deposit = require('../models/deposit');
const Withdrawal = require('../models/Withdrawal');
const Wingo3Bet = require('../models/wingo3bet');
const moment = require('moment-timezone');

// Route for deposit form (GET) and submission (POST)
router.route('/recharge')
    .get(isLoggedIn, (req, res) => {
        const imageUrl = "https://i.postimg.cc/7YM3M6jK/photo-2024-09-23-21-10-42.jpg"; // Replace with your QR image link
        res.render('accounts/recharge.ejs', { imageUrl });
    })
    .post(isLoggedIn, async (req, res) => {
        const { transactionId, amount } = req.body;
        const newDeposit = new Deposit({
            userId: req.user._id,
            username: req.user.username,
            transactionId,
            amount
        });
        await newDeposit.save();
        req.flash('success', 'Your deposit request has been submitted.');
        res.redirect('/main/deposit-history');
    });

// Route for showing deposit history
router.get("/deposit-history", isLoggedIn, async (req, res) => {
    const deposits = await Deposit.find({ userId: req.user._id });
    res.render('accounts/deposit-history.ejs', { deposits });
});
router.get('/transaction-history', isLoggedIn, async (req, res) => {
    try {
        const userId = req.user._id;
        // Fetch deposits and withdrawals for the current user
        const deposits = await Deposit.find({ userId: userId }).sort({ date: -1 });
        const withdrawals = await Withdrawal.find({ userId: userId }).sort({ date: -1 });

        // Calculate total deposits and withdrawals
        const totalDeposits = deposits.reduce((sum, deposit) => sum + deposit.amount, 0);
        const totalWithdrawals = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

        // Combine deposits and withdrawals into a single list, sorted by date
        const transactions = [...deposits, ...withdrawals].sort((a, b) => b.date - a.date);

        // Render the transaction history page
        res.render('accounts/transaction-history', {
            transactions,
            totalDeposits,
            totalWithdrawals
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Unable to fetch transaction history.');
        res.redirect('/');
    }
});
// Route for deposit page
router.get("/", isLoggedIn, (req, res) => {
    const balance = req.user.balance;
    const uid = req.user.uid;
    const username = req.user.username;
    let lastLoginDate;
    if (req.user.lastLogin) {
        lastLoginDate = moment(req.user.lastLogin).tz('Asia/Kolkata').format('YYYY-MM-DD, h:mm:ss a');
    }
    res.render("accounts/deposit.ejs", { balance, uid, lastLoginDate, username });
});
router.route("/withdraw")
    .get(isLoggedIn, (req, res) => {
        res.render("accounts/withdraw.ejs");
    })
    .post(isLoggedIn, async (req, res) => {
        const { amount, accountDetails } = req.body;
        const user = req.user;  // Assuming req.user contains the logged-in user's details
        if (user.balance >= amount) {
            // Create and save the withdrawal request
            const newWithdrawal = new Withdrawal({
                userId: user._id,  // Store the user's ID
                username: user.username,  // Optionally store the username for reference
                amount,
                accountDetails,
                status: 'pending',
                date: new Date()
            });
            await newWithdrawal.save();
            res.redirect('/main/withdraw-history');  // Redirect to the user's withdrawal history page
        } else {
            req.flash('success', 'Insufficient balance to withdraw this amount.');
            res.render('accounts/withdraw.ejs');
        }
    });

// User views their withdrawal history
router.get('/withdraw-history', isLoggedIn, async (req, res) => {
    const user = req.user;  // Get the logged-in user
    // Find all withdrawals made by this user
    const withdrawals = await Withdrawal.find({ userId: user._id }).sort({ date: -1 });
    res.render('accounts/user-withdraw-history', { withdrawals });
});
// User views their game history;
router.get("/game-history",isLoggedIn,async(req,res)=>{
    try {
        // Find the current user's game history
        const userId = req.user._id;
        const gameHistory = await Wingo3Bet.find({ userId });

        // Format the date and prepare the data
        const formattedHistory = gameHistory.map(history => {
            // Format the date to dd-mm-yyyy
            const formattedDate = new Date(history.date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            return {
                betAmount: history.betAmount,
                choosedBet: history.choosedBet,
                currCycleId: history.currCycleId,
                status: history.status,
                date: formattedDate // Use the formatted date
            };
        });

        // Render the game-history template with the formatted data
        res.render('accounts/game-history', { gameHistory: formattedHistory });
    } catch (error) {
       req.flash("success","Game History not found!");
    }
});
module.exports = router;
