'use strict';

const wordpress = require('./wordpress');
const jwt = require('./jwt');

/**
 * Convenience function that groups up all authentication middleware.
 *
 * You can disable individual authentication methods by commenting out
 * the appropriate line.
 */
const auth = app => {
  app.use(wordpress);
  app.use(jwt);
};

module.exports = auth;
