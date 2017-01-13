'use strict';

const router  = require('express').Router();

const { authenticate, issueToken } = require('../lib/authentication');
const errorResponse = require('../lib/error-response');

/**
 * POST /session
 */
router.post('/', (req, res) => {

  const { nonce, apiKeyHash } = req.body;

  if ('string' !== typeof nonce) {
    return errorResponse({ message: 'Missing or invalid nonce.', status: 400, public: true }, res);
  }
  if ('string' !== typeof apiKeyHash) {
    return errorResponse({ message: 'Missing or invalid password hash.', status: 400, public: true });
  }

  if (authenticate(nonce, apiKeyHash)) {
    const token = issueToken();
    res.status(200).json({ success: true, message: 'Authenticated.', token });
    return;
  }

  return errorResponse({ message: 'Unauthorized', status: 401, public: true });
});

module.exports = router;
