'use strict';

const router = require('express').Router();
const fs = require('fs');
const path = require('path');

const Patch = require('../lib/patch');
const PatchModel = require('../models/patch');
const { getUserInfoBatch } = require('../lib/wordpress-bridge.js');
const apiSettings = require('../api-settings.js');
const { authTypes, API_USER_NAME } = require('../middleware/auth/constants');
const errorResponse = require('../lib/error-response');
const wordpressBridge = require('../lib/wordpress-bridge');

/**
 * Returns the WordPress user's "display name" for the given WordPress user ID.
 *
 * @todo FIXME Move this function somewhere else.
 *
 * @param {number} wordpressId
 * @return {Promise<string>}
 */
const getUserWpDisplayName = wordpressId => {

  // FIXME - This should not be a batch call - This should call instead 'getUserInfo()'
  return getUserInfoBatch([ parseInt(wordpressId) ])
    .then(result => {
      if (wordpressId in result) {
        return result[wordpressId].display_name;
      }
    });
};

/**
 * Returns information about available builds.
 *
 * FIXME - This function relies on the API being able to access the same filesystem
 *         as the website.
 *
 * @param {Patch} patch
 * @return {Object}
 */
const getPatchBuildInfo = patch => {

  const result = {
    sysExAvailable: false,
    jsAvailable: false,
  };

  // Get patch SysEx build
  const sysexFile = path.join(apiSettings.SYSEX_PATH, patch['seoName'] + '.syx');
  if (fs.existsSync(sysexFile)) {
    result['sysExAvailable'] = true;
    result['sysExLastUpdated'] = fs.statSync(sysexFile).mtime;
  }

  // Get patch JS build
  const jsFile = path.join(apiSettings.JS_PATH, patch['seoName'] + (apiSettings.JS_BUILD_TYPE === 'min' ? '.min' : '') + '.js');
  if (fs.existsSync(jsFile)) {
    result['jsAvailable'] = true;
    result['jsLastUpdated'] = fs.statSync(jsFile).mtime;
  }

  return result;
};

/**
 * Convenience function to process patch data as retrieved from the database and
 * add some extra fields to it.
 *
 * @param  {Object} result
 * @return {Promise<Patch>}
 */
const processPatch = result => {

  if (!result) {
    throw { message: 'Patch not found.', status: 404, public: true };
  }

  let patch = result;

  // Get WordPress user's display name
  let p = Promise.resolve();
  if (patch.author.wordpressId) {
    p = p.then(() => getUserWpDisplayName(patch.author.wordpressId));
  }
  return p
    .then(wordpressDisplayName => {
      if (wordpressDisplayName) {
        patch.author.name = wordpressDisplayName;
      }
      Object.assign(patch, getPatchBuildInfo(patch)); // Get available builds
      return patch;
    });
};

/**
 * Retrieves a single patch.
 *
 * GET /patch/{id}
 */
router.get('/:id', (req, res) => {
  const patchModel = new PatchModel(req.db);
  patchModel
    .getById(req.params.id)
    .then(processPatch)
    .then(patch => res.status(200).json({ success: true, result: patch }))
    .catch(error => errorResponse(error, res));
});

/**
 * Retrieves a patch by its SEO name.
 *
 * GET /patch/?seoName=value
 */
router.get('/', (req, res) => {

  if (!req.query.seoName || typeof req.query.seoName !== 'string') {
    const status = 500;
    return res.status(status).json({ message: 'Invalid seoName.', status });
  }

  const patchModel = new PatchModel(req.db);
  patchModel
    .getBySeoName(req.query.seoName)
    .then(processPatch)
    .then(patch => res.status(200).json({ success: true, result: patch }))
    .catch(error => errorResponse(error, res));
});

/**
 * Updates a patch.
 *
 * PUT /patch/{id}
 */
router.put('/:id', (req, res) => {

  let isWpAdmin = false;
  let wpUserId;

  const patchModel = new PatchModel(req.db);
  const updatedPatch = new Patch();
  Object.assign(updatedPatch, req.body.patch);
  const patchAuthor = {};

  Promise.resolve()
    .then(() => {

      // Is user authenticated?
      if (!res.locals.authenticated) {
        throw { message: 'Access denied (1).', status: 401, public: true };
      }

      const userInfo = res.locals.userInfo;
      if (authTypes.AUTH_TYPE_WORDPRESS !== userInfo.type) { // API users cannot delete patches!
        throw { message: 'Access denied (2).', status: 401, public: true };
      }

      isWpAdmin = userInfo.wpAdmin;
      wpUserId = userInfo.wpUserId;
      process.stdout.write('User is' + (isWpAdmin ? '' : ' *NOT*') + ' a WP admin.\n');
      process.stdout.write('WP user ID is ' + wpUserId + '\n');

      // If not a WP admin, we set the current WP user as patch author,
      // disregarding any authorship info s/he sent. If a WP admin, we blindy
      // trust the authorship information.
      if (!isWpAdmin) {
        patchAuthor.wordpressId = wpUserId;
      }

      updatedPatch.generateSeoName();
      return updatedPatch.validate(); // will throw an error if patch is not valid
    })
    .then(() => patchModel.patchNameTaken(updatedPatch.name, updatedPatch.seoName, updatedPatch._id))
    .then(nameAlreadyTaken => {
      if (nameAlreadyTaken) {
        throw { message: 'Patch name already taken.', status: 400, type: 'not_valid', field: 'name', public: true };
      }

      // Retrieve patch before updating it
      return patchModel.getById(updatedPatch._id); // FIXME - Use findOneAndUpdate() for atomic update instead
    })
    .then(patch => {

      // Save patch
      if (!patch) {
        throw { message: 'Patch not found!', status: 400, public: true };
      }

      if (!isWpAdmin && (!patch.author.wordpressId || patch.author.wordpressId !== wpUserId)) {
        throw { message: 'You are not authorized to edit this patch.', status: 401, public: true };
      }

      updatedPatch.sanitize();
      if (!isWpAdmin) {
        updatedPatch.author = patchAuthor;
      }

      if (!isWpAdmin) {
        updatedPatch.creationTimeUtc = patch.creationTimeUtc;
      } else {
        if (!updatedPatch.creationTimeUtc) {
          updatedPatch.creationTimeUtc = patch.creationTimeUtc;
        }
      }

      process.stdout.write('Patch to be updated: \n' + JSON.stringify(updatedPatch, null, 4) + '\n');
      return patchModel.update(updatedPatch._id, updatedPatch);
    })
    .then(() => {

      // Confirms that the patch was actually inserted
      process.stdout.write('Patch ' + updatedPatch._id + ' updated.\n');
      const response = {
        message: 'Patch updated.',
        _id: updatedPatch._id,
        seoName: updatedPatch.seoName,
        success: true,
      };
      return res.status(200).json(response);
    })
    .catch(error => errorResponse(error, res));
});

