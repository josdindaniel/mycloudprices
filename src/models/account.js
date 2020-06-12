/* 
Model: Account
Information about the account in the database
*/
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const { Schema } = mongoose;

// Schema: account
const accountSchema = new Schema({
    name: {type: String, required: true, trim: true},
    lastname: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true},
    status: { type: Boolean, required: true, trim: true, default: true },
    role: { type: Number, required: true, trim: true, default: 1 },
    password: { type: String, required: true, trim: true },
    creation: { type: Date, default: Date.now },
    idaccount: { type: String, trim: true, default: "" },
    main: { type: Number, required: true, trim: true, default: 0 }
});

// Method: Encrypt the Password
accountSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

// Method: Validate the Password
accountSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password,this.password);
}

module.exports = mongoose.model('account',accountSchema)