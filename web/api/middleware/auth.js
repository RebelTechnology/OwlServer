'use strict';

const { validateAuthCookie, getUserInfo } = require('../lib/wordpress-bridge.js');

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
 * Authentication middleware.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const auth = (req, res, next) => {

  res.locals.authenticated = false;

  let credentials = req.body.credentials;

  // To avoid unnecessary requests if wordpress cookie is available
  if (req.cookies) {
    const wpCookieFromRequest = getWordpressCookie(req.cookies);
    if (wpCookieFromRequest) {
      console.log('auth: WP cookie found in request.');
      credentials = {
        type: 'wordpress',
        cookie: wpCookieFromRequest
      };
    }
  }

  if (!credentials) {
    next();
    return;
  }

  if (!credentials.type || 'wordpress' !== credentials.type || !credentials.cookie) {
    next();
    return;
  }

  let username;
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
      username = wpCookie.split('|')[0];
      return getUserInfo(username);
    })
    .then(wpUserInfo => {
      res.locals.authenticated = true;
      res.locals.username = username;
      res.locals.wpUserInfo = wpUserInfo;

      // At this point `res.locals` will look like:
      // {
      //    authenticated: true,
      //    username: 'jdoe',
      //    wpUserInfo: {
      //      id: 1,
      //      display_name: 'JohnDoe',
      //      admin: true
      //    }
      //  }

      next();
    })
    .catch(err => {
      const status = err.status || 500;
      res.status(status).json({
        message: err.message || err.toString(),
        status: status
      });
    });
};

module.exports = auth;
