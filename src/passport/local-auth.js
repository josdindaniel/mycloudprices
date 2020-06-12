const passport = require('passport');   
const LocalStrategy = require('passport-local').Strategy;
const Account = require('../models/account');

passport.serializeUser((account,done) => {
    done(null, account.id);
});

passport.deserializeUser(async (id, done) => {
    const account = await Account.findById(id);
    done(null, account);
});

// Strategy for Signup
passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {

    const account = await Account.findOne({email: email});
    if (account) {
        return done(null,false, req.flash('signupMessage','The email is already taken.'));
    } else {
        const newAccount = new Account();
        //console.log(req.body);
        newAccount.name = req.body.firstname;
        newAccount.lastname = req.body.lastname;
        newAccount.company = req.body.company;
        newAccount.country = req.body.country;
        newAccount.email = email;
        newAccount.password = newAccount.encryptPassword(password);
        newAccount.main = 1;
        await newAccount.save();
        console.log(newAccount);
        console.log(newAccount.id);
        await Account.findByIdAndUpdate(newAccount.id, { idaccount: newAccount.id});
        done(null, newAccount, req.flash('signupMessage', 'Welcome to MyCloudPrices, you have registered successfully!.'));
    }
}));

// Strategy for Signin
passport.use('local-signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
        const account = await Account.findOne({ email: email });
        if (!account) {
            return done(null, false, req.flash('signinMessage', 'No Account found, try again.'));
        }
        if (account.status == false) {
            return done(null, false, req.flash('signinMessage', 'Inactive user, contact the administrator and try again.'));
        }
        if (!account.comparePassword(password)) {
            return done(null, false, req.flash('signinMessage', 'Incorrect Password, try again.'));
        }
        done(null, account, req.flash('signinMessage', 'Welcome to MyCloudPrices!'))
}));