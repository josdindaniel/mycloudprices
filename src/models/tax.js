/* 
Model: Tax
Information about the tax
*/
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const { Schema } = mongoose;

// Schema: user
const userSchema = new Schema({
    country: { type: String, required: true, trim: true },
    wht: { type: Number, required: true, trim: true }
});

module.exports = mongoose.model('tax', userSchema)