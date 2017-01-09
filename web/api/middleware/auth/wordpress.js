'use strict';

const { validateAuthCookie, getUserInfo } = require('../../lib/wordpress-bridge.js');
const authTypes = require('./auth-types');

/**
 * Convenience function gets wordpress cookie if exists or returns false.
 *
 * @param {Object} cookies
 * @return {boolean|string}
 */
const getWordpressCookie = cookies => {
  var wpCookie = false;
  Object.keys(cookies).some(key => {
    if(key.lastIndexOf('wordpress_logged_in_') === 0) {
      wpCookie = cookies[key];
      return true;
    }
    return false;
  });
  return wpCookie;
};

/**
 * WordPress authentication middleware.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const wordpressAuth = (req, res, next) => {

  if (res.locals.authenticated) {
    next(); // already authenticated in some other way
    return;
  }

  let credentials = req.body.credentials;

  // To avoid unnecessary requests if wordpress cookie is available
  if (req.cookies) {
    const wpCookieFromRequest = getWordpressCookie(req.cookies);
    if (wpCookieFromRequest) {
      console.log('auth: WP cookie found in request.');
      credentials = {
        type: authTypes.AUTH_TYPE_WORDPRESS,
        cookie: wpCookieFromRequest
      };
    }
  }

  if (!credentials) {
    next();
    return;
  }

  if (!credentials.type || authTypes.AUTH_TYPE_WORDPRESS !== credentials.type || !credentials.cookie) {
    next();
    return;
  }

  let wpUsername;
  const wpCookie = credentials.cookie;

  Promise.resolve()
    .then(() => {
      console.log('auth: Verifying WP user cookie...')
      return validateAuthCookie(wpCookie); // Should throw an error if cookie is not valid. FIXME: what error? handled where?
    })
    .then(result => {
      if (!result) {
        console.log('auth: WP cookie verification failed.');
        throw { message: 'Not authorized.', status: 401 };
      }
      console.log('auth: Getting WP user info...');
      wpUsername = wpCookie.split('|')[0];
      return getUserInfo(wpUsername);
    })
    .then(wpUserInfo => {

      if (!wpUserInfo) {
        throw { message: 'Internal error.', status: 500 };
      }

      res.locals.authenticated = true;
      res.locals.userInfo = {
        type: authTypes.AUTH_TYPE_WORDPRESS,
        wpUserId: wpUserInfo.id,
        wpUsername,
        wpAdmin: !!wpUserInfo.admin,
      };
      Object.assign(res.locals.userInfo, wpUserInfo);

      // At this point `res.locals` will look like:
      // {
      //    authenticated: true,
      //    userInfo: {
      //      type: 'wp',
      //      wpUserId: 1,
      //      wpUsername: 'jdoe',
      //      wpAdmin: true
      //    }
      //  }

      next();
    })
    .catch(error => {
      const message = error.message || JSON.stringify(error);
      const status = error.status || 500;
      return res.status(status).json({ message, status });
    });
};

module.exports = wordpressAuth;
