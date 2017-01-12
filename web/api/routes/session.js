'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const router  = require('express').Router();
const scmp = require('scmp');

const errorResponse = require('../lib/error-response');

const authenticate = (nonce, givenHash) => {
  const expectedHash = crypto.createHash('sha256').update(nonce + process.env.API_KEY).digest('hex');
  return scmp(Buffer.from(expectedHash, 'hex'), Buffer.from(givenHash, 'hex'));
};

router.post('/', (req, res) => {

  const { nonce, apiKeyHash } = req.body;

  if ('string' !== typeof nonce) {
    return errorResponse({ message: 'Missing or invalid nonce.', status: 400, public: true }, res);
  }
  if ('string' !== typeof apiKeyHash) {
    return errorResponse({ message: 'Missing or invalid password hash.', status: 400, public: true });
  }

  if (authenticate(nonce, apiKeyHash)) {
    const token = jwt.sign({ iss: 'Rebel Technology', sub: 'OWL API' }, process.env.JWT_SECRET);
    res.status(200).json({ success: true, message: 'Authenticated.', token });
    return;
  }

  return errorResponse({ message: 'Unauthorized', status: 401, public: true });
});

module.exports = router;
