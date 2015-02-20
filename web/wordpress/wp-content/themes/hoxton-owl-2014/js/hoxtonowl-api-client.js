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
HoxtonOwl.ApiClient = function() {
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
 *     An object representing an ajax request.
 */
HoxtonOwl.ApiClient.prototype.query = function(path, method, data) {
    method = method || 'GET';
    //if (data) {
    //    return jQuery[method](, data, null, 'json');
    //} else {
    //    return jQuery[method](this.apiEndPoint + path);
    //}
    var settings = {
        type: method,
        dataType: 'json'
    };
    if (data) {
        settings.data = data;
    }
    return $.ajax(this.apiEndPoint + path, settings);
};

/**
 * Retrieves all patch data by calling the OWL API.
 * 
 * @param {Function} callback
 *     A callback that will be invoked once data is loaded.
 */
HoxtonOwl.ApiClient.prototype.getAllPatches = function(callback) {
    
    var client = this;
    
    jQuery.when(
        client.query('/patches/'),
        client.query('/authors/'),
        client.query('/tags/')
    ).done(function(patchData, authorData, tagData) {
        
        var patches = patchData[0].result;
        
        for (var i = 0; i < patches.length; i++) {
            patches[i] = new HoxtonOwl.Patch(patches[i]);
        }
        
        var authors = [];
        for(var i = 0; i < authorData[0].result.length; i++) {
            authors.push(authorData[0].result[i].name);
        }
        authors.unshift("All");
        
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
HoxtonOwl.ApiClient.prototype.getSinglePatch = function(patchId, callback) {
    
    var client = this;
    
    jQuery.when(client.query('/patch/' + patchId)).done(function(patchData) {
        
        var patch = patchData.result;
        patch = new HoxtonOwl.Patch(patch);
        callback(patch);
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
HoxtonOwl.ApiClient.prototype.savePatch = function(patch, callback) {
    
    var client = this;
    var path, method;
    
    if ('undefined' === typeof patch._id) {
        path = '/patches/';
        method = 'POST';
    } else {
        path = '/patch/';
        method = 'PUT';
    }
    
    jQuery.when(client.query(path, method, patch)).always(function(data) {
        callback(data);
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
HoxtonOwl.ApiClient.prototype.getSinglePatchBySeoName = function(patchSeoName, callback) {
    
    var client = this;
    
    jQuery.when(client.query('/patch/?seoName=' + encodeURIComponent(patchSeoName))).done(function(patchData) {
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
HoxtonOwl.ApiClient.prototype.getAllTags = function(callback) {
    
    var client = this;
    
    jQuery.when(client.query('/tags/')).done(function(tagData) {
        var tags = tagData.result;
        callback(tags);
    });
};