/* 
Model: Tax
Information about the tax
*/
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const { Schema } = mongoose;

// Schema: user
const pricingSchema = new Schema({
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    template: { type: Number, required: true, trim: true },
    region: { type: Number, required: true, trim: true },
    user: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    os: { type: Number, required: true, trim: true },
    instance: { type: String, required: true, trim: true },
    storage: { type: Number, required: true, trim: true },
    s3: { type: Number, required: true, trim: true },
});

module.exports = mongoose.model('pricing', pricingSchema)