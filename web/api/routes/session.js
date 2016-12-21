'use strict'

/*
 To generate a nonce:

       node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"

 To generate the password hash:

       node -e "console.log(.createHash('sha256').update(nonce + password).digest('hex'));"

 To request a token from the command line:
      curl
        --header "Content-Type: application/json"
        -d'{"nonce":"nonce", "passwordHash":"..."}'
        -X POST
        http://localhost:3000/session
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const express = require('express');

const router  = express.Router();

const authenticate = (nonce, passwordHash) => {
  return crypto.createHash('sha256').update(nonce + process.env.API_PASSWORD).digest('hex') === passwordHash;
};

router.post('/', (req, res) => {

  const { nonce, passwordHash } = req.body;

  if (!nonce || 'string' !== typeof nonce) {
    res.status(400).json({ message: 'Missing or invalid nonce.', status: 400 });
    return;
  }
  if (!passwordHash || 'string' !== typeof passwordHash) {
    res.status(400).json({ message: 'Missing or invalid password hash.', status: 400 });
    return;
  }

  if (authenticate(nonce, passwordHash)) {
    const token = jwt.sign({ iss: 'Rebel Technology', sub: 'OWL API' }, process.env.JWT_SECRET);
    res.status(200).json({ message: 'Authenticated.', token });
    return;
  }

  res.status(401).json({ message: 'Unauthorized', status: 401 });

});

module.exports = router;
