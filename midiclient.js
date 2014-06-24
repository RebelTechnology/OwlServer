var midiAccess = null;  // global MIDIAccess object
var midiOutputs = [];

function onMIDIInit(midi) {
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
	    midiOutputs.push(outputs[i]);
	    console.log("added MIDI output "+outputs[i].name+" ("+outputs[i].manufacturer+") "+outputs[i].id);
	}
    }
}

function onMIDIReject(err) {
    alert("The MIDI system failed to start.");
}

function MIDIMessageEventHandler(event) {
    console.log("received MIDI event "+event);
    // Mask off the lower nibble (MIDI channel, which we don't care about)
    switch (event.data[0] & 0xf0) {
    case 0x90:
	if (event.data[2]!=0) {  // if velocity != 0, this is a note-on message
	    noteOn(event.data[1], event.data[2]);
	    return;
	}
	// if velocity == 0, fall thru: it's a note-off.  MIDI's weird, ya'll.
    case 0x80:
	noteOff(event.data[1]);
	return;
    case 0xB0:
	controlChange(event.data[1], event.data[2]);
	return;
    }
}

function sendCc(cc, value) {
    console.log("sending CC "+cc+"/"+value);
    // for(var i=0;i<midiOutputs.length;i++)
    // 	midiOutputs[i].send([0xB0, cc, value], 0);
	midiOutputs[midiOutputs.length-1].send([0xB0, cc, value], 0);
}

window.addEventListener('load', function() {
    // patch up prefixes
    window.AudioContext=window.AudioContext||window.webkitAudioContext;

    context = new AudioContext();
    if (navigator.requestMIDIAccess)
	navigator.requestMIDIAccess().then( onMIDIInit, onMIDIReject );
    else
	alert("No MIDI support present in your browser.")
} );
