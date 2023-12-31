const mongoose = require ('mongoose');

const budgetSchema = new mongoose.Schema({
    user_id: String,
    credit: [{amount: Number, year: String, month: String}],
    debit: [{amount: Number, year: String, month: String}],
    want: [{name: String, amount: Number, card: String, month: String, year:String}],
    need: [{name: String, amount: Number, card: String, month: String, year:String}],
    expense: [{name: String, amount: Number, card: String, month: String, year:String}]
})

const budget = new mongoose.model('budget', budgetSchema)
module.exports = budget;