require('dotenv').config();
const express = require("express");
const app = express();
const path = require('path');
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require('method-override');
const Cycle = require('./models/cycle');
const Info = require('./models/Info');
const WingoBetResult = require('./models/WingoBetResult');
const passport = require("passport");
const flash = require('connect-flash');
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const resetResultDb = require('./utils/resetResultDb');
const { isLoggedIn } = require("./middlewares/isLoggedIn.js");
const mongoose = require('mongoose');
const signupRouter = require("./routes/signup.js");
const adminRouter = require("./routes/admin.js");
const wingoRouter = require("./routes/wingo.js");
const isAdmin = require('./middlewares/isAdmin.js');
const Wingo3Bet = require('./models/wingo3bet');
const loginRouter = require("./routes/login.js");
const mainRouter = require("./routes/main.js");
const dbUrl = process.env.MONGO_URL;
const initializeDefaultData = require('./utils/initializeData');
const fetchCurrentCycleData = require('./utils/fetchCurrentCycleData');
const WebSocket = require('ws');
const { startWebSocketServer, saveCycleToDB } = require('./wsServer');
const { startTimer, timeLeft, cycleCount, currentCycleId } = require('./timer');
const { calculateResultTime } = require('./utils/calculateResultTime');
const port = process.env.PORT || 3000;
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600,
});
store.on("error", (err) => {
    console.log("Error in mongo session store", err);
})
const sessionOptions = {
    store,
    secret: process.env.SECRET,
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
app.use(flash());
app.use(express.static('public'));
app.use(express.json()); // to parse JSON data
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded form data
app.use(methodOverride('_method'));

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


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
mongoose.connect(dbUrl)
    .then(async () => {
        console.log('Connected to MongoDB');
        resetResultDb();
        initializeCycle();
        await initializeDefaultData();
    })
    .catch(err => console.error("MongoDB connection error:", err));

// wingo One Minute Result Edit 
app.get("/admin/wingooneresult", isLoggedIn, isAdmin, (req, res) => {
    let resultStatus="";
    res.render("admin/wingoOneResult.ejs",{resultStatus});
})
app.post("/admin/wingooneresult", isLoggedIn, isAdmin, async (req, res) => {
    const { color, size, selectedNumber } = req.body;
    // Check for missing fields
    if (!color || !size || !selectedNumber) {
        req.flash("error", "Missing fields");
        console.log("missing fields");
        return res.redirect("/admin/wingooneresult");
    }
    try {
        // Fetch the current cycle data
        const cycleData = await fetchCurrentCycleData();
        if (!cycleData) {
            req.flash("error", "No active cycle found");
            return res.redirect("/admin/wingooneresult");
        }
        const { cycleId, createdAt } = cycleData;
        const currentTime = new Date();
        const elapsedTime = currentTime - createdAt; // Time in milliseconds
        // If the request is made after 28 seconds
        if (elapsedTime > 28 * 1000) {
            // Check if the result for this cycle already exists in the database
            const existingResult = await WingoBetResult.findOne({ currCycleId: cycleId });
            if (existingResult) {
                console.log("you are late result has been declared");
                req.flash("error", "Result for this cycle has already been declared");
                return res.redirect("/admin/wingooneresult"); // Redirect to home if result already exists
            } else {
                console.log('able to apply your result')
                // 28 seconds have passed, and no result exists yet, allow declaring the result
                req.flash("success", `You can now declare the result for cycle ${cycleId}`);
                return res.redirect("/admin/wingooneresult"); // Redirect to result declaration page
            }
        } else {
            // If the request is made before 28 seconds, process and fetch relevant bets
            const upperLimit = new Date(createdAt.getTime() + 25 * 1000); // Limit bet time to 25 seconds
            // Fetch bets within the first 25 seconds of the current cycle
            const WingoThreeBet = await Wingo3Bet.find({
                date: {
                    $gt: createdAt,
                    $lte: upperLimit
                }
            });

            // Create the result for the current cycle
            const result = await WingoBetResult.create({
                bigSmallResult: size, // Assuming 'size' corresponds to 'bigSmallResult'
                numberResult: selectedNumber, // Assuming 'selectedNumber' corresponds to 'numberResult'
                colorResult: color, // Assuming 'color' corresponds to 'colorResult'
                currCycleId: cycleId
            });

            // Calculate the remaining time to wait for 29 seconds
            const remainingTime = 28 * 1000 - elapsedTime;

            // Log when the `addMoney` function will be triggered
            
            // Run the `addMoney` function after 29 seconds if the request was made before 28 seconds
            setTimeout(async () => {
                await addMoney(WingoThreeBet);
                console.log("Bets processed and money added.");
            }, remainingTime);
            
            let resultStatus = `addMoney will ${cycleId} after ${remainingTime} ms <br> You bets have been registered. Results will be processed shortly`;
            console.log("sucessfuly process your bets",result);
            req.flash("success", "Your bets have been registered. Results will be processed shortly.");
            return res.redirect("/admin/wingooneresult",{resultStatus});
        }
    } catch (error) {
        console.error("Error processing the result:", error);
        req.flash("error", "An error occurred while processing the request.");
        return res.redirect("/admin/wingooneresult");
    }
});


// routes 
app.use("/signup", signupRouter);
app.use("/login", loginRouter);
app.use("/admin", adminRouter);

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

app.use("/wingo", wingoRouter);//wingo game and bet request
async function initializeCycle() {
    try {
        // Check if any cycles exist in the database
        const existingCycle = await Cycle.findOne();
        if (existingCycle) {
            await Cycle.deleteMany({});
        }
        // Create the first cycle with the format YYYYMMDD01
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const initialCycleId = `${year}${month}${day}01`;
        // Create and save the initial cycle
        const newCycle = new Cycle({
            cycleId: initialCycleId,
            createdAt: now
        });
        await newCycle.save();
        // Start the cycle result handling process after initializing the cycle
        // it will only fire handlecylceresult when admin hasn't sent any result 
        handleCycleResult();
    } catch (error) {
        console.error('Error during cycle initialization:', error);
    }
}


// Function to declare the game result
async function declareGameResult(cycleId) {
    let WingoThreebet;
    try {
        // Fetch result from resultRule
        const result = await WingoBetResult.findOne({ currCycleId: cycleId });
        if (!result) {
            console.log(cycleId, "result doesn't exist")
            const rule = await resultRule(); // Assuming resultRule returns { numberResults, colorResults, sizeResults }
            // Extract the arrays from the rule object
            const { numberResults, colorResults, sizeResults, WingoThreeBet } = rule;
            WingoThreebet = WingoThreeBet;
            // Utility function to select a result
            function selectResult(resultsArray) {
                // Find all results with 0 bet amount
                const zeroAmountResults = resultsArray.filter(res => res.totalAmount === 0);
                if (zeroAmountResults.length > 0) {
                    // Randomly select one from the zeroAmountResults
                    return zeroAmountResults[Math.floor(Math.random() * zeroAmountResults.length)].choosedBet;
                } else {
                    // Otherwise, find the result with the least bet amount
                    return resultsArray.reduce((min, current) => {
                        return (min.totalAmount < current.totalAmount) ? min : current;
                    }).choosedBet;
                }
            }
            // Select the result for each category using the utility function
            numberResult = selectResult(numberResults);
            colorResult = selectResult(colorResults);
            bigSmallResult = selectResult(sizeResults);
            // Save the result to the database
            const result = await WingoBetResult.create({
                bigSmallResult,
                numberResult,
                colorResult,
                currCycleId: cycleId
            });
            await addMoney(WingoThreeBet);
        }
        // Notify clients of the result
        console.log("let's notify the clients")
        notifyClients(); // Your WebSocket or client notification logic
    } catch (error) {
        // Function to generate a random number between 1 and 3
        function getRandomNumber1To3() {
            return Math.floor(Math.random() * 3) + 1; // Generates 1, 2, or 3
        }
        // Function to generate a random number between 1 and 2
        function getRandomNumber1To2() {
            return Math.floor(Math.random() * 2) + 1; // Generates 1 or 2
        }
        // Function to generate a random number between 0 and 9
        function getRandomNumber0To9() {
            return Math.floor(Math.random() * 10); // Generates 0 to 9
        }
        const random1To3 = getRandomNumber1To3();
        const random1To2 = getRandomNumber1To2();
        // declare variables 
        let bigSmallResult = (random1To2 === 2) ? 'big' : 'small';
        let numberResult = getRandomNumber0To9();// Default
        let colorResult;   // Default
        // Example usage
        switch (random1To3) {
            case 1:
                colorResult = 'red';
                break;
            case 2:
                colorResult = 'green';
                break;
            case 3:
                colorResult = 'violet';
                break;
            default:
                colorResult = 'yellow'; // Fallback, if needed
        }

        const result = await WingoBetResult.create({
            bigSmallResult,
            numberResult,
            colorResult,
            currCycleId: cycleId
        });
        if (WingoThreebet) {
            await addMoney(WingoThreebet);
        }
        notifyClients();
    }
}
async function addMoney(WingoThreeBet) {  //let's write amount adding processor now 
    const latestResult = await WingoBetResult.findOne().sort({ date: -1 });
    if (latestResult) {
        bets = WingoThreeBet;
        if (bets) {
            console.log("bets is " + bets);
            calculateWinnings(bets, latestResult);
        }
    }
}

// winning calculation function 
// Function to calculate winnings based on the latest result
async function calculateWinnings(bets, latestResult) {
    try {
        console.log(bets)

        for (const bet of bets) {
            const userId = bet.userId;
            const betAmount = bet.betAmount;
            let winnings = 0;

            // Check for big/small result
            if (bet.choosedBet === latestResult.bigSmallResult) {
                winnings += betAmount * 2; // 2x if big/small matches
            }

            // Check for color result
            if (bet.choosedBet === latestResult.colorResult) {
                winnings += betAmount * 2; // 2x if color matches
            }

            // Check for number result
            if (bet.choosedBet === latestResult.numberResult.toString()) {
                winnings += betAmount * 9; // 9x if number matches
            }
            // Step 4: Update user balance and bet status
            if (winnings > 0) {
                await User.findByIdAndUpdate(userId, { $inc: { balance: winnings } });
                await Wingo3Bet.findByIdAndUpdate(bet._id, { status: 'won' });
            } else {
                await Wingo3Bet.findByIdAndUpdate(bet._id, { status: 'lost' });
            }

            console.log(`User ${userId} updated: ${winnings > 0 ? 'Won' : 'Lost'}, Balance: ${winnings}`);
        }
    } catch (error) {
        console.error('Error calculating winnings:', error);
    }
}


function notifyClients() {
    WingoBetResult.find({})
        .sort({ currCycleId: -1 }) // Sort by currCycleId in descending order
        .limit(10) // Limit the results to 10
        .then(recentResults => {
            // Send to all clients
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(recentResults)); // Send recent results
                }
            });
        })
        .catch(err => {
            console.error("Error fetching recent results for clients:", err);
        });
}

