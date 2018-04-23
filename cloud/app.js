var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var getReservations = require('./routes/getreservations');
var signupRouter = require('./routes/signup');
var reserveRouter = require('./routes/reserve');
var deleteReservation = require('./routes/deleteReservation');
var loginRouter = require('./routes/login');
var admindashboardRouter = require('./routes/admindashboard');
var monitorRouter = require('./routes/monitor');
var billing = require('./routes/billing');

var app = express();

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/signup', signupRouter);
app.use('/deleteReservation', deleteReservation);
app.use('/login', loginRouter);
app.get('/dashboard', function(req, res) {
    console.log('THis is nice dashboard');
    res.render('dashboard');
});
app.use('/admindashboard', admindashboardRouter);
app.get('/reservepage', function(req, res) {
    console.log('I am onto reserve page');
    res.render('reserve');
});
app.use('/myreservationspage', getReservations);
app.use('/billing', billing);

app.use('/reserve', reserveRouter);
app.use('/monitor', monitorRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.listen(3000);
console.log('Running on port 3000...');
module.exports = app;
