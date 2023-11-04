const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // This enforces uniqueness for the 'email' field
      },
    password: String
});

const user = new mongoose.model('user', userSchema)
module.exports = user;