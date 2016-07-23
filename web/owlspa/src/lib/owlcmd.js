import { midiClient } from 'lib';

import { openWareMidi } from  'lib';

// const {
//     MIDI_SYSEX_MANUFACTURER,
//     MIDI_SYSEX_DEVICE,
//     OpenWareMidiSysexCommand,
//     OpenWareMidiControl
// } = openWareMidi;

console.log(openWareMidi);


const owlCmd = {};

owlCmd.monitorTask = undefined;

owlCmd.sleep = function(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

owlCmd.noteOn = function(note, velocity) {
  console.log("received noteOn "+note+"/"+velocity);
}

owlCmd.noteOff = function(note) {
  console.log("received noteOff "+note);
}

owlCmd.getStringFromSysex = function(data, startOffset, endOffset){
  var str = "";
  for(i=startOffset; i<(data.length-endOffset) && data[i] != 0x00; ++i)
    str += String.fromCharCode(data[i]);
  return str;
}

owlCmd.sendCommand = function(cmd){
    midiClient.sendSysexCommand(cmd);
}

owlCmd.registerPatch = function(idx, name){
    $('#patchnames').append($("<option>").attr('value',idx).text(name));
}

owlCmd.log = function(msg){
    $('#log').append('<li><span class="badge">' + msg + '</span></li>');
}

owlCmd.systemExclusive = function(data) {
    if(data.length > 3 && data[0] == 0xf0
       && data[1] == MIDI_SYSEX_MANUFACTURER
       && data[2] == MIDI_SYSEX_DEVICE){
	// console.log("sysex: 0x"+data[3].toString(16)+" length: "+data.length);
	switch(data[3]){
	case OpenWareMidiSysexCommand.SYSEX_PRESET_NAME_COMMAND:
            var name = owlCmd.getStringFromSysex(data, 5, 1);
	    var idx = data[4];
	    owlCmd.registerPatch(idx, name);
	    // log("preset "+idx+": "+name);
	    break;
	case OpenWareMidiSysexCommand.SYSEX_PARAMETER_NAME_COMMAND:
            var parameter_map = [' ', 'a', 'b', 'c', 'd', 'e'];
            var name = owlCmd.getStringFromSysex(data, 5, 1);
	    var pid = data[4]+1;
	    console.log("parameter "+pid+" :"+name);
	    $("#p"+pid).text(name); // update the prototype slider names
	    break;
	case OpenWareMidiSysexCommand.SYSEX_PROGRAM_STATS:
            var msg = owlCmd.getStringFromSysex(data, 4, 1);
	    $("#patchstatus").text(msg);	    
	    break;
	case OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION:
            var msg = owlCmd.getStringFromSysex(data, 4, 1);
	    $("#ourstatus").text("Connected to "+msg);	    
	    break;
	case OpenWareMidiSysexCommand.SYSEX_PROGRAM_MESSAGE:
            var msg = owlCmd.getStringFromSysex(data, 4, 1);
	    $("#patchmessage").text("["+msg+"]");
	    break;
	case OpenWareMidiSysexCommand.SYSEX_DEVICE_STATS:
	default:
            var msg = owlCmd.getStringFromSysex(data, 4, 1);
	    owlCmd.log("Unhandled message: "+msg);
	    break;
	}
    }
}

owlCmd.controlChange = function(cc, value){
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
}

owlCmd.programChange = function(pc){
    console.log("received PC "+pc);
    var name = $("#patchnames option:eq("+pc+")").text();
    console.log("patch name "+name);
    $("#patchname").text(name);			    
}


owlCmd.sendRequest = function(type){
    midiClient.sendCc(OpenWareMidiControl.REQUEST_SETTINGS, type);
}

owlCmd.sendStatusRequest = function(){
    owlCmd.sendRequest(OpenWareMidiSysexCommand.SYSEX_PROGRAM_STATS);
    owlCmd.sendRequest(OpenWareMidiSysexCommand.SYSEX_PROGRAM_MESSAGE);
}

owlCmd.doStatusRequestLoop = true;
owlCmd.statusRequestLoop = function() {
    owlCmd.sendStatusRequest();
    if(owlCmd.doStatusRequestLoop)
	setTimeout(owlCmd.statusRequestLoop, 2000);
}

owlCmd.setParameter = function(pid, value){
    console.log("parameter "+pid+": "+value);
    midiClient.sendCc(OpenWareMidiControl.PATCH_PARAMETER_A+pid, value);
}

owlCmd.selectOwlPatch = function(pid){
    var parameter_map = [' ', 'a', 'b', 'c', 'd', 'e'];

    console.log("select patch "+pid);

    for(i=0; i<5; ++i) {
        $("#p"+i).text(""); // clear the prototype slider names
    }
    
    midiClient.sendPc(pid);
}

owlCmd.sendLoadRequest = function(){
    owlCmd.sendRequest(OpenWareMidiSysexCommand.SYSEX_PRESET_NAME_COMMAND);
    owlCmd.sendRequest(OpenWareMidiSysexCommand.SYSEX_PARAMETER_NAME_COMMAND);
}

owlCmd.onMidiInitialised = function(){

    // auto set the input and output to an OWL
    
    var outConnected = false,
        inConnected = false;

    for (var o = 0; o < midiClient.midiOutputs.length; o++) {
        if (midiClient.midiOutputs[o].name.match('^OWL-MIDI')) {
            midiClient.selectMidiOutput(o);
            outConnected = true;
            break;
        }        
    }

    for (var i = 0; i < midiClient.midiInputs.length; i++) {
        if (midiClient.midiInputs[i].name.match('^OWL-MIDI')) {
            midiClient.selectMidiInput(i);
            inConnected = true;
            break;
        }        
    }

    if (inConnected && outConnected) {
        console.log('connected to an OWL');
        $('#ourstatus').text('Connected to an OWL')
        $('#load-owl-button').show();
    } else {
        console.log('failed to connect to an OWL');
        $('#ourstatus').text('Failed to connect to an OWL')
        $('#load-owl-button').hide();
    }

    // owlCmd.sendLoadRequest(); // load patches
    owlCmd.sendRequest(OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION);
    owlCmd.statusRequestLoop();
}

owlCmd.updatePermission = function(name, status) {
    console.log('update permission for ' + name + ' with ' + status);
    owlCmd.log('update permission for ' + name + ' with ' + status);
}

owlCmd.connectToOwl = function() {
    if(navigator && navigator.requestMIDIAccess)
    {
        navigator.requestMIDIAccess({sysex:true});
    }
    midiClient.initialiseMidi(owlCmd.onMidiInitialised);
}

// owlCmd.hookupButtonEvents = function() {
    // Check for Midi/Midi SysEx permissions

    // if(navigator && navigator.permissions){
    // 	navigator.permissions.query({name:'midi', sysex:false}).then(function(p) {
    //         owlCmd.updatePermission('midi', p.status);
    //         p.onchange = function() {
    // 		owlCmd.updatePermission('midi', this.status);
    //         };
    // 	});

    // 	navigator.permissions.query({name:'midi', sysex:true}).then(function(p) {
    //         owlCmd.updatePermission('midi-sysex', p.status);
    //         p.onchange = function() {
    // 		owlCmd.updatePermission('midi-sysex', this.status);
    // 		midiClient.initialiseMidi(owlCmd.onMidiInitialised);
    //         };
    // 	});
    // }

    // $("#midi").on('click', function() {
    // 	if(navigator && navigator.requestMIDIAccess)
    //         navigator.requestMIDIAccess({sysex:false});
    // });

    // $("#connect").on('click', owlCmd.connectToOwl);

    // $("#monitor").on('click', function() {
    // 	if(owlCmd.monitorTask == undefined){
    // 	    owlCmd.monitorTask = window.setInterval(owlCmd.sendStatusRequest, 1000);
    // 	}else{
    // 	    clearInterval(owlCmd.monitorTask);
    // 	    owlCmd.monitorTask = undefined;
    // 	}
    // });

    // midiClient.initialiseMidi(owlCmd.onMidiInitialised);
    
    // $('#clear').on('click', function() {
    // 	$('#log').empty();
    // 	return false;
    // });
// }

owlCmd.sendProgramData = function(data){
    var from = 0;
    console.log("sending program data "+data.length+" bytes");  
    for(var i=0; i<data.length; ++i){
    if(data[i] == 0xf0){
        from = i;
    }else if(data[i] == 0xf7){
        console.log("sending "+(i-from)+" bytes sysex");
        msg = data.subarray(from, i+1);
        midiClient.logMidiData(msg);
        if(midiClient.midiOutput)
        {
            midiClient.midiOutput.send(msg, 0);            
        }
        owlCmd.sleep(1);
    }
    }
}

owlCmd.sendProgramRun = function(){
    console.log("sending sysex run command");
    var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_DEVICE, 
           OpenWareMidiSysexCommand.SYSEX_FIRMWARE_RUN, 0xf7 ];
    midiClient.logMidiData(msg);
    if(midiClient.midiOutput)
    {
        midiClient.midiOutput.send(msg, 0);
    }
      
}

owlCmd.sendProgramFromUrl = function(url){
    console.log("sending patch from url "+url);
    var oReq = new XMLHttpRequest();
    oReq.responseType = "arraybuffer";
    oReq.onload = function (oEvent) {
    console.log("here");    
    var arrayBuffer = oReq.response; // Note: not oReq.responseText
    if(arrayBuffer) {
        console.log("there");   
        var data = new Uint8Array(arrayBuffer);
        owlCmd.sendProgramData(data);
        owlCmd.sendProgramRun();
    }
    }
    oReq.open("GET", url, true);
    oReq.send();
}

export default owlCmd;
