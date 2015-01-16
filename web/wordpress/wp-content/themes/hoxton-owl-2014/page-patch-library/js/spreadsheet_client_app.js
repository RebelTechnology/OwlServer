function getGithubFile(url, callback, startLineNum, endLineNum) {
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
}

function getURLParameter(sParam){
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++){
        var sParameterName = sURLVariables[i].split('=');
        if(sParameterName[0] == sParam) 
            return decodeURIComponent(sParameterName[1]);
    }
}

function add_stylesheet_once( url ){
    $head = $('head');
    if( $head.find('link[rel="stylesheet"][href="'+url+'"]').length < 1 )
    $head.append('<link rel="stylesheet" href="'+ url +'" type="text/css" />');
}

function unique(arr) {
    var u = {}, a = [];
    for(var i = 0, l = arr.length; i < l; ++i){
    arr[i] = arr[i].trim();
        if(!u.hasOwnProperty(arr[i]) && arr[i] != "") {
            a.push(arr[i]);
            u[arr[i]] = 1;
        }
    }
    return a;
}

function humanFileSize(size) {
    var i = Math.floor( Math.log(size) / Math.log(1024) );
    return ( size / Math.pow(1024, i) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

function importGSS(root){
    var that = this;
    var patchName = getURLParameter("patch");
    //console.log("patch: "+patchName);
    that.selectedPatch = ko.observable();
    var feed = root.feed;
    var entries = feed.entry || [];
    var tags = [];
    var authors = [];
    var patches = [];
    console.log(entries); // FIXME
    for(var i = 0; i < entries.length; ++i){
        var entry = entries[i];
        var patch = {
            name: entry['gsx$name']['$t'],
            link: "patch.html?patch=" + encodeURIComponent(entry['gsx$name']['$t']),
            author: entry['gsx$author']['$t'].trim(),
            description: entry['gsx$description']['$t'],
            tags: $.map((entry['gsx$tags']['$t']).split(','), $.trim),
            parameters: [ entry['gsx$parametera']['$t'],
                  entry['gsx$parameterb']['$t'],
                  entry['gsx$parameterc']['$t'],
                  entry['gsx$parameterd']['$t'],
                  entry['gsx$parametere']['$t]'] ],
            inputs: entry['gsx$inputs']['$t'],
            outputs: entry['gsx$outputs']['$t'],
            cycles: entry['gsx$armcyclespersample']['$t'],
            bytes: entry['gsx$byteswithgain']['$t'],
            soundcloud: entry['gsx$soundcloud']['$t'],
            repo: entry['gsx$repo']['$t'],
            file: entry['gsx$github']['$t']
        };
        //console.log("cycles "+patch.cycles);
        patch.cycles = Math.round(patch.cycles * 100.0 / 3500.0) + "%";
        patch.bytes = humanFileSize(patch.bytes);
        // console.log("patch: "+JSON.stringify(patch));
        patches.push(patch);
        $.merge(tags, patch.tags);
        authors.push(patch.author);
    }

    //console.log(patches.length+" patches");
    that.patches = ko.observableArray(patches);
    tags = unique(tags);
    that.tags = ko.observableArray(tags);
    that.tags.sort();
    tags.unshift("All");

    authors = unique(authors);
    that.authors = ko.observableArray(authors);
    that.authors.sort();
    authors.unshift("All");

    that.search = ko.observable();
    that.searchItems = ko.observableArray();

    that.filteredPatches = ko.computed(function() {
    return ko.utils.arrayFilter
    (that.patches(), function(r) {
        if(that.searchItems.indexOf("All") > -1)
        return true;
        if(that.search() === "tag"){
        for(i=0; i<r.tags.length; ++i){
            if(that.searchItems.indexOf(r.tags[i]) > -1)
            return true;
        }
        }else if(that.search() === "author"){
        return that.searchItems.indexOf(r.author) > -1;     
        }
        return false;
    });
    });

    that.selectFilter = function(item){
    //console.log("select filter "+item+" searching "+that.search());
    if(that.search() === "author")
        return selectAuthor(item);
    else 
        return selectTag(item);
    };

    that.selectAuthor = function(author){
    if(author.author)
        author = author.author;
    //console.log("select author "+author);
    that.selectedPatch(null);
    if(that.search() != "author"){
        that.search("author");
        that.searchItems.removeAll();
        that.searchItems.push(author);
    }else if(that.searchItems.indexOf(author) > -1){
        that.searchItems.remove(author);
        if(that.searchItems().length === 0)
        that.searchItems.push("All");   
    }else{
        if(author === "All")
        that.searchItems.removeAll();
        else
        that.searchItems.remove("All"); 
        that.searchItems.push(author);
    }
    };

    that.selectTag = function(tag){
    //console.log("select tag "+tag);
    that.selectedPatch(null);
    if(that.search() != "tag"){
        that.search("tag");
        that.searchItems.removeAll();
        that.searchItems.push(tag);
    }else if(that.searchItems.indexOf(tag) > -1){
        that.searchItems.remove(tag);
        if(that.searchItems().length == 0)
        that.searchItems.push("All");   
    }else{
        if(tag === "All")
        that.searchItems.removeAll();
        else
        that.searchItems.remove("All"); 
        that.searchItems.push(tag);
    }
    };

    that.selectOnlyTag = function(tag){
    that.searchItems.removeAll();
    selectTag(tag);
    };

    that.selectAllTags = function(tag){
    selectTag('All');
    };

    that.selectOnlyAuthor = function(author){
    that.searchItems.removeAll();
    selectAuthor(author);
    };

    that.selectAllAuthors = function(tag){
    selectAuthor('All');
    };

    that.selectPatch = function(name){
    if(name.name)
        name = name.name;
    //console.log("select patch "+name);
    that.search("patch");
    that.searchItems.removeAll();
    $("#gitsource").empty();
    for(var i=0; i<that.patches().length; ++i){
        var patch = that.patches()[i];
        if(patch.name === name)
        that.selectedPatch(patch);
    }
    // var url = "https://api.github.com/repos/" + user + "/" + repo + "/git/blobs/" + sha;
    // var url = "https://api.github.com/repos/pingdynasty/OwlPatches/contents/" + that.selectedPatch().file;
    var url = "https://api.github.com/repos/"+that.selectedPatch().repo+"/contents/"+that.selectedPatch().file;
    getGithubFile(url, function(contents) {
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

    that.soundcloud = ko.computed(function() {
    if(selectedPatch() && selectedPatch().soundcloud)
        return "https://w.soundcloud.com/player/?url=" +
        encodeURIComponent(that.selectedPatch().soundcloud) +
        "&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true";
    else
        return "";
    });

    ko.applyBindings(that);  

    if(patchName){
    selectPatch(patchName);
    }else{
    selectTag("All");
    }
}
