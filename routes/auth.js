var express = require('express');
var router = express.Router();

// add auth package for refs
var passport = require('passport');
var mongoose = require('mongoose');
var Account = require('../models/account');
var configDb = require('../config/db.js');
var gitHub = require('passport-github2');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    Account.findById(id, function(err, user) {
        done(err, user);
    });
});

// github auth config
passport.use(new gitHub({
    clientID: configDb.githubClientId,
    clientSecret: configDb.githubClientSecret,
    callbackURL: configDb.githubCallbackUrl
}, function(accessToken, refreshToken, profile, done) {
        var searchQuery = { name: profile.displayName };

        var updates = {
            name: profile.displayName,
            someID: profile.id
        };

        var options = { upsert: true };

        Account.findOneAndUpdate(searchQuery, updates, options, function(err, user) {
            if (err) {
                return done(err);
            }
            else {
                return done(null, user);
            }
        });
    }
));

// GET github login
router.get('/github', passport.authenticate('github', { scope: ['user.email'] }));

// get github callback
router.get('/github/callback', passport.authenticate('github', {
    failureRedirect: '/auth/login'}),
    function(req, res) {
        res.redirect('/articles');
    }
);

// GET login show login form
router.get('/login', function(req, res, next) {
    // store the session messages in a local variable
    var messages = req.session.messages || [];

    // clear the session messages
    req.session.messages = [];

    // show the login page and pass in any messages we may have
    res.render('auth/login', {
        title: 'Login',
        user: req.user,
        messages: messages
    });
});

// POST login - validate user
router.post('/login', passport.authenticate('local', {
    successRedirect: '/articles',
    failureRedirect: '/auth/login',
    failureMessage: 'Invalid Login'
}));

// GET register - show registration form
router.get('/register', function(req, res, next) {
   res.render('auth/register', {
    title: 'Register'
   });
});

// Post register - save new user
router.post('/register', function(req, res, next) {
    /* Try to create a new account using our Account model & the form values
    If we get an error display the register form again
    If registration works, store the user and show the articles main page */
    Account.register(new Account({ username: req.body.username }), req.body.password, function(err, account) {
        if (err) {
           return res.render('auth/register', { title: 'Register' });
        }
        else {
            req.login(account, function(err) {
                res.redirect('/articles');
            });
        }
    });
});

// make this public
module.exports = router, passport;