function getGithubFile(user, repo, sha, callback, startLineNum, endLineNum) {
    startLineNum = (typeof startLineNum == "undefined") ? 1 : startLineNum;
    endLineNum = (typeof endLineNum == "undefined") ? 0 : endLineNum;
    var url = "https://api.github.com/repos/" + user + "/" + repo + "/git/blobs/" + sha;
    console.log("get github file "+url);
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

function importGSS(root){
    var that = this;

    var patchName = getURLParameter("patch");
    console.log("patch: "+patchName);
    that.selectedPatchName = ko.observable(patchName);
    that.selectedPatch = ko.observable();

    var feed = root.feed;
    var entries = feed.entry || [];
    var tags = [];
    var authors = [];
    var patches = [];
    that.tagSearch = ko.observableArray(["All"]);
    that.authorSearch = ko.observableArray(["All"]);
    for(var i = 0; i < entries.length; ++i){
	var entry = entries[i];
	var patch = { 
	    name: entry['gsx$name']['$t'],
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
	    armcycles: entry['gsx$armcyclespersample']['$t'],
	    bytes: entry['gsx$byteswithgain']['$t'],
	    soundcloud: entry['gsx$soundcloud']['$t'],
	    github: entry['gsx$github']['$t']
	};
	if(patch.name === selectedPatchName())
	    selectedPatch(patch);
	// console.log("patch: "+JSON.stringify(patch));
	patches.push(patch);
	$.merge(tags, patch.tags);
	authors.push(patch.author);
    }

    console.log(patches.length+" patches");
    that.patches = ko.observableArray(patches);
    tags = unique(tags);
    tags.push("All");
    that.tags = ko.observableArray(tags);
    that.tags.sort();

    authors = unique(authors);
    authors.push("All");
    that.authors = ko.observableArray(authors);
    that.authors.sort();

    self.filteredPatches = ko.computed(function() {
	return ko.utils.arrayFilter
	(self.patches(), function(r) {
	    if(self.tagSearch.indexOf("All") > -1)
		return true;
	    for(i=0; i<r.tags.length; ++i){
		if(self.tagSearch.indexOf(r.tags[i]) > -1)
		    return true;
	    }
	    return false;
	});
    });

    self.authorPatches = ko.computed(function() {
	return ko.utils.arrayFilter
	(self.patches(), function(r) {
	    return self.authorSearch.indexOf("All") > -1 || self.authorSearch.indexOf(r.author) > -1;
	});
    });

    self.selectAuthor = function(author){
	if(author.author)
	    author = author.author;
	if(self.authorSearch.indexOf(author) > -1){
	    self.authorSearch.remove(author);
	    if(self.authorSearch().length === 0)
		self.authorSearch.push("All");	
	}else{
	    if(author === "All")
		self.authorSearch.removeAll();
	    else
		self.authorSearch.remove("All"); 
	    self.authorSearch.push(author);
	}
    };

    self.selectTag = function(tag){
	if(self.tagSearch.indexOf(tag) > -1){
	    self.tagSearch.remove(tag);
	    if(self.tagSearch().length == 0)
		self.tagSearch.push("All");	
	}else{
	    if(tag === "All")
		self.tagSearch.removeAll();
	    else
		self.tagSearch.remove("All"); 
	    self.tagSearch.push(tag);
	}
    };

    that.soundcloud = ko.computed(function() {
	return "https://w.soundcloud.com/player/?url=" +
	    encodeURIComponent(that.selectedPatch().soundcloud) +
	    "&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true";
    });

    var user = "pingdynasty";
    var repo = "OwlPatches";
    var sha = selectedPatch().github;
    getGithubFile(user, repo, sha, function(contents) {
	// console.log("contents "+contents);
	$("#gitsource").text(contents).removeClass("prettyprinted").parent();
	console.log("pretty printing");
	prettyPrint();
	// use highlight.js instead?
	// https://github.com/isagalaev/highlight.js
    });
    // var img = new Image();
    // var src = "https://raw.githubusercontent.com/pingdynasty/OwlPatches/master/Contest/DroneBox.hpp";
    // img.onload = function(){
    // 	console.log("hello: "+this.src + " loaded");
    // }
    // img.src = src;


    console.log("selected patch: "+JSON.stringify(that.selectedPatch()));
    ko.applyBindings(that);  
}
