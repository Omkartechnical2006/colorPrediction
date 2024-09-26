const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const isAdmin = require('../middlewares/isAdmin.js');
const Deposit = require('../models/deposit');
const { isLoggedIn } = require("../middlewares/isLoggedIn.js");
const Withdrawal = require('../models/Withdrawal');
const WingoBet = require('../models/wingo3bet');
const Info = require('../models/Info'); 


// admin 
// /admin/create 
router.get("/create", async (req, res) => {
    try {
        // Check if the admin user already exists
        const existingAdmin = await User.findOne({ username: 'admin' });

        if (existingAdmin) {
            // Admin already exists, set flash message
            req.flash("success", "Admin already exists");
            return res.redirect("/home");
        }

        // Create a new admin user if not already present
        const adminUser = new User({
            username: 'admin',
            mobile: '1234567890',
            isAdmin: true,
            uid: '14314312'
        });
        await User.register(adminUser, 'Prince@9876');  // Register admin with password

        // Flash message for successful admin creation
        req.flash("success", "Admin created successfully");
        res.redirect("/home");
    } catch (e) {
        // Handle any errors that occur during the process
        req.flash("error", "Error creating admin");
        res.redirect("/home");
    }
});

//edit admin credentails for login
// /admin/edit
router.route('/edit')
    .get(isLoggedIn, isAdmin, (req, res) => {
        res.render("admin/passwordedit.ejs");
    })
    .post(isLoggedIn, isAdmin, async (req, res) => {
        try {
            const { username, mobile, newPassword } = req.body;
            // Find the admin user by username
            const adminUser = await User.findOne({ username: 'admin' });
            if (!adminUser) {
                req.flash("error", "Admin user not found.");
                return res.redirect("/admin");
            }
            // Update username and mobile number if provided
            if (username) adminUser.username = username;
            if (mobile) adminUser.mobile = mobile;

            // If the new password is provided, update it
            if (newPassword) {
                await adminUser.setPassword(newPassword);  // Use passport-local-mongoose method to update password
            }
            // Save updated admin user
            await adminUser.save();
            req.flash("success", "Admin details updated successfully.");
            res.redirect("/admin");
        } catch (error) {
            req.flash("error", "Failed to update admin details.");
            res.redirect("/admin");
        }
    });


// withdrawls 
// Admin views all withdrawals you will be able to mark as rejected or paid on admin-withdrawl.ejs
router.get('/withdrawals', isLoggedIn, isAdmin, async (req, res) => {
    const pendingWithdrawals = await Withdrawal.find({ status: 'pending' }).sort({ date: -1 });
    const paidWithdrawals = await Withdrawal.find({ status: 'paid' }).sort({ date: -1 });
    const rejectedWithdrawals = await Withdrawal.find({ status: 'rejected' }).sort({ date: -1 });

    res.render('admin/admin-withdrawals', { pendingWithdrawals, paidWithdrawals, rejectedWithdrawals });
});

// Admin approves the withdrawal
router.post('/withdrawals/:id/pay', isLoggedIn, isAdmin, async (req, res) => {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
        return res.status(404).send('Withdrawal request not found.');
    }

    // Mark the withdrawal as paid
    withdrawal.status = 'paid';
    await withdrawal.save();

    // Deduct the withdrawn amount from the user's balance
    const user = await User.findById(withdrawal.userId);
    if (user) {
        user.balance -= withdrawal.amount;
        await user.save();
    }

    req.flash('success', `Withdrawal of ${withdrawal.amount} for ${user.username} has been paid.`);
    res.redirect('/admin/withdrawals');
});

// Admin rejects the withdrawal
router.post('/withdrawals/:id/reject', isLoggedIn, isAdmin, async (req, res) => {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
        return res.status(404).send('Withdrawal request not found.');
    }

    // Mark the withdrawal as rejected
    withdrawal.status = 'rejected';
    await withdrawal.save();

    req.flash('error', `Withdrawal of ${withdrawal.amount} for ${withdrawal.username} has been rejected.`);
    res.redirect('/admin/withdrawals');
});

// deposits
// Admin view for approving/rejecting deposits
router.get('/pending-deposits', isLoggedIn, isAdmin, async (req, res) => {
    try {
        const pendingDeposits = await Deposit.find({ status: 'pending' }).populate('userId', 'username'); // Populate user details
        const approvedDeposits = await Deposit.find({ status: 'approved' }).populate('userId', 'username');
        const rejectedDeposits = await Deposit.find({ status: 'rejected' }).populate('userId', 'username');
        res.render('admin/admin-pending', {
            pendingDeposits,
            approvedDeposits,
            rejectedDeposits
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Admin approves or rejects deposits
router.post('/approve/:id', isLoggedIn, isAdmin, async (req, res) => {
    const depositId = req.params.id;
    const deposit = await Deposit.findById(depositId);
    deposit.status = 'approved';
    await deposit.save();

    const user = await User.findById(deposit.userId);
    user.balance += deposit.amount;
    await user.save();
    req.flash('success', `Deposit of ₹${deposit.amount} by ${deposit.username} approved.`);
    res.redirect('/admin/pending-deposits');
});

router.post('/reject/:id', isLoggedIn, isAdmin, async (req, res) => {
    const depositId = req.params.id;
    const deposit = await Deposit.findById(depositId);
    deposit.status = 'rejected';
    await deposit.save();

    req.flash('error', `Deposit of ₹${deposit.amount} by ${deposit.username} rejected.`);
    res.redirect('/admin/pending-deposits');
});

// admin will be able to edit the user info
router.get('/users', isLoggedIn, isAdmin, async (req, res) => {
    try {
        const users = await User.find();  // Fetch all users from database
        res.render('admin/users', { users });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// Edit a specific user (render edit form)
router.get('/users/edit/:id', isLoggedIn, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);  // Find user by ID
        res.render('admin/edit-user', { user });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// Handle user update
router.post('/users/edit/:id', isLoggedIn, isAdmin, async (req, res) => {
    const { username, password, phoneNumber, balance } = req.body;
    try {
        await User.findByIdAndUpdate(req.params.id, {
            username,
            password,  // You should hash the password if updating
            phoneNumber,
            balance,
        });
        res.redirect('/admin/users');  // Redirect to user list after edit
    } catch (error) {
        res.status(500).send('Server error');
    }
});
router.get('/wingobet', isLoggedIn, isAdmin, async (req, res) => {
    try {
        const results = await WingoBet.aggregate([
            {
                $group: {
                    _id: {
                        choosedBet: "$choosedBet",
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
                    },
                    totalAmount: { $sum: "$betAmount" },
                    userCount: { $addToSet: "$userId" },
                    userIds: { $push: { userId: "$userId", date: "$date" } }
                }
            },
            {
                $project: {
                    choosedBet: "$_id.choosedBet",
                    date: "$_id.date",
                    totalAmount: 1,
                    userCount: { $size: "$userCount" },
                    userIds: 1
                }
            }
        ]);
        res.render('admin/adminWingobet', { results });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});
router.get("/game-history", isLoggedIn, isAdmin, async (req, res) => {
    try {
        // Fetch all game history for the admin
        const gameHistory = await WingoBet.find({});
        // Format the date and prepare the data
        const formattedHistory = gameHistory.map(history => {
            // Format the date to dd-mm-yyyy
            const formattedDate = new Date(history.date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            return {
                userId: history.userId,  // Admin should be able to see the user ID
                betAmount: history.betAmount,
                choosedBet: history.choosedBet,
                currCycleId: history.currCycleId,
                status: history.status,
                date: formattedDate // Use the formatted date
            };
        });
        // Render the admin-game-history template with the formatted data
        res.render('admin/admin-gameHistory.ejs', { gameHistory: formattedHistory });
    } catch (error) {
        console.error('Error fetching game history for admin:', error);
        res.status(500).send('Internal Server Error');
    }
});
// Don't forget to isloogedin and isAdmin 
router.get("/dashboard",isLoggedIn,isAdmin,async(req,res)=>{
    try {
        // 1. Get today's date range (start and end of today)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);  // Start of today (00:00:00)

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);  // End of today (23:59:59)

        // 2. Aggregate the total amount of approved deposits for all users
        const totalDepositsResult = await Deposit.aggregate([
            {
                $match: {
                    status: 'approved'  // Only approved deposits
                }
            },
            {
                $group: {
                    _id: null,  // No need to group by any field
                    totalAmount: { $sum: "$amount" }  // Sum the amount field for total deposits
                }
            }
        ]);

        // 3. Aggregate today's approved deposits
        const todayDepositsResult = await Deposit.aggregate([
            {
                $match: {
                    status: 'approved',  // Only approved deposits
                    date: {
                        $gte: startOfDay,  // Greater than or equal to today's start
                        $lt: endOfDay      // Less than the end of today
                    }
                }
            },
            {
                $group: {
                    _id: null,  // No need to group by any field
                    todayAmount: { $sum: "$amount" }  // Sum the amount field for today's deposits
                }
            }
        ]);

        // 4. Aggregate the total amount of paid withdrawals for all users
        const totalWithdrawalsResult = await Withdrawal.aggregate([
            {
                $match: {
                    status: 'paid'  // Only paid withdrawals
                }
            },
            {
                $group: {
                    _id: null,  // No need to group by any field
                    totalWithdrawAmount: { $sum: "$amount" }  // Sum the amount field for total withdrawals
                }
            }
        ]);

        // 5. Aggregate today's paid withdrawals
        const todayWithdrawalsResult = await Withdrawal.aggregate([
            {
                $match: {
                    status: 'paid',  // Only paid withdrawals
                    date: {
                        $gte: startOfDay,  // Greater than or equal to today's start
                        $lt: endOfDay      // Less than the end of today
                    }
                }
            },
            {
                $group: {
                    _id: null,  // No need to group by any field
                    todayWithdrawAmount: { $sum: "$amount" }  // Sum the amount field for today's withdrawals
                }
            }
        ]);

        // 6. Count total number of users
        const totalUsersCount = await User.countDocuments({});

        // 7. If there are no deposits or withdrawals, default amounts to 0
        const totalAmount = totalDepositsResult.length > 0 ? totalDepositsResult[0].totalAmount : 0;
        const todayAmount = todayDepositsResult.length > 0 ? todayDepositsResult[0].todayAmount : 0;
        const totalWithdrawAmount = totalWithdrawalsResult.length > 0 ? totalWithdrawalsResult[0].totalWithdrawAmount : 0;
        const todayWithdrawAmount = todayWithdrawalsResult.length > 0 ? todayWithdrawalsResult[0].todayWithdrawAmount : 0;

        // 8. Pass all calculated values to the EJS template
        res.render("admin/dashboard.ejs", {
            totalAmount,         // Total approved deposits
            todayAmount,         // Today's approved deposits
            totalWithdrawAmount, // Total paid withdrawals
            todayWithdrawAmount,  // Today's paid withdrawals
            totalUsersCount      // Total number of users
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// edit the telegram and qrcodeurl
router.route("/info")
.get(isLoggedIn,isAdmin,async(req,res)=>{
    try {
        const info = await Info.findOne(); // Fetch the existing Info document
        if (!info) {
            return res.status(404).render('error', { message: 'Info not found' });
        }
        res.render('admin/info.ejs', { info });
    } catch (error) {
        console.error('Error fetching info:', error);
        res.status(500).render('error', { message: 'Internal server error' });
    }
})
.put(isLoggedIn,isAdmin,async (req, res) => {
    const { telegramLink, qrCodeLink } = req.body;
    try {
        const updatedInfo = await Info.findOneAndUpdate(
            {},
            { telegramLink, qrCodeLink },
            { new: true } // Return the updated document
        );
        if (!updatedInfo) {
            return res.status(404).json({ message: 'Info not found' });
        }
        req.flash("success","updated successfully!🎁");
        res.redirect("/admin/info") // Send the updated info as JSON
    } catch (error) {
        console.error('Error updating info:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get("/",isLoggedIn,isAdmin,(req,res)=>{
    res.render("admin/admin.ejs");
});


module.exports = router;
