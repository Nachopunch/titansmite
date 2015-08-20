var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: 'TitanSmite: Home'});
});

/* GET picksand bans page. */
router.get('/pb', function(req, res, next) {
  res.render('pb', { title: 'TitanSmite: Picks and Bans'});
});

module.exports = router;
