/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

/**
 * @namespace
 */
var com;
if (!com) com = {};

if(!com.hoxtonowl) {
    /**
     * @namespace
     */
    com.hoxtonowl = {};
}

/**
 * API client
 * 
 * @class
 */
com.hoxtonowl.apiClient = function() {
    // Determine API endpoint
    this.apiEndPoint = window.location.protocol + '//' + window.location.host + '/api';
    if ('hoxtonowl.localhost' == window.location.hostname) { // for local debugging
        this.apiEndPoint = 'http://' + window.location.hostname + ':3000';
    }
};

/**
 * Calls an API method.
 * 
 * @param  {string}       path
 *     The path to the API method.
 * @param  {string} [verb=get]
 *     The  HTTP verb to use.
 * @return Object
 *     An object representing an ajax request.
 */
com.hoxtonowl.apiClient.prototype.query = function(path, method) {
    method = method || 'get';
    return $[method](this.apiEndPoint + path);
};