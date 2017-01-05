/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

const wordpress = require('wordpress');
const apiSettings = require('../api-settings');

const client = wordpress.createClient({
  url: apiSettings.WORDPRESS_XML_RPC_ENDPOINT,
  username: apiSettings.WORDPRESS_XML_RPC_USERNAME,
  password: apiSettings.WORDPRESS_XML_RPC_PASSWORD,
});

/**
 * Tries to validate a user cookie.
 */
const validateAuthCookie = function (cookie, callback) {
  client.call('owl.validateAuthCookie', cookie, (error, data) => {
    if (error) {
      callback(error);
    } else {
      callback(null, data);
    }
  });
};

/**
 * Returns information about a WP user.
 */
const getUserInfo = function (username, callback) {
  client.call('owl.getUserInfo', username, (error, data) => {
    if (error) {
      callback(error);
    } else {
      callback(null, data);
    }
  });
};

/**
 * Returns information about the WP users identified by the given user IDs.
 */
const getUserInfoBatch = function (userIds, callback) {
  client.call('owl.getUserInfoBatch', userIds, (error, data) => {
    if (error) {
      callback(error);
    } else {
      callback(null, data);
    }
  });
};

module.exports = {
  validateAuthCookie,
  getUserInfo,
  getUserInfoBatch,
};
