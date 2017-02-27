'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const scmp = require('scmp');

const config = require('./config');

/**
 * Authenticates users given an API key.
 *
 * @param {string} nonce     - The nonce provided by the user.
 * @param {string} givenHash - The API key hash provided by the user.
 * @return {boolean}
 */
const authenticate = (nonce, givenHash) => {
  const expectedHash = crypto.createHash('sha256').update(nonce + config.api.key).digest('hex');
  return scmp(Buffer.from(expectedHash, 'hex'), Buffer.from(givenHash, 'hex'));
};

const issueToken = () => jwt.sign({ iss: 'Rebel Technology', sub: 'OWL API' }, config.api.jwtSecret);

module.exports = {
  authenticate,
  issueToken,
};
