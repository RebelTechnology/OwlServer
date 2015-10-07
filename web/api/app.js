/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express = require('express');
var cors = require('cors');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var assert = require('assert');

var mongo = require('mongodb');
var monk = require('monk');
var apiSettings = require('./api-settings');
var db = monk(apiSettings.mongoConnectionString);

var swaggerize = require('swaggerize-express');

var author  = require('./routes/author');
var authors = require('./routes/authors');
var patch   = require('./routes/patch');
var patches = require('./routes/patches');
var tag     = require('./routes/tag');
var tags    = require('./routes/tags');
var sysex   = require('./routes/sysex');

var app = express();
app.use(cors());

app.use(swaggerize({
    api: './swagger.yaml',
    handlers: './routes'
}));

//// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next) {
    req.db = db; next();
});

app.use('/author', author);
app.use('/authors', authors);
app.use('/patch', patch);
app.use('/patches', patches);
app.use('/tag', tag);
app.use('/tags', tags);
app.use('/sysex', sysex);

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
