'use strict';

const router = require('express').Router();

const AuthorModel = require('../models/author');
const errorResponse = require('../lib/error-response');

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
    .catch(error => errorResponse(error, res));
});

module.exports = router;
