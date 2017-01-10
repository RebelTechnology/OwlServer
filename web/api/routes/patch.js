/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Q = require('q');

const Patch = require('../models/patch');
const { getUserInfoBatch } = require('../lib/wordpress-bridge.js');
const apiSettings = require('../api-settings.js');
const authTypes = require('../middleware/auth/auth-types');

/**
 * Adds the WP user "display name" to the patch's author info, if necessary.
 */
var getUserWpDisplayName = patch => {

    if (null === patch) {
        var e = new Error('Patch not found.');
        e.status = 404;
        throw e;
    }

    /*
     * Get WordPress user's "display name"
     */

    if ('wordpressId' in patch.author) {

        // FIXME - This should not be a batch call
        // This should call instead 'getUserInfo()'

        return getUserInfoBatch([ parseInt(patch.author.wordpressId) ]).then(result => {

            if (patch.author.wordpressId in result) {
                patch.author.name = result[patch.author.wordpressId].display_name;
            }

            return patch;

        });
    }

    return patch;

};

/**
 * Completes patch info with extra information.
 */
var finishPatch = patch => {

    /*
     * Get patch SysEx
     */

    patch['sysExAvailable'] = false;
    var sysexFile = path.join(apiSettings.SYSEX_PATH, patch['seoName'] + '.syx');
    if (fs.existsSync(sysexFile)) {
        patch['sysExAvailable'] = true;
        patch['sysExLastUpdated'] = fs.statSync(sysexFile).mtime;
    }

    /*
     * Get patch JS
     */

    patch['jsAvailable'] = false;
    var jsFile = path.join(apiSettings.JS_PATH, patch['seoName'] + (apiSettings.JS_BUILD_TYPE === 'min' ? '.min' : '') + '.js');
    if (fs.existsSync(jsFile)) {
        patch['jsAvailable'] = true;
        patch['jsLastUpdated'] = fs.statSync(jsFile).mtime;
    }

    /*
     * Return patch
     */

    return response = { result: patch };

};

/**
 * Retrieves a single patch.
 *
 * GET /patch/{id}
 *
 * FIXME: Private patches should be returned only to their owners.
 */
router.get('/:id', (req, res) => {

  const id = req.params.id;
  const collection = req.db.get('patches');

  Q
    .fcall(() => collection.findOne({ _id: id })) // Get patch by ID
    .then(getUserWpDisplayName)
    .then(finishPatch)
    .catch(error => {
      console.error(error);
      console.error(error.stack);
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

/**
 * Retrieves a patch by some field.
 *
 * GET /patch/?field=value&...
 *
 * FIXME: Private patches should be returned only to their owners.
 */
router.get('/', (req, res) => {

    var query = {};
    var collection = req.db.get('patches');

    if (typeof req.query.seoName === 'string' ) {
        query.seoName = req.query.seoName;
    }

    Q.fcall(() => {

        if (0 === Object.keys(query).length) {
            var e = new Error('You must specify at least 1 search parameter.');
            e.status = 400;
            throw e;
        }

        /*
         * Find patch
         */

        return collection.findOne(query);

    }).then(getUserWpDisplayName)
    .then(finishPatch)
    .catch(error => {
      console.error(error);
      console.error(error.stack);
      const message = error.message || JSON.stringify(error);
      const status = error.status || 500;
      return res.status(status).json({ message, status });
    }).done(response => {

        if ('ServerResponse' === response.constructor.name) {
            return response;
        }

        return res.status(200).json(response);

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

  const collection = req.db.get('patches');
  const updatedPatch = new Patch();
  Object.assign(updatedPatch, req.body.patch);
  const patchAuthor = {};

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
    console.log('User is' + (isWpAdmin ? '' : ' *NOT*') + ' a WP admin.');
    console.log('WP user ID is ' + wpUserId + '');

    // If not a WP admin, we set the current WP user as patch author,
    // disregarding any authorship info s/he sent.
    //
    // If a WP admin, we blindy trust the authorship information. Not ideal,
    // but at least keeps code leaner.
    if (!isWpAdmin) {
      patchAuthor.wordpressId = wpUserId;
    }

    updatedPatch.generateSeoName();
    return updatedPatch.validate(); // will throw an error if patch is not valid

  })
  .then(() => {

    // Make sure that no other patches are named the same (in a case insensitive fashion)
    const regExpEscape = str => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    const nameRegexp = new RegExp('^' + regExpEscape(updatedPatch.name) + '$', 'i');
    const seoNameRegexp = new RegExp('^' + regExpEscape(updatedPatch.seoName) + '$', 'i');
    return collection.findOne({
      $and: [
        { _id: { $ne: collection.id(updatedPatch._id)}},
        { $or: [ { name: nameRegexp }, { seoName: seoNameRegexp }]},
      ]
    });
  })
  .then(doc => {

    // Retrieve patch before updating it
    if (null !== doc) {
      var e = new Error('Patch name already taken.');
      e.status = 400;
      e.type = 'not_valid';
      e.field = 'name';
      throw e;
    }
    return collection.findById(updatedPatch._id);
  })
  .then(patch => {

    // Save patch
    if (null === patch) {
      var e = new Error('Patch not found!');
      e.status = 400;
      throw e;
    }

    if (!isWpAdmin) {
      if (!patch.author.wordpressId || patch.author.wordpressId !== wpUserId) {
        var e = new Error('You are not authorized to edit this patch.');
        e.status = 401;
        throw e;
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

    console.log('Patch to be updated: \n' + JSON.stringify(updatedPatch, null, 4));
    return collection.updateById(updatedPatch._id, updatedPatch);
  })
  .then(patch => {

    // Confirms that the patch was actually inserted
    console.log('Patch ' + updatedPatch._id + ' updated.');
    return {
      message: 'Patch updated.',
      _id:     updatedPatch._id,
      seoName: updatedPatch.seoName,
    };
  })
  .catch(error => {
    console.error(error);
    console.error(error.stack);
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
    console.log('User is' + (isWpAdmin ? '' : ' *NOT*') + ' a WP admin.');
    console.log('WP user ID = ' + wpUserId);

    console.log('Finding patch ' + id + '...');
    return collection.findOne({ _id: id });
  })
  .then(patch => {
    if (!patch) {
        var e = new Error('Patch not found.');
        e.status = 404;
        throw e;
    }

    // Check if user can delete patch
    if (!isWpAdmin && (patch.author.wordpressId !== wpUserId)) {
      var e = new Error('You are not authorized to delete this patch.');
      e.status = 401;
      throw e;
    }

    console.log('Removing patch ' + id + '...');
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
    console.error(error);
    console.error(error.stack);
    var status = error.status || 500;
    return res.status(status).json({
        message: error.message || JSON.stringify(error),
        status: status
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
