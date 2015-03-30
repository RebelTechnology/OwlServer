var midiAccess = null;  // global MIDIAccess object
var midiOutputs = [];
var midiOutput = null;

function onMIDIInit(midi, options) {
    console.log("MIDI sysex options: "+options);
    console.log("MIDI sysex: "+midi.sysexEnabled);
    midiAccess = midi;

    var i = 0;
    var iterator = midiAccess.inputs.values();
    var data;
    while((data = iterator.next()).done === false){
        port = data.value;
        console.log( i++ + ": " + port.name + "; manufacturer: " + port.manufacturer + "; version: " + port.version + "\n");
    }

    var inputs = midiAccess.inputs.values();
    if(inputs.size === 0)
    	console.log("No MIDI input devices present.")
    for(var input = inputs.next(); input && !input.done; input = inputs.next()) {
	input.value.onmidimessage = MIDIMessageEventHandler;
	console.log("added MIDI input "+input.value.name+" ("+input.value.manufacturer+") "+input.value.id);
    }

    // var inputs = midiAccess.inputs.values();
    // if(inputs.size === 0)
    // 	console.log("No MIDI input devices present.")
    // else { // Hook the message handler for all MIDI inputs
    // 	for (var i=0;i<inputs.size;i++){
    // 	    inputs.values()[i].onmidimessage = MIDIMessageEventHandler;
    // 	    console.log("added MIDI input "+inputs[i].name+" ("+inputs[i].manufacturer+") "+inputs[i].id);
    // 	}
    // }
    var outputs = midiAccess.outputs.values();
    var i = 0;
    for(var output = outputs.next(); output && !output.done; output = outputs.next()) {
        midiOutputs.push(output.value);
	registerMidiOutput(i++, output.value.name);
	console.log("added MIDI output "+output.value.name+" ("+output.value.manufacturer+") "+output.value.id);
    }
    if(outputs.size === 0)
	console.log("No MIDI output devices present.")
    else
	selectMidiOutput(0);
    // midiOutput = midiOutputs[midiOutputs.size - 1];
    // midiOutput = outputs[outputs.size - 1];
}

function onMIDIReject(err) {
    alert("The MIDI system failed to start.");
}

var sysexMessage = [];
function MIDIMessageEventHandler(event) {
    console.log("MIDI 0x"+event.data[0].toString(16)+" "+event.data.length+" bytes");
    switch(event.data[0] & 0xf0) {
    case 0x90:
	if(event.data[2] != 0) {  // if velocity != 0, this is a note-on message
	    noteOn(event.data[1], event.data[2]);
	    return;
	}
    case 0x80:
	noteOff(event.data[1]);
	return;
    case 0xB0:
	controlChange(event.data[1], event.data[2]);
	return;
    case 0xF0:
  	systemExclusive(event.data);
	// sysexMessage = sysexMessage.concat(event.data);
	// console.log("sysex evt 0x"+event.data[0].toString(16)+":0x"+event.data[event.data.length-1].toString(16));
	// console.log("sysex msg 0x"+sysexMessage[0].toString(16)+":0x"+sysexMessage[sysexMessage.length-1].toString(16));
	// if(sysexMessage.indexOf(0xf7) != -1){
  	//     systemExclusive(sysexMessage);
	//     sysexMessage = [];
	// }
	return;
    }
}

function selectMidiOutput(index) {
    midiOutput = midiOutputs[index];
    if(midiOutput)
      console.log("selecting MIDI output "+index+": "+midiOutput.name+" ("+midiOutput.manufacturer+")");
}

function sendCc(cc, value) {
    console.log("sending CC "+cc+"/"+value);
    if(midiOutput)
      midiOutput.send([0xB0, cc, value], 0);
}

window.addEventListener('load', function() {
    // patch up prefixes
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();
    var options = { sysex: true };
    if (navigator.requestMIDIAccess)
	navigator.requestMIDIAccess( { sysex: true } ).then( onMIDIInit, onMIDIReject );
    else
	alert("No MIDI support present in your browser.")
} );
