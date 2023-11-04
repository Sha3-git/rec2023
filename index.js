const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const session = require('express-session');
const fs = require('fs');
const cors = require('cors');
const app = express();



const User = require('./models/user.js');
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + "/public/"));
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

const port = 3000;


mongoose.connect(process.env.MONGO_URI);

app.listen (port, () => {
    //template literal
   console.log (`Server is running on http://localhost:${port}`);
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/index.html');
});

app.get('/Login', (req, res)=>{
    res.sendFile(__dirname + '/src/login.html');
})

app.get('/Signup', (req, res)=>{
    res.sendFile(__dirname + '/src/signup.html');
})

app.post('/signupauth', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const cpassword = req.body.cpassword;
  
    // Check if any of the fields are empty
    if (email.length <= 0 || password.length <= 0 || cpassword.length <= 0) {
      res.redirect("Signup");
    } else if (password !== cpassword) {
      // Check if passwords don't match
      res.redirect("Signup");
    } else {
      try {
        // Check if the email already exists in the database
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
          // Redirect to Signup page with an error message
          res.redirect("Signup");
        } else {
          // Create the user if email is not a duplicate
          await User.create({
            email: email,
            password: password
          });
          res.redirect("Login");
        }
      } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
      }
    }
  });

  app.post('/loginauth', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  
    try {
      // Check if a user with the provided email and password exists
      const user = await User.findOne({ email: email, password: password });
  
      if (user) {
        // Redirect to the '/budget' page upon successful login
        res.redirect('/Budget');
      } else {
        // Redirect to a login error page or the login page with an error message
        res.redirect('/login');
      }
    } catch (err) {
      console.error("Error:", err);
      res.status(500).send("Internal Server Error");
    }
  });
app.get('/Budget', (req, res)=>{
    res.render("budget")
})