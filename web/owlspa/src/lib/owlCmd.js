import * as openWareMidi from './openWareMidi';

import * as midiClient from './midiClient';

import { API_END_POINT } from 'constants';

import {
	deviceDispatchPresetReceived,
	deviceDispatchResourceReceived,
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

let DEBUG = true;

function log() {
	if (DEBUG) console.log(...arguments);
};

function getStringFromSysex(data, startOffset, endOffset) {
	let str = "";

	for (let i=startOffset; i<(data.length-endOffset) && data[i] != 0x00; ++i)
		str += String.fromCharCode(data[i]);

	return str;
};

const crcTable = (function() {
	let c;
	const t = [];

	for (let n = 0; n < 256; n++) {
		c = n;
		for (let k = 0; k < 8; k++)
			c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));

		t[n] = c;
	}

	return t;
})();

function crc32(arr) {
	let crc = 0 ^ (-1);

	for (let i = 0; i < arr.length; i++)
		crc = (crc >>> 8) ^ crcTable[(crc ^ arr[i]) & 0xFF];

	return (crc ^ (-1)) >>> 0;
};

function decodeInt(x) {
	const msb = x[0];
	let y = x[1] << 24;

	y += x[2] << 16;
	y += x[3] << 8;
	y += x[4] << 0;
	y += (msb & 0x01) ? 0x80000000 : 0;
	y += (msb & 0x02) ? 0x800000 : 0;
	y += (msb & 0x04) ? 0x8000 : 0;
	y += (msb & 0x08) ? 0x80 : 0;

	return y;
};

function encodeInt(x) {
	return [
		((x&0x80000000)?1:0) | ((x&0x800000)?2:0) | ((x&0x8000)?4:0) | ((x&0x80)?8:0),
		(x>>24) & 0x7f, (x>>16) & 0x7f, (x>>8) & 0x7f, (x>>0) & 0x7f
	];
};

function encodeSysexData(data) {
	log("encoding", data.length, "bytes");

	const sysex = [];
	let cnt = 0;
	let cnt7 = 0;
	let pos = 0;
	sysex[0] = 0;

	for (cnt = 0; cnt < data.length; cnt++) {
		const c = data[cnt] & 0x7F;
		const msb = data[cnt] >> 7;

		sysex[pos] |= msb << cnt7;
		sysex[pos + 1 + cnt7] = c;

		if (cnt7++ == 6) {
			pos += 8;
			sysex[pos] = 0;
			cnt7 = 0;
		}
	}

	return sysex;
};

function packageSysexData(raw) {
	const data = encodeSysexData(raw);
	const chunks = [];
	let i = 0;

	// all messages must have message index
	// first message contains data length
	let packageIndex = 0;
	let msg = [
		0xf0,
		MIDI_SYSEX_MANUFACTURER,
		MIDI_SYSEX_OMNI_DEVICE,
		OpenWareMidiSysexCommand.SYSEX_FIRMWARE_UPLOAD
	];
	msg = msg.concat(encodeInt(packageIndex++));
	msg = msg.concat(encodeInt(raw.length));

	msg.push(0xf7);

	chunks.push(msg);

	while (i < data.length) {
		msg = [
			0xf0,
			MIDI_SYSEX_MANUFACTURER,
			MIDI_SYSEX_OMNI_DEVICE,
			OpenWareMidiSysexCommand.SYSEX_FIRMWARE_UPLOAD
		];
		msg = msg.concat(encodeInt(packageIndex++));

		let j = msg.length;
		for (; j<249 && i<data.length; ++j)
			msg[j] = data[i++];

		msg[j] = 0xf7;
		chunks.push(msg);
	}

	msg = [
		0xf0,
		MIDI_SYSEX_MANUFACTURER,
		MIDI_SYSEX_OMNI_DEVICE,
		OpenWareMidiSysexCommand.SYSEX_FIRMWARE_UPLOAD
	];
	msg = msg.concat(encodeInt(packageIndex++));

	const checksum = crc32(raw);
	log("Checksum:", checksum);
	msg = msg.concat(encodeInt(checksum));
	msg.push(0xf7);
	chunks.push(msg);

	return chunks;
};

