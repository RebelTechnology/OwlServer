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

module.exports.validateAuthCookie = function(cookie, callback) {

    client.call('owl.validateAuthCookie', cookie, function (error, data) {
        if (error) {
            callback(error);
        } else {
            callback(null, data);
        }
    });
};

module.exports.getUserInfo = function (username, callback) {

    client.call('owl.getUserInfo', username, function (error, data) {
        if (error) {
            callback(error);
        } else {
            callback(null, data);
        }
    });
};
