const mongoose = require ('mongoose');

const budgetSchema = new mongoose.Schema({
    user_id: String,
    want: [{name: String, amount: Number, card: String, month: String}],
    need: [{name: String, amount: Number, card: String, month: String}],
    expense: [{name: String, amount: Number, card: String, month: String}]
})

const budget = new mongoose.model('budget', budgetSchema)
module.exports = budget;