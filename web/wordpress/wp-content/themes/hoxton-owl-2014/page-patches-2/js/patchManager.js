/**
 * @author Martin Klang <mars@pingdynasty.com>
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
com.hoxtonowl.ApiClient = function() {
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
com.hoxtonowl.ApiClient.prototype.query = function(path, method) {
    method = method || 'get';
    return $[method](this.apiEndPoint + path);
};

/**
 * Represents a patch.
 * 
 * @param {Object} p
 *     Patch data as returned by the API, which can come in the form of a summary
 *     or as complete data.
 * @class
 */
com.hoxtonowl.Patch = function(p) {
    
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
    this.author      = $.trim(p.author.name);
    this.tags        = [];
    if (p.tags && p.tags.length) {
        this.tags = $.map(p.tags, $.trim);
    }
    //this.link      = 'patch.html?patch=' + encodeURIComponent(p.name); // should we use id?
    
    // Complete data
    if (p.description) this.description = p.description;
    if (typeof p.inputs !== 'undefined') this.inputs = p.inputs;
    if (typeof p.outputs !== 'undefined') this.outputs     = p.outputs;
    if (p.armCyclesPerSample) this.cycles = Math.round(p.armCyclesPerSample * 100.0 / 3500.0) + '%';
    if (p.bytesWithGain) this.bytes = humanFileSize(p.bytesWithGain);
    if (p.soundcloud) this.soundcloud = p.soundcloud;
    if (p.repo) this.repo = p.repo;
    if (p.github) this.file = p.github;
    if (p.parameters) {
        this.parameters = [];
        for(var key in p.parameters) {
            this.parameters.push(p.parameters[key]);
        }
    }
};

/**
 * Conveniently groups some utility functions to handle patches.
 * 
 * @namespace
 */
