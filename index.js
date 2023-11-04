const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const session = require('express-session');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.set('view engine', 'ejs');
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
app.listen (port, () => {
    //template literal
   console.log (`Server is running on http://localhost:${port}`);
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/index.html');
});
