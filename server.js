const express = require("express");
require("dotenv").config();
const path = require('path');
const playlistRoute = require("./routes/playlist");
const segmentRoute = require("./routes/segment");

const app = express();
//app.use(express.static('.'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // views folder path
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use("/", playlistRoute);
app.use("/", segmentRoute);

// Root
app.get("/", (req, res) => {
 // res.send(`<h1>Livetvapp<h1><h3>satring the server </h3> `);
  //res.sendFile('index.html', { root: '.' });
  
    res.render('index.ejs', { title: 'Hello EJS', message: 'Welcome to Node.js + EJS!' });


  
});
app.get("streams",(req,res)=>{
res.render("brawse.ejs");

});
app.get("/start",(req,res)=>{
 res.render("start.ejs");
});

app.get("/*", (req,res)=>{
res.send(`<h1>NOT FOUND </h1> <strong>চেষ্টা করলে অবশ্যই সফল হওয়া যায়।</strong><br>
<strong>If you try, you can definitely succeed.</strong><br>
<strong>Agar prayaas kiya jaaye, to nishchit roop se safalta milti hai.</strong><br>
`);

});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
