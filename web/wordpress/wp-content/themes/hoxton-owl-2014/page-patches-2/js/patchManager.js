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
 * Conveniently groups some utility functions to handle patches.
 * 
 * @class
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
     * Returns the value of the specified query string parameter.
     * 
     * @param  {string} sParam
     *     The query string parameter to look for.
     * @return {string|undefined}
     *     The value of the specified query string parameter, or `undefined`
     *     if the parameter could not be found.
     */
    getURLParameter: function(sParam){
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++){
            var sParameterName = sURLVariables[i].split('=');
            if(sParameterName[0] == sParam) 
                return decodeURIComponent(sParameterName[1]);
        }
    },

    /**
     * Removes all duplicates from an array of strings.
     * 
     * @param  {string[]} array
     *     An array of strings.
     * @return {string[]}
     *     The input array with duplicates removed.
     */
    unique: function(array) {
        return $.grep(array, function(el, index) {
            return index === $.inArray(el, array);
        });
    },

    /**
     * Converts a number of bytes into a human-readable string.
     * 
     * @param  {number} size
     *     The size in bytes.
     * @return {string}
     *     A human-readable string.
     */
    humanFileSize: function(size) {
        var i = Math.floor( Math.log(size) / Math.log(1024) );
        return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    },

    /**
     * Retrieves all patch data by calling the OWL API.
     */
    getAllPatchData: function(callback) {
        
        var owl = com.hoxtonowl;
        var client = new owl.apiClient();
        
        $.when(
            client.query('/patches/findAll'),
            client.query('/authors/findAll'),
            client.query('/tags/findAll')
        ).done(function(patchData, authorData, tagData) {
            
            var patches = patchData[0].result;
            // for backward compatibility
            for (var i = 0; i < patches.length; i++) {
                patches[i].author = patches[i].author.name;
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
        
        var owl = com.hoxtonowl;
        var pm = owl.patchManager;
        
        window.selectedPatch = ko.observable();
        window.patches = ko.observableArray(patches);
        window.tags = ko.observableArray(tags);
        window.authors = ko.observableArray(authors);

        window.search = ko.observable();
        window.searchItems = ko.observableArray();

        window.filteredPatches = ko.computed(function() {
            return ko.utils.arrayFilter(window.patches(), function(r) {
                if(window.searchItems.indexOf("All") > -1) {
                    return true;
                }
                if(window.search() === "tag") {
                    for(i=0; i<r.tags.length; ++i) {
                        if(window.searchItems.indexOf(r.tags[i]) > -1) {
                            return true;
                        }
                    }
                } else if(window.search() === "author") {
                    return window.searchItems.indexOf(r.author) > -1;
                }
                return false;
            });
        });

        window.selectFilter = function(item) {
            //console.log("select filter "+item+" searching "+window.search());
            if(window.search() === "author") {
                return selectAuthor(item);
            } else {
                return selectTag(item);
            }
        };

        window.selectAuthor = function(author) {
            if(author.author) {
                author = author.author;
            }
            //console.log("select author "+author);
            window.selectedPatch(null);
            if(window.search() != "author") {
                window.search("author");
                window.searchItems.removeAll();
                window.searchItems.push(author);
            } else if(window.searchItems.indexOf(author) > -1) {
                window.searchItems.remove(author);
                if(window.searchItems().length === 0) {
                    window.searchItems.push("All");
                }
            } else {
                if(author === "All") {
                    window.searchItems.removeAll();
                } else {
                    window.searchItems.remove("All"); 
                    window.searchItems.push(author);
                }
            }
        };

        window.selectTag = function(tag){
        //console.log("select tag "+tag);
        window.selectedPatch(null);
        if(window.search() != "tag"){
            window.search("tag");
            window.searchItems.removeAll();
            window.searchItems.push(tag);
        }else if(window.searchItems.indexOf(tag) > -1){
            window.searchItems.remove(tag);
            if(window.searchItems().length == 0)
            window.searchItems.push("All");   
        }else{
            if(tag === "All")
            window.searchItems.removeAll();
            else
            window.searchItems.remove("All"); 
            window.searchItems.push(tag);
        }
        };

        window.selectOnlyTag = function(tag) {
            window.searchItems.removeAll();
            selectTag(tag);
        };

        window.selectAllTags = function(tag) {
            selectTag('All');
        };

        window.selectOnlyAuthor = function(author) {
            window.searchItems.removeAll();
            selectAuthor(author);
        };

        window.selectAllAuthors = function(tag) {
            selectAuthor('All');
        };

        window.selectPatch = function(name) {
            if (name.name) {
                name = name.name;
            }
            //console.log("select patch "+name);
            window.search("patch");
            window.searchItems.removeAll();
            $("#gitsource").empty();
            for (var i = 0; i < window.patches().length; ++i) {
                var patch = window.patches()[i];
                if(patch.name === name) {
                    window.selectedPatch(patch);
                }
            }
            // var url = "https://api.github.com/repos/" + user + "/" + repo + "/git/blobs/" + sha;
            // var url = "https://api.github.com/repos/pingdynasty/OwlPatches/contents/" + window.selectedPatch().file;
            var url = "https://api.github.com/repos/"+window.selectedPatch().repo+"/contents/"+window.selectedPatch().file;
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
        };

        window.soundcloud = ko.computed(function() {
            if(window.selectedPatch() && window.selectedPatch().soundcloud) {
                return "https://w.soundcloud.com/player/?url=" +
                encodeURIComponent(window.selectedPatch().soundcloud) +
                "&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true";
            } else {
                return "";
            }
        });

        ko.applyBindings(window);

        var patchName = pm.getURLParameter("patch");
        if(patchName) {
            selectPatch(patchName);
        } else {
            selectTag("All");
        }
    }
};

(function() {
    var owl = com.hoxtonowl;
    var pm = owl.patchManager;
    pm.getAllPatchData(pm.main);
})();