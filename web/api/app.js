/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

require('dotenv').config();

var express = require('express');
var cors = require('cors');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var monk = require('monk');
var apiSettings = require('./api-settings');
var db = monk(apiSettings.mongoConnectionString);

if (!process.env.API_PASSWORD) {
  console.error('Error: Make sure that `.env` file exists and that it contains the API_PASSWORD setting in it.')
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('Error: Make sure that `.env` file exists and that it contains the JWT_SECRET setting in it.')
  process.exit(1);
}

var auth    = require('./middleware/auth');
var patches = require('./routes/patches');
var patch   = require('./routes/patch');
var authors = require('./routes/authors');
var tags    = require('./routes/tags');
var builds  = require('./routes/builds');
var session = require('./routes/session');

var app = express();
app.use(cors());

//// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('short'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next) {
    req.db = db; next();
});

// API authentication middleware
app.use(auth);

app.use('/patches', patches);
app.use('/patch', patch);
app.use('/tags', tags);
app.use('/authors', authors);
app.use('/builds', builds);
app.use('/session', session);

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
        res.json( {
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
