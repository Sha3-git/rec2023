const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const session = require('express-session');
const fs = require('fs');
const cors = require('cors');
const app = express();



const User = require('./models/user.js');
const Budget = require('./models/budget.js')
var user_id;
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
        user_id = user._id.toString();
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
  app.get('/Budget', async (req, res) => {
    try {
      // Find the user's budget based on the user_id
      const userBudget = await Budget.findOne({ user_id });
  
      if (userBudget) {
        // Calculate the sums of "Wants," "Needs," and "Expenses"
        const sumWants = calculateCategorySum(userBudget.want);
        const sumNeeds = calculateCategorySum(userBudget.need);
        const sumExpenses = calculateCategorySum(userBudget.expense);


        // Render the "budget" view with the data, including the sums
        res.render("budget", {
          user_id: user_id,
          budgetData: userBudget,
          sumWants: sumWants,
          sumNeeds: sumNeeds,
          sumExpenses: sumExpenses,
        });
      } else {
        // Handle the case where the user's budget does not exist
        res.render("budget", { user_id: user_id, budgetData: null });
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  
  app.get('/Year', async (req, res) => {
    try {
      // Find the user's budget based on the user_id
      const userBudget = await Budget.findOne({ user_id });
  
      if (userBudget) {
        // Calculate the sums of "Wants," "Needs," and "Expenses"
        const sumWants = calculateCategorySum(userBudget.want);
        const sumNeeds = calculateCategorySum(userBudget.need);
        const sumExpenses = calculateCategorySum(userBudget.expense);


        // Render the "budget" view with the data, including the sums
        res.render("year", {
          user_id: user_id,
          budgetData: userBudget,
          sumWants: sumWants,
          sumNeeds: sumNeeds,
          sumExpenses: sumExpenses,
        });
      } else {
        // Handle the case where the user's budget does not exist
        res.render("year", { user_id: user_id, budgetData: null });
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  
  // Function to calculate the sum of amounts within a category
  function calculateCategorySum(category) {
    return category.reduce((acc, item) => acc + item.amount, 0);
  }
  
app.get('/Edit', (req, res)=>{
    console.log(user_id)
    res.render("budgetEdit", {user_id: user_id})
});


app.post('/want', (req, res)=>{
    const newWant = {
        name: req.body.wantName,
        amount: req.body.wantAmount,
        card: req.body.wantCard,
        month: req.body.wantMonth
    };
    insertNewWant(user_id, newWant)
    res.render("budgetEdit", {user_id: user_id})
    console.log(user_id)
} )

async function insertNewWant(user_id, wantData) {
    try {
        // Check if a budget with the user_id exists
        let budget = await Budget.findOne({ user_id });

        if (!budget) {
            // If a budget does not exist, create a new budget object
            budget = new Budget({ user_id, want: [], expense:[], need:[] });
        }

        // Push the new "want" object into the "want" array
        budget.want.push(wantData);

        // Save the budget document
        await budget.save();
        console.log("New want inserted successfully.");
    } catch (error) {
        console.error("Error:", error);
    }
}

// Route for adding a new "need"
app.post('/need', (req, res) => {
    const newNeed = {
      name: req.body.needName,
      amount: req.body.needAmount,
      card: req.body.needCard,
      month: req.body.needMonth
    };
    insertNewNeed(user_id, newNeed);
    res.render("budgetEdit", { user_id: user_id });
    console.log(user_id);
  });
  
  // Route for adding a new "expense"
  app.post('/expense', (req, res) => {
    const newExpense = {
      name: req.body.expenseName,
      amount: req.body.expenseAmount,
      card: req.body.expenseCard,
      month: req.body.expenseMonth
    };
    insertNewExpense(user_id, newExpense);
    res.render("budgetEdit", { user_id: user_id });
    console.log(user_id);
  });
  
  async function insertNewNeed(user_id, needData) {
    try {
      // Check if a budget with the user_id exists
      let budget = await Budget.findOne({ user_id });
  
      if (!budget) {
        // If a budget does not exist, create a new budget object
        budget = new Budget({ user_id, want: [], need: [], expense:[] });
      }
  
      // Push the new "need" object into the "need" array
      budget.need.push(needData);
  
      // Save the budget document
      await budget.save();
      console.log("New need inserted successfully.");
    } catch (error) {
      console.error("Error:", error);
    }
  }
  
  async function insertNewExpense(user_id, expenseData) {
    try {
      // Check if a budget with the user_id exists
      let budget = await Budget.findOne({ user_id });
  
      if (!budget) {
        // If a budget does not exist, create a new budget object
        budget = new Budget({ user_id, want: [], need: [], expense: [] });
      }
  
      // Push the new "expense" object into the "expense" array
      budget.expense.push(expenseData);
  
      // Save the budget document
      await budget.save();
      console.log("New expense inserted successfully.");
    } catch (error) {
      console.error("Error:", error);
    }
  }
  