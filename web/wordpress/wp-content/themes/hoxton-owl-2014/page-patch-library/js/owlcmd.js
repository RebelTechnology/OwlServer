/**
 * @namespace
 */
var HoxtonOwl;
if (!HoxtonOwl) {
    HoxtonOwl = {};
}

HoxtonOwl.owlCmd = {

    monitorTask: undefined,

    noteOn: function(note, velocity) {
      console.log("received noteOn "+note+"/"+velocity);
    },

    noteOff: function(note) {
      console.log("received noteOff "+note);
    },

    getStringFromSysex: function(data, startOffset, endOffset){
      var str = "";
      for(i=startOffset; i<(data.length-endOffset) && data[i] != 0x00; ++i)
        str += String.fromCharCode(data[i]);
      return str;
    },

    sendCommand: function(cmd){
        sendSysexCommand(cmd);
    },

    registerPatch: function(idx, name){
        $('#patchnames').append($("<option>").attr('value',idx).text(name));
    },

    log: function(msg){
        $('#log').append('<li><span class="badge">' + msg + '</span></li>');
    },

    systemExclusive: function(data) {
        if(data.length > 3 && data[0] == 0xf0
           && data[1] == MIDI_SYSEX_MANUFACTURER
           && data[2] == MIDI_SYSEX_DEVICE){
        // console.log("sysex: 0x"+data[3].toString(16)+" length: "+data.length);
            switch(data[3]){
                case OpenWareMidiSysexCommand.SYSEX_PRESET_NAME_COMMAND:
                        var name = getStringFromSysex(data, 5, 1);
                    var idx = data[4];
                    registerPatch(idx, name);
                    // log("preset "+idx+": "+name);
                    break;
                case OpenWareMidiSysexCommand.SYSEX_PARAMETER_NAME_COMMAND:
                        var name = getStringFromSysex(data, 5, 1);
                    var pid = data[4]+1;
                    console.log("parameter "+pid+" :"+name);
                    $("#p"+pid).text(name);
                    break;
                case OpenWareMidiSysexCommand.SYSEX_PROGRAM_STATS:
                        var msg = this.getStringFromSysex(data, 4, 1);
                    $("#patchstatus").text(msg);        
                    break;
                case OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION:
                        var msg = getStringFromSysex(data, 4, 1);
                    $("#firmwareversion").text(msg);        
                    break;
                case OpenWareMidiSysexCommand.SYSEX_DEVICE_STATS:
                case OpenWareMidiSysexCommand.SYSEX_PROGRAM_MESSAGE:
                    // deliberate fall-through
                default:
                        var msg = getStringFromSysex(data, 4, 1);
                    log(msg);
                    break;
            }
        }
    },

    registerMidiInput: function (index, name){
      var select = document.getElementById("midiInputs");
      select.options[index] = new Option(name, index);
    },

    registerMidiOutput: function (index, name){
      var select = document.getElementById("midiOutputs");
      select.options[index] = new Option(name, index);
    },

    controlChange: function (cc, value){
        console.log("received CC "+cc+": "+value);
        switch(cc){
        case OpenWareMidiControl.PATCH_PARAMETER_A:
        $("#p1").val(value);
        break;
        case OpenWareMidiControl.PATCH_PARAMETER_B:
        $("#p2").val(value);
        break;
        case OpenWareMidiControl.PATCH_PARAMETER_C:
        $("#p3").val(value);
        break;
        case OpenWareMidiControl.PATCH_PARAMETER_Da:
        $("#p4").val(value);
        break;
        }
    },

    programChange: function (pc){
        console.log("received PC "+pc);
        var name = $("#patchnames option:eq("+pc+")").text();
        console.log("patch name "+name);
        $("#patchname").text(name);             
    },


    sendRequest: function (type){
        HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.REQUEST_SETTINGS, type);
    },

    sendStatusRequest: function (){
        this.sendRequest(OpenWareMidiSysexCommand.SYSEX_PROGRAM_STATS);
    },

    setParameter: function (pid, value){
        console.log("parameter "+pid+": "+value);
        HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_A+pid, value);
    },

    selectPatch: function (pid){
        console.log("select patch "+pid);
        for(i=0; i<5; ++i)
        $("#p"+i).text("");
        sendPc(pid);
    },

    sendLoadRequest: function (){
        this.sendRequest(OpenWareMidiSysexCommand.SYSEX_PRESET_NAME_COMMAND);
        this.sendRequest(OpenWareMidiSysexCommand.SYSEX_PARAMETER_NAME_COMMAND);
    },

    onMidiInitialised: function (){
        $("#midiInputs").val(0).change();
        $("#midiOutputs").val(0).change();
        // selectMidiInput(3);
        // selectMidiOutput(4);
        // selectMidiInput(0);
        // selectMidiOutput(0);
        console.log("showtime");
    },

    updatePermission: function (name, status) {
        console.log('update permission for ' + name + ' with ' + status);
        this.log('update permission for ' + name + ' with ' + status);
    },

    hookupButtonEvents: function () {
        // Check for Midi/Midi SysEx permissions

        // if(navigator && navigator.permissions){
        //  navigator.permissions.query({name:'midi', sysex:false}).then(function(p) {
        //         updatePermission('midi', p.status);
        //         p.onchange = function() {
        //      updatePermission('midi', this.status);
        //         };
        //  });

        //  navigator.permissions.query({name:'midi', sysex:true}).then(function(p) {
        //         updatePermission('midi-sysex', p.status);
        //         p.onchange = function() {
        //      updatePermission('midi-sysex', this.status);
        //      initialiseMidi(onMidiInitialised);
        //         };
        //  });
        // }

        // $("#midi").on('click', function() {
        //  if(navigator && navigator.requestMIDIAccess)
        //         navigator.requestMIDIAccess({sysex:false});
        // });

        $("#connect").on('click', function() {
            if(navigator && navigator.requestMIDIAccess)
            {
                navigator.requestMIDIAccess({sysex:true});
            }
            HoxtonOwl.midiClient.initialiseMidi(this.onMidiInitialised);
            HoxtonOwl.owlCmd.sendRequest(OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION);
            HoxtonOwl.owlCmd.sendLoadRequest();
            HoxtonOwl.owlCmd.sendStatusRequest();
        });

        $("#monitor").on('click', function() {
        if(this.monitorTask == undefined){
            this.monitorTask = window.setInterval(sendStatusRequest, 1000);
        }else{
            clearInterval(this.monitorTask);
            this.monitorTask = undefined;
        }
        });

        // initialiseMidi(onMidiInitialised);
        
        $('#clear').on('click', function() {
        $('#log').empty();
        return false;
        });
    }
}