export function systemCalls(data) {
	if (!(data.length > 3
				&& data[0] == 0xF0
				// && data[2] == MIDI_SYSEX_OMNI_DEVICE
				&& data[1] == MIDI_SYSEX_MANUFACTURER)) return;

	switch(data[3]) {
	case OpenWareMidiSysexCommand.SYSEX_PRESET_NAME_COMMAND: {
		const name = getStringFromSysex(data, 5, 1);
		const slot = data[4];
		const size = data.length > 5+6+name.length ? decodeInt(data.slice(6+name.length)) : 0;
		const crc = data.length > 5+5+6+name.length ? decodeInt(data.slice(5+6+name.length)) : 0;

		deviceDispatchPresetReceived({ slot, name, size, crc });
		log("preset received:", slot, "name: ", name, "size:", size, "CRC:", "0x"+crc.toString(16));

		break;
	}

	case OpenWareMidiSysexCommand.SYSEX_RESOURCE_NAME_COMMAND: {
		const name = getStringFromSysex(data, 5, 1);
		const slot = data[4];
		const size = data.length > 5+6+name.length ? decodeInt(data.slice(6+name.length)) : 0;

		deviceDispatchResourceReceived({ slot, name, size });
		log("resource received:", name, "slot:", slot, "size:", size);

		break;
	}

	case OpenWareMidiSysexCommand.SYSEX_PARAMETER_NAME_COMMAND: {
		const parameter_map = [' ', 'a', 'b', 'c', 'd', 'e'];
		const name = getStringFromSysex(data, 5, 1);
		const pid = data[4]+1;

		log("parameter", name, "PID:", pid);

		break;
	}

	case OpenWareMidiSysexCommand.SYSEX_PROGRAM_STATS: {
		const msg = getStringFromSysex(data, 4, 1);

		log('PATCH STATUS:', msg);
		owlDispatchPatchStatus(msg);

		break;
	}

	case OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION: {
		const msg = getStringFromSysex(data, 4, 1);

		owlDispatchFirmWareVersion(msg);
		log('FIRMWARE VERSION:', msg);

		break;
	}

	case OpenWareMidiSysexCommand.SYSEX_FIRMWARE_UPLOAD: {
		const index = decodeInt(data.slice(4, 5));
		log("Resource sequence:", index);

		if (index === 0)
			log("Resource size:", decodeInt(data.slice(9, 5)));

		break;
	}

	case OpenWareMidiSysexCommand.SYSEX_PROGRAM_MESSAGE: {
		const msg = getStringFromSysex(data, 4, 1);

		owlDispatchProgramMessage(msg)
		console.log('PROGRAM MESSAGE:', msg);

		break;
	}

	case OpenWareMidiSysexCommand.SYSEX_PROGRAM_ERROR: {
		const msg = getStringFromSysex(data, 4, 1);

		owlDispatchProgramError(msg)
		log('PROGRAM ERROR:', msg);

		break;
	}

	case OpenWareMidiSysexCommand.SYSEX_DEVICE_ID: {
		const msg = getStringFromSysex(data, 4, 1);

		deviceDispatchDeviceUUIDReceived(msg);
		log('DEVICE UUID:', msg);

		break;
	}

	case OpenWareMidiSysexCommand.SYSEX_DEVICE_STATS: {
		const msg = getStringFromSysex(data, 4, 1);

		owlDispatchProgramMessage(msg)
		log('DEVICE STATS:', msg);

		break;
	}

	default: {
		log('Unhandled SYSEX DEVICE event:', data);
		break;
	}
	}
};

function midi(data, msg) {
	const output = midiClient.output;

	if (typeof msg === 'string')
		log(msg);
	else if (msg !== undefined)
		log(...msg);

	if (!(output instanceof MIDIOutput))
		throw new Error(`owlCmd.run: expected output to be a MIDIOutput. It is '${typeof output}'`);

	output.send(data, 0);
};

function messageHandler(event) {
	const data = event.data;

	switch (data[0] & 0xF0) {
	case 0x80:
	        log('received noteOff:', data[1], 'velocity:', data[2]);
	        break;

	case 0x90:
		if (data[2] === 0)
			log('received noteOff:', data[1], 'velocity:', data[2]);
		else
			log('received noteOn:', data[1], 'velocity:', data[2]);

		break;

	case 0xB0:
		log("received CC ", data[1], "/", data[2]);
		break;

	case 0xC0:
		log("received PC ", data[1]);
		deviceDispatchProgramChange(data[1]);
		break;

	case 0xF0:
		systemCalls(data);
		break;

	default:
		break;
	}
};

function sendRequest(type) {
	midiClient.output.send([0xB0, OpenWareMidiControl.REQUEST_SETTINGS, type]);
};

function sendStatusRequest() {
	sendRequest(OpenWareMidiSysexCommand.SYSEX_PROGRAM_STATS);
	sendRequest(OpenWareMidiSysexCommand.SYSEX_PROGRAM_MESSAGE);
};

