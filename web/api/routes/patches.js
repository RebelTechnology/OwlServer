'use strict';

const express = require('express');
const router = express.Router();
const url = require('url');
const Q = require('q'); // TODO: Remove dependency on Q

const Patch = require('../lib/patch');
const authTypes = require('../middleware/auth/auth-types');

const summaryFields = {
  _id: 1,
  name: 1,
  'author.name': 1,
  'author.url': 1,
  'author.wordpressId': 1,
  tags: 1,
  seoName: 1,
  creationTimeUtc: 1,
  published: 1,
  description: 1
};

/**
 * Retrieves all patches.
 *
 * GET /patches
 *
 * Possible GET parameters:
 * * author.name
 * * author.wordpressId
 *
 * FIXME - Only WP admins/patch authors should be able to retrieve all/their private patches.
 */
router.get('/', (req, res) => {
  const urlParts = url.parse(req.url, true);
  const query = urlParts.query;
  const collection = req.db.get('patches');

  const summaryFields2 = {};
  for (let field in summaryFields) { // shallow copy
    summaryFields2[field] = summaryFields[field];
  }
  summaryFields2.lowercase = { $toLower: '$name' }; // Used below to sort patches by name
  const filter = { $match: {}};
  if ('author.name' in query && query['author.name'] !== '') {
    filter.$match['author.name'] = query['author.name'];
  }
  if ('author.wordpressId' in query && query['author.wordpressId'] !== '') {
    filter.$match['author.wordpressId'] = query['author.wordpressId'];
  }

  collection.aggregate(filter, { $project: summaryFields2 }, { $sort: { lowercase: 1 }}, { $project: summaryFields })
    .then(result => {
      var response = { count: result.length, result };
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

/**
 * Creates a new patch.
 *
 * POST /patches
 */

router.post('/', (req, res) => {

  let isWpAdmin = false;
  let wpUserId;

  const collection = req.db.get('patches');
  const newPatch = new Patch();
  Object.assign(newPatch, req.body.patch);
  const patchAuthor = {};

  Q.fcall(() => {

    // Is user authenticated?
    if (!res.locals.authenticated) {
      throw { message: 'Access denied.', status: 401 };
    }

    const userInfo = res.locals.userInfo;
    if (userInfo.type === authTypes.AUTH_TYPE_WORDPRESS) {
      wpUserId = userInfo.wpUserId;
      console.log('WP user ID is ' + wpUserId + '');
      isWpAdmin = userInfo.wpAdmin;
      console.log('User is' + (isWpAdmin ? '' : ' *NOT*') + ' a WP admin.');

      // If not a WP admin, we set the current WP user as patch author,
      // disregarding any authorship info s/he sent.
      if(!isWpAdmin || (isWpAdmin && (!newPatch.author || !newPatch.author.wordpressId))) {
        patchAuthor.wordpressId = wpUserId;
      }
    } else if (userInfo.type === authTypes.AUTH_TYPE_TOKEN) { // token authentication
      patchAuthor.name = userInfo.name;
    }

    newPatch.author = patchAuthor;
    if (!newPatch.name) newPatch.generateRandomName();
    newPatch.generateSeoName();
    return newPatch.validate(); // will throw an error if patch is not valid

  })
  .then(() => {

    // Make sure that no other patches are named the same (in a case insensitive fashion)
    const regExpEscape = str => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");;
    var nameRegexp = new RegExp('^' + regExpEscape(newPatch.name) + '$', 'i');
    var seoNameRegexp = new RegExp('^' + regExpEscape(newPatch.seoName) + '$', 'i');
    return collection.findOne({ $or: [ { name: nameRegexp }, { seoName: seoNameRegexp } ] });
  })
  .then(doc => {

    // Save patch
    if (doc !== null) {
      throw {
        type: 'not_valid',
        field: 'name',
        message: 'Patch name is already taken.',
        status: 400,
      }
    }

    newPatch.sanitize();

    delete newPatch._id;

    // Set patch creation date
    const now = new Date().getTime();
    if (!isWpAdmin || !newPatch.creationTimeUtc) {
      newPatch.creationTimeUtc = now;
    }

    console.log('Patch to be inserted: \n' + JSON.stringify(newPatch, null, 4));
    return collection.insert(newPatch);
  })
  .then(patch => {

    // Check that the new patch was actually inserted
    console.log('New patch saved, id = ' + patch._id);
    return {
      message: 'New patch saved.',
      _id: patch._id,
      seoName: patch.seoName,
    };
  })
  .catch(error => {
    console.log(error);
    console.log(error.stack);
    const message = error.message || JSON.stringify(error);
    const status = error.status || 500;
    return res.status(status).json({ message, status });
  })
  .done(response => {
    if ('ServerResponse' === response.constructor.name) {
      return response;
    }
    return res.status(200).json(response);
  });
});

module.exports = router;
