'use strict';

const router = require('express').Router();

const TagModel = require('../models/tag');
const errorResponse = require('../lib/error-response');

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
      const response = { success: true, count: result.length, result };
      return res.status(200).json(response);
    })
    .catch(error => errorResponse(error, res));
});

module.exports = router;
