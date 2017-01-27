'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const scmp = require('scmp');

/**
 * Authenticates users given an API key.
 *
 * @param {string} nonce     - The nonce provided by the user.
 * @param {string} givenHash - The API key hash provided by the user.
 * @return {boolean}
 */
const authenticate = (nonce, givenHash) => {
  const expectedHash = crypto.createHash('sha256').update(nonce + process.env.API_KEY).digest('hex');
  return scmp(Buffer.from(expectedHash, 'hex'), Buffer.from(givenHash, 'hex'));
};

const issueToken = () => jwt.sign({ iss: 'Rebel Technology', sub: 'OWL API' }, process.env.JWT_SECRET);

module.exports = {
  authenticate,
  issueToken,
};
