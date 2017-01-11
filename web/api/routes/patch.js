'use strict';

const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const Q = require('q');

const Patch = require('../lib/patch');
const PatchModel = require('../models/patch');
const { getUserInfoBatch } = require('../lib/wordpress-bridge.js');
const apiSettings = require('../api-settings.js');
const authTypes = require('../middleware/auth/auth-types');

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
    const err = new Error('Patch not found.');
    err.status = 404;
    err.success = false;
    throw err;
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
    .catch(error => {
      process.stderr.write(error + '\n');
      process.stderr.write(error.stack + '\n');
      const message = error.message || JSON.stringify(error);
      const status = error.status || 500;
      return res.status(status).json({ success: false, message, status });
    });
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
    .catch(error => {
      process.stderr.write(error + '\n');
      process.stderr.write(error.stack + '\n');
      const message = error.message || JSON.stringify(error);
      const status = error.status || 500;
      return res.status(status).json({ success: false, message, status });
    });
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
        throw { message: 'Access denied (1).', status: 401 };
      }

      const userInfo = res.locals.userInfo;
      if (authTypes.AUTH_TYPE_WORDPRESS !== userInfo.type) { // API users cannot delete patches!
        throw { message: 'Access denied (2).', status: 401 };
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
        var e = new Error('Patch name already taken.');
        e.status = 400;
        e.type = 'not_valid';
        e.field = 'name';
        throw e;
      }
      // Retrieve patch before updating it
      return patchModel.getById(updatedPatch._id); // FIXME - Use findOneAndUpdate() for atomic update instead
    })
    .then(patch => {

      // Save patch
      if (!patch) {
        const err = new Error('Patch not found!');
        err.status = 400;
        throw err;
      }

      if (!isWpAdmin) {
        if (!patch.author.wordpressId || patch.author.wordpressId !== wpUserId) {
          const err = new Error('You are not authorized to edit this patch.');
          err.status = 401;
          throw err;
        }
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
      };
      return res.status(200).json(response);
    })
    .catch(error => {
      process.stderr.write(error + '\n');
      process.stderr.write(error.stack + '\n');
      const message = error.message || JSON.stringify(error);
      let status = 500;
      if (error.status) {
        status = error.status;
      } else if ([ 'PatchValidationError', 'PatchFieldValidationError' ].includes(error.constructor.name)) {
        status = 400;
      }
      return res.status(status).json({ success: false, message, status });
    });
});

/**
 * Deletes a patch.
 *
 * DELETE /patch/{id}
 */
router.delete('/:id', (req, res) => {

  let isWpAdmin = false;
  let wpUserId;

  const collection = req.db.get('patches');
  const id = req.params.id;

  Q.fcall(() => {

    // Is user authenticated?
    if (!res.locals.authenticated) {
      throw { message: 'Access denied (1).', status: 401 };
    }

    const userInfo = res.locals.userInfo;
    if (authTypes.AUTH_TYPE_WORDPRESS !== userInfo.type) { // API users cannot delete patches!
      throw { message: 'Access denied (2).', status: 401 };
    }

    isWpAdmin = userInfo.wpAdmin;
    wpUserId = userInfo.wpUserId;
    process.stdout.write('User is' + (isWpAdmin ? '' : ' *NOT*') + ' a WP admin.\n');
    process.stdout.write('WP user ID = ' + wpUserId + '\n');

    process.stdout.write('Finding patch ' + id + '...\n');
    return collection.findOne({ _id: id });
  })
  .then(patch => {
    if (!patch) {
      const err = new Error('Patch not found.');
      err.status = 404;
      throw err;
    }

    // Check if user can delete patch
    if (!isWpAdmin && (patch.author.wordpressId !== wpUserId)) {
      const err = new Error('You are not authorized to delete this patch.');
      err.status = 401;
      throw err;
    }

    process.stdout.write('Removing patch ' + id + '...\n');
    return collection.remove({ _id: id }); // Actually delete patch

  })
  .then(deletedCount => {
    if (1 !== deletedCount) { // Check that patch was actually deleted
      var e = new Error('Unexpected error while trying to delete patch.');
      e.status = 500;
      throw e;
    }
    return { message: 'Patch deleted successfully.' };
  })
  .catch(error => {
    process.stderr.write(error + '\n');
    process.stderr.write(error.stack + '\n');
    const status = error.status || 500;
    return res.status(status).json({
      message: error.message || JSON.stringify(error),
      status: status,
      success: false,
    });
  })
  .done(response => {
    if ('ServerResponse' === response.constructor.name) {
      return response;
    }
    return res.status(200).json(response);
  });
});

module.exports = router;