let pollRequestTimeout;
export function pollStatus() {
	sendStatusRequest();
	pollStatusStop();
	pollRequestTimeout = window.setTimeout(pollStatus, 2000);
};

export function pollStatusStop() {
	if (pollRequestTimeout) {
		window.clearTimeout(pollRequestTimeout);
	}
};

export function setParameter(param) {
	const { id, value } = param;

	const X = ['A','B','C','D','E','F','G','H'];

	const _P = X[Math.floor(id / 8) - 1];
	const P = _P > -1 ? _P : "";
	const S = X[(id % 8)]

	const T = `PATCH_PARAMETER_${P}${S}`;

	midi([0xB0, OpenWareMidiControl[T], value], [`sending CC:`, T, "/", value]);
};

function sendLoadRequest() {
	sendRequest(OpenWareMidiSysexCommand.SYSEX_PRESET_NAME_COMMAND);
	window.setTimeout(function() {
		sendRequest(OpenWareMidiSysexCommand.SYSEX_PARAMETER_NAME_COMMAND);
	}, 1000);
};

export function requestDevicePresets() {
	sendRequest(OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION);
	sendRequest(OpenWareMidiSysexCommand.SYSEX_PRESET_NAME_COMMAND);
	window.setTimeout(function() {
		sendRequest(OpenWareMidiSysexCommand.SYSEX_DEVICE_STATS);
	}, 1000);
};

export function requestDeviceResources() {
	sendRequest(OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION);
	sendRequest(OpenWareMidiSysexCommand.SYSEX_RESOURCE_NAME_COMMAND);
	window.setTimeout(function() {
		sendRequest(OpenWareMidiSysexCommand.SYSEX_DEVICE_STATS);
	}, 1000);
};

function selectPorts({inputs, outputs}) {
	let input, output;

	for (const i of inputs) {
		if (i.name.match('^OWL-')) {
			input = midiClient.selectInput(i.id);
			break;
		}
	}

	for (const o of outputs) {
		if (o.name.match('^OWL-')) {
			output = midiClient.selectOutput(o.id);
			break;
		}
	}

	if (!input) throw new Error('Failed to connect to MIDI input');
	if (!output) throw new Error('Failed to connect to MIDI output');

	return {
		connectedMidiInputPort: input,
		connectedMidiOutputPort: output,
		isConnected: !!(input && output),
		midiInputs: inputs,
		midiOutputs: outputs,
	};
};

function updatePermission(name, status) {
	log("update permission for:", name, "with", status);
};

export function connect() {
	return new Promise((resolve, reject) => {
		midiClient.init(messageHandler)
			.then(r => selectPorts(r))
			.then(r => resolve(r))
			.then(_ => sendRequest(OpenWareMidiSysexCommand.SYSEX_FIRMWARE_VERSION))
			.catch(e => reject(e));
	});
};

function sendProgramData(data) {
	return new Promise((resolve, reject) => {
		log("sending program data", data.length, "bytes");
		sendDataChunks(0, chunkData(data), resolve);
	});
};

function storeProgramInDeviceSlot(slot) {
	return new Promise((resolve, reject) => {

		if (typeof slot !== 'number' || slot < 0 || slot > 40) {
			reject(new Error('slot is not a number from 0 to 40'));
			return;
		}

		sendRequest(OpenWareMidiSysexCommand.SYSEX_DEVICE_STATS);

		const msg = [
			0xf0,
			MIDI_SYSEX_MANUFACTURER,
			MIDI_SYSEX_OMNI_DEVICE,
			OpenWareMidiSysexCommand.SYSEX_FIRMWARE_STORE,
			0, 0, 0, 0, slot, 0xf7
		];

		midiClient.log(msg);
		midi(msg, "sysex STORE command")
		resolve();
	});
};

export function resetDevice() {
	const msg = [
		0xf0,
		MIDI_SYSEX_MANUFACTURER,
		MIDI_SYSEX_OMNI_DEVICE,
		OpenWareMidiSysexCommand.SYSEX_DEVICE_RESET_COMMAND,
		0xf7
	];

	midiClient.log(msg);
	midiClient.output.send(msg, 0);
};

export function eraseDeviceStorage() {
	const cmd = OpenWareMidiSysexCommand.SYSEX_FLASH_ERASE;
	const msg = [
		0xf0,
		MIDI_SYSEX_MANUFACTURER,
		MIDI_SYSEX_OMNI_DEVICE,
		cmd,
		0xf7
	];

	midiClient.log(msg);
	midiClient.output.send(msg, 0);
};