com.hoxtonowl.patchManager = {

    /**
     * Fetches a file from GitHub.
     * 
     * @param  {string} url
     *     The URL.
     * @param  {Function} callback
     *     A callback returned data will be passed to.
     * @param  {number} startLineNum
     *     Selection start.
     * @param  {number} endLineNum
     *     Selection end.
     */
    getGithubFile: function(url, callback, startLineNum, endLineNum) {
        startLineNum = (typeof startLineNum == "undefined") ? 1 : startLineNum;
        endLineNum = (typeof endLineNum == "undefined") ? 0 : endLineNum;
        $.ajax({
            type: "GET",
            url: url,
            dataType: "jsonp",
            success: function(data) {
                if (typeof data.data.content != "undefined") {
                    if (data.data.encoding == "base64") {
                        var base64EncodedContent = data.data.content;
                        base64EncodedContent = base64EncodedContent.replace(/\n/g, "");
                        var content = window.atob(base64EncodedContent);
                        var contentArray = content.split("\n");
                        if (endLineNum == 0) {
                            endLineNum = contentArray.length;
                        }
                        callback(contentArray.slice(startLineNum - 1, endLineNum).join("\n"));
                    }
                }
            }
        })
    },

    /**
     * Retrieves all patch data by calling the OWL API.
     * 
     * @param  {Function} callback
     *     A callback that will be invoked once data is loaded.
     */
    getAllPatches: function(callback) {
        
        var owl = com.hoxtonowl;
        var client = new owl.ApiClient();
        
        $.when(
            client.query('/patches/findAll'),
            client.query('/authors/findAll'),
            client.query('/tags/findAll')
        ).done(function(patchData, authorData, tagData) {
            
            var patches = patchData[0].result;
            for (var i = 0; i < patches.length; i++) {
                patches[i] = new owl.Patch(patches[i]);
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
    },
    
    /**
     * Get data for the patch with the specified ID by calling the OWL API.
     * 
     * @param  {string} patchId
     *     The patch ID.
     * @param  {Function} callback
     *     A callback that will be invoked once data is loaded. This function will
     *     be passed the freshly loaded patch.
     */
    getSinglePatch: function(patchId, callback) {
        
        var owl = com.hoxtonowl;
        var client = new owl.ApiClient();
        
        $.when(client.query('/patches/findOne/' + patchId)).done(function(patchData) {
            // console.log(patchData.result);
            var patch = patchData.result;
            patch = new owl.Patch(patch);
            callback(patch);
        });
    },

    /**
     * Contains the code that operates the patches page.
     * 
     * @param  {Object[]} patches
     *     An array of objects that represent patches.
     * @param  {string[]} authors
     *     The authors.
     * @param  {string[]} tags
     *     The tags.
     */
    main: function(patches, authors, tags) {
        
        var that = this;
        var owl = com.hoxtonowl;
        var pm = owl.patchManager;
        
        that.selectedPatch = ko.observable();       // currently selected patch
        that.patches = ko.observableArray(patches); // all patches
        that.authors = ko.observableArray(authors); // all authors
        that.tags = ko.observableArray(tags);       // all tags

        that.search = ko.observable();              // one of 'all', 'search', 'tag' or 'patch'
        that.searchItems = ko.observableArray();

        that.filteredPatches = ko.computed(function() {
            //console.log('filteredPatches');
            //console.log(that.searchItems());
            return ko.utils.arrayFilter(that.patches(), function(r) {
                //console.log(that.searchItems);
                if(that.searchItems.indexOf("All") > -1) {
                    return true;
                }
                if(that.search() === "tag") {
                    for (i=0; i<r.tags.length; ++i) {
                        if(that.searchItems.indexOf(r.tags[i]) > -1) {
                            return true;
                        }
                    }
                } else if(that.search() === "author") {
                    return that.searchItems.indexOf(r.author) > -1;
                }
                return false;
            });
        });

        that.selectAllPatches = function() {
            that.selectedPatch(null);
            that.search('all');
            that.searchItems.removeAll();
            that.searchItems.push('All');
        };
        
        that.selectFilter = function(item) {
            //console.log("select filter "+item+" searching "+that.search());
            if(that.search() === "author") {
                return selectAuthor(item);
            } else {
                return selectTag(item);
            }
        };

        that.selectAuthor = function(author) {
            if(author.author) {
                author = author.author;
            }
            //console.log("select author "+author);
            that.selectedPatch(null);
            if(that.search() != "author") {
                that.search("author");
                that.searchItems.removeAll();
                that.searchItems.push(author);
            } else if (that.searchItems.indexOf(author) > -1) {
                that.searchItems.remove(author);
                if(that.searchItems().length === 0) {
                    that.searchItems.push("All");
                }
            } else {
                if (author === "All") {
                    that.searchItems.removeAll();
                    that.searchItems.push('All'); // added by Sam
                } else {
                    that.searchItems.remove("All"); 
                    that.searchItems.push(author);
                }
            }
        };

        that.selectTag = function(tag) {
            //console.log("select tag " + tag);
            that.selectedPatch(null);
            if (that.search() != "tag") {
                that.search("tag");
                that.searchItems.removeAll();
                that.searchItems.push(tag);
            } else if (that.searchItems.indexOf(tag) > -1) {
                that.searchItems.remove(tag);
                if(that.searchItems().length == 0) {
                    that.searchItems.push("All");
                }
            } else {
                if (tag === "All") {
                    that.searchItems.removeAll();
                    that.searchItems.push('All'); // added by Sam
                } else {
                    that.searchItems.remove("All"); 
                    that.searchItems.push(tag);
                }
            }
        };

        that.selectOnlyTag = function(tag) {
            //console.log('selectOnlyTag');
            that.searchItems.removeAll();
            selectTag(tag);
        };

        that.selectAllTags = function(tag) {
            //console.log('selectAllTags');
            selectTag('All');
        };

        that.selectOnlyAuthor = function(author) {
            //console.log('selectOnlyAuthor');
            that.searchItems.removeAll();
            selectAuthor(author);
        };

        that.selectAllAuthors = function(tag) {
            //console.log('selectAllAuthors');
            selectAuthor('All');
        };

        that.selectPatch = function(name, e) {
            console.log('selectPatch');
            
            var target;
            if (e.target) {
                target = e.target; // gecko
            } else if (e.srcElement) {
                target = e.srcElement; // ie
            } if (target.nodeType == 3) { // defeat Safari bug
                target = target.parentNode;
            }
            
            var patchId = $(target).attr('data-patch-id');
            pm.getSinglePatch(patchId, function(patch) {
                
                if (name.name) {
                    name = name.name;
                }
                //console.log("select patch "+name);
                that.search("patch");
                that.searchItems.removeAll();
                $("#gitsource").empty();
                that.selectedPatch(patch);
                
                // var url = "https://api.github.com/repos/" + user + "/" + repo + "/git/blobs/" + sha;
                // var url = "https://api.github.com/repos/pingdynasty/OwlPatches/contents/" + that.selectedPatch().file;
                var url = "https://api.github.com/repos/" + that.selectedPatch().repo + "/contents/" + that.selectedPatch().file;
                pm.getGithubFile(url, function(contents) {
                    // console.log("contents "+contents);
                    $("#gitsource").text(contents).removeClass("prettyprinted").parent();
                    //console.log("pretty printing");
                    prettyPrint();
                    // use highlight.js instead?
                    // https://github.com/isagalaev/highlight.js
                    // embed editor?
                    // http://ace.c9.io/#nav=embedding
                });
                knobify();
                
            });
        };

        that.soundcloud = ko.computed(function() {
            if(that.selectedPatch() && that.selectedPatch().soundcloud) {
                return "https://w.soundcloud.com/player/?url=" +
                encodeURIComponent(that.selectedPatch().soundcloud) +
                "&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true";
            } else {
                return "";
            }
        });

        ko.applyBindings(that);
        selectTag("All");
        that.search("all");
    }
};

(function() {
    var owl = com.hoxtonowl;
    var pm = owl.patchManager;
    pm.getAllPatches(pm.main);
})();

// EOF