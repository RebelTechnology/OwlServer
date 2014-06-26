var midiAccess = null;  // global MIDIAccess object
var midiOutputs = [];

function onMIDIInit(midi, options) {
    // console.log("MIDI sysex options: "+options);
    // console.log("MIDI sysex: "+midi.sysexEnabled);
    midiAccess = midi;

    var inputs=midiAccess.inputs();
    if (inputs.length === 0)
	alert("No MIDI input devices present.")
    else { // Hook the message handler for all MIDI inputs
	for (var i=0;i<inputs.length;i++){
	    inputs[i].onmidimessage = MIDIMessageEventHandler;
	    console.log("added MIDI input "+inputs[i].name+" ("+inputs[i].manufacturer+") "+inputs[i].id);
	}
    }
    var outputs=midiAccess.outputs();
    if (outputs.length === 0)
	alert("No MIDI output devices present.")
    else {
	for (var i=0;i<outputs.length;i++){
	    console.log("adding MIDI output "+i+"/"+outputs.length);
            midiOutputs.push(outputs[i]);
	    console.log("added MIDI output "+outputs[i].name+" ("+outputs[i].manufacturer+") "+outputs[i].id);
	}
    }
}

function onMIDIReject(err) {
    alert("The MIDI system failed to start.");
}

var sysexMessage = [];
function MIDIMessageEventHandler(event) {
    // console.log("MIDI 0x"+event.data[0].toString(16)+" "+event.data.length+" bytes");
    switch(event.data[0] & 0xf0) {
    case 0x90:
	if (event.data[2] != 0) {  // if velocity != 0, this is a note-on message
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

function sendCc(cc, value) {
    // console.log("sending CC "+cc+"/"+value);
    // for(var i=0;i<midiOutputs.length;i++)
    // 	midiOutputs[i].send([0xB0, cc, value], 0);
	midiOutputs[midiOutputs.length-1].send([0xB0, cc, value], 0);
}

window.addEventListener('load', function() {
    // patch up prefixes
    window.AudioContext=window.AudioContext||window.webkitAudioContext;
    context = new AudioContext();
    var options = { sysex: true };
    if (navigator.requestMIDIAccess)
	navigator.requestMIDIAccess(options).then( onMIDIInit, onMIDIReject );
    else
	alert("No MIDI support present in your browser.")
} );