export function deleteDevicePresetFromSlot(slot) {
	const cmd = OpenWareMidiSysexCommand.SYSEX_FLASH_ERASE;
	const data = [0, 0, 0, 0, slot];
	const msg = [
		0xf0,
		MIDI_SYSEX_MANUFACTURER,
		MIDI_SYSEX_OMNI_DEVICE,
		cmd,
		...data,
		0xf7
	];

	midiClient.log(msg);
	midiClient.output.send(msg, 0);
};

export function deleteDeviceResourceFromSlot(slot) {
	const cmd = OpenWareMidiSysexCommand.SYSEX_FLASH_ERASE;
	const data = [0, 0, 0, 0, slot];
	const msg = [
		0xf0,
		MIDI_SYSEX_MANUFACTURER,
		MIDI_SYSEX_OMNI_DEVICE,
		cmd,
		...data,
		0xf7
	];

	midiClient.log(msg);
	midiClient.output.send(msg, 0);
};

export function deviceUUID() {
	sendRequest(OpenWareMidiSysexCommand.SYSEX_DEVICE_ID)
};

export function setDeviceActivePresetSlot(slot) {
	midi([0xC0, slot], ["sending PC", slot]);
};

function chunkData(data) {
	const chunks = [];
	let start = 0;

	for (let i = 0; i < data.length; ++i) {
		if (data[i] == 0xf0) {
			start = i;
		} else if (data[i] == 0xf7) {
			chunks.push(data.subarray(start, i + 1));
		}
	}

	return chunks;
};

function sendDataChunks(index, chunks, resolve) {
	if (index < chunks.length) {
		midiClient.log(chunks[index]);

		midi(chunks[index], ["sent chunk", index]);

		window.setTimeout(function() {
			sendDataChunks(++index, chunks, resolve);
		}, 1);
	} else {
		resolve && resolve();
	}
};

function sendProgramRun() {
	const msg = [
		0xf0,
		MIDI_SYSEX_MANUFACTURER,
		MIDI_SYSEX_OMNI_DEVICE,
		OpenWareMidiSysexCommand.SYSEX_FIRMWARE_RUN,
		0xf7
	];

	midiClient.log(msg);
	midi(msg, "sysex RUN command");
};

function sendProgramFromUrl(url) {
	return new Promise((resolve, reject) => {
		console.log("sending patch from url "+url);

		const r = new XMLHttpRequest();

		r.responseType = "arraybuffer";
		r.onload = function (oEvent) {
			const arrayBuffer = r.response; // Note: not r.responseText
			if (arrayBuffer) {
				const data = new Uint8Array(arrayBuffer);
				resolve(sendProgramData(data));
			}
		};

		r.open("GET", url, true);
		r.send();
	});
};

export function loadPatchOnDevice(patchId) {
	const url = API_END_POINT + '/builds/' + patchId + '?format=sysex&amp;download=1';
	return sendProgramFromUrl(url);
};

export function storeResourceOnDevice(file) {
	return file.arrayBuffer()
		.then(x => sendDataChunks(0, packageSysexData((new Uint8Array(x))), _ => {
			const n = file.name;

			const msg = [
				0xF0,
				MIDI_SYSEX_MANUFACTURER,
				MIDI_SYSEX_OMNI_DEVICE,
				OpenWareMidiSysexCommand.SYSEX_FIRMWARE_SAVE,
				...n.split('').map(t => t.charCodeAt(0)),
				0x00,
				0xF7
			];

			midi(msg, ["sysex SAVE command", msg]);
		}));
};

export function storePatchInDeviceSlot(patchId, slot) {
	return loadPatchOnDevice(patchId).then(function() {
		return storeProgramInDeviceSlot(slot);
	});
};

export function loadAndRunPatchOnDevice(patchId) {
	return loadPatchOnDevice(patchId).then(function() {
		sendProgramRun();
	}, function(err) {
		console.error(err);
	});
};

export function sendNoteOff(note, velocity) {
	midi([0x90, note, velocity], ['sending Note On:', note, 'velocity:', velocity]);
};

export function sendNoteOn(note, velocity) {
	midi([0x80, note, velocity], ['sending Note Off:', note, 'velocity:', velocity]);
};

export function selectMidiInput() {
	midiClient.selectInput(...arguments);
};

export function selectMidiOutput() {
	midiClient.selectOutput(...arguments);
};
