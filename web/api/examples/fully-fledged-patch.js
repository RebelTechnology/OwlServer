/* eslint-disable */
'use strict';

// All fields are optional
const patch = {
  "name": "Patch name", // a random name will be generated if not provided
  "parameters": {
    "a": "Parameter 1",
    "b": "Parameter 2",
    "c": "Parameter 3",
    "d": "Parameter 4",
    "e": "Parameter 5"
  },
  "inputs": 1,  // 0, 1 or 2, defaults to 0
  "outputs": 1, // 0, 1 or 2, defaults to 0
  "description": "descriptions here...",
  "instructions": "instructions here...",
  "soundcloud": [ // as many links as needed here
    "https://soundcloud.com/hoxtonowl/owl-freeverb-patch"
  ],
  "github": [ // as many as needed. the URL is the one from the browser's URL bar
    "https://github.com/pingdynasty/OwlPatches/blob/master/FreeVerbPatch.hpp"
  ],
  "compilationType": "gen" // one of the following: 'cpp', 'faust', 'pd', 'gen'. defaults to 'cpp'
};
