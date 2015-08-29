var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');


router.use('/pb', function(req, res, next){
	if(!req.user){
		res.redirect('/login');
	}
	next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: 'TitanSmite: Home'});
});

/* GET picksand bans page. */
router.get('/pb', function(req, res, next) {
 	res.render('pb', { title: 'TitanSmite: Picks and Bans'});
});

router.get('/pbsaves', function (req, res){
  mongoose.model('pbsaves').find(function (err, pbsaves){
  	console.log(pbsaves);
    res.send(pbsaves);
  });
});


module.exports = router;
