'use strict';

const router = require('express').Router();

const Patch = require('../lib/patch');
const PatchModel = require('../models/patch');
const { getUserInfoBatch } = require('../lib/wordpress-bridge.js');
const { authTypes, API_USER_NAME } = require('../middleware/auth/constants');
const errorResponse = require('../lib/error-response');
const wordpressBridge = require('../lib/wordpress-bridge');
const patchBuild = require('../lib/patch-build');
const config = require('../lib/config');

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
      // Get available builds
      Object.assign(patch, patchBuild.getInfo(patch));
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

  // Is user authenticated?
  if (!res.locals.authenticated) {
    return errorResponse({ message: 'Access denied (1).', status: 401, public: true }, res);
  }

  const userInfo = res.locals.userInfo;
  if (authTypes.AUTH_TYPE_WORDPRESS !== userInfo.type) { // API users cannot edit patches!
    return errorResponse({ message: 'Access denied (2).', status: 401, public: true }, res);
  }

  let isWpAdmin = userInfo.wpAdmin;
  let wpUserId = userInfo.wpUserId;
  process.stdout.write('User is' + (isWpAdmin ? '' : ' *NOT*') + ' a WP admin.\n');
  process.stdout.write('WP user ID is ' + wpUserId + '\n');

  const patchModel = new PatchModel(req.db);
  const updatedPatch = new Patch();
  Object.assign(updatedPatch, req.body.patch);

  updatedPatch.generateSeoName();

  Promise.resolve(updatedPatch.validate()) // will throw an error if patch is not valid
    .then(() => patchModel.patchNameTaken(updatedPatch.name, updatedPatch.seoName, updatedPatch._id))
    .then(nameAlreadyTaken => {
      if (nameAlreadyTaken) {
        throw { message: 'Patch name already taken.', status: 400, type: 'not_valid', field: 'name', public: true };
      }

      // Retrieve patch before updating it
      return patchModel.getById(updatedPatch._id); // FIXME - Use findOneAndUpdate() for atomic update instead
    })
    .then(patch => {

      if (!patch) {
        throw { message: 'Patch not found!', status: 400, public: true };
      }

      if (!isWpAdmin && (!patch.author.wordpressId || patch.author.wordpressId !== wpUserId)) {
        throw { message: 'You are not authorized to edit this patch.', status: 401, public: true };
      }

      updatedPatch.sanitize();

      // If not a WP admin, we set the current WP user as patch author,
      // disregarding any authorship info s/he sent. If a WP admin, we blindy
      // trust the authorship information.
      if (!isWpAdmin) {
        updatedPatch.author = { wordpressId: wpUserId };
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

  // Is user authenticated?
  if (!res.locals.authenticated) {
    return errorResponse({ message: 'Access denied (1).', status: 401, public: true }, res);
  }

  const userInfo = res.locals.userInfo;
  if (authTypes.AUTH_TYPE_WORDPRESS !== userInfo.type) { // API users cannot delete patches!
    throw { message: 'Access denied (2).', status: 401, public: true };
  }

  let isWpAdmin = userInfo.wpAdmin;
  let wpUserId = userInfo.wpUserId;
  process.stdout.write('User is' + (isWpAdmin ? '' : ' *NOT*') + ' a WP admin.\n');
  process.stdout.write('WP user ID = ' + wpUserId + '\n');

  const patchModel = new PatchModel(req.db);
  const id = req.params.id;
  if (!/^[a-f\d]{24}$/i.test(id)) { // FIXME - This code should not be here
    return errorResponse({ public: true, status: 400, message: 'Invalid patch ID.' }, res);
  }

  // Retrieve patch before deleting it
  patchModel.getById(id) // FIXME - Use findOneAndDelete() for atomic delete instead
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
 * Add the authenticated user's star to the patch by Id
 *
 * POST /patch/{id}/star
 *
 */
router.post('/:id/star', (req,res) => {

  // Is user authenticated?
  if (!res.locals.authenticated) {
    return errorResponse({ message: 'Access denied (1).', status: 401, public: true }, res);
  }

  const userInfo = res.locals.userInfo;
  if (authTypes.AUTH_TYPE_WORDPRESS !== userInfo.type) { // API users cannot star patches.
    return errorResponse({ message: 'Access denied (2).', status: 401, public: true }, res);
  }

  const id = req.params.id;
  const star = {
    user : userInfo.display_name,
    timeStamp : new Date().getTime()
  };

  const patchModel = new PatchModel(req.db);
  patchModel.addStar(id, star)
    .then(result => {

      if (!result.ok) {
        throw { message: 'Starring failed.', status: 400, public: true };
      }

      return res.status(200).json( {success: true, result: star});
    })
    .catch(error => errorResponse(error, res));
});

/**
 * Remove the authenticated user's star from the specified patch by Id
 *
 * DELETE /patch/{id}/star
 *
 */
router.delete('/:id/star', (req,res) => {

  // Is user authenticated?
  if (!res.locals.authenticated) {
    return errorResponse({ message: 'Access denied (1).', status: 401, public: true }, res);
  }

  const userInfo = res.locals.userInfo;
  if (authTypes.AUTH_TYPE_WORDPRESS !== userInfo.type) { // API users cannot star patches.
    return errorResponse({ message: 'Access denied (2).', status: 401, public: true }, res);
  }

  const id = req.params.id;
  const star = {
    user : userInfo.display_name
  };

  const patchModel = new PatchModel(req.db);
  patchModel.removeStar(id, star)
    .then(result => {

      if (!result.ok) {
        throw { message: 'Removing star failed.', status: 400, public: true };
      }

      return res.status(200).json( {success: true});
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

  const successfulUploads = [];
  const failedUploads = [];

  // Is user authenticated?
  if (!res.locals.authenticated) {
    return errorResponse({ message: 'Access denied (1).', status: 401, public: true }, res);
  }

  // Only API users can upload sources. WordPress users will do it through the website.
  if (authTypes.AUTH_TYPE_TOKEN !== res.locals.userInfo.type) {
    return errorResponse({ message: 'Access denied (2).', status: 401, public: true }, res);
  }

  // Validate patch ID
  const id = req.params.id;
  if (!/^[a-f\d]{24}$/i.test(id)) { // FIXME - This code should not be here
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
  let patch;
  patchModel.getById(id)
    .then(result => {
      patch = result;
      if (!patch) {
        throw { message: 'Patch not found.', status: 400, public: true };
      }

      if (!patch.author.name || patch.author.name !== API_USER_NAME) {
        throw { message: 'Access denied (3).', status: 401, public: true };
      }

      return wordpressBridge.uploadSources(id, files);
    })
    .then(result => {
      if (!result) {
        throw new Error();
      }

      if (result.err) {
        throw new Error('Error while uploading patch source(s).');
      }

      // Check that every single upload succeeded...
      if (!Array.isArray(result.files)) {
        throw new Error();
      }

      for (let file of result.files) {
        if (file.err) {
          failedUploads.push(file.name);
          continue;
        } else {
          successfulUploads.push(file.name);
        }
      }

      const sourceUrls = successfulUploads.map(uploadedFile => {
        // Example:
        // https://staging.hoxtonowl.com/wp-content/uploads/patch-files/563b9a3031062254525b5831/TestTonePatch.hpp
        return `https://${config.wordpress.hostname}/${config.wordpress.patchSourceUrlFragment}/${id}/${uploadedFile}`;
      });
      return patchModel.addSources(id, sourceUrls);
    })
    .then(() => {
      const response = { success: !failedUploads.length };
      if (successfulUploads.length && !failedUploads.length) {
        response.message = 'Success.';
      } else if (!successfulUploads.length && failedUploads.length) {
        response.message = 'Error uploading source file(s).';
      } else if (successfulUploads.length && failedUploads.length) {
        response.message = 'Some files could not be uploaded.';
      }
      response.successfulUploads = successfulUploads;
      response.failedUploads = failedUploads;

      return res.status(response.success ? 200 : 400).json(response);
    })
    .catch(error => errorResponse(error, res));
});

module.exports = router;
