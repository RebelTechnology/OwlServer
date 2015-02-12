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
 * @return Object
 *     An object representing an ajax request.
 */
HoxtonOwl.ApiClient.prototype.query = function(path, method) {
    method = method || 'get';
    return jQuery[method](this.apiEndPoint + path);
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
        client.query('/patches/findAll'),
        client.query('/authors/findAll'),
        client.query('/tags/findAll')
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
        
        // console.log('From API:');
        // console.log(patches);
        // console.log(authors);
        // console.log(tags);
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
    
    jQuery.when(client.query('/patches/findOne/' + patchId)).done(function(patchData) {
        // console.log(patchData.result);
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
HoxtonOwl.ApiClient.prototype.getSinglePatchBySeoName = function(patchSeoName, callback) {
    
    var client = this;
    
    jQuery.when(client.query('/patches/findOneBySeoName/' + patchSeoName)).done(function(patchData) {
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
    
    jQuery.when(client.query('/tags/findAll')).done(function(tagData) {
        var tags = tagData.result;
        callback(tags);
    });
};