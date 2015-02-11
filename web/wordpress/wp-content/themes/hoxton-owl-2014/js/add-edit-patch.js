/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

jQuery(function() {
    
    var $ = jQuery;
    
    // tag multi select
    var tagMulti = $(".chosen-select").chosen({
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
    $('#frm-patch-samples').sheepIt(options);
    $('#frm-patch-github').sheepIt(options);
    
    var client = new HoxtonOwl.ApiClient();
    client.getAllTags(function(tags) {
        for (var i = 0, max = tags.length; i < max; i++) {
            $('#frm-patch-tags').append('<option>' + tags[i] + '</option>');
        }
        tagMulti.trigger("chosen:updated");
    });
});

// EOF