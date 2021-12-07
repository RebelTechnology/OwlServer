let messageHandler;

let input;
let output;

const outputs = [];
const inputs = [];

let DEBUG = true;

export function log(data) {
	console.log('MIDI:', data.map(item => (item<16 ? '0' : '') + (item && item.toString(16))));
};

function run(fn, msg) {
	if (typeof fn !== 'function')
		throw new Error(`midiclient.run: expected a function as a first argument. Got '${typeof fn}'`);

	if (DEBUG && msg !== undefined) {
		if (typeof msg === 'string')
			console.log(msg);
		else
			console.log(...msg);
	}

	if (!(input instanceof MIDIInput)) {
		throw new Error(`midiclient.run: expected input to be a MIDIInput. It is '${typeof input}'`);
	}

	fn();
};

function setup(midi) {
	const vis = midi.inputs.values();

	for (let i = vis.next(); i && !i.done; i = vis.next()) {
		inputs.push(i.value);
		console.log("added MIDI input", i.value);
	}

	if (vis.size === 0)
		console.log("No MIDI input devices present");

	const vos = midi.outputs.values();

	for (let o = vos.next(); o && !o.done; o = vos.next()) {
		outputs.push(o.value);
		console.log("added MIDI output", o.value);
	}

	if (vos.size === 0)
		console.log("No MIDI output devices present");

	return {
		inputs,
		outputs,
	};
};

function retry(err) {
	console.log("error", err);

	if (confirm("The MIDI system failed to start.\n"+err+"\nRetry?"))
		init();
};

export function selectInput(id) {
	if (typeof id === 'undefined') return;

	if (input) input.onmidimessage = undefined;

	input = inputs.find(i => i.id === id);

	if (input) {
		console.log("selecting MIDI input", input);
		input.onmidimessage = messageHandler;

		return input;
	}
};

export function selectOutput(id) {
	if (typeof id === 'undefined') return;

	output = outputs.find(o => o.id === id);

	if (output) {
		console.log("selecting MIDI output", output);
		return output;
	}
};

export function init(_messageHandler) {
	if (!navigator.requestMIDIAccess) {
		alert("No MIDI support present in your browser.");
		return;
	}

	messageHandler = _messageHandler;

	return navigator.requestMIDIAccess({ sysex: true })
		.catch(retry)
		.then(setup);
};

export {
	inputs,
	input,
	outputs,
	output,
};
