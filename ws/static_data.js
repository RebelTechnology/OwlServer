var vertx = require('vertx')

var eb = vertx.eventBus;

var pa = 'vertx.mongopersistor';

var patches = [
    {
	name: 'Overdrive',
	author: 'OWL Team',
	description: 'Simulation of tube distortion',
	parameters: [ 'Drive', 'Offset', '', 'Gain'];
	tags: [ "Distortion", "Tube" ]
    },
    {
	name: 'Simple Delay',
	author: 'OWL Team',
	description: 'Non-interpolating delay, delay times up to 2 seconds',
	parameters: [ 'Delay', 'Feedback', '', 'Dry/Wet'];
	tags: [ "Delay" ]
    },
    {
	name: 'Resonant Low Pass Filter',
	author: 'OWL Team',
	description: '4-pole resonant low pass filter with drive',
	tags: [ "Filter", "Distortion" ]
    },
    {
	name: 'Dronebox',
	author: 'Oli Larkin',
	description: 'A bank of four tuned comb filters / virtual strings which resonate in response to the input',
	parameters: [ 'Coarse Pitch', ' Fine Pitch', 'Decay', 'Mix'];
	inputs: 1,
	outputs: 1,
	tags: [ "Comb Filter", "Resonance" ]
    },
    {
	name: 'Freeverb',
	author: 'Marek Bereza',
	parameters: [ 'Mix', ' Room Size', 'Damp'];
	inputs: 1,
	outputs: 1,
	description: 'Port of a popular implementation of the Schroeder/Moorer lowpass-feedback-comb-filter reverb',
	tags: [ "Reverb" ]
    },
];

// First delete everything
eb.send(pa, {action: 'delete', collection: 'patches', matcher: {}}, function(reply) {
    eb.send(pa, {action: 'delete', collection: 'users', matcher: {}}, function(reply) {
	for (var i = 0; i < patches.length; i++) {
	    eb.send(pa, {
		action: 'save',
		collection: 'patches',
		document: patches[i]
	    });
	}

	// And a user
	eb.send(pa, {
	    action: 'save',
	    collection: 'users',
	    document: {
		firstname: 'Tim',
		lastname: 'Fox',
		email: 'tim@fox.com',
		username: 'tim',
		password: 'fox'
	    }
	});
	
    });
});
