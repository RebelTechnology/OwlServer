/*
*
*  This file is a concat of legacy files owlcmd.js and midiclient.js
*  should ideally be re-written to be inline with the rest of the spa
*/

import * as openWareMidi from './openWareMidi';
import { API_END_POINT } from 'constants';
import {
    owlDispatchPresetChange,
    owlDispatchPatchStatus,
    owlDispatchFirmWareVersion,
    owlDispatchProgramMessage
} from 'actions';

const {
    MIDI_SYSEX_MANUFACTURER,
    MIDI_SYSEX_DEVICE,
    OpenWareMidiSysexCommand,
    OpenWareMidiControl
} = openWareMidi;

var monitorTask = undefined;

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

function sendCommand(cmd){
    sendSysexCommand(cmd);
}

function registerPatch(idx, name){
    //$('#patchnames').append($("<option>").attr('value',idx).text(name));
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

            // registerPatch(idx, name);
            owlDispatchPresetChange({preset:idx,name:name});   
            console.log("preset "+idx+": "+name);
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
            //console.log('FIRMWARE VERSION: ',msg);
            break;
        case OpenWareMidiSysexCommand.SYSEX_PROGRAM_MESSAGE:
            var msg = getStringFromSysex(data, 4, 1);
            owlDispatchProgramMessage(msg)
            console.log('PROGRAM MESSAGE: ',msg);
            break;
        case OpenWareMidiSysexCommand.SYSEX_DEVICE_STATS:
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
    console.log("received PC "+pc);
    //var name = $("#patchnames option:eq("+pc+")").text();
    console.log("patch name "+name);
    //$("#patchname").text(name);               
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

function selectOwlPatch(pid){
    var parameter_map = [' ', 'a', 'b', 'c', 'd', 'e'];

    console.log("select patch "+pid);

    for(var i=0; i<5; ++i) {
        $("#p"+i).text(""); // clear the prototype slider names
    }
    
    sendPc(pid);
}

function sendLoadRequest(){
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PRESET_NAME_COMMAND);
    sendRequest(OpenWareMidiSysexCommand.SYSEX_PARAMETER_NAME_COMMAND);
}

function onMidiInitialised(callback){

    // auto set the input and output to an OWL
    
    var outConnected = false,
        inConnected = false;

    for (var o = 0; o < HoxtonOwl.midiClient.midiOutputs.length; o++) {
        if (HoxtonOwl.midiClient.midiOutputs[o].name.match('^OWL-MIDI')) {
            HoxtonOwl.midiClient.selectMidiOutput(o);
            outConnected = true;
            break;
        }        
    }

    for (var i = 0; i < HoxtonOwl.midiClient.midiInputs.length; i++) {
        if (HoxtonOwl.midiClient.midiInputs[i].name.match('^OWL-MIDI')) {
            HoxtonOwl.midiClient.selectMidiInput(i);
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
        isConnected: inConnected && outConnected
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
    console.log("sending sysex run command");
    var msg = [
        0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_DEVICE, 
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
                resolve(
                    sendProgramData(data).then(function(){
                        sendProgramRun();
                    }, function(err){
                        console.error(err);
                    })
                );
            }
        }
        oReq.open("GET", url, true);
        oReq.send();
    });
}

function loadPatchFromServer(patchId){
    return sendProgramFromUrl(API_END_POINT + '/builds/' + patchId + '?format=sysx&amp;download=1');
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
      var arr = [];
      for(var i=0; i<data.length; i++) arr.push((data[i]<16 ? '0' : '') + data[i].toString(16));
      // console.log('MIDI:', arr.join(' '));
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
            console.log("added MIDI input "+input.value.name+" ("+input.value.manufacturer+") "+input.value.id);
        }
        if(inputs.size === 0)
            console.log("No MIDI input devices present.")

        i = 0;
        var outputs = HoxtonOwl.midiClient.midiAccess.outputs.values();
        for(var output = outputs.next(); output && !output.done; output = outputs.next()) {
            HoxtonOwl.midiClient.midiOutputs.push(output.value);
            console.log("added MIDI output "+output.value.name+" ("+output.value.manufacturer+") "+output.value.id);
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

    selectMidiInput: function(index) {
        var midiInput = HoxtonOwl.midiClient.midiInput;

        if(midiInput)
        {
            midiInput.onmidimessage = undefined;
        }
        midiInput = HoxtonOwl.midiClient.midiInputs[index];
        if(midiInput){
            console.log("selecting MIDI input "+index+": "+ midiInput.name+" ("+ midiInput.manufacturer+")");
            midiInput.onmidimessage = this.MIDIMessageEventHandler;
        }
    },

    selectMidiOutput: function(index) {
        var midiOutput = HoxtonOwl.midiClient.midiOutput = HoxtonOwl.midiClient.midiOutputs[index];
        if(midiOutput)
        {
          console.log("selecting MIDI output "+index+": "+midiOutput.name+" ("+midiOutput.manufacturer+")");        
        }
    },

    sendPc: function(value) {
        console.log("sending PC "+value);
        if(midiOutput)
          midiOutput.send([0xC0, value], 0);
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
    //     logMidiData(msg);
    //     if(midiOutput)
    //       midiOutput.send(msg, 0);
    // }

    sendSysexCommand: function(cmd) {
        console.log("sending sysex command 0x"+cmd.toString(16));
        var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_DEVICE, cmd, 0xf7 ];
        logMidiData(msg);
        if(midiOutput)
          midiOutput.send(msg, 0);
    },

    sendSysexData: function(cmd, data) {
        console.log("sending sysex data");
        var msg = [0xf0, MIDI_SYSEX_MANUFACTURER, MIDI_SYSEX_DEVICE, cmd ];
        for(var i=0; i<data.length; ++i)
        msg.push(data.charCodeAt(i));
        // msg.push.apply(msg, data);
        msg.push(0xf7);
        logMidiData(msg);
        if(midiOutput)
          midiOutput.send(msg, 0);
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
    connectToOwl : connectToOwl,
    loadPatchFromServer : loadPatchFromServer,
    startPollingOwlStatus: pollOwlStatus,
    stopPollingOwlStatus: clearPollRequestTimeout
}

