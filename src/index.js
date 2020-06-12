const express = require('express');
const engine = require('ejs-mate');
const path = require('path');
const methodOverride =  require('method-override');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');

// Initializations
const app = express();
require('./database');
require('./passport/local-auth');

// Settings
app.set('port', process.env.PORT || 81);
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// Static files
app.use(express.static(path.join(__dirname, '/assets/')))

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(methodOverride('_method'));
app.use(session({
    secret: 'mysecretsession',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    app.locals.signupMessage = req.flash('signupMessage');
    app.locals.signinMessage = req.flash('signinMessage');
    app.locals.newUserMessage = req.flash('newUserMessage');
    app.locals.newUserMessageWarning = req.flash('newUserMessageWarning');
    app.locals.infoFirstName = req.flash('infoFirstName');
    app.locals.infoLastName = req.flash('infoLastName');
    app.locals.infoEmail = req.flash('infoEmail');
    app.locals.infoRole = req.flash('infoRole');
    app.locals.infoStatus = req.flash('infoStatus');
    app.locals.updateUserMessage = req.flash('updateUserMessage');
    app.locals.deleteUserMessage = req.flash('deleteUserMessage');
    app.locals.newTaxMessageWarning = req.flash('newTaxMessageWarning');
    app.locals.newTaxMessage = req.flash('newTaxMessage');
    app.locals.infoCountry = req.flash('infoCountry');
    app.locals.infoTax = req.flash('infoTax');
    app.locals.updateTaxMessage = req.flash('updateTaxMessage');
    app.locals.RoleMessageWarning = req.flash('RoleMessageWarning');
    app.locals.LogoutMessage = req.flash('LogoutMessage');
    app.locals.newPricingMessage = req.flash('newPricingMessage');
    app.locals.deletePricingMessage = req.flash('deletePricingMessage');
    app.locals.updatePricingMessage = req.flash('updatePricingMessage');
    app.locals.account = req.user;
    next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/account'));
app.use('/', require('./routes/pricing'));
app.use('/', require('./routes/tax'));
app.use('/', require('./routes/template'));
app.use('/', require('./routes/users'));

// Starting the server
app.listen(app.get('port'), () => {
    console.log('Server on port ', app.get('port'));
});