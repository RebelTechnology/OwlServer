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
    var feed = root.feed;
    var entries = feed.entry || [];
    var tags = [];
    that.tagSearch = ko.observableArray(["All"]);
    var authors = [];
    that.authorSearch = ko.observableArray(["All"]);
    var patches = [];
    for(var i = 0; i < entries.length; ++i){
	var entry = entries[i];
	var patch = { 
	    name: entry['gsx$name']['$t'],
	    author: entry['gsx$author']['$t'].trim(),
	    description: entry['gsx$description']['$t'],
	    // tags: entry['gsx$tags']['$t'],
	    tags: $.map((entry['gsx$tags']['$t']).split(','), $.trim),
	    parameters: [ entry['gsx$parametera']['$t'],
			  entry['gsx$parameterb']['$t'],
			  entry['gsx$parameterc']['$t'],
			  entry['gsx$parameterd']['$t'],
			  entry['gsx$parametere']['$t]'] ],
	    inputs: entry['gsx$inputs']['$t'],
	    outputs: entry['gsx$outputs']['$t'],
	    armcycles: entry['gsx$armcyclespersample']['$t'],
	    bytes: entry['gsx$byteswithgain']['$t']
	};
	// console.log("patch: "+JSON.stringify(patch));
	patches.push(patch);
	$.merge(tags, patch.tags);
	authors.push(patch.author);
	// tags.push.apply(
	// that.patches.push(patch);
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
	// console.log("select author: "+author);
	if(self.authorSearch.indexOf(author) > -1){
	    self.authorSearch.remove(author);
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
	}else{
	    if(tag === "All")
		self.tagSearch.removeAll();
	    else
		self.tagSearch.remove("All"); 
	    self.tagSearch.push(tag);
	}
    };

    ko.applyBindings(that);  
}

/*
  "gsx$name":{"$t":"Guitarix/Dunwah"},
  "gsx$author":{"$t":"Grame "},
  "gsx$description":{"$t":""},
  "gsx$parametera":{"$t":"Wah"},
  "gsx$parameterb":{"$t":""},
  "gsx$parameterc":{"$t":""},
  "gsx$parameterd":{"$t":""},
  "gsx$parametere":{"$t":""},
  "gsx$inputs":{"$t":"1"},
  "gsx$outputs":{"$t":"1"},
  "gsx$armcyclespersample":{"$t":"570"},
  "gsx$byteswithgain":{"$t":"1680"},
  "gsx$soundsample":{"$t":""} 
*/

// (function DemoViewModel() {
//   var that = this;
//   var eb = new vertx.EventBus(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/eventbus');
//   that.items = ko.observableArray([]);

//   eb.onopen = function() {

//     // Get the static data

//     eb.send('vertx.mongopersistor', {action: 'find', collection: 'patches', matcher: {} },
//       function(reply) {
//         if (reply.status === 'ok') {
//           // var albumArray = [];
//           // for (var i = 0; i < reply.results.length; i++) {
//           //   albumArray[i] = new Patch(reply.results[i]);
//           // }
//           var albumArray = reply.results;
//           that.patches = ko.observableArray(albumArray);
//           ko.applyBindings(that);
//         } else {
//           console.error('Failed to retrieve patches: ' + reply.message);
//         }
//       });
//   };

//   eb.onclose = function() {
//     eb = null;
//   };

// })();
