function knobify () {

    function knobChange(val) {
        HoxtonOwl.patchManager.updatePatchParameters();
    }

    $(".knob").knob({
        change : knobChange,
        release : knobChange,
	readOnly : false
    });
};
