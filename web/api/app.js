'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// Connect to database
const monk = require('monk');
const db = monk(process.env.MONGO_CONNECTION_STRING);
db.then(() => process.stdout.write('Connected correctly to MongoDB.\n'))
  .catch(err => {
    process.stderr.write(err + '\n');
    process.stderr.write('Could not connect to MongoDB.\n');
    process.exit(1);
  });

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
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.json( {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

process.stdout.write('API started.\n');
process.on('SIGTERM', () => {
  process.stdout.write('Ooops... Got SIGINT\'d. Bye!\n');
  process.exit();
});

module.exports = app;
