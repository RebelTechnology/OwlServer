'use strict';

const ApiClient = require('../api-client');

// const patch = {};

const client = new ApiClient('https://staging.hoxtonowl.com/api', 'secret');
client
  .authenticate()
  .then(() => client.getPatch('55ad6128125320db07310166'))
  // .then(() => client.getPatchBySeoName('Contest_Bias'))
  // .then(() => client.newPatch({ patch }))
  // .then(() => client.getTags(false))
  .then(result => process.stdout.write('= ' + JSON.stringify(result.data) + '\n'))
  .catch(err => process.stderr.write('! ' + JSON.stringify(err) + '\n'));
