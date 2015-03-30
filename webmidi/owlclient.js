function requestStatus(){
  sendCc(OpenWareMidiControl.REQUEST_SETTINGS, 3); // request firmware version
  /* setTimeout(function() { sendCc(OpenWareMidiControl.REQUEST_SETTINGS, 127) }, 3000); */
}

/* var timer = setInterval(requestStatus, 6000); */

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

function systemExclusive(data) {
    console.log("sysex: 0x"+data[3].toString(16)+" length: "+data.length);
  if(data.length > 3 && data[0] == 0xf0
     && data[1] == MIDI_SYSEX_MANUFACTURER
     && data[2] == MIDI_SYSEX_DEVICE){
    switch(data[3]){
      case OpenWareMidiSysexCommand.SYSEX_PRESET_NAME_COMMAND:
        var index = data[4];
        var name = getStringFromSysex(data, 5, 2);
        setPreset(index, name);
        break;
      case OpenWareMidiSysexCommand.SYSEX_PARAMETER_NAME_COMMAND:
        var index = data[4];
        var name = getStringFromSysex(data, 5, 2);
        setParameter(index, name);
      break;
      case OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION:
        var name = getStringFromSysex(data, 4, 2);
        document.getElementById("firmwareVersion").innerHTML = name;
      break;
      case OpenWareMidiSysexCommand.SYSEX_DEVICE_ID:
      break;
      case OpenWareMidiSysexCommand.SYSEX_SELFTEST:
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

function connect(){
  // sendCc(OpenWareMidiControl.REQUEST_SETTINGS, 3); // load firmware version (chrashes Chrome Android)
  sendCc(OpenWareMidiControl.REQUEST_SETTINGS, 1); // load patch names
  sendCc(OpenWareMidiControl.REQUEST_SETTINGS, 127); // load settings
}

function setPreset(index, name) {
    console.log("Preset "+index+": "+name);
  var select = document.getElementById("greenSlot");
  select.options[index] = new Option(name, index);
  select = document.getElementById("redSlot");
  select.options[index] = new Option(name, index);
}

function setParameter(index, name) {
  console.log("Parameter "+index+": "+name);
  var input;
  switch(index){
      case 0:
        input = document.getElementById("nameParameterA");
      break;
      case 1:
        input = document.getElementById("nameParameterB");
      break;
      case 2:
        input = document.getElementById("nameParameterC");
      break;
      case 3:
        input = document.getElementById("nameParameterD");
      break;
      case 4:
        input = document.getElementById("nameParameterE");
      break;
  }
  input.innerHTML = name;
}

function changePatch(cc, index){
  sendCc(cc, index);
  // sendCc(OpenWareMidiControl.REQUEST_SETTINGS, 2); // request parameter names (doesn't work, sometimes crashes)
  // sendCc(OpenWareMidiControl.REQUEST_SETTINGS, OpenWareMidiControl.LED);
}

function changeMidiOutput(index){
    selectMidiOutput(index);
    // sendCc(OpenWareMidiControl.REQUEST_SETTINGS, 1); // load patch names
    // setTimeout(function() { sendCc(OpenWareMidiControl.REQUEST_SETTINGS, 1) }, 500); // load patch names
    // setTimeout(function() { sendCc(OpenWareMidiControl.REQUEST_SETTINGS, 127) }, 1000); // load settings 
}

function pressPushbutton(){
  sendCc(25, 127);
  sendCc(OpenWareMidiControl.REQUEST_SETTINGS, OpenWareMidiControl.LED);
}

function controlChange(cc, value) {
    console.log("received CC "+cc+": "+value);
    switch(cc){
    case OpenWareMidiControl.LED:
	var button = document.getElementById("pushbutton");
	if(value < 42){
	    button.style.backgroundColor = "white";
	}else if(value < 84){
	    button.style.backgroundColor = "lightgreen";
	}else{
	    button.style.backgroundColor = "red";
	}
	break;
    case OpenWareMidiControl.PATCH_PARAMETER_A:
	document.getElementById("parameterA").value = value;
	break;
    case OpenWareMidiControl.PATCH_PARAMETER_B:
	document.getElementById("parameterB").value = value;
	break;
    case OpenWareMidiControl.PATCH_PARAMETER_C:
	document.getElementById("parameterC").value = value;
	break;
    case OpenWareMidiControl.PATCH_PARAMETER_D:
	document.getElementById("parameterD").value = value;
	break;
    case OpenWareMidiControl.PATCH_PARAMETER_E:
	document.getElementById("parameterE").value = value;
	break;
    case OpenWareMidiControl.PATCH_CONTROL:
        var input = document.getElementById("patchControl");
	if(value == 127)
	  input.checked = true;
	else
	  input.checked = false;
	break;
    case OpenWareMidiControl.PATCH_MODE:
        var select = document.getElementById("patchMode");
        if(value < 32)
            select.selectedIndex = 0;
	else if(value < 64)
            select.selectedIndex = 1;
	else if(value < 96)
            select.selectedIndex = 2;
	else
            select.selectedIndex = 3;
	break;
    case OpenWareMidiControl.PATCH_SLOT_GREEN:
	document.getElementById("greenSlot").selectedIndex = value;
	break;
    case OpenWareMidiControl.PATCH_SLOT_RED:
	document.getElementById("redSlot").selectedIndex = value;
	break;
    }
}
