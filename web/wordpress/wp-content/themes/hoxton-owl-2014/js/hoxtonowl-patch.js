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

    // Minimal patch data (summary)
    this._id         = p._id,
    this.name        = p.name;
    this.seoName     = p.seoName;
    this.author      = p.author;
    this.tags        = [];
    if (p.tags && p.tags.length) {
        this.tags = jQuery.map(p.tags, jQuery.trim);
    }
    //this.link      = 'patch.html?patch=' + encodeURIComponent(p.name); // should we use id?

    // Complete data
    if (p.description) this.description = p.description; else this.description = '';
    if (p.instructions) this.instructions = p.instructions; else this.instructions = '';
    if (typeof p.inputs !== 'undefined') this.inputs = p.inputs;
    if (typeof p.outputs !== 'undefined') this.outputs = p.outputs;

    this.cycles = '';
    //if (p.cycles) this.cycles = Math.round(p.cycles * 100.0 / 3500.0) + '%';
    if (p.cycles) this.cycles = this.cyclesToPercent(p.cycles);

    this.bytes = '';
    //if (p.bytes) this.bytes = humanFileSize(p.bytes);
    if (p.bytes) this.bytes = p.bytes;

    this.soundcloud = [];
    if (p.soundcloud) this.soundcloud = p.soundcloud;

    this.github = [];
    if (p.github) this.github = p.github;

    this.parameters = {};
    if (p.parameters) {
        for(var key in p.parameters) {
            this.parameters[key] = p.parameters[key];
        }
    }

    this.published = 0;
    if ('published' in p) {
        this.published = p.published === true ? 1 : 0;
    }

    this.creationTimeUtc = 0;
    if (p.creationTimeUtc) {
        this.creationTimeUtc = p.creationTimeUtc;
    }

    this.sysExAvailable = false;
    if (p.sysExAvailable) {
        this.sysExAvailable = p.sysExAvailable;
        if (p.sysExLastUpdated) {
            this.sysExLastUpdated = p.sysExLastUpdated;
        }
    }

    this.jsAvailable = false;
    if (p.jsAvailable) {
        this.jsAvailable = p.jsAvailable;
        if (p.jsLastUpdated) {
            this.jsLastUpdated = p.jsLastUpdated;;
        }
    }
};

/**
 * Converts a number of bytes into a human-readable file size string.
 *
 * @param {Number} bytes
 *     The number of bytes.
 * @return {String}
 *     A human-readable file size string.
 */
HoxtonOwl.Patch.prototype.bytesToHuman = function(bytes) {
    var i = Math.floor( Math.log(bytes) / Math.log(1024) );
    return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
};

/**
 * Converts cycles into a CPU%.
 *
 * @param  {Number} cycles
 *      The number of cycles.
 * @return {Number}
 *     The CPU%.
 */
HoxtonOwl.Patch.prototype.cyclesToPercent = function(cycles) {
    return Math.round(cycles * 100.0 / 3500.0);
};

/**
 * Converts CPU% into number of cycles.
 *
 * @param  {Number} percent
 *      The CPU%.
 * @return {Number}
 *     The number of cycles.
 */
HoxtonOwl.Patch.prototype.percentToCycles = function(percent) {
    return Math.round(percent * 3500.0 / 100.0);
};
