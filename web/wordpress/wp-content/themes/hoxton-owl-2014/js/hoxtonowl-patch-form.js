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
    load: function(seoName) {
        
        var apiClient = new HoxtonOwl.ApiClient();
        apiClient.getSinglePatchBySeoName(seoName, HoxtonOwl.patchForm.populate);
        
    },
    
    /**
     * Populates the form with a patch object.
     * 
     * @param {HoxtonOwl.Patch} patch
     *     An object that represents a patch.
     */
    populate: function(patch) {
        
        $('#frm-patch-id').val(patch._id);
        if (patch.name) $('#frm-patch-name').val(patch.name);
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
        if (patch.inputs) $('#frm-patch-inputs').val(patch.inputs);
        if (patch.outputs) $('#frm-patch-outputs').val(patch.outputs);
        
        // Tags
        for (var i = 0, max = patch.tags.length; i < max; i++) {
            $('#frm-patch-tags option').filter(function() {
                return $(this).text() === patch.tags[i];
            }).prop('selected', true);
        }
        HoxtonOwl.patchForm.tagMulti.trigger("chosen:updated");
        
        // Soundcloud
        if (patch.soundcloud && patch.soundcloud.length) {
            if (patch.soundcloud.length !== 1) {
                HoxtonOwl.patchForm.sampleCtrl.addNForms(patch.soundcloud.length - 1);
            }
            for (var i = 0, max = patch.soundcloud.length; i < max; i++) {
                $('#frm-patch-samples_' + i).val(patch.soundcloud[i]);
            }
        }
        
        // GitHub
        if (patch.github && patch.github.length) {
            if (patch.github.length !== 1) {
                HoxtonOwl.patchForm.gitHubCtrl.addNForms(patch.github.length - 1);
            }
            for (var i = 0, max = patch.github.length; i < max; i++) {
                $('#frm-patch-github_' + i).val(patch.github[i]);
            }
        }
    },
    
    /**
     * Creates an object that represents a patch from the values in the fields
     * of the form.
     * 
     * @return {HoxtonOwl.Patch}
     *     An object that represents a patch.
     */
    make: function() {
        
        $('#patch-add-edit-form input').
          add('#patch-add-edit-form textarea').
          add('#patch-add-edit-form select').focus(function(e) {
            var $target = $(e.target);
            $target.removeClass('invalid');
        });
        $('#patch-add-edit-form input').next('div.error-message').hide();
        $('#patch-add-edit-form textarea').next('div.error-message').hide();
        $('#patch-add-edit-form select').next('div.error-message').hide();
        
        var name = $.trim($('#frm-patch-name').val());
        var description = $.trim($('#frm-patch-description').val());
        var instructions = $.trim($('#frm-patch-instructions').val());
        
        if ('' === name) {
            $('#frm-patch-name').
                addClass('invalid').
                next('div.error-message').
                text('This field is required.').
                show();
            location = '#form-top';
            return;
        }
        
        if ('' === description) {
            $('#frm-patch-description').
                addClass('invalid').
                next('div.error-message').
                text('This field is required.').
                show();
            location = '#form-top';
            return;
        }
        
        if ('' === instructions) {
            $('#frm-patch-instructions').
                addClass('invalid').
                next('div.error-message').
                text('This field is required.').
                show();
            location = '#form-top';
            return;
        }
        
        var patch = {
            name: name,
            // author: '', // FIXME
            description: description,
            instructions: instructions,
            inputs: parseInt($('#frm-patch-inputs').val()),
            outputs: parseInt($('#frm-patch-outputs').val())
        };
        
        var percent = $.trim($('#frm-patch-cycles').val());
        if ('' !== percent) {
            patch.cycles = HoxtonOwl.Patch.prototype.percentToCycles(percent); // FIXME - what precision is required here?
        }
        
        var bytes = $('#frm-patch-bytes').val();
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
        $('input[type=url][id^=frm-patch-samples_]').each(function(i, el) {
            var val = $.trim($(el).val());
            if ('' != val) {
                patch.soundcloud.push(val);
            }
        });
        
        // github
        patch.github = [];
        $('input[type=url][id^=frm-patch-github_]').each(function(i, el) {
            var val = $.trim($(el).val());
            if ('' != val) {
                patch.github.push(val);
            }
        });
        
        return patch;
        
    },
    
    /**
     * Saves a patch to the database.
     * 
     * @return {HoxtonOwl.Patch}
     *     An object that represents a patch.
     */
    save: function(patch) {
        
        var apiClient = new HoxtonOwl.ApiClient;
        apiClient.savePatch(patch);
        
    },
    
    /**
     * Initializes the form.
     */
    init: function() {
        
        jQuery(function() {
            
            var $ = jQuery;
            
            // tag multi select
            HoxtonOwl.patchForm.tagMulti = $(".chosen-select").chosen({
                no_results_text: "Oops, nothing found!"
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
            HoxtonOwl.patchForm.sampleCtrl = $('#frm-patch-samples').sheepIt(options);
            HoxtonOwl.patchForm.gitHubCtrl = $('#frm-patch-github').sheepIt(options);
            
            var client = new HoxtonOwl.ApiClient();
            client.getAllTags(function(tags) {
                for (var i = 0, max = tags.length; i < max; i++) {
                    $('#frm-patch-tags').append('<option>' + tags[i] + '</option>');
                }
                HoxtonOwl.patchForm.tagMulti.trigger("chosen:updated");
            });
            
            $('#frm-patch-btn-submit').click(function(e) {
                var patch = HoxtonOwl.patchForm.make();
                if (patch) {
                    HoxtonOwl.patchForm.save(patch);
                }
            });
            
            // Trigger the "formInited" event
            $(document).trigger('formInited');
            
        });
    }
};

(function() {
    
    $(document).on('formInited', function(e) {
        var url = location.pathname;
        var matches = url.match(/^\/edit-patch\/.+\/?$/g);
        if (matches) {
            var seoName = url.split('/')[2];
            HoxtonOwl.patchForm.load(seoName);
        }
    });
    
    HoxtonOwl.patchForm.init();
    
    
})();