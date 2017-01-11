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
      const response = { count: result.length, result };
      return res.status(200).json(response);
    })
    .catch(error => {
      console.error(error);
      console.error(error.stack);
      const message = error.message || JSON.stringify(error);
      const status = error.status || 500;
      return res.status(status).json({ message, status });
    });
});

module.exports = router;
