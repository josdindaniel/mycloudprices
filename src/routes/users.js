const express = require('express');
const router = express.Router();
const Account = require('../models/account');

router.get('/user', isAuthenticated, async (req, res, next) => {
    if (req.user.role != 1 ) {
        req.flash('RoleMessageWarning', 'You do not have sufficient permissions to execute this action.');
        res.redirect('/account');
    }else{
        const users = await Account.find({ idaccount: req.user.idaccount, main: 0 });
        res.render('user', { users });
    }
    
});

router.get('/new-user', isAuthenticated, async (req, res, next) => {
    if (req.user.role != 1) {
        req.flash('RoleMessageWarning', 'You do not have sufficient permissions to execute this action.');
        res.redirect('/account');
    } else {
        res.render('new-user');
    }
});

router.post('/new-user', isAuthenticated, async (req, res, next) => {
    if (req.user.role != 1) {
        req.flash('RoleMessageWarning', 'You do not have sufficient permissions to execute this action.');
        res.redirect('/account');
    } else {
        const { firstname, lastname, email, password, role } = req.body;
        var { status } = req.body;
        if (status == null) {
            status = false;
        } else if (status == "on") {
            status = true;
        }

        const account = await Account.findOne({ email: email });
        if (account) {
            req.flash('newUserMessageWarning', 'The user ' + email + ' already exists. Try another email.');
            req.flash('infoFirstName', firstname);
            req.flash('infoLastName', lastname);
            req.flash('infoEmail', email);
            req.flash('infoRole', role);
            req.flash('infoStatus', status);
            res.redirect('/new-user')
        } else {
            const newAccount = new Account();
            newAccount.name = req.body.firstname;
            newAccount.lastname = req.body.lastname;
            newAccount.company = req.user.company;
            newAccount.country = req.user.country;
            newAccount.email = email;
            newAccount.status = status;
            newAccount.role = role;
            newAccount.password = newAccount.encryptPassword(password);
            newAccount.idaccount = req.user.idaccount;
            console.log(req.body);
            console.log(req.user.idaccount);
            await newAccount.save();
            req.flash('newUserMessage', 'The user ' + email + ' has been created correctly.');
            res.redirect('/user')
        }
    }
});

router.get('/edit-user/:id', isAuthenticated, async (req, res, next) => {
    if (req.user.role != 1) {
        req.flash('RoleMessageWarning', 'You do not have sufficient permissions to execute this action.');
        res.redirect('/account');
    } else {
        const account = await Account.findById(req.params.id);
        res.render('edit-user', { account });
    }
});

router.put('/edit-user/:id', isAuthenticated, async (req, res, next) => {
    if (req.user.role != 1) {
        req.flash('RoleMessageWarning', 'You do not have sufficient permissions to execute this action.');
        res.redirect('/account');
    } else {
        const { firstname, lastname, email, password, password2, role } = req.body;
        var { status } = req.body;
        if (status == null) {
            status = false;
        } else if (status == "on") {
            status = true;
        }
        if (!password.length > 0 && !password2.length > 0) {
            await Account.findByIdAndUpdate(req.params.id, { name: firstname, lastname, status, role });
            req.flash('updateUserMessage', 'The user has been updated correctly.');
            res.redirect("/user");
        }
        const newAccount = new Account();
        if (password.length > 0) {
            await Account.findByIdAndUpdate(req.params.id, { name: firstname, lastname, status, role, password: newAccount.encryptPassword(password) });
            req.flash('updateUserMessage', 'The user has been updated correctly.');
            res.redirect("/user");
        }
    }
});

router.delete('/delete-user/:id', isAuthenticated, async (req, res, next) => {
    if (req.user.role != 1) {
        req.flash('RoleMessageWarning', 'You do not have sufficient permissions to execute this action.');
        res.redirect('/account');
    } else {
        await Account.findByIdAndDelete(req.params.id);
        req.flash('deleteUserMessage', 'The user has been successfully deleted.');
        res.redirect("/user");
    }
});



function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/signin');
};


module.exports = router;