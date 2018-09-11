/* eslint-disable */
'use strict';

// All fields are optional
const patch = {
  "name": "Patch name", // a random name will be generated if not provided
  "parameters": [
    {
      id: 0,
      name: "A",
      io: "input",
      type: "float"
    },
    {
      id: 1,
      name: "B",
      io: "input",
      type: "float"
    },
    {
      id: 2,
      name: "C",
      io: "input",
      type: "float"
    },
    {
      id: 3,
      name: "D",
      io: "input",
      type: "float"
    },
    {
      id: 4,
      name: "Exp",
      io: "input",
      type: "float"
    },
    {
      id: 80,
      name: "Pushbutton",
      io: "input",
      type: "bool"
    },
    {
      id: 5,
      name: "CV Out",
      io: "output",
      type: "float"
    }
  ],
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