/**
 * Deletes a patch.
 *
 * DELETE /patch/{id}
 */
router.delete('/:id', (req, res) => {

  let isWpAdmin = false;
  let wpUserId;

  const patchModel = new PatchModel(req.db);
  const id = req.params.id;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return errorResponse({ public: true, status: 400, message: 'Invalid patch ID.' }, res);
  }

  Promise.resolve()
    .then(() => {

      // Is user authenticated?
      if (!res.locals.authenticated) {
        throw { message: 'Access denied (1).', status: 401, public: true };
      }

      const userInfo = res.locals.userInfo;
      if (authTypes.AUTH_TYPE_WORDPRESS !== userInfo.type) { // API users cannot delete patches!
        throw { message: 'Access denied (2).', status: 401, public: true };
      }

      isWpAdmin = userInfo.wpAdmin;
      wpUserId = userInfo.wpUserId;
      process.stdout.write('User is' + (isWpAdmin ? '' : ' *NOT*') + ' a WP admin.\n');
      process.stdout.write('WP user ID = ' + wpUserId + '\n');

      // Retrieve patch before deleting it
      return patchModel.getById(id); // FIXME - Use findOneAndDelete() for atomic delete instead
    })
    .then(patch => {

      if (!patch) {
        throw { message: 'Patch not found.', status: 404, public: true };
      }

      // Check if user can delete patch
      if (!isWpAdmin && (!patch.author.wordpressId || patch.author.wordpressId !== wpUserId)) {
        throw { message: 'You are not authorized to delete this patch.', status: 401, public: true };
      }

      process.stdout.write('Deleting...\n'); // FIXME
      return patchModel.delete(id); // Actually delete patch
    })
    .then(() => {
      process.stdout.write('Patch deleted!\n'); // FIXME
      return res.status(200).json({ success: true, message: 'Patch deleted successfully.' });
    })
    .catch(error => errorResponse(error, res));
});

/**
 * Uploads one or more source files.
 *
 * POST /patch/{id}/sources
 *
 * Request payload format:
 * {
 *   files: [
 *     {
 *       name: 'Gain.hpp',
 *       data: 'base64 encoded file content'
 *     },
 *     ...
 *   ]
 * }
 */
router.post('/:id/sources', (req, res) => {

  // Is user authenticated?
  if (!res.locals.authenticated) {
    throw { message: 'Access denied (1).', status: 401, public: true };
  }

  // Only API users can upload sources. WordPress users will do it through the website.
  if (authTypes.AUTH_TYPE_TOKEN !== res.locals.userInfo.type) {
    throw { message: 'Access denied (2).', status: 401, public: true };
  }

  // Validate patch ID
  const id = req.params.id;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return errorResponse({ public: true, status: 400, message: 'Invalid patch ID.' }, res);
  }

  // Validate files
  const { files } = req.body;
  if (!files || !Array.isArray(files) || !files.length) {
    return errorResponse({ public: true, status: 400, message: 'No files specified.' }, res);
  }
  for (let i = 0; i < files.length; i++) {
    if (!files[i].name || typeof files[i].name !== 'string') {
      return errorResponse({ public: true, status: 400, message: 'Invalid file name.' }, res);
    }
    if (!files[i].data || typeof files[i].data !== 'string') {
      return errorResponse({ public: true, status: 400, message: 'Invalid file data.' }, res);
    }
  }

  const patchModel = new PatchModel(req.db);
  patchModel.getById(id)
    .then(patch => {
      if (!patch) {
        throw { message: 'Patch not found.', status: 400, public: true };
      }

      if (!patch.author.name || patch.author.name !== API_USER_NAME) {
        throw { message: 'Access denied (3).', status: 401, public: true };
      }

      return wordpressBridge.uploadSources(id, files);
    })
    .catch(error => errorResponse(error, res));
});

module.exports = router;
