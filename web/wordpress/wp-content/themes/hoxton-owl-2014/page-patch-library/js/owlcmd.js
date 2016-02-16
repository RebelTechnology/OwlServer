var monitorTask = undefined;

function noteOn(note, velocity) {
  console.log("received noteOn "+note+"/"+velocity);
}

function noteOff(note) {
  console.log("received noteOff "+note);
}

function getStringFromSysex(data, startOffset, endOffset){
  var str = "";
  for(i=startOffset; i<(data.length-endOffset) && data[i] != 0x00; ++i)
    str += String.fromCharCode(data[i]);
  return str;
}

function sendCommand(cmd){
    sendSysexCommand(cmd);
}

function registerPatch(idx, name){
    $('#patchnames').append($("<option>").attr('value',idx).text(name));
}

function log(msg){
    $('#log').append('<li><span class="badge">' + msg + '</span></li>');
}

function systemExclusive(data) {
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
        var parameter_map = [' ', 'a', 'b', 'c', 'd', 'e'];
            var name = getStringFromSysex(data, 5, 1);
	    var pid = data[4]+1;
	    console.log("parameter "+pid+" :"+name);
	    $("#p"+pid).text(name); // update the prototype slider names
        $('#patch-parameter-' + parameter_map[pid] + ' p').text(name); // update the styled slider names
	    break;
	case OpenWareMidiSysexCommand.SYSEX_PROGRAM_STATS:
            var msg = getStringFromSysex(data, 4, 1);
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
}

function registerMidiInput(index, name){
  var select = document.getElementById("midiInputs");
  select.options[index] = new Option(name, index);
}

function registerMidiOutput(index, name){
  var select = document.getElementById("midiOutputs");
  select.options[index] = new Option(name, index);
}

function controlChange(cc, value){
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

function programChange(pc){
    console.log("received PC "+pc);
    var name = $("#patchnames option:eq("+pc+")").text();
    console.log("patch name "+name);
    $("#patchname").text(name);			    
}


function sendRequest(type){
    sendCc(OpenWareMidiControl.REQUEST_SETTINGS, type);
}

function sendStatusRequest(){
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PROGRAM_STATS);
}

function setParameter(pid, value){
    console.log("parameter "+pid+": "+value);
    sendCc(OpenWareMidiControl.PATCH_PARAMETER_A+pid, value);
}

function selectOwlPatch(pid){
    var parameter_map = [' ', 'a', 'b', 'c', 'd', 'e'];

    console.log("select patch "+pid);

    for(i=0; i<5; ++i) {
        $("#p"+i).text(""); // clear the prototype slider names
        $('#patch-parameter-' + parameter_map[i] + ' p').text(''); // clear the styled slider names    
    }
    
    sendPc(pid);
}

function sendLoadRequest(){
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PRESET_NAME_COMMAND);
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PARAMETER_NAME_COMMAND);
}

function onMidiInitialised(){

    // auto set the input and output to an OWL
    
    for (var o = 0; o < midiOutputs.length; o++) {
        if (midiOutputs[o].name.match('^OWL-MIDI')) {
            selectMidiOutput(o);
        }        
    }

    for (var i = 0; i < midiInputs.length; i++) {
        if (midiInputs[i].name.match('^OWL-MIDI')) {
            selectMidiInput(i);
        }        
    }

    sendLoadRequest(); // load patches

    // selectMidiInput(3);
    // selectMidiOutput(4);
    // selectMidiInput(0);
    // selectMidiOutput(0);
    log("showtime");
}

function updatePermission(name, status) {
    console.log('update permission for ' + name + ' with ' + status);
    log('update permission for ' + name + ' with ' + status);
}

function connectToOwl() {
    if(navigator && navigator.requestMIDIAccess)
    {
        navigator.requestMIDIAccess({sysex:true});
    }
    initialiseMidi(onMidiInitialised);
    sendRequest(OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION);
    sendLoadRequest();
    sendStatusRequest();
}

function hookupButtonEvents() {
    // Check for Midi/Midi SysEx permissions

    // if(navigator && navigator.permissions){
    // 	navigator.permissions.query({name:'midi', sysex:false}).then(function(p) {
    //         updatePermission('midi', p.status);
    //         p.onchange = function() {
    // 		updatePermission('midi', this.status);
    //         };
    // 	});

    // 	navigator.permissions.query({name:'midi', sysex:true}).then(function(p) {
    //         updatePermission('midi-sysex', p.status);
    //         p.onchange = function() {
    // 		updatePermission('midi-sysex', this.status);
    // 		initialiseMidi(onMidiInitialised);
    //         };
    // 	});
    // }

    // $("#midi").on('click', function() {
    // 	if(navigator && navigator.requestMIDIAccess)
    //         navigator.requestMIDIAccess({sysex:false});
    // });

    $("#connect").on('click', connectToOwl);

    $("#monitor").on('click', function() {
	if(monitorTask == undefined){
	    monitorTask = window.setInterval(sendStatusRequest, 1000);
	}else{
	    clearInterval(monitorTask);
	    monitorTask = undefined;
	}
    });

    // initialiseMidi(onMidiInitialised);
    
    $('#clear').on('click', function() {
	$('#log').empty();
	return false;
    });
}

function sendProgramData(data){
    var from = 0;
    console.log("sending program data "+data.length+" bytes");  
    for(var i=0; i<data.length; ++i){
    if(data[i] == 0xf0){
        from = i;
    }else if(data[i] == 0xf7){
        console.log("sending "+(i-from)+" bytes sysex");
        msg = data.subarray(from, i+1);
        logMidiData(msg);
        if(midiOutput)
        midiOutput.send(msg, 0);
    }
    }
}

function sendProgramRun(){
    console.log("sending sysex run command");
    var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_DEVICE, 
           OpenWareMidiSysexCommand.SYSEX_FIRMWARE_RUN, 0xf7 ];
    logMidiData(msg);
    if(midiOutput)
      midiOutput.send(msg, 0);
}

function sendProgramFromUrl(url){
    console.log("sending patch from url "+url);
    var oReq = new XMLHttpRequest();
    oReq.responseType = "arraybuffer";
    oReq.onload = function (oEvent) {
    console.log("here");    
    var arrayBuffer = oReq.response; // Note: not oReq.responseText
    if(arrayBuffer) {
        console.log("there");   
        var data = new Uint8Array(arrayBuffer);
        sendProgramData(data);
        sendProgramRun();
    }
    }
    oReq.open("GET", url, true);
    oReq.send();
}
