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
 *
 * @param {string} cookie
 * @return {Promise<string,Error>}
 */
const validateAuthCookie = function (cookie) {
  return new Promise((resolve, reject) => {
    client.call('owl.validateAuthCookie', cookie, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Returns information about a WP user.
 *
 * @param {string} username
 * @return {Promise<Object,Error>}
 */
const getUserInfo = function (username) {
  return new Promise((resolve, reject) => {
    client.call('owl.getUserInfo', username, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Returns information about the WP users identified by the given user IDs.
 *
 * @param {Array} userIds
 * @return {Promise<Array<Object>,Error>}
 */
const getUserInfoBatch = function (userIds) {
  return new Promise((resolve, reject) => {
    client.call('owl.getUserInfoBatch', userIds, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = {
  validateAuthCookie,
  getUserInfo,
  getUserInfoBatch,
};
