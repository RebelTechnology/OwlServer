/**
 * @author Martin Klang <mars@pingdynasty.com>
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
 * Conveniently groups some utility functions to handle patches.
 *
 * @namespace
 */
HoxtonOwl.patchManager = {

    sortPatchesByName: function () {

        if ('name' === window.patchSortOrder()) {
            return;
        }
        window.patchSortOrder ('name');
        window.patches.sort(function (left, right) {
            return left.name.localeCompare(right.name);
        });
    },

    sortPatchesByCreationTimeUtc: function () {

        if ('creationTimeUtc' === window.patchSortOrder()) {
            return;
        }
        window.patchSortOrder('creationTimeUtc');
        window.patches.sort(function (left, right) {
            return right.creationTimeUtc - left.creationTimeUtc;
        });
    },

    /**
     * Fetches a file from GitHub.
     *
     * @param {string} url
     *     The URL.
     * @param {Function} callback(content, filename, url)
     *     A callback returned data will be passed to.
     * @param {number} startLineNum
     *     Selection start.
     * @param {number} endLineNum
     *     Selection end.
     */
    getGithubFile: function(url, callback, startLineNum, endLineNum) {

        var pm = HoxtonOwl.patchManager;

        // hack to see if this file is hosted on GitHub
        var urlParser = document.createElement('a');
        urlParser.href = url;
        if (urlParser.host != 'github.com' && urlParser.host != 'www.github.com') {

            var pieces = urlParser.pathname.split('/');
            var filename = pieces[pieces.length - 1];

            // Force same protocol as current HTTP(S) connection
            urlParser.protocol = window.location.protocol;
            url = urlParser.href;

            $.ajax({
                type:     "GET",
                url:      url,
                dataType: "text",
                success:  function(data) {
                    pm.getGithubFile.count++;
                    callback(data, filename, url, false);
                },
                error: function(data) {
                    pm.getGithubFile.count++;
                    callback('// This file could not be fetched because of an unexpected error.', filename, url, false);
                }
            });
            return;
        }

        startLineNum = (typeof startLineNum == "undefined") ? 1 : startLineNum;
        endLineNum = (typeof endLineNum == "undefined") ? 0 : endLineNum;

        // input:
        //
        // https://github.com/pingdynasty/OwlPatches/blob/master/Contest/ConnyPatch.hpp
        //                    [+++++++++] [++++++++]      [++++] [++++++++++++++++++++]
        //                    owner       repo            branch file path
        //
        // output:
        // https://api.github.com/repos/pingdynasty/OwlPatches/contents/Contest/ConnyPatch.hpp?ref=master
        //                              [+++++++++] [++++++++]          [++++++++++++++++++++]     [++++]
        //                              owner       repo                path                       branch

        var bits     = url.split('/');
        var repo     = bits.slice(3,5).join('/');
        var branch   = bits[6];
        var path     = bits.slice(7).join('/');
        var filename = bits[bits.length-1];
        var endpoint = 'https://api.github.com/repos/' + repo + '/contents/' + path + '?ref=' + branch;

        $.ajax({
            type:     "GET",
            url:      endpoint,
            dataType: "jsonp",
            success:  function(data) {
                pm.getGithubFile.count++;
                if (typeof data.data.content != "undefined") {
                    if (data.data.encoding == "base64") {

                        var base64EncodedContent = data.data.content;
                        base64EncodedContent = base64EncodedContent.replace(/\n/g, "");
                        var content = window.atob(base64EncodedContent);
                        var contentArray = content.split("\n");
                        if (endLineNum == 0) {
                            endLineNum = contentArray.length;
                        }

                        callback(contentArray.slice(startLineNum - 1, endLineNum).join("\n"), filename, url);
                        return;
                    }
                }
                callback('// This file could not be fetched. Is it from a public GitHub repository?', filename);
            },
            error: function(data) {
                pm.getGithubFile.count++;
                callback('// This file could not be fetched because of an unexpected error.', filename);
            }
        });
    },

    updatePushbutton: function () {
	// todo: update button state (and message) regularly
        var pm = HoxtonOwl.patchManager;
        if(pm.testPatch) {
	    var state = pm.testPatch.getButtons();
	    if(state & 0x04) // GREEN_BUTTON
  		$('#patch-test-pushbutton').css('background', 'green');
	    else if(state & 0x08) // RED_BUTTON
  		$('#patch-test-pushbutton').css('background', 'red');
	    else
  		$('#patch-test-pushbutton').css('background', 'lightgray');    
	}
    },

    updatePatchParameters: function () {
        var pm = HoxtonOwl.patchManager;
        var patch = pm.testPatch;
        if (patch) {
            $('[id^=patch-parameter-]:visible').each(function (i, el) {
                var paramLetter = el.id.substr(-1, 1),
                    paramNo = paramLetter.charCodeAt(0) - 97, // "a".charCodeAt(0) === 97
                    $el = $(el),
                    paramVal = $el.find('.knob').val() / 100;
                if (paramVal !== pm['param_' + paramLetter]) { // Don't call into the patch if not necessary
		    // console.log("set "+paramNo+":"+paramVal);
                    patch.update(paramNo, paramVal);
                    pm['param_' + paramLetter] = paramVal;
                }
            });
        }
    },

    /**
     * Returns whether the current user is allowed to build a patch.
     *
     * @return boolean
     *     Whether the current user is alloed to build a patch.
     */
    userAllowedToBuildPatch: function (patch) {

        var isAdmin = false,
            $isAdmin = $('#wordpress-user-is-admin'),
            currentWpUserId = null,
            $currentWpUserId = $('#wordpress-user-id'),
            github = patch.github;

        if ($isAdmin) {
            isAdmin = $isAdmin.text() == 1;
        }

        if ($currentWpUserId) {
            currentWpUserId = $currentWpUserId.text();
        }

        if (github && github.length && // are there any source files?
            (isAdmin || (patch.author && patch.author.wordpressId && patch.author.wordpressId == currentWpUserId))) { // either admin or legitimate owner

            return true;
        }

        return false;
    },

    initPatchTest: function () {

        var pm = HoxtonOwl.patchManager;

        if (pm.patchTestInited || !pm.patchTestOk) {
            return;
        }

        var deferred1 = $.getScript($('.jsDownloadLink').attr('href'));
        var deferred2 = $.getScript('/wp-content/themes/hoxton-owl-2014/page-patch-library/js/webaudio.js');

        $.when(deferred1, deferred2).done(function () {

            pm.startPatchTest();

            $('#patch-tab-test-err-4').hide();

            $('#patch-test-inner-container').show();
            $('.knob').val(35).trigger('change');
            // $('#patch-test-source').select2({
            //     placeholder: 'Select a source',
            //     minimumResultsForSearch: Infinity
            // });

            $('#patch-test-source').change(function (e) {
                var $target = $(e.target);
                var $audio = $('#patch-test-audio');
                var val = $(e.target).val();
                var audioSampleBasePath = '/wp-content/themes/hoxton-owl-2014/page-patch-library/audio/';
                $audio.find('source').remove();
                if ('_' !== val.substr(0, 1)) {
                    var html = '<source src="' + audioSampleBasePath + val + '.mp3" type="audio/mpeg"><source src="' + audioSampleBasePath + val + '.ogg" type="audio/ogg">';
                    $(html).appendTo($audio);
                }
                $audio[0].load();
		if(!pm.patchPlaying)
		    pm.startPatchTest();
                if ('_' !== val.substr(0, 1)) {
                    $audio[0].play();
                    pm.testPatch.useFileInput();
                } else if ('_clear' === val) {
                    pm.testPatch.clearInput();
                } else if ('_mic' === val) {
                    pm.testPatch.useMicrophoneInput();
                }
            });

        }).fail(function () {
            $('#patch-tab-test-err-4').html('Error: Could not load patch.');
        });

        $('#patch-test-start-stop').click(function () {
            if (pm.patchPlaying) {
                pm.stopPatchTest();
            } else {
                pm.startPatchTest();
            }
        });

        $('#patch-test-pushbutton').click(function () {
            if(pm.patchPlaying) {
		pm.testPatch.toggleButton();
		pm.updatePushbutton();
            }
        });

        pm.patchTestInited = true;
    },

    startPatchTest: function () {
        var pm = HoxtonOwl.patchManager;
        var patch = pm.testPatch;

        if (pm.startPatchTest.inited) {
            pm.testPatch.scriptProcessor.connect(owl.context.destination);
        } else {
            pm.testPatch = owl.dsp();
            pm.testPatch.scriptProcessor.connect(owl.context.destination);
            pm.updatePatchParameters();
	    pm.updatePushbutton();
            pm.startPatchTest.inited = true;
        }
        pm.patchPlaying = true;
        $('#patch-test-start-stop').val('Stop');
    },

    stopPatchTest: function () {
        var pm = HoxtonOwl.patchManager;
        if (!pm.patchPlaying) {
            return;
        }
        pm.testPatch.scriptProcessor.disconnect();
        pm.patchPlaying = false;
        $('#patch-test-start-stop').val('Start');
    },

    /**
     * Contains the code that operates the patches page.
     *
     * @param {Object[]} patches
     *     An array of objects that represent patches.
     * @param {string[]} authors
     *     The authors.
     * @param {string[]} tags
     *     The tags.
     */
    main: function(patches, authors, tags) {

        var self = this;
        var pm = HoxtonOwl.patchManager;
        var $currentWpUserId = $('#wordpress-user-id').text();

        self.selectedPatch = ko.observable();       // currently selected patch
        self.patches = ko.observableArray(patches); // all patches
        self.authors = ko.observableArray(authors); // all authors
        self.tags = ko.observableArray(tags);       // all tags

        self.search = ko.observable();              // one of 'all', 'author', 'tag', 'patch' or 'myPatches'
        self.searchItems = ko.observableArray();
        self.patchSortOrder = ko.observable('name');

        self.truncateDescriptions = function(patch){
            if(patch.description && patch.description.length > 215){
                patch.description = patch.description.substr(0,215) + ' ...';
            }
            return patch;
        };

        self.filteredPatches = ko.computed(function() {
            return self.patches().filter(function(patch) {
                
                if (self.searchItems.indexOf('All') > -1) {
                    return patch.published;
                }
                if (self.search() === 'tag') {
                    for (i=0; i<patch.tags.length; ++i) {
                        if(self.searchItems.indexOf(patch.tags[i]) > -1 && patch.published) {
                            return true;
                        }
                    }
                } else if (self.search() === 'author') {
                    return patch.author && self.searchItems.indexOf(patch.author.name) > -1 && patch.published;
                } else if (self.search() === 'myPatches') {
                    // return self.searchItems.indexOf(patch.author.name) > -1;
                    return patch.author && patch.author.wordpressId == $currentWpUserId;
                }
                return false;
            }).map(self.truncateDescriptions);
        });

        self.filteredPatchAuthorNo = ko.computed(function () {
            var stringified;
            var distinctAuthors = [];
            for (var i = 0, max = filteredPatches().length; i < max; i++) {
                stringified = JSON.stringify(filteredPatches()[i].author); // not very performant, but should be ok
                if (distinctAuthors.indexOf(stringified) == -1) {
                    distinctAuthors.push(stringified);
                }
            }
            return distinctAuthors.length;
        });

        self.selectAllPatches = function(dummy, e) {

            pm.stopPatchTest();
            pm['sortPatchesBy' + e.currentTarget.id.split('-')[3]]();

            self.selectedPatch(null);
            self.search('all');
            self.searchItems.removeAll();
            self.searchItems.push('All');
        };

        self.selectFilter = function(item) {
            pm.stopPatchTest();
            if(self.search() === "author") {
                return selectAuthor(item);
            } else {
                return selectTag(item);
            }
        };

        self.selectAuthor = function(author) {
            pm.stopPatchTest();
            self.selectedPatch(null);
            if(self.search() != "author") {
                self.search("author");
                self.searchItems.removeAll();
                self.searchItems.push(author);
            } else if (self.searchItems.indexOf(author) > -1) {
                self.searchItems.remove(author);
                if(self.searchItems().length === 0) {
                    self.searchItems.push("All");
                }
            } else {
                if (author === "All") {
                    self.searchItems.removeAll();
                    self.searchItems.push('All'); // added by Sam
                } else {
                    self.searchItems.remove("All");
                    self.searchItems.push(author);
                }
            }
        };

        self.selectTag = function(tag) {
            pm.stopPatchTest();
            self.selectedPatch(null);
            if (self.search() != "tag") {
                self.search("tag");
                self.searchItems.removeAll();
                self.searchItems.push(tag);
            } else if (self.searchItems.indexOf(tag) > -1) {
                self.searchItems.remove(tag);
                if(self.searchItems().length == 0) {
                    self.searchItems.push("All");
                }
            } else {
                if (tag === "All") {
                    self.searchItems.removeAll();
                    self.searchItems.push('All'); // added by Sam
                } else {
                    self.searchItems.remove("All");
                    self.searchItems.push(tag);
                }
            }
        };

        self.selectOnlyTag = function(tag) {
            self.searchItems.removeAll();
            selectTag(tag);
        };

        self.selectAllTags = function(tag) {
            pm.stopPatchTest();
            pm.sortPatchesByName();
            selectTag('All');
        };

        self.selectOnlyAuthor = function(authorsPatch) {
            pm.stopPatchTest();
            self.searchItems.removeAll();
            selectAuthor(authorsPatch.author.name);
        };

        self.selectAllAuthors = function(tag) {
            pm.stopPatchTest();
            pm.sortPatchesByName();
            selectAuthor('All');
        };

        self.selectMyPatches = function() {

            pm.stopPatchTest();
            pm.sortPatchesByName();
            self.search('myPatches');
            var author = $('#wordpress-username').text();
            self.searchItems.removeAll();
            self.selectedPatch(null);
            self.searchItems.push(author);

        };

        self.userAllowedToEditPatch = function(patch){
            var currentWpUserId = parseInt($('#wordpress-user-id').text());
            if(patch.author && patch.author.wordpressId && (patch.author.wordpressId === currentWpUserId)){
                return true
            }
            return false;
        };

        self.selectPatch = function(patch) {
            var patchId = patch._id;
            var apiClient = new HoxtonOwl.ApiClient();
            var pdGraphs = [];
            apiClient.getSinglePatch(patchId, function(patch) {

                if (name.name) {
                    name = name.name;
                }
                self.search("patch");
                self.searchItems.removeAll();
                $("#gitsource").empty();
                self.selectedPatch(patch);

                $('#github-files').empty();
                $('#git-code').hide();
                if (self.selectedPatch().github.length) {
                    for (var i = 0, max = self.selectedPatch().github.length; i < max; i++) {

                        pm.getGithubFile(self.selectedPatch().github[i], function(contents, filename, url, actuallyFromGitHub) {

                            var cnt;

                            if (typeof(actuallyFromGitHub) === 'undefined') {
                                actuallyFromGitHub = true;
                            }

                            if (0 === $('#github-files > ul').length) {
                                $('#github-files').html('<ul></ul>');
                            }
                            cnt = $('#github-files > ul > li').length;

                            cnt++;

                            if (url)
                            {
                                var downloadLink = url;
                                if (actuallyFromGitHub) {
                                    downloadLink = downloadLink.replace('github.com', 'raw.githubusercontent.com');
                                    downloadLink = downloadLink.replace('/blob', '');
                                }
                            }


                            $('#github-files > ul').append('<li><a href="#tabs-' + cnt + '">' + filename + '</a>' + 
                                (downloadLink ? '<a target="_blank" href="' + downloadLink + '"><img src="/wp-content/themes/hoxton-owl-2014/page-patch-library/images/download.png"/></a>' : '') +
                                '</li>');
                            $('#github-files').append('<div id="tabs-' + cnt + '"><pre class="prettyprint"></pre></div>');
                            if (actuallyFromGitHub) {
                                $('#github-files #tabs-' + cnt).prepend('<a href="' + url + '" target="_new" class="github-link">Open this file in GitHub</a>');
                            }

                            if (/\.pd$/.test(filename)) {
                                var p = pdfu.parse(contents);
                                var r = pdfu.renderSvg(p, {svgFile: false});
                                pdGraphs[cnt] = r;
                                $('body').append('<div id="svg-' + cnt + '"></div>');
                            } else {
                                $('#github-files pre.prettyprint').eq(pm.getGithubFile.count - 1).text(contents);
                            }

                            if (pm.getGithubFile.count == max) { // no more files to be loaded

                                // Pretty print source code
                                prettyPrint();
                                $('#github-files').tabs({ active: 0 }); // jQuery-UI tabs
                                $('#git-code').show();

                                // Render PD patches
                                for (var key in pdGraphs) {
                                    var $tab = $('#tabs-' + key);
                                    $tab.find('pre.prettyprint').remove();
                                    $('#svg-' + key).html(pdGraphs[key]).appendTo($tab);
                                }
                            }
                        });
                    }
                }
                
                // add colour to knobs for which parameters exist in this patch
                if (patch.parameters) {
                    for (var key in patch.parameters) {
                        $('#patch-parameter-' + key + ' .knob').attr('data-fgColor', '#ed7800');
                    }
                }
                knobify();                

                // Show build download links
                if (self.selectedPatch().sysExAvailable) {
                    $('.sysExDownloadLink').on('click', function(){
                        window.location = apiClient.apiEndPoint + '/builds/' + self.selectedPatch()._id + '?format=sysx&amp;download=1';
                    });
                }

                if (self.selectedPatch().jsAvailable) {
                    $('.jsDownloadLink').attr('href', apiClient.apiEndPoint + '/builds/' + self.selectedPatch()._id + '?format=js&amp;download=1');
                }

                var isAdmin = HoxtonOwl.isUserAdmin;

                // Patch test
                if (!window.AudioContext) {
                    $('#patch-tab-test-err-1').show(); // Web Audio API not available
                } else if (!self.selectedPatch().jsAvailable) {
                    $('#patch-tab-test-err-2').show(); // JS build not available
                    if (pm.userAllowedToBuildPatch(self.selectedPatch())) {
                        $('#patch-tab-test-err-3').show(); // Would you like to build the patch now?
                    }
                } else  {
                    pm.patchTestOk = true;
                }

                var resetPatchParameterView = function () {
                    $('.knob').val(35).trigger('change');
                    $('.knob-container:visible input.knob').css('visibility', 'hidden');
                };
                resetPatchParameterView();

                function changeKnobReadOnlyState(readonly) {
		    // this won't work because the readOnly attribute is only read on creation
                    if (patch.parameters) {
                        for (var key in patch.parameters) {
                            $('#patch-parameter-' + key + ' .knob').trigger('configure', {"readOnly":readonly});
                        }
                    }
                }

                $('.patch-tab-header a').click(function (e) {
                    var $tab = $(e.target).closest('h2'),
                        id = $tab.attr('id');
                    $tab.addClass('selected');
                    $tab.siblings('h2').removeClass('selected');
                    if ('patch-tab-header-info' === id) {
                        $('#patch-tab-midi').hide();
                        $('#patch-tab-test').hide();
                        $('#patch-tab-info').show();
                        pm.stopPatchTest();
                        resetPatchParameterView();
                        changeKnobReadOnlyState(true);
                    } else if ('patch-tab-header-test' === id) {
                        $('#patch-tab-info').hide();
                        $('#patch-tab-midi').hide();
                        $('#patch-tab-test').show();
                        $('.knob').val(35).trigger('change');
                        $('.knob-container:visible input.knob').css('visibility', 'visible');
                        pm.initPatchTest();
                        changeKnobReadOnlyState(false);
                    } else if ('patch-tab-header-midi' === id) {
                        $('#patch-tab-info').hide();
                        $('#patch-tab-test').hide();
                        $('#patch-tab-midi').show();
                        pm.stopPatchTest();
                        resetPatchParameterView();
                        changeKnobReadOnlyState(true);
                    }
                    return false;
                });
                $('.knob-container:visible input.knob').css('visibility', 'hidden');

                // Show compile patch button:
                $('.compile-patch-container').css('display', 'none');

                // Patch compile button
                if (pm.userAllowedToBuildPatch(self.selectedPatch())) {
                    $('tr.compile-patch-container').css('display', 'table-row');
                    $('span.compile-patch-container').css('display', 'inline');
                } else {
                    $('span.compile-patch-container').remove();
                }

                // hook up owl-load-button
                $('#load-owl-button').click(function(){
                    sendProgramFromUrl('/api/builds/' + selectedPatch()._id + '?format=sysx&amp;download=1');
                    statusRequestLoop();
                });

            });
        };

        self.soundcloud = ko.computed(function() {
            if(self.selectedPatch() && self.selectedPatch().soundcloud && self.selectedPatch().soundcloud.length) {

                var iframeSrcs = [];
                for (var i = 0, max = self.selectedPatch().soundcloud.length; i < max; i++) {
                    iframeSrcs.push(
                        "https://w.soundcloud.com/player/?url=" +
                        encodeURIComponent(self.selectedPatch().soundcloud[i]) +
                        "&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true"
                    );
                }
                return iframeSrcs;

            } else {
                return "";
            }
        });

        ko.applyBindings(self);

        /* patch compilation section */

        $('#compile-tabs').tabs();
        $('#compile-dialog-btn-done').click(function () {
            $('#compile-dialog').dialog('close');
            window.location.reload();
        });
        $(document).on('click', '.compileLink', function(e) {

            var target = 'sysx';
            if ($(e.target).hasClass('js')) {
                target = 'js';
            }

            $('#compile-dialog').dialog({
                width: 600,
                modal: true,
                closeOnEscape: false
            });
            $('#compile-dialog textarea').empty().text('Please wait...');

            var apiClient = new HoxtonOwl.ApiClient();
            apiClient.compilePatch($('#selected-patch-id').text(), target, function (data) {

                if (data.success === true) {
                    $('#compile-dialog textarea').first().text('Patch compiled successfully.');
                    $('#tabs-stdout textarea').text(data.stdout);
                    $('#tabs-stderr textarea').text(data.stderr);
                } else {
                    $('#compile-dialog textarea').first().text('Patch compilation failed. Please check the logs for errors.');
		    if(data.stdout)
			$('#tabs-stdout textarea').text(data.stdout);
		    else
			$('#tabs-stdout textarea').text(data.responseText);
		    if(data.stderr)
			$('#tabs-stderr textarea').text(data.stderr);
		    else
			$('#tabs-stderr textarea').text(JSON.stringify(data));
                }
            });

            return false;
        });

        /* end of patch compilation section */

        var url = location.pathname;
        var matches = url.match(/^\/patch-library\/patch\/.+\/?$/g);
        if (matches) {
            var seoName = url.split('/')[3];
            var apiClient = new HoxtonOwl.ApiClient();
            apiClient.getSinglePatchBySeoName(seoName, selectPatch);
        } else {
            selectTag("All");
            self.search("all");
            pm.sortPatchesByCreationTimeUtc();
        }
    },

    /**
     * Navigates to a patch page.
     *
     * @param  {HoxtonOwl.Patch} patch
     *     The patch to view.
     */
    openPatch: function(patch) {
        location = '/patch-library/patch/' + patch.seoName;
    },

    /**
     * Navigates to the patch edit page.
     *
     * @param  {HoxtonOwl.Patch} patch
     *     The patch to edit.
     */
    editPatch: function(patch) {
        location = '/edit-patch/' + patch.seoName;
    },

    /**
     * Deletes a patch.
     *
     * @param  {HoxtonOwl.Patch} patch
     *     The patch to delete.
     */
    deletePatch: function(patch) {

        if (confirm('Are you sure you want to delete this patch?')) {

            var pm = HoxtonOwl.patchManager;
            var apiClient = new HoxtonOwl.ApiClient();
            apiClient.deletePatch(patch._id, function (success) {
                if (success) {
                    alert('Patch deleted successfully.');
                    location = '/patch-library';
                } else {
                    alert('Unexpected error. Patch could not be deleted.');
                }
            });
        }
    },

    /**
     * Adds a new patch
     */
    addPatch: function() {
        location = '/add-patch/';
    },

    //updateBreadcrumbs: function(patch) {
    //    $('#breadcrumbs li').slice(2).remove();
    //    if (patch) {
    //        document.title = 'The OWL | ' + patch.name;
    //        $('#breadcrumbs').append('<li><a href="/patch-library/" rel="category tag">Patches</a></li><li class="separator"> / </li><li>' + patch.name + '</li>');
    //    } else {
    //        $('#breadcrumbs').append('<li><strong>Patches</strong></li>');
    //        document.title = 'The OWL | Patch Library';
    //    }
    //}
};

HoxtonOwl.patchManager.getGithubFile.count = 0;

$(function() {

    var pm = HoxtonOwl.patchManager;
    var apiClient = new HoxtonOwl.ApiClient();
    apiClient.getAllPatches(pm.main);

});

// EOF
