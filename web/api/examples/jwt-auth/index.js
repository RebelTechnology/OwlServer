/* eslint no-console: 0 */
'use strict';

const path = require('path');
const fs = require('fs');

const ApiClient = require('../api-client');

const API_ENDPOINT = 'https://staging.hoxtonowl.com/api'; // Comment out this line to run API locally
//const API_ENDPOINT = 'http://localhost:3000'; // Uncomment this line to run API locally

const client = new ApiClient(API_ENDPOINT, 'secret');
const testPatch = {}; // see ../fully-fledged-patch.js to see all possible fields
let newPatchId;
client
  .authenticate()

  // Create new patch
  .then(() => client.newPatch(testPatch))

  // Upload source file
  .then(({ data }) => {
    console.log(data);
    if (!data.success) {
      throw data;
    }
    console.log('Now uploading source file...');
    newPatchId = data._id;
    return client.uploadSourceFiles(newPatchId, [ path.join(__dirname, './TestTonePatch.hpp') ]);
  })

  // Build patch
  .then(({ data }) => {
    console.log(data);
    if (!data.success) {
      throw data;
    }
    console.log('Now building patch...');
    return client.buildPatch(newPatchId);
  })

  // Download SysEx build
  .then(({data}) => {
    if (!data.success) {
      throw data; // this object contains a lot of useful debug info (stdout, stderr..)!
    }
    console.log('Patch compiled successfully!');

    console.log('Downloading Sysex build...');
    const file = fs.createWriteStream('/tmp/patch.syx');
    return client.downloadPatch(newPatchId, 'sysex', file);
  })

  // Download JS build
  .then(() => {
    console.log('Downloading JS build...');
    const file = fs.createWriteStream('/tmp/patch.js');
    return client.downloadPatch(newPatchId, 'js', file);
  })

  // Show result
  .then(({ data }) => process.stdout.write('= ' + JSON.stringify(data) + '\n'))

  // Handle errors
  .catch(err => {
    console.error(err);
    process.stderr.write('! ' + err.stack + '\n');
  });

process.on('unhandledRejection', reason => {
  process.stderr.write('!! ' + reason + '\n');
});
