'use strict';

const jwt = require('jsonwebtoken');

const { authTypes, API_USER_NAME } = require('./constants');
const errorResponse = require('../../lib/error-response');

const TOKEN_MAX_AGE = 1209600; // = 60 * 60 * 24 * 7 * 2 seconds = 2 weeks

/**
 * JWT authentication middleware.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const jwtAuth = (req, res, next) => {

  if (res.locals.authenticated) {
    next(); // already authenticated in some other way
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    next();
    return;
  }

  const [ , token ] = authHeader.split('Bearer ');
  if (!token) {
    next();
    return;
  }

  // Verify token
  let tokenPayload;
  try {
    tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    process.stderr.write('Token signature verification failed.\n');
    process.stderr.write(err.stack + '\n');
    next();
    return;
  }

  // Check if token expired
  try {
    if (!tokenPayload.iat) {
      throw { public: true, message: 'auth: Cannot determined when token was issued.', status: 500 };
    }
    const tokenAge = new Date().getTime() / 1000 - tokenPayload.iat;
    if (tokenAge > TOKEN_MAX_AGE) {
      throw { public: true, message: 'auth: Token expired!', status: 401 };
    }
  } catch (err) {
    return errorResponse(err, res);
  }

  res.locals.authenticated = true;
  res.locals.userInfo = {
    type: authTypes.AUTH_TYPE_TOKEN,
    name: API_USER_NAME,
  };

  // At this point `res.locals` will look like:
  // {
  //    authenticated: true,
  //    userInfo: {
  //      type: 'tk',
  //      name: 'API user'
  //    }
  //  }

  next();
};

module.exports = jwtAuth;
