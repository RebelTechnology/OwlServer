import { owlCmd } from 'lib';

const midiClient = {

    midiAccess: null,  // global MIDIAccess object
    midiInputs: [],
    midiInput: null,
    midiOutputs: [],
    midiOutput: null,
    midiInitialisedCallback: null,

    logMidiEvent: function(ev){
        midiClient.logMidiData(ev.data);
    },

    logMidiData: function(data){
      var arr = [];
      for(var i=0; i<data.length; i++) arr.push((data[i]<16 ? '0' : '') + data[i].toString(16));
      // console.log('MIDI:', arr.join(' '));
    },

    onMIDIInit: function(midi, options) {
        owlCmd.log("MIDI sysex options: "+options);
        owlCmd.log("MIDI sysex: "+midi.sysexEnabled);
        owlCmd.log("MIDI onstatechange: "+midi.onstatechange);
        midiClient.midiAccess = midi;

        var i = 0;
        var inputs = midiAccess.inputs.values();
        for(var input = inputs.next(); input && !input.done; input = inputs.next()) {
            midiClient.midiInputs.push(input.value);
        	console.log("added MIDI input "+input.value.name+" ("+input.value.manufacturer+") "+input.value.id);
        }
        if(inputs.size === 0)
        	console.log("No MIDI input devices present.")

        i = 0;
        var outputs = midiAccess.outputs.values();
        for(var output = outputs.next(); output && !output.done; output = outputs.next()) {
            midiClient.midiOutputs.push(output.value);
        	console.log("added MIDI output "+output.value.name+" ("+output.value.manufacturer+") "+output.value.id);
        }
        if(outputs.size === 0)
    	console.log("No MIDI output devices present.")

        if(typeof midiClient.midiInitialisedCallback === 'function'){
    	    midiClient.midiInitialisedCallback();
        }
    },

    onMIDIReject: function(err) {
        console.log("error "+err);
        var retry = confirm("The MIDI system failed to start.\n"+err+"\nRetry?");
        if(retry)
    	midiClient.initialiseMidi();
    },

    // var sysexMessage = [];
    MIDIMessageEventHandler: function(event) {
        // console.log("MIDI 0x"+event.data[0].toString(16)+" "+event.data.length+" bytes");
        midiClient.logMidiEvent(event);
        switch(event.data[0] & 0xf0) {
        case 0x90:
    	if(event.data[2] != 0) {  // if velocity != 0, this is a note-on message
    	    owlCmd.noteOn(event.data[1], event.data[2]);
    	    return;
    	}
        case 0x80:
    	owlCmd.noteOff(event.data[1]);
    	return;
        case 0xB0:
    	owlCmd.controlChange(event.data[1], event.data[2]);
    	return;
        case 0xC0:
    	owlCmd.programChange(event.data[1]);
    	return;
        case 0xF0:
      	owlCmd.systemExclusive(event.data);
    	// sysexMessage = sysexMessage.concat(event.data);
    	// console.log("sysex evt 0x"+event.data[0].toString(16)+":0x"+event.data[event.data.length-1].toString(16));
    	// console.log("sysex msg 0x"+sysexMessage[0].toString(16)+":0x"+sysexMessage[sysexMessage.length-1].toString(16));
    	// if(sysexMessage.indexOf(0xf7) != -1){
      	//     owlCmd.systemExclusive(sysexMessage);
    	//     sysexMessage = [];
    	// }
    	return;
        }
    },

    selectMidiInput: function(index) {
        var midiInput = midiClient.midiInput;

        if(midiInput)
        {
            midiInput.onmidimessage = undefined;
        }
        midiInput = midiClient.midiInputs[index];
        if(midiInput){
        	console.log("selecting MIDI input "+index+": "+ midiInput.name+" ("+ midiInput.manufacturer+")");
        	midiInput.onmidimessage = midiClient.MIDIMessageEventHandler;
        }
    },

    selectMidiOutput: function(index) {
        var midiOutput = midiClient.midiOutput = midiClient.midiOutputs[index];
        if(midiOutput)
        {
          console.log("selecting MIDI output "+index+": "+midiOutput.name+" ("+midiOutput.manufacturer+")");        
        }
    },

    sendPc: function(value) {
        console.log("sending PC "+value);
        if(this.midiOutput)
          this.midiOutput.send([0xC0, value], 0);
    },

    sendCc: function(cc, value) {
        console.log("sending CC "+cc+"/"+value);
        if(this.midiOutput)
        {
          this.midiOutput.send([0xB0, cc, value], 0);            
        }
    },

    // function sendSysexMessage(msg) {
    //     console.log("sending sysex msg "+msg);
    //     var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_DEVICE ];
    //     msg.push.apply(msg, data.split(''));
    //     msg.push(0xf7);
    //     midiClient.logMidiData(msg);
    //     if(this.midiOutput)
    //       this.midiOutput.send(msg, 0);
    // }

    sendSysexCommand: function(cmd) {
        console.log("sending sysex command 0x"+cmd.toString(16));
        var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_DEVICE, cmd, 0xf7 ];
        midiClient.logMidiData(msg);
        if(this.midiOutput)
          this.midiOutput.send(msg, 0);
    },

    sendSysexData: function(cmd, data) {
        console.log("sending sysex data");
        var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_DEVICE, cmd ];
        for(var i=0; i<data.length; ++i)
    	msg.push(data.charCodeAt(i));
        // msg.push.apply(msg, data);
        msg.push(0xf7);
        midiClient.logMidiData(msg);
        if(this.midiOutput)
          this.midiOutput.send(msg, 0);
    },

    initialiseMidi: function(callback){
        midiClient.midiInitialisedCallback = callback;
        var options = { sysex: true };
        if(navigator.requestMIDIAccess)
    	navigator.requestMIDIAccess( { sysex: true } ).then( midiClient.onMIDIInit, midiClient.onMIDIReject );
        else
    	alert("No MIDI support present in your browser.")
    }
}

export default midiClient;