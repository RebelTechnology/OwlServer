'use strict';

const router = require('express').Router();

const TagModel = require('../models/tag');

/**
 * Retrieves all tags.
 *
 * GET /tags
 */
router.get('/', (req, res) => {
  const tagModel = new TagModel(req.db);
  let onlyForPublicPatches = true;
  if (req.query.onlyForPublicPatches == '0' || req.query.onlyForPublicPatches === 'false') {
    onlyForPublicPatches = false;
  }
  tagModel
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
