'use strict';

const router = require('express').Router();
const Patch = require('../lib/patch');
const PatchModel = require('../models/patch');
const { authTypes } = require('../middleware/auth/constants');
const errorResponse = require('../lib/error-response');

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
  const patchModel = new PatchModel(req.db);
  return patchModel.find(req.query)
    .then(result => {
      var response = { count: result.length, result, success: true };
      return res.status(200).json(response);
    })
    .catch(error => errorResponse(error, res));
});

/**
 * Creates a new patch.
 *
 * POST /patches
 */
router.post('/', (req, res) => {

  // Is user authenticated?
  if (!res.locals.authenticated) {
    return errorResponse({ message: 'Access denied.', status: 401, public: true }, res);
  }

  const patchModel = new PatchModel(req.db);
  const newPatch = new Patch();
  Object.assign(newPatch, req.body.patch);

  // Get user details
  let isWpAdmin = false;
  let wpUserId;
  const patchAuthor = {};
  const userInfo = res.locals.userInfo;
  if (userInfo.type === authTypes.AUTH_TYPE_WORDPRESS) {
    wpUserId = userInfo.wpUserId;
    process.stdout.write('WP user ID is ' + wpUserId + '\n');
    isWpAdmin = userInfo.wpAdmin;
    process.stdout.write('User is' + (isWpAdmin ? '' : ' *NOT*') + ' a WP admin.\n');

    // If not a WP admin, we set the current WP user as patch author,
    // disregarding any authorship info s/he sent.
    if(!isWpAdmin || (isWpAdmin && (!newPatch.author || !newPatch.author.wordpressId))) {
      patchAuthor.wordpressId = wpUserId;
    }
  } else if (userInfo.type === authTypes.AUTH_TYPE_TOKEN) { // token authentication
    patchAuthor.name = userInfo.name;
  }

  newPatch.author = patchAuthor;
  if (!newPatch.name) {
    newPatch.generateRandomName();
  }
  newPatch.generateSeoName();

  Promise.resolve(newPatch.validate()) // will throw an error if patch is not valid
    .then(() => patchModel.patchNameTaken(newPatch.name, newPatch.seoName))
    .then(nameAlreadyTaken => {
      if (nameAlreadyTaken) {
        throw { message: 'Patch name already taken.', status: 400, type: 'not_valid', field: 'name', public: true };
      }

      newPatch.sanitize();

      delete newPatch._id;

      // Set patch creation date
      const now = new Date().getTime();
      if (!isWpAdmin || !newPatch.creationTimeUtc) {
        newPatch.creationTimeUtc = now;
      }

      process.stdout.write('Patch to be inserted: \n' + JSON.stringify(newPatch, null, 4) + '\n');
      return patchModel.insert(newPatch);
    })
    .then(patch => {
      process.stdout.write('New patch saved, id = ' + patch._id + '\n');
      return res.status(200).json({
        message: 'New patch saved.',
        _id: patch._id,
        seoName: patch.seoName,
        url: `https://${process.env.WORDPRESS_HOSTNAME}/patch-library/patch/${patch.seoName}`,
        success: true,
      });
    })
    .catch(error => errorResponse(error, res));
});

module.exports = router;
