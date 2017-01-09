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

if (!process.env.API_KEY) {
  console.error('Error: Make sure that `.env` file exists and that it contains the API_KEY setting in it.')
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('Error: Make sure that `.env` file exists and that it contains the JWT_SECRET setting in it.')
  process.exit(1);
}

// Load middleware
const auth = require('./middleware/auth');

// Load routes
const patches = require('./routes/patches');
const patch = require('./routes/patch');
const authors = require('./routes/authors');
const tags = require('./routes/tags');
const builds = require('./routes/builds');
const session = require('./routes/session');

const app = express();

// Middleware
app.use(cors());
app.use(logger('short'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => { // Make our db accessible to our router
  req.db = db;
  next();
});

auth(app); // Authentication middleware

// Routes
app.use('/patches', patches);
app.use('/patch', patch);
app.use('/tags', tags);
app.use('/authors', authors);
app.use('/builds', builds);
app.use('/session', session);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json( {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

