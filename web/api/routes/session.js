'use strict'

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const express = require('express');
const scmp = require('scmp');

const router  = express.Router();

const authenticate = (nonce, givenHash) => {
  const expectedHash = crypto.createHash('sha256').update(nonce + process.env.API_KEY).digest('hex');
  console.log('given    :', givenHash);
  console.log('expected :', expectedHash);
  return scmp(Buffer.from(expectedHash, 'hex'), Buffer.from(givenHash, 'hex'));
};

router.post('/', (req, res) => {

  const { nonce, apiKeyHash } = req.body;

  if ('string' !== typeof nonce) {
    res.status(400).json({ message: 'Missing or invalid nonce.', status: 400 });
    return;
  }
  if ('string' !== typeof apiKeyHash) {
    res.status(400).json({ message: 'Missing or invalid password hash.', status: 400 });
    return;
  }

  if (authenticate(nonce, apiKeyHash)) {
    const token = jwt.sign({ iss: 'Rebel Technology', sub: 'OWL API' }, process.env.JWT_SECRET);
    res.status(200).json({ message: 'Authenticated.', token });
    return;
  }

  res.status(401).json({ message: 'Unauthorized.', status: 401 });

});

module.exports = router;
