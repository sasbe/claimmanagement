var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var router = express.Router();
var index = require('./server/routes/index');
var users = require('./server/routes/users');
var claims = require('./server/routes/claims');
var serverStats = require('./server/routes/serverstatus');
var flash = require('connect-flash');
var app = express();
var passport = require('passport');
var fbsocial = require('./server/passport/facebook/fbpassport')(app, passport);
// view engine setups
app.set('views', path.join(__dirname, '/server/views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
        //sess.cookie.secure = true // serve secure cookies
}
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/users', users);
app.use('/claims', claims)
app.use('/serverstatus', serverStats);
app.use('*', index);

// load mongoose package
var mongoose = require('mongoose');
// Use native Node promises
mongoose.Promise = global.Promise;
// connect to MongoDB
mongoose.connect('mongodb://127.0.0.1/claim')
    .then(() => console.log('connection succesful'))
    .catch((err) => console.error(err));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    console.log('test')
    var err = new Error('Not Found');
    err.status = 404;
    err.message = "page not found";
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    console.log(err.message + err.status);
    res.status(err.status || 500);
    res.send({
        success: false,
        message: err.message || "Something went wrong. Please contact the administrator"
    });
});

module.exports = app;