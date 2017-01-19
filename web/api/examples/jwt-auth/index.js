'use strict';

const path = require('path');

const ApiClient = require('../api-client');

const client = new ApiClient('https://staging.hoxtonowl.com/api', 'secret');
client
  .authenticate()
  // .then(() => client.getPatch('55ad6128125320db07310166'))
  // .then(() => client.getPatchBySeoName('Contest_Bias'))
  .then(() => client.newPatch({ name: 'test' }))
  .then(result => {
    console.log(result.data);
    if (!result.data.success) {
      return result;
    }
    console.log('Now uploading source file...'); // FIXME
    return client.uploadSourceFiles(result.data._id, [ path.join(__dirname, './TestTonePatch.hpp') ]);
  })
  .then(result => process.stdout.write('= ' + JSON.stringify(result.data) + '\n'))
  .catch(err => {
    console.error(err);
    process.stderr.write('! ' + err.stack + '\n');
  });

process.on('unhandledRejection', reason => {
  process.stderr.write('!! ' + reason + '\n');
});
