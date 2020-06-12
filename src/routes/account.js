const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isAuthenticated } = require('../helper/auth');
const Account = require('../models/account');

router.get('/signup', (req, res, next) => {
    res.render('signup');
});

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/account',
    failureRedirect: '/signin',
    passReqToCallback: true
}));

router.get('/signin', (req, res, next) => {
    res.render('signin');
});

router.post('/signin', passport.authenticate('local-signin', {
    successRedirect: '/account',
    failureRedirect: '/signin',
    passReqToCallback: true
}));

router.get('/logout', (req, res, next) => {
    req.logout();
    req.flash('LogoutMessage', 'Your session has been finalized.');
    res.redirect('/signin');
});

router.get('/account', isAuthenticated, (req, res, next) => {
    res.render('account');
});

router.post('/update-account', isAuthenticated, async (req, res, next) => {
    const { idd, firstname, lastname, email, company, country, password, password2 } = req.body;
    if (!password.length > 0 && !password2.length > 0) {        
        await Account.findByIdAndUpdate(idd, { name: firstname, lastname, company, country });
        req.flash('updateUserMessage', 'The user has been updated correctly.');
        res.redirect("/account");
    }
    const account = new Account();
    if (password.length > 0) {
        await Account.findByIdAndUpdate(idd, { name: firstname, lastname, company, country, password: account.encryptPassword(password) });
        req.flash('updateUserMessage', 'The user and password has been updated correctly.');
        res.redirect("/account");   
    }
}); 

module.exports = router;