app.get("/result", (req, res) => {
    res.render("temp.ejs");
})



// Main function to handle automatic result generation and cycle checking
function handleCycleResult() {
    fetchCurrentCycleData()
        .then(cycle => {
            if (!cycle) {
                console.error('No cycle data found');
                return;
            }
            const { cycleId, createdAt } = cycle;
            const resultTime = calculateResultTime(createdAt);
            const delay = resultTime - new Date(); // Time until result should be declared
            console.log(`Result will be declared for cycle ${cycleId} at ${resultTime}`);
            // Wait until the result declaration time
            setTimeout(() => {
                // Declare the result for the current cycle
                declareGameResult(cycleId);
                // Wait 5 seconds after declaring result to confirm next cycle has started
                setTimeout(() => {
                    // console.log(`Checking for the next cycle after 5 seconds...`);
                    // Check for the next cycle after 5 seconds
                    handleCycleResult(); // Recursive call to handle the next cycle
                }, 5000); // Wait 5 seconds to confirm next cycle
            }, delay); // Delay until result declaration
        })
        .catch(err => {
            console.error('Error fetching cycle data:', err);
        });
}

//result fetcher 
async function resultRule() {
    try {
        // Fetch the current cycle data to get createdAt
        const cycleData = await fetchCurrentCycleData();
        const createdAt = cycleData.createdAt;
        // Reset the global variable
        // Calculate the upper limit for the date range (createdAt + 25 seconds)
        const upperLimit = new Date(createdAt.getTime() + 25 * 1000);
        // console.log("Fetching bets created after:", createdAt, "and before:", upperLimit);

        // Fetch WingoThreeBet records within the specified date range
        const WingoThreeBet = await Wingo3Bet.find({
            date: {
                $gt: createdAt,
                $lte: upperLimit
            }
        });

        // console.log("Fetched WingoThreeBet records:", WingoThreeBet);

        if (WingoThreeBet.length === 0) {
            return null;
        }
        // Store 

        // Arrays to track bet amounts for numbers, colors, and sizes
        const numberBetTracker = {
            '0': 0, '1': 0, '2': 0, '3': 0, '4': 0,
            '5': 0, '6': 0, '7': 0, '8': 0, '9': 0
        };
        const colorBetTracker = { 'red': 0, 'green': 0, 'violet': 0 };
        const sizeBetTracker = { 'big': 0, 'small': 0 };

        // Count the total amounts placed on each type of bet
        WingoThreeBet.forEach(bet => {
            const chosenBet = bet.choosedBet;
            const betAmount = bet.betAmount;

            // Track number bets
            if (numberBetTracker.hasOwnProperty(chosenBet)) {
                numberBetTracker[chosenBet] += betAmount;
            }

            // Track color bets
            if (colorBetTracker.hasOwnProperty(chosenBet)) {
                colorBetTracker[chosenBet] += betAmount;
            }

            // Track size bets
            if (sizeBetTracker.hasOwnProperty(chosenBet)) {
                sizeBetTracker[chosenBet] += betAmount;
            }
        });

        // Arrays to store the results
        const numberResults = [];
        const colorResults = [];
        const sizeResults = [];

        // Process number bets
        for (const [bet, totalAmount] of Object.entries(numberBetTracker)) {
            if (totalAmount === 0) {
                numberResults.push({ choosedBet: bet, totalAmount: '0' });
            } else {
                numberResults.push({ choosedBet: bet, totalAmount });
            }
        }

        // Process color bets
        for (const [bet, totalAmount] of Object.entries(colorBetTracker)) {
            if (totalAmount === 0) {
                colorResults.push({ choosedBet: bet, totalAmount: '0' });
            } else {
                colorResults.push({ choosedBet: bet, totalAmount });
            }
        }

        // Process size bets
        for (const [bet, totalAmount] of Object.entries(sizeBetTracker)) {
            if (totalAmount === 0) {
                sizeResults.push({ choosedBet: bet, totalAmount: '0' });
            } else {
                sizeResults.push({ choosedBet: bet, totalAmount });
            }
        }
        // Log the results in three arrays
        // console.log("Number bet results:", numberResults);
        // console.log("Color bet results:", colorResults);
        // console.log("Size bet results:", sizeResults);
        return {
            numberResults,
            colorResults,
            sizeResults,
            WingoThreeBet
        };

    } catch (error) {
        // console.error('Error:', error);
        return null;
    }
}


app.get("/activity", isLoggedIn, (req, res) => {
    res.render("activity/activity.ejs");
});

app.get("/wallet", isLoggedIn, (req, res) => {
    const balance = req.user.balance;
    res.render("wallet/wallet.ejs", { balance });
});
// main router 
app.use("/main", mainRouter);

app.get("/promotion", isLoggedIn, (req, res) => {
    res.render("promotion/promotion.ejs");
});
app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you have been loged out");
        res.redirect("/home");

    })
});

app.get("/help", async (req, res) => {
    try {
        const info = await Info.findOne(); // Fetch the Info document
        if (!info) {
            return res.status(404).render('error', { message: 'Info not found' });
        }
        const telegramLink = info.telegramLink;
        res.render("help/help-center.ejs", { telegramLink });
    } catch (error) {
        console.error('Error fetching QR code:', error);
        res.status(500).render('error', { message: 'Internal server error' });
    }
});

app.get("/about", (req, res) => {
    res.render("conditions/about.ejs");
});

app.all("*", (req, res) => {
    res.redirect("/home");
})


app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
