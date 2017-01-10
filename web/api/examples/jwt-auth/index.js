'use strict';

const ApiClient = require('../api-client');

const patch = {};

const client = new ApiClient('https://staging.hoxtonowl.com/api', 'secret');
client
  .authenticate()
  // .then(() => client.getPatch('547db9630548016374e6497e'))
  // .then(() => client.newPatch({ patch }))
  .then(() => client.getAuthors(false))
  .then(result => console.log(result.data))
  .catch(err => console.error(err));
