require('dotenv').config();
const express = require("express");
const app = express();
const path = require('path'); 
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));


app.get("/",(req,res)=>{
    res.redirect("/home");
});
app.get("/home",(req,res)=>{
res.render("home/index.ejs");
})

app.get("/login",(req,res)=>{
    res.render("accounts/login.ejs");
})
app.get("/register",(req,res)=>{
    res.render("accounts/register.ejs");
})
app.get("/about",(req,res)=>{
    res.render("conditions/about.ejs");
})

app.listen(port,()=>{
console.log(`http://localhost:${port}`);
});