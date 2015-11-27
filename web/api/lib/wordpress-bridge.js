/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var wordpress = require('wordpress');
var apiSettings = require('../api-settings');

var client = wordpress.createClient({
    url: apiSettings.WORDPRESS_XML_RPC_ENDPOINT,
    username: apiSettings.WORDPRESS_XML_RPC_USERNAME,
    password: apiSettings.WORDPRESS_XML_RPC_PASSWORD
});

/**
 * Tries to validate a user cookie.
 */
module.exports.validateAuthCookie = function(cookie, callback) {

    client.call('owl.validateAuthCookie', cookie, function (error, data) {
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
module.exports.getUserInfo = function (username, callback) {

    client.call('owl.getUserInfo', username, function (error, data) {
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
module.exports.getUserInfoBatch = function (userIds, callback) {

    client.call('owl.getUserInfoBatch', userIds, function (error, data) {
        if (error) {
            callback(error);
        } else {
            callback(null, data);
        }
    });
};
