function knobify () {

    function knobChange(val) {
        HoxtonOwl.patchManager.updatePatchParameters();
    }

    $(".knob.enabled").knob({
        change : knobChange,
        release : knobChange,
    });

    $(".knob.disabled").knob({
        'readOnly': true,
        'fgColor': '#aaa',
        change : knobChange,
        release : knobChange,
    });
};
