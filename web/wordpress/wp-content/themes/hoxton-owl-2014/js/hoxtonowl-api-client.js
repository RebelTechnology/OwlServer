/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

/**
 * @namespace
 */
var HoxtonOwl;
if (!HoxtonOwl) {
    HoxtonOwl = {};
}

/**
 * API client
 *
 * @class
 */
HoxtonOwl.ApiClient = function () {
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
 * @param {?object} data
 *     An optional object containing the payload for the API call. Used with
 *     methods like POST and PUT.
 * @return Object
 *     An promise-like object representing an ajax request.
 * @private
 */
HoxtonOwl.ApiClient.prototype._query = function (path, method, data) {

    method = method || 'GET';

    var settings = {
        type: method,
        dataType: 'json'
    };
    if (data) {
        settings.data = data;
    }

    return $.ajax(this.apiEndPoint + path, settings); // returns a promise-like object

};

/**
 * Finds the WP authentication cookie,
 *
 * @return Object
 *     An promise-like object representing an ajax request.
 * @private
 */
HoxtonOwl.ApiClient.prototype._getWpAuthCookie = function () {

    return $.get('/wp-admin/admin-ajax.php', { action: 'owl-get-auth-cookie' });

};

/**
 * Retrieves all patch data by calling the OWL API.
 *
 * @param {Function} callback
 *     A callback that will be invoked once data is loaded.
 */
HoxtonOwl.ApiClient.prototype.getAllPatches = function (callback) {

    var client = this;

    jQuery.when(
        client._query('/patches/'),
        client._query('/authors/'),
        client._query('/tags/')
    ).done(function (patchData, authorData, tagData) {

        var patches = patchData[0].result;

        for (var i = 0; i < patches.length; i++) {
            patches[i] = new HoxtonOwl.Patch(patches[i]);
        }

        var authors = [];
        var wpAuthors = {};
        for(var i = 0; i < authorData[0].result.length; i++) {
            authors.push(authorData[0].result[i].name);
            if ('wordpressId' in authorData[0].result[i]) {
                wpAuthors[authorData[0].result[i].wordpressId] = authorData[0].result[i].name;
            }
        }
        authors.unshift("All");

        for (var i = 0; i < patches.length; i++) {
            if ('wordpressId' in patches[i].author) {
                patches[i].author.name = wpAuthors[patches[i].author.wordpressId];
            }
        }

        var tags = tagData[0].result;
        tags.unshift("All");

        callback(patches, authors, tags);

    });
};

/**
 * Get data for the patch with the specified ID by calling the OWL API.
 *
 * @param  {string} patchId
 *     The patch ID.
 * @param  {Function} callback
 *     A callback that will be invoked once data is loaded. This function will
 *     be passed the freshly loaded patch.
 */
HoxtonOwl.ApiClient.prototype.getSinglePatch = function (patchId, callback) {

    var client = this;

    jQuery.when(client._query('/patch/' + patchId)).done(function (patchData) {
        var patch = patchData.result;
        patch = new HoxtonOwl.Patch(patch);
        callback(patch);
    });
};

/**
 * Get data for the patch with the specified ID by calling the OWL API.
 *
 * @param  {string} patchSeoName
 *     The patch's SEO name.
 * @param  {Function} callback
 *     A callback that will be invoked once data is loaded. This function will
 *     be passed the freshly loaded patch.
 */
HoxtonOwl.ApiClient.prototype.getSinglePatchBySeoName = function (patchSeoName, callback) {

    var client = this;

    jQuery.when(client._query('/patch/?seoName=' + encodeURIComponent(patchSeoName))).done(function (patchData) {
        var patch = patchData.result;
        patch = new HoxtonOwl.Patch(patch);
        callback(patch);
    });
};

/**
 * Retrieves all tags.
 *
 * @param {Function} callback
 *     A callback that will be invoked once data is loaded.
 */
HoxtonOwl.ApiClient.prototype.getAllTags = function (callback) {

    var client = this;

    jQuery.when(client._query('/tags/')).done(function (tagData) {
        var tags = tagData.result;
        callback(tags);
    });
};

/**
 * Saves a patch. This method will determine wheter to create a new patch or
 * update an existing one based on the presence of the '_id' property in the
 * 'patch' object.
 *
 * @param  {object}   patch
 *     A patch object.
 * @param  {function} callback
 *     A callback that will be invoked when the API sends a response. The
 *     response will be passed to the callback as an argument.
 */
HoxtonOwl.ApiClient.prototype.savePatch = function (patch, callback) {

    var client = this;
    var path, method;

    if ('undefined' === typeof patch._id) {
        path = '/patches/';
        method = 'POST';
    } else {
        path = '/patch/' + patch._id;
        method = 'PUT';
    }

    jQuery.when(client._getWpAuthCookie()).then(

        function (authCookieVal) {

            var credentials = {
                type: 'wordpress',
                cookie: authCookieVal
            };

            jQuery.when(client._query(path, method, { patch: patch, credentials: credentials })).always(function (result) {
                callback(result);
            });
        },

        function (reason) {
            // Unable to retrieve authentication cookie
            //console.log(reason);
            callback(false);
        }
    );

};

/**
 * Deletes a patch.
 *
 * @param  {string} patchId
 *     The ID of the patch to delete.
 * @param {Function} callback
 *     A function to be called after the attempt to delete the patch. This
 *     callback will be passed a boolean argument saying whether the deletion
 *     succeeded or not.
 */
HoxtonOwl.ApiClient.prototype.deletePatch = function (patchId, callback) {

    var client = this;

    jQuery.when(client._getWpAuthCookie()).then(

        function (authCookieVal) {

            var ajaxConfig = {
                url: '/wp-admin/admin-ajax.php',
                data: {
                    action: 'owl-patch-file-delete',
                    cache: false,
                    patchId: patchId
                }
            };
            jQuery.when(jQuery.ajax(ajaxConfig)).then(

                function (result) {

                    var credentials = {
                        type: 'wordpress',
                        cookie: authCookieVal
                    };

                    jQuery.when(client._query('/patch/' + patchId, 'DELETE', credentials)).then(

                        function (result) {
                            callback(true);
                        },

                        function (reason) {
                            // deletion failed
                            //console.log(reason);
                            callback(false);
                        }
                    );
                },

                function (reason) {
                    calback(false);
                }
            );
        },

        function (reason) {
            // Unable to retrieve authentication cookie
            //console.log(reason);
            callback(false);
        }
    );
};

/**
 * Compiles a patch and returns the output of make.
 *
 * @param {string} patchId
 *     The patch ID.
 * @param {string} format
 *     The desired format (either `sysx` or `js`).
 * @param {Function} callback
 *     A callback that will be invoked once data is loaded. This function will
 *     be passed the freshly loaded patch.
 */
HoxtonOwl.ApiClient.prototype.compilePatch = function (patchId, format, callback) {

    var client = this;

    jQuery.when(client._getWpAuthCookie()).then(

        function (authCookieVal) {

            var credentials = {
                type: 'wordpress',
                cookie: authCookieVal
            };

            var data = {
                credentials: credentials,
                format: format
            };
            jQuery.when(client._query('/builds/' + patchId, 'PUT', data)).always(function (result) {
                callback(result);
            });
        },

        function (reason) {
            // Unable to retrieve authentication cookie
            //console.log(reason);
            callback(false);
        }
    );

};
