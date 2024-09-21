require('dotenv').config();
const express = require("express");
const app = express();
const path = require('path');
const session = require("express-session");
const passport = require("passport");
const flash = require('connect-flash');
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const { isLoggedIn } = require("./middleware.js");
const mongoose = require('mongoose');
const userRouter = require("./routes/user.js");
const mainRouter = require("./routes/main.js")
const WebSocket = require('ws');
const { startWebSocketServer, saveCycleToDB } = require('./wsServer');
const { startTimer, timeLeft, cycleCount, currentCycleId } = require('./timer');
const port = process.env.PORT || 3000;
const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
}
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.json()); // to parse JSON data
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded form data

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(flash());
// Middleware to make flash messages available in all views
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});
// req will be available on ejs 
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

// MongoDB connection
// mongoose.connect('mongodb://localhost:27017/bigmumbai')
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// routes 
app.use("/", userRouter);

// Start WebSocket server
const wss = startWebSocketServer(8080);

// Start the server-side timer
startTimer(wss, saveCycleToDB);

app.get("/", (req, res) => {
    res.redirect("/home");
});
app.get("/home", (req, res) => {
    res.render("home/index.ejs");
});

app.get("/wingo", isLoggedIn, (req, res) => {
    res.render("games/wingo.ejs", { timeLeft, cycleCount, cycleId: currentCycleId })
});
app.get("/activity", isLoggedIn, (req, res) => {
    res.render("activity/activity.ejs")
});

app.get("/wallet", isLoggedIn, (req, res) => {
    res.render("wallet/wallet.ejs");
});
app.use("/main",mainRouter);

app.get("/promotion", isLoggedIn, (req, res) => {
    res.render("promotion/promotion.ejs");
});

app.get("/about", (req, res) => {
    res.render("conditions/about.ejs");
});

// Middleware to check if user is admin
function isAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    req.flash('success', 'You do not have permission to access this page.');
    return res.redirect('/home');
}
// admin 
app.get("/admin/create",(req,res)=>{
    try {
        const createAdmin = async () => {
            const adminUser = new User({ username: 'admin', mobile: '1234567890', isAdmin: true });
            await User.register(adminUser, 'Prince@9876');  // Register admin with password
        };
        createAdmin();
        res.redirect("/home");
    } catch (e) {
        res.flash("success", "admin exists");
        res.redirect("/home");
    }
});
//edit admin credentails for login
app.get("/admin/edit",isAdmin,(req,res)=>{
    res.render("admin/passwordedit.ejs");
})
app.post("/admin/edit",isAdmin, async (req, res) => {
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

//admin page
// app.get("/admin",isAdmin,(req,res)=>{
app.get("/admin",(req,res)=>{
res.render("admin/admin.ejs");
});
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});