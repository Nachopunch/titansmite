var express = require('express');
var router = express.Router();
var passport = require('passport');


router.use('/home', function(req, res, next){
	if(!req.user){
		res.redirect('/login');
	}
	next();
});
router.use('/pb', function(req, res, next){
	if(!req.user){
		res.redirect('/login');
	}
	next();
});


/* GET home page. */
router.get('/', function(req, res, next){
	res.redirect('/home')
})

router.get('/home', function(req, res, next) {
  res.render('home', { title: 'TitanSmite: Home'});
});

/* GET picksand bans page. */
router.get('/pb', function(req, res, next) {
 	res.render('pb', { title: 'TitanSmite: Picks and Bans'});
});


module.exports = router;
