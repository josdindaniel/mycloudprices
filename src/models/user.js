/* 
Model: User
Information about the users in the database
*/
const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const { Schema } = mongoose;

// Schema: user
const userSchema = new Schema({
    name: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true, trim: true },
    status: { type: Boolean, required: true, trim: true },
    role: { type: Number, required: true, trim: true },
    creation: { type: Date, default: Date.now }
});

// Method: Encrypt the Password
userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

// Method: Validate the Password
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('user', userSchema)