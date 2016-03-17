var express = require('express');
var router = express.Router();
// link to account model
var Account = require('../models/account');

/* GET users listing. */
router.get('/', isLoggedIn, function(req, res) {
    
	Account.find(function (err, accounts) {
		// if we get an error
		if (err) {
			console.log(err);
			res.end(err);
		}
		else {
			// show the view and pass data into it (if we get data)
			res.render('users', {
				title: 'Users',
				users: accounts
			});
		}
	});
});

// authentication check
function isLoggedIn(req, res, next) {
    // is the user authenticated?
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect('/auth/login');
    }
}

module.exports = router;
