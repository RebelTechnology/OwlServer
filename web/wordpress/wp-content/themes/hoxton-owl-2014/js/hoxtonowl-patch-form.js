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
 * Conveniently groups some utility functions to handle the add/edit form.
 *
 * @namespace
 */
HoxtonOwl.patchForm = {

    /**
     * Loads a patch.
     *
     * @param {string} seoName
     *     The SEO name of the patch to load.
     */
    load: function (seoName) {

        var apiClient = new HoxtonOwl.ApiClient();
        apiClient.getSinglePatchBySeoName(seoName, HoxtonOwl.patchForm.populate);

    },

    /**
     * Populates the form with a patch object.
     *
     * @param {HoxtonOwl.Patch} patch
     *     An object that represents a patch.
     */
    populate: function (patch) {

        var form = HoxtonOwl.patchForm;

        $('#frm-patch-id').val(patch._id);
        if (patch.name) $('#frm-patch-name').val(patch.name);

        // Author
        var wordPressIdRadio = $('#frm-patch-author-type-wordpress');
        var patchAuthorNameRadio = $('#frm-patch-author-type-other');
        if (wordPressIdRadio.length && patchAuthorNameRadio.length) {
            if ('wordpress' === patch.author.type && !!patch.author.wordpressId) {
                $('#frm-patch-author-wordpressId').
                    append('<option value="' + patch.author.wordpressId + '">' + patch.author.name + '</option>').
                    trigger('change');
                wordPressIdRadio.prop('checked', true);
            } else {
                $('#frm-patch-author-name').val(patch.author.name);
                patchAuthorNameRadio.prop('checked', true);
            }
        }

        // Published field
        if ('published' in patch) {
            $('#frm-patch-published').val(patch.published).trigger('change');
        }
        form.updateMandatoryFields();

        // Description & instructions
        if (patch.description) $('#frm-patch-description').val(patch.description);
        if (patch.instructions) $('#frm-patch-instructions').val(patch.instructions);

        // Parameters
        if (patch.parameters) {
            if (patch.parameters.a) $('#frm-patch-parameters-a').val(patch.parameters.a);
            if (patch.parameters.b) $('#frm-patch-parameters-b').val(patch.parameters.b);
            if (patch.parameters.c) $('#frm-patch-parameters-c').val(patch.parameters.c);
            if (patch.parameters.d) $('#frm-patch-parameters-d').val(patch.parameters.d);
            if (patch.parameters.e) $('#frm-patch-parameters-e').val(patch.parameters.e);
        }

        if (patch.cycles) $('#frm-patch-cycles').val(patch.cycles);
        if (patch.bytes) $('#frm-patch-bytes').val(patch.bytes);
        if (patch.inputs) $('#frm-patch-inputs').val(patch.inputs).trigger('change');
        if (patch.outputs) $('#frm-patch-outputs').val(patch.outputs).trigger('change');

        // Tags
        var tagData = [];
        for (var i = 0, max = patch.tags.length; i < max; i++) {

            $('#frm-patch-tags option').filter(function () {
                return $(this).text() === patch.tags[i];
            }).prop('selected', true);

            tagData.push([{ id: patch.tags[i], text: patch.tags[i] }]);
        }
        form.tagMulti.select2({
            placeholder: 'Pick one or more tags...',
            data: tagData,
            tags: true
        });

        // Soundcloud
        if (patch.soundcloud && patch.soundcloud.length) {
            if (patch.soundcloud.length !== 1) {
                form.sampleCtrl.addNForms(patch.soundcloud.length - 1);
            }
            for (var i = 0, max = patch.soundcloud.length; i < max; i++) {
                $('#frm-patch-samples_' + i).val(patch.soundcloud[i]);
            }
        }

        // GitHub
        if (patch.github && patch.github.length) {
            if (patch.github.length !== 1) {
                form.gitHubCtrl.addNForms(patch.github.length - 1);
            }
            for (var i = 0, max = patch.github.length; i < max; i++) {
                $('#frm-patch-github_' + i).val(patch.github[i]);
            }
        }

        // Creation time
        if ($('#frm-patch-creationTimeUtc').length) {
            $('#frm-patch-creationTimeUtc').val(new Date(patch.creationTimeUtc).toISOString());
        }
    },

    /**
     * Creates an object that represents a patch from the values in the fields
     * of the form.
     *
     * @return {HoxtonOwl.Patch}
     *     An object that represents a patch.
     */
    make: function () {

        $('#patch-add-edit-form input').
          add('#patch-add-edit-form textarea').
          add('#patch-add-edit-form select').focus(function (e) {
            var $target = $(e.target);
            $target.removeClass('invalid');
        });
        $('#patch-add-edit-form input').siblings('div.error-message').hide();
        $('#patch-add-edit-form textarea').siblings('div.error-message').hide();
        $('#patch-add-edit-form select').siblings('div.error-message').hide();

        $('[id^=frm-patch-samples_]').
            removeClass('invalid').
            nextAll('div.error-message').
            hide();
        $('[id^=frm-patch-github_]').
            removeClass('invalid').
            nextAll('div.error-message').
            hide();

        var name = $.trim($('#frm-patch-name').val());
        var description = $.trim($('#frm-patch-description').val());
        var instructions = $.trim($('#frm-patch-instructions').val());

        if ('' === name) {
            $('#frm-patch-name').
                addClass('invalid').
                siblings('div.error-message').
                text('This field is required.').
                show();
            location = '#form-top';
            return;
        }

        if ($('#frm-patch-author-type-wordpress').length) {

            var author = {};
            if ($('#frm-patch-author-type-wordpress').prop('checked')) {
                author.type = 'wordpress';
                author.wordpressId = $('#frm-patch-author-wordpressId').val();
                author.name = $.trim($('#frm-patch-author-wordpressId option[value="' + author.wordpressId + '"]').text());
                $('#frm-patch-author-name').val('');
            } else if ($('#frm-patch-author-type-other').prop('checked')) {
                author.name = $.trim($('#frm-patch-author-name').val());
                $('#frm-patch-author-wordpressId').empty().val(null).trigger('change');
            }

            if (!('name' in author) || '' === author.name) {
                $('#frm-patch-author-name').
                    addClass('invalid').
                    siblings('div.error-message').
                    text('Invalid author.').
                    show();
                location = '#form-top';
                return;
            }

            if (('type' in author) && (author.type !== 'wordpress' || !('wordpressId' in author) || !author.wordpressId)) {
                $('#frm-patch-author-name').
                    addClass('invalid').
                    siblings('div.error-message').
                    text('Invalid author.').
                    show();
                location = '#form-top';
                return;
            }
        }

        // published
        var published = $('#frm-patch-published').val() == 0 ? '' : true;

        if ('' === description) {
            $('#frm-patch-description').
                addClass('invalid').
                siblings('div.error-message').
                text('This field is required.').
                show();
            location = '#form-top';
            return;
        }

        if (published && '' === instructions) {
            $('#frm-patch-instructions').
                addClass('invalid').
                siblings('div.error-message').
                text('This field is required for published patches.').
                show();
            location = '#form-top';
            return;
        }

        var patch = {
            name: name,
            description: description,
            instructions: instructions,
            inputs: parseInt($('#frm-patch-inputs').val()),
            outputs: parseInt($('#frm-patch-outputs').val()),
            published: published ? 1 : 0
        };

        if (author) {
            patch.author = author;
        }

        var percent = $.trim($('#frm-patch-cycles').val());
        if (published && '' === percent) {
            $('#frm-patch-cycles').
                addClass('invalid').
                siblings('div.error-message').
                text('This field is required for published patches.').
                show();
            location = '#form-top';
            return;
        }
        if ('' !== percent) {
            patch.cycles = HoxtonOwl.Patch.prototype.percentToCycles(percent); // FIXME - what precision is required here?
        }

        var bytes = $('#frm-patch-bytes').val();
        if (published && '' === bytes) {
            $('#frm-patch-bytes').
                addClass('invalid').
                siblings('div.error-message').
                text('This field is required for published patches.').
                show();
            location = '#form-top';
            return;
        }
        if ('' !== bytes) {
            patch.bytes = Math.round(bytes);
        }

        if ($('#frm-patch-id').length) {
            var patchId = $('#frm-patch-id').val();
            if ('' !== patchId) {
                patch._id = patchId;
            }
        }

        // tags
        patch.tags = [];
        var tags = $('#frm-patch-tags').val();
        if (null !== tags) {
            patch.tags = tags;
        }

        // parameters
        patch.parameters = {
            a: $.trim($('#frm-patch-parameters-a').val()),
            b: $.trim($('#frm-patch-parameters-b').val()),
            c: $.trim($('#frm-patch-parameters-c').val()),
            d: $.trim($('#frm-patch-parameters-d').val()),
            e: $.trim($('#frm-patch-parameters-e').val())
        };
        for (key in patch.parameters) {
            if ('' === patch.parameters[key]) {
                delete patch.parameters[key];
            }
        }

        // soundcloud
        patch.soundcloud = [];
        $('input[type=url][id^=frm-patch-samples_]').each(function (i, el) {
            var val = $.trim($(el).val());
            if ('' != val) {
                patch.soundcloud.push(val);
            }
        });

        // github
        patch.github = [];
        $('input[type=url][id^=frm-patch-github_]').each(function (i, el) {
            var val = $.trim($(el).val());
            if ('' != val) {
                patch.github.push(val);
            }
        });

        // creation time
        var $creationTimeUtc = $('#frm-patch-creationTimeUtc');
        if ($creationTimeUtc.length && $creationTimeUtc.val() !== '') {
            var creationTimeUtc = new Date($creationTimeUtc.val()).getTime();
            if (isNaN(creationTimeUtc)) {
                $creationTimeUtc.
                    addClass('invalid').
                    siblings('div.error-message').
                    text('Invalid date/time.').
                    show();
                location = '#form-top';
                return;
            }
            patch.creationTimeUtc = creationTimeUtc;
        }

        return patch;

    },

    /**
     * Saves a patch to the database.
     *
     * @return {HoxtonOwl.Patch}
     *     An object that represents a patch.
     */
    save: function (patch) {

        var apiClient = new HoxtonOwl.ApiClient;
        apiClient.savePatch(patch, function (data) {
            if (data._id) { // patch saved
                // clean up locally hosted source files:
                $.ajax({
                    url: '/wp-admin/admin-ajax.php',
                    dataType: 'json',
                    data: {
                        action: 'owl-patch-file-cleanup',
                        patchId: data._id
                    },
                    cache: false,
                    error: function (jqXHR, textStatus, errorThrown ) {},
                    complete: function (jqXHR, textStatus) { // Executed regardless of whethere the clean-up succeeded or not
                        // Final redirect
                        location = '/patch-library/patch/' + data.seoName;
                    },
                    success: function (data, textStatus, jqXHR) {}
                });
            } else if (data.responseJSON) {

                var response = data.responseJSON;
                if (response.error && response.field && response.message) {

                    if (response.field == 'soundcloud' || response.field == 'github') {
                        $('#frm-patch-' + (response.field == 'soundcloud' ? 'samples' : 'github') + '_' + response.index).
                            addClass('invalid').
                            nextAll('div.error-message').
                            text(response.message).
                            show();
                    } else if (response.field == 'author') {
                        $('#frm-patch-author-name').
                            addClass('invalid').
                            siblings('div.error-message').
                            text('Invalid author.').
                            show();
                    } else {
                        $('#frm-patch-' + response.field).
                            addClass('invalid').
                            siblings('div.error-message').
                            text(response.message).
                            show();
                    }
                    location = '#form-top';
                } else {
                    alert('Internal error.');
                }
            } else {
                alert('Internal error.');
            }
        });
    },

    /**
     * Updates mandatory fields.
     *
     * Some fields are mandatory based on whether the patch is published or not.
     */
    updateMandatoryFields: function () {

        if (0 == $('#frm-patch-published.form-control').val()) { // not published

            // Instructions
            $('label[for=frm-patch-instructions]').removeClass('required');
            $('#frm-patch-instructions').removeAttr('required');

            // CPU
            $('label[for=frm-patch-cycles]').removeClass('required');
            $('#frm-patch-cycles').removeAttr('required');

            // Memory
            $('label[for=frm-patch-bytes]').removeClass('required');
            $('#frm-patch-bytes').removeAttr('required');

        } else { // published

            // Instructions
            $('label[for=frm-patch-instructions]').addClass('required');
            $('#frm-patch-instructions').attr('required', '');

            // CPU
            $('label[for=frm-patch-cycles]').addClass('required');
            $('#frm-patch-cycles').attr('required', '');

            // Memory
            $('label[for=frm-patch-bytes]').addClass('required');
            $('#frm-patch-bytes').attr('required', '');

        }
    },

    /**
     * Initializes the form.
     */
    init: function () {

        jQuery(function () {

            var $ = jQuery;
            var form = HoxtonOwl.patchForm;

            // Selects
            $('#frm-patch-inputs').select2({
                minimumResultsForSearch: Infinity
            });
            $('#frm-patch-outputs').select2({
                minimumResultsForSearch: Infinity
            });
            $('#frm-patch-published').select2({
                minimumResultsForSearch: Infinity
            });

            $('#frm-patch-published').change(function () {
                form.updateMandatoryFields();
            });
            form.updateMandatoryFields();

            var wordPressIdRadio = $('#frm-patch-author-wordpressId');
            if (wordPressIdRadio.length) {
                var $eventSelect = wordPressIdRadio.select2({
                        ajax: {
                            url: '/wp-admin/admin-ajax.php',
                            dataType: 'json',
                            delay: 250,
                            data: function (params) {
                                return {
                                    q: params.term, // search term
                                    page: params.page,
                                    action: 'owl-username-autocomplete'
                                };
                            },
                            processResults: function (data, page) {

                                var results = [];

                                for (var i = 0, max = data.items.length; i < max; i++) {
                                    results.push({
                                        id: parseInt(data.items[i].ID),
                                        text: data.items[i].data.user_login
                                    });
                                }

                            return { results: results };
                        },
                        type: 'POST',
                        cache: true
                    },
                    minimumInputLength: 1
                });
                var checkWordPressIdRadio = function () {
                    $('#frm-patch-author-type-wordpress').prop('checked', true);
                };
                $eventSelect.on("select2:open", function (e) { checkWordPressIdRadio(); });
                $eventSelect.on("select2:close", function (e) { checkWordPressIdRadio(); });
                $eventSelect.on("select2:select", function (e) { checkWordPressIdRadio(); });
                $eventSelect.on("select2:unselect", function (e) { checkWordPressIdRadio(); });
            }

            var patchAuthorNameRadio = $('#frm-patch-author-name');
            if (patchAuthorNameRadio.length) {
                $('#frm-patch-author-name').focus(function (e) {
                    $('#frm-patch-author-type-other').prop('checked', true);
                });
            }

            form.tagMulti = $('#frm-patch-tags');
            form.tagMulti.select2({
                placeholder: 'Pick one or more tags...',
                tags: true
            });

            var options = {
                separator: '',
                allowRemoveLast: false,
                allowRemoveCurrent: true,
                allowRemoveAll: false,
                allowAdd: true,
                allowAddN: false,
                maxFormsCount: 10,
                minFormsCount: 1,
                iniFormsCount: 1
            };
            form.sampleCtrl = $('#frm-patch-samples').sheepIt(options);
            form.gitHubCtrl = $('#frm-patch-github').sheepIt(options);

            var client = new HoxtonOwl.ApiClient();
            client.getAllTags(function (tags) {
                for (var i = 0, max = tags.length; i < max; i++) {
                    $('#frm-patch-tags').append('<option>' + tags[i] + '</option>');
                }
            });

            $('#frm-patch-btn-submit').click(function (e) {
                var patch = form.make();
                if (patch) {
                    form.save(patch);
                }
            });

            $('#frm-patch-btn-cancel').click(function (e) {
                location = '/patch-library/';
            });

            // Trigger the "formInited" event
            $(document).trigger('formInited');

            // Source file upload
            var fileUpload = $('#frm-patch-file');

            HoxtonOwl.patchForm.fileUploadToken = '';
            var bag = 'abcdefghijklmnopqrstuvwxyz0123456789';
            for (var i = 0; i < 7; i++) {
                HoxtonOwl.patchForm.fileUploadToken += bag.charAt(Math.floor(Math.random() * bag.length));
            }

            fileUpload.change(function (e) {

                fileUpload.prop('disabled', true);
                $('#frm-patch-file').closest('.form-control').next('.error-message').html('').hide();

                var data = new FormData();
                var files = fileUpload[0].files;
                for (var i = 0; i < files.length; i++) {
                    data.append('files[]', files[i]);
                }

                var patchId = $('#frm-patch-id').val();
                if (patchId) {
                    data.append('patchId', patchId);
                } else {
                    data.append('fileUploadToken', HoxtonOwl.patchForm.fileUploadToken);
                }

                data.append('action', 'owl-patch-file-upload'); // WordPress action

                $.ajax({
                    url: '/wp-admin/admin-ajax.php',
                    type: 'POST',
                    contentType: false,
                    data: data,
                    processData: false,
                    cache: false
                }).done(HoxtonOwl.patchForm.handleUploads);

            });
        });
    },

    handleUploads: function (data) {

        var errorDiv = $('#frm-patch-file').closest('.form-control').next('.error-message');
        var fileUpload = $('#frm-patch-file');

        fileUpload.prop('disabled', false);

        // reset file input (see http://stackoverflow.com/questions/1043957/clearing-input-type-file-using-jquery#13351234)
        fileUpload.wrap('<form>').closest('form').get(0).reset();
        fileUpload.unwrap();

        if (data.err) {
            errorDiv.html('Unexpected error during file upload.').show();
        } else {

            var files = [];
            var errorMsg = '';
            for (var i = 0, max = data.files.length; i < max; i++) {
                if (data.files[i].err) {
                    var errorMsg = errorDiv.html();
                    errorDiv.html(errorMsg + data.files[i].name + ': ' + data.files[i].msg + '<br />');
                    errorDiv.show();
                } else {
                    //console.log(location.protocol + '//' + location.host + '/wp-content/uploads/patch-files/' + data.files[i].path);
                    files.push(location.protocol + '//' + location.host + '/wp-content/uploads/patch-files/' + data.files[i].path);
                }
            }

            var fileFields = $('input[type=url][id^=frm-patch-github_]');
            var currentFiles = Array.prototype.map.call(fileFields, function (e) { return e.value; });
            currentFiles = currentFiles.filter(function (e) { return e != ''; });
            files = files.filter(function (e) { return currentFiles.indexOf(e) == -1 });

            // Populate any empty fields
            var file;
            for (var i = 0, max = fileFields.length; i < max; i++) {
                if (!fileFields[i].value) {
                    file = files.pop();
                    if (file) {
                        fileFields[i].value = file;
                    } else {
                        break;
                    }
                }
            }

            // Create new fields for remaining elements
            while (file = files.pop()) {
                HoxtonOwl.patchForm.gitHubCtrl.addForm();
                $('input[type=url][id^=frm-patch-github_]').last().val(file);
            }
        }
    }
};

(function () {

    $(document).on('formInited', function (e) {
        var url = location.pathname;
        var matches = url.match(/^\/edit-patch\/.+\/?$/g);
        if (matches) {
            var seoName = url.split('/')[2];
            HoxtonOwl.patchForm.load(seoName);
        }
    });

    HoxtonOwl.patchForm.init();

})();
