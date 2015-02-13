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
 * Represents a patch.
 * 
 * @param {Object} p
 *     Patch data as returned by the API, which can come in the form of a summary
 *     or as complete data.
 * @class
 */
HoxtonOwl.Patch = function(p) {
    
    /**
     * Converts a number of bytes into a human-readable string.
     * 
     * @param {number} size
     *     The size in bytes.
     * @return {string}
     *     A human-readable string.
     * @private
     */
    var humanFileSize = function(size) {
        var i = Math.floor( Math.log(size) / Math.log(1024) );
        return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    };
    
    // Minimal patch data (summary)
    this.id          = p._id,
    this.name        = p.name;
    this.seoName     = p.seoName;
    this.author      = jQuery.trim(p.author.name);
    this.tags        = [];
    if (p.tags && p.tags.length) {
        this.tags = jQuery.map(p.tags, jQuery.trim);
    }
    //this.link      = 'patch.html?patch=' + encodeURIComponent(p.name); // should we use id?
    
    // Complete data
    if (p.description) this.description = p.description;
    if (typeof p.inputs !== 'undefined') this.inputs = p.inputs;
    if (typeof p.outputs !== 'undefined') this.outputs = p.outputs;
    if (p.armCyclesPerSample) this.cycles = Math.round(p.armCyclesPerSample * 100.0 / 3500.0) + '%';
    if (p.bytesWithGain) this.bytes = humanFileSize(p.bytesWithGain);
    if (p.soundcloud) this.soundcloud = p.soundcloud;
    if (p.github) this.github = p.github;
    if (p.parameters) {
        this.parameters = [];
        for(var key in p.parameters) {
            this.parameters.push(p.parameters[key]);
        }
    }
};