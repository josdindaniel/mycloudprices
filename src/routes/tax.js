const express = require('express');
const router = express.Router();
const Tax = require('../models/tax');

router.get('/tax', isAuthenticated, async (req, res, next) => {
    const taxes = await Tax.find();
    res.render('tax', { taxes });

});

router.get('/new-tax', isAuthenticated, (req, res, next) => {
    if (req.user.role == 3) {
        req.flash('RoleMessageWarning', 'You do not have sufficient permissions to execute this action.');
        res.redirect('/tax');
    } else {
        res.render('new-tax');
    }
});

router.post('/new-tax', isAuthenticated, async (req, res, next) => {
    if (req.user.role == 3) {
        req.flash('RoleMessageWarning', 'You do not have sufficient permissions to execute this action.');
        res.redirect('/tax');
    } else {
        const { country, ntax } = req.body;
        console.log(req.body);
        
        const tax = await Tax.findOne({ country: country });

        if (tax) {
            req.flash('newTaxMessageWarning', 'The tax of the country' + country + ' already exists. Try another country.');
            req.flash('infoCountry', country);
            req.flash('infoTax', ntax);
            res.redirect('/new-tax')
        } else {
            const newTax = new Tax();
            newTax.country = req.body.country;
            newTax.wht = req.body.ntax;
            await newTax.save();
            console.log('Guardado');
            
            req.flash('newTaxMessage', 'The tax of the country ' + country + ' has been created correctly.');
            res.redirect('/tax')
        }
    }
});

router.get('/edit-tax/:id', isAuthenticated, async (req, res, next) => {
    if (req.user.role == 3) {
        req.flash('RoleMessageWarning', 'You do not have sufficient permissions to execute this action.');
        res.redirect('/tax');
    } else {
        const tax = await Tax.findById(req.params.id);
        res.render('edit-tax', { tax });
    }
});

router.put('/edit-tax/:id', isAuthenticated, async (req, res, next) => {
    if (req.user.role == 3) {
        req.flash('RoleMessageWarning', 'You do not have sufficient permissions to execute this action.');
        res.redirect('/tax');
    } else {
        const { country, ntax } = req.body;
        await Tax.findByIdAndUpdate(req.params.id, { country, wht: ntax });
        req.flash('updateTaxMessage', 'The tax has been updated correctly.');
        res.redirect("/tax");
    }
});


router.delete('/delete-tax/:id', isAuthenticated, async (req, res, next) => {
    if (req.user.role == 3) {
        req.flash('RoleMessageWarning', 'You do not have sufficient permissions to execute this action.');
        res.redirect('/tax');
    } else {
        await Tax.findByIdAndDelete(req.params.id);
        req.flash('deleteUserMessage', 'The tax has been successfully deleted.');
        res.redirect("/tax");
    }
});


function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/signin');
};


module.exports = router;