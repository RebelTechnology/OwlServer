/*
*
*  This file is a concat of legacy files owlcmd.js and midiclient.js
*  should ideally be re-written to be inline with the rest of the spa
*/

import * as openWareMidi from './openWareMidi';
import { API_END_POINT } from 'constants';
import {
    deviceDispatchPresetReceived,
    deviceDispatchDeviceUUIDReceived,
    deviceDispatchProgramChange,
    owlDispatchPatchStatus,
    owlDispatchFirmWareVersion,
    owlDispatchProgramMessage,
    owlDispatchProgramError
} from 'actions';

const {
    MIDI_SYSEX_MANUFACTURER,
    MIDI_SYSEX_OMNI_DEVICE,
    OpenWareMidiSysexCommand,
    OpenWareMidiControl
} = openWareMidi;

function noteOn(note, velocity) {
  console.log("received noteOn "+note+"/"+velocity);
}

function noteOff(note) {
  console.log("received noteOff "+note);
}

function getStringFromSysex(data, startOffset, endOffset){
  var str = "";
  for(var i=startOffset; i<(data.length-endOffset) && data[i] != 0x00; ++i)
    str += String.fromCharCode(data[i]);
  return str;
}

function systemExclusive(data) {
    if(data.length > 3 && data[0] == 0xf0
       && data[1] == MIDI_SYSEX_MANUFACTURER){
       // && data[2] == MIDI_SYSEX_OMNI_DEVICE){
    // console.log("sysex: 0x"+data[3].toString(16)+" length: "+data.length);
    switch(data[3]){
        case OpenWareMidiSysexCommand.SYSEX_PRESET_NAME_COMMAND:
            var name = getStringFromSysex(data, 5, 1);
            var slot = data[4];
            deviceDispatchPresetReceived({ slot, name });   
            console.log("preset received: " + slot + ": " + name);
            break;
        case OpenWareMidiSysexCommand.SYSEX_PARAMETER_NAME_COMMAND:
            var parameter_map = [' ', 'a', 'b', 'c', 'd', 'e'];
            var name = getStringFromSysex(data, 5, 1);
            var pid = data[4]+1;
            console.log("parameter "+pid+" :"+name);
            break;
        case OpenWareMidiSysexCommand.SYSEX_PROGRAM_STATS:
            var msg = getStringFromSysex(data, 4, 1);
            console.log('PATCH STATUS: ',msg);
            owlDispatchPatchStatus(msg);    
            break;
        case OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION:
            var msg = getStringFromSysex(data, 4, 1);
            owlDispatchFirmWareVersion(msg);
            console.log('FIRMWARE VERSION: ',msg);
            break;
        case OpenWareMidiSysexCommand.SYSEX_PROGRAM_MESSAGE:
            var msg = getStringFromSysex(data, 4, 1);
            owlDispatchProgramMessage(msg)
            console.log('PROGRAM MESSAGE: ',msg);
            break;
        case OpenWareMidiSysexCommand.SYSEX_PROGRAM_ERROR:
            var msg = getStringFromSysex(data, 4, 1);
            owlDispatchProgramError(msg)
            console.log('PROGRAM ERROR: ',msg);
            break;
        case OpenWareMidiSysexCommand.SYSEX_DEVICE_ID:
            var msg = getStringFromSysex(data, 4, 1);
            deviceDispatchDeviceUUIDReceived(msg);
            console.log('DEVICE UUID: ', msg);
            break;
        case OpenWareMidiSysexCommand.SYSEX_DEVICE_STATS:
            var msg = getStringFromSysex(data, 4, 1);
            owlDispatchProgramMessage(msg)
            console.log('DEVICE STATS: ',msg);
            break;
        default:
            var msg = getStringFromSysex(data, 4, 1);
            break;
        }
    }
}

function controlChange(cc, value){
    console.log("received CC "+cc+": "+value);
    switch(cc){
    case OpenWareMidiControl.PATCH_PARAMETER_A:
    //$("#p1").val(value);
    break;
    case OpenWareMidiControl.PATCH_PARAMETER_B:
    //$("#p2").val(value);
    break;
    case OpenWareMidiControl.PATCH_PARAMETER_C:
    //$("#p3").val(value);
    break;
    case OpenWareMidiControl.PATCH_PARAMETER_Da:
    //$("#p4").val(value);
    break;
    }
}

function programChange(pc){
    console.log("received PC " + pc);
    deviceDispatchProgramChange(pc);
}


function sendRequest(type){
    HoxtonOwl.midiClient.sendCc(OpenWareMidiControl.REQUEST_SETTINGS, type);
}

function sendStatusRequest(){
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PROGRAM_STATS);
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PROGRAM_MESSAGE);
}

var pollRequestTimeout;
function pollOwlStatus() {
    sendStatusRequest();
    clearPollRequestTimeout();
    pollRequestTimeout = window.setTimeout(pollOwlStatus, 2000);
}

function clearPollRequestTimeout(){
    if(pollRequestTimeout){
        window.clearTimeout(pollRequestTimeout);
    }
}

function setParameter(pid, value){
    console.log("parameter "+pid+": "+value);
    sendCc(OpenWareMidiControl.PATCH_PARAMETER_A+pid, value);
}

function sendLoadRequest(){
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PRESET_NAME_COMMAND);
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PARAMETER_NAME_COMMAND);
}

function requestDevicePresets(){
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PRESET_NAME_COMMAND);
    sendRequest(OpenWareMidiSysexCommand.SYSEX_DEVICE_STATS);
    sendRequest(OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION);
}

function onMidiInitialised(callback){

    // auto set the input and output to an OWL
    
    var outConnected = false,
        inConnected = false,
        connectedMidiInputPort = null,
        connectedMidiOutputPort = null;

    for (var o = 0; o < HoxtonOwl.midiClient.midiOutputs.length; o++) {
        if (HoxtonOwl.midiClient.midiOutputs[o].name.match('^OWL-')) {
            connectedMidiOutputPort = HoxtonOwl.midiClient.selectMidiOutput(HoxtonOwl.midiClient.midiOutputs[o].id);
            outConnected = true;
            break;
        }        
    }

    for (var i = 0; i < HoxtonOwl.midiClient.midiInputs.length; i++) {
        if (HoxtonOwl.midiClient.midiInputs[i].name.match('^OWL-')) {
            connectedMidiInputPort = HoxtonOwl.midiClient.selectMidiInput(HoxtonOwl.midiClient.midiInputs[i].id);
            inConnected = true;
            break;
        }        
    }
    
    if (inConnected && outConnected) {
        console.log('connected to an OWL');
        // $('#ourstatus').text('Connected to an OWL')
        // $('#load-owl-button').show();
    } else {
        console.log('failed to connect to an OWL');
        // $('#ourstatus').text('Failed to connect to an OWL')
        // $('#load-owl-button').hide();
    }

    callback && callback({
        isConnected: inConnected && outConnected,
        connectedMidiInputPort,
        connectedMidiOutputPort,
        midiInputs: HoxtonOwl.midiClient.midiInputs,
        midiOutputs: HoxtonOwl.midiClient.midiOutputs
    });

    // sendLoadRequest(); // load patches
    sendRequest(OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION);
}

function updatePermission(name, status) {
    console.log('update permission for ' + name + ' with ' + status);
}

function connectToOwl() {
    return new Promise((resolve, reject)=>{
        HoxtonOwl.midiClient.initialiseMidi(function(){
            onMidiInitialised((owlConnection) => {
                if(owlConnection.isConnected){
                    resolve(owlConnection);
                } else {
                    reject(owlConnection);
                }
            });
        });
    });
}


function sendProgramData(data){
    return new Promise( (resolve, reject) => {
        console.log("sending program data "+data.length+" bytes"); 
        var chunks = chunkData(data);
        sendDataChunks(0, chunks, resolve);
    });
}

function storeProgramInDeviceSlot(slot){
    return new Promise((resolve, reject) => {
        
        if(typeof slot !== 'number' || slot < 0 || slot > 40){
            reject(new Error('slot is not a number from 0 to 40'));
            return;
        }

        console.log("sending sysex STORE command");
        var msg = [
            0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_OMNI_DEVICE,
            OpenWareMidiSysexCommand.SYSEX_FIRMWARE_STORE, 0, 0, 0, 0, slot, 0xf7
        ];

        HoxtonOwl.midiClient.logMidiData(msg);
        if(HoxtonOwl.midiClient.midiOutput){
            HoxtonOwl.midiClient.midiOutput.send(msg, 0);
            resolve();
        } else {
            reject(new Error('failed to store in slot: ' + slot));
        }
    });
}

function resetDevice(){
    HoxtonOwl.midiClient.sendSysexCommand(OpenWareMidiSysexCommand.SYSEX_DEVICE_RESET_COMMAND);
}

function eraseDeviceStorage(){
    HoxtonOwl.midiClient.sendSysexCommand(OpenWareMidiSysexCommand.SYSEX_FLASH_ERASE);
}

function deleteDevicePresetFromSlot(slot){
    HoxtonOwl.midiClient.sendSysexData(OpenWareMidiSysexCommand.SYSEX_FLASH_ERASE, [0, 0, 0, 0, slot])
}

function showDeviceUUID(){
    sendRequest(OpenWareMidiSysexCommand.SYSEX_DEVICE_ID)
}

const setDeviceActivePresetSlot = slot => {
    HoxtonOwl.midiClient.sendProgramChange(slot)
}

function chunkData(data){
    var chunks = [];
    var start = 0;
    for(var i = 0; i < data.length; ++i){
        if(data[i] == 0xf0){
            start = i;
        } else if(data[i] == 0xf7){
            chunks.push(data.subarray(start, i + 1));
        }
    }
    return chunks;
}

var sendDataTimeout;
function sendDataChunks(index, chunks, resolve){
    index = index || 0;
    if(sendDataTimeout){
        window.clearTimeout(sendDataTimeout);
        sendDataTimeout = null;
    }
    if(index < chunks.length){
        HoxtonOwl.midiClient.logMidiData(chunks[index]);
        if(HoxtonOwl.midiClient.midiOutput){
            //console.log("sending chunk "+ index + ' with '+ chunks[index].length +" bytes sysex");
            HoxtonOwl.midiClient.midiOutput.send(chunks[index], 0);            
        }
        sendDataTimeout = window.setTimeout(function(){
            sendDataChunks(++index, chunks, resolve);
        },0);
    } else {
        resolve && resolve();
    }
}

function sendProgramRun(){
    console.log("sending sysex RUN command");
    var msg = [
        0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_OMNI_DEVICE, 
        OpenWareMidiSysexCommand.SYSEX_FIRMWARE_RUN, 0xf7
    ];
    HoxtonOwl.midiClient.logMidiData(msg);
    if(HoxtonOwl.midiClient.midiOutput){
        HoxtonOwl.midiClient.midiOutput.send(msg, 0);
    }
      
}

function sendProgramFromUrl(url){
    return new Promise((resolve, reject) => {
        console.log("sending patch from url "+url);
        var oReq = new XMLHttpRequest();
        oReq.responseType = "arraybuffer";
        oReq.onload = function (oEvent) {   
            var arrayBuffer = oReq.response; // Note: not oReq.responseText
            if(arrayBuffer) {  
                var data = new Uint8Array(arrayBuffer);
                resolve(sendProgramData(data));
            }
        }
        oReq.open("GET", url, true);
        oReq.send();
    });
}

function loadPatchOnDevice(patchId){
    const url = API_END_POINT + '/builds/' + patchId + '?format=sysx&amp;download=1';
    return sendProgramFromUrl(url);
}

function storePatchInDeviceSlot(patchId, slot){
    return loadPatchOnDevice(patchId).then(function(){
        return storeProgramInDeviceSlot(slot);
    });
}

function loadAndRunPatchOnDevice(patchId){
    return loadPatchOnDevice(patchId).then(function(){
        sendProgramRun();
    }, function(err){
        console.error(err);
    });
}


/*
*
*  Below imported from legacy midiclient.js
*
*/

var HoxtonOwl;
if (!HoxtonOwl) {
    HoxtonOwl = {};
}

HoxtonOwl.midiClient = {

    midiAccess: null,  // global MIDIAccess object
    midiInputs: [],
    midiInput: null,
    midiOutputs: [],
    midiOutput: null,
    midiInitialisedCallback: null,

    logMidiEvent: function(ev){
        HoxtonOwl.midiClient.logMidiData(ev.data);
    },

    logMidiData: function(data){
      const arr = data.map(item => (item<16 ? '0' : '') + (item && item.toString(16)));
      console.log('MIDI:', arr.join(' '));
    },

    onMIDIInit: function(midi, options) {
        //console.log("MIDI sysex options: "+options);
        //console.log("MIDI sysex: "+midi.sysexEnabled);
        //console.log("MIDI onstatechange: "+midi.onstatechange);
        HoxtonOwl.midiClient.midiAccess = midi;

        var i = 0;
        var inputs = HoxtonOwl.midiClient.midiAccess.inputs.values();
        for(var input = inputs.next(); input && !input.done; input = inputs.next()) {
            HoxtonOwl.midiClient.midiInputs.push(input.value);
            console.log("added MIDI input ", input.value);
        }
        if(inputs.size === 0)
            console.log("No MIDI input devices present.")

        i = 0;
        var outputs = HoxtonOwl.midiClient.midiAccess.outputs.values();
        for(var output = outputs.next(); output && !output.done; output = outputs.next()) {
            HoxtonOwl.midiClient.midiOutputs.push(output.value);
            console.log("added MIDI output ", output.value);
        }
        if(outputs.size === 0)
        console.log("No MIDI output devices present.")

        if(HoxtonOwl.midiClient.midiInitialisedCallback)
        HoxtonOwl.midiClient.midiInitialisedCallback();
    },

    onMIDIReject: function(err) {
        console.log("error "+err);
        var retry = confirm("The MIDI system failed to start.\n"+err+"\nRetry?");
        if(retry)
        initialiseMidi();
    },

    // var sysexMessage = [];
    MIDIMessageEventHandler: function(event) {
        // console.log("MIDI 0x"+event.data[0].toString(16)+" "+event.data.length+" bytes");
        HoxtonOwl.midiClient.logMidiEvent(event);
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
        case 0xC0:
        programChange(event.data[1]);
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
    },

    selectMidiInput: function(id) {
        if(typeof id === 'undefined'){
            return;
        }

        var midiInput = HoxtonOwl.midiClient.midiInput;

        if(midiInput){
            midiInput.onmidimessage = undefined;
        }

        midiInput = HoxtonOwl.midiClient.midiInputs.find(input => input.id === id);
        
        if(midiInput){
            console.log("selecting MIDI input ", midiInput);
            midiInput.onmidimessage = this.MIDIMessageEventHandler;
            return midiInput;
        }
    },

    selectMidiOutput: function(id) {
        if(typeof id === 'undefined'){
            return;
        }

        var midiOutput = HoxtonOwl.midiClient.midiOutput = HoxtonOwl.midiClient.midiOutputs.find(output => output.id === id);
        
        if(midiOutput){
          console.log("selecting MIDI output ", midiOutput);   
          return midiOutput;     
        }
    },

    sendProgramChange: function(value) {
        console.log("sending PC "+value);
        if(HoxtonOwl.midiClient.midiOutput){
          HoxtonOwl.midiClient.midiOutput.send([0xC0, value], 0);
        }
    },

    sendCc: function(cc, value) {
        console.log("sending CC "+cc+"/"+value);
        if(HoxtonOwl.midiClient.midiOutput){
          HoxtonOwl.midiClient.midiOutput.send([0xB0, cc, value], 0);            
        }
    },

    sendNoteOn: function(note, velocity) {
        console.log('sending Note On:', note, 'velocity:', velocity);
        if(HoxtonOwl.midiClient.midiOutput){
          HoxtonOwl.midiClient.midiOutput.send([0x90, note, velocity], 0);            
        }
    },

    sendNoteOff: function(note, velocity) {
        console.log('sending Note Off:', note, 'velocity:', velocity);
        if(HoxtonOwl.midiClient.midiOutput){
          HoxtonOwl.midiClient.midiOutput.send([0x80, note, velocity], 0);            
        }
    },

    sendSysexCommand: function(cmd) {
        console.log("sending sysex command 0x"+cmd.toString(16));
        var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_OMNI_DEVICE, cmd, 0xf7 ];
        HoxtonOwl.midiClient.logMidiData(msg);
        if(HoxtonOwl.midiClient.midiOutput)
          HoxtonOwl.midiClient.midiOutput.send(msg, 0);
    },

    sendSysexData: function(cmd, data) {
        console.log("sending sysex data");
        const msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_OMNI_DEVICE, cmd, ...data, 0xf7 ];
        HoxtonOwl.midiClient.logMidiData(msg);
        if(HoxtonOwl.midiClient.midiOutput){
          HoxtonOwl.midiClient.midiOutput.send(msg, 0);
        }
    },

    initialiseMidi: function(callback){
        HoxtonOwl.midiClient.midiInitialisedCallback = callback;
        var options = { sysex: true };
        if(navigator.requestMIDIAccess){
            navigator.requestMIDIAccess( { sysex: true } ).then( this.onMIDIInit, this.onMIDIReject );
        } else {
            alert("No MIDI support present in your browser.")
        }
    }

}

export default {
    connectToOwl,
    eraseDeviceStorage,
    deleteDevicePresetFromSlot,
    loadAndRunPatchOnDevice,
    resetDevice,
    requestDevicePresets,
    sendNoteOff: HoxtonOwl.midiClient.sendNoteOff,
    sendNoteOn: HoxtonOwl.midiClient.sendNoteOn,
    selectMidiInput: HoxtonOwl.midiClient.selectMidiInput,
    selectMidiOutput: HoxtonOwl.midiClient.selectMidiOutput,
    startPollingOwlStatus: pollOwlStatus,
    stopPollingOwlStatus: clearPollRequestTimeout,
    setDeviceActivePresetSlot,
    showDeviceUUID,
    storePatchInDeviceSlot
}
