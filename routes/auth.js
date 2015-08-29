var passport = require('passport');
var Users = require('../models/users')
var express = require('express');
var router = express.Router();

router.get('/register', function (req, res, next){
	res.render('register', { });
});

router.post('/register', function (req, res, next){
	Users.register(new Users({
		username : req.body.username 
	}), req.body.password, function(err, user) {
		if(err) {
			console.log(err);
			return res.send(err);
		}else{
			req.login(user, function (err){
				res.redirect('/');
			});
		}
	});
});

router.get('/login', function (req, res, next){
	res.render('login', {title: req.user});
});

router.post('/login', passport.authenticate('local'), function (req, res, next){
	res.redirect('/');
});

router.all('/logout', function (req, res, next){
	req.logout();
	res.redirect('/');
});

module.exports = router;