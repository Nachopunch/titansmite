var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var users = require('./routes/users');

var dbConfig = require('./config/db.js');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//load routes
var routes = require('./routes/index');
var auth = require('./routes/auth');

var app = express();

// mongoose.connect(dbConfig.url, function(){
//   console.log('connected to db with mongoose');
// });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'titan wins',
  resave: true,
  saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));

//Passport Configuration
app.use(passport.initialize());
app.use(passport.session());


//connect to database
mongoose.connect(dbConfig.url);


//load models
var Users = require('./models/users.js');
var PBSaves = require('./models/pbsaves.js');

//define callback for passport using passport-local-mongoose
passport.use(Users.createStrategy());

passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());



//Use Routes
app.use('/', routes);
app.use('/', auth);
// app.use('/users', users);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
