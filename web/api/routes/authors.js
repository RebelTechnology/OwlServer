'use strict';

const express = require('express');
const router = express.Router();

const AuthorModel = require('../models/author');

/**
 * Retrieves all authors.
 *
 * GET /authors
 */
router.get('/', (req, res) => {
  const authorModel = new AuthorModel(req.db);
  let onlyWithPublicPatches = true;
  if (req.query.onlyWithPublicPatches == '0' || req.query.onlyWithPublicPatches === 'false') {
    onlyWithPublicPatches = false;
  }
  authorModel
    .getAll(!!req.query.onlyWithPublicPatches)
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
