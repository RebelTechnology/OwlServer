function knobify () {

    $(".knob").knob({
        change : function (value) {
            HoxtonOwl.patchManager.updatePatchParameters();
        },
        release : function (value) {
            HoxtonOwl.patchManager.updatePatchParameters();
        },
        /*cancel : function () {
            //console.log("cancel : ", this);
        },*/
        /*format : function (value) {
          return value + '%';
          },*/
        draw : function () {
            // "tron" case
            if(this.$.data('skin') == 'tron') {
                this.cursorExt = 0.3;
                var a = this.arc(this.cv)  // Arc
                , pa                   // Previous arc
                , r = 1;
                this.g.lineWidth = this.lineWidth;
                if (this.o.displayPrevious) {
                    pa = this.arc(this.v);
                    this.g.beginPath();
                    this.g.strokeStyle = this.pColor;
                    this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, pa.s, pa.e, pa.d);
                    this.g.stroke();
                }
                this.g.beginPath();
                this.g.strokeStyle = r ? this.o.fgColor : this.fgColor ;
                this.g.arc(this.xy, this.xy, this.radius - this.lineWidth, a.s, a.e, a.d);
                this.g.stroke();
                this.g.lineWidth = 2;
                this.g.beginPath();
                this.g.strokeStyle = this.o.fgColor;
                this.g.arc( this.xy, this.xy, this.radius - this.lineWidth + 1 + this.lineWidth * 2 / 3, 0, 2 * Math.PI, false);
                this.g.stroke();
                return false;
            }
        }
    });
};
