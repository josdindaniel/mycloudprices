const express = require('express');
const router = express.Router();

router.get('/template', isAuthenticated, (req, res, next) => {
    res.render('template');
});

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/signin');
};


module.exports = router;