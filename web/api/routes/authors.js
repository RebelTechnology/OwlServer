'use strict';

const router = require('express').Router();

const AuthorModel = require('../models/author');

/**
 * Retrieves all authors.
 *
 * GET /authors
 */
router.get('/', (req, res) => {
  const authorModel = new AuthorModel(req.db);
  let onlyForPublicPatches = true;
  if (req.query.onlyForPublicPatches == '0' || req.query.onlyForPublicPatches === 'false') {
    onlyForPublicPatches = false;
  }
  authorModel
    .getAll(onlyForPublicPatches)
    .then(result => {
      const response = { success: true, count: result.length, result };
      return res.status(200).json(response);
    })
    .catch(error => {
      process.stderr.write(error + '\n');
      process.stderr.write(error.stack + '\n');
      const message = error.message || JSON.stringify(error);
      const status = error.status || 500;
      return res.status(status).json({ success: false, message, status });
    });
});

module.exports = router;
