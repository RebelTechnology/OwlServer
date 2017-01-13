'use strict';

const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const exec = require('child-process-promise').exec;

const apiSettings = require('../api-settings.js');
const PatchModel = require('../models/patch');
const errorResponse = require('../lib/error-response');

/**
 * Convenience function for validating and normalizing the build format.
 *
 * @param {string} format
 * @return {string}
 */
const getBuildFormat = format => {

  let buildFormat = 'sysx'; // default build format
  if (format) {
    buildFormat = format;
  }
  // validate
  if (buildFormat !== 'js' && buildFormat !== 'sysx' && buildFormat !== 'sysex') {
    throw { public: true, message: 'Invalid format.', status: 500 };
  }
  if (buildFormat === 'sysex') { // 'sysex' is just an alias for 'sysx'
    buildFormat = 'sysx'; // normalize
  }

  return buildFormat;
};

/**
 * Downloads the build for the specified patch.
 *
 * GET /builds/{patchId}[?format={sysex|sysx|js}]
 *
 * The `format` parameter defaults to `sysx`.
 */
router.get('/:id', function (req, res) {

  const id = req.params.id;
  const query = req.query;
  let format;
  let download = true;
  const patchModel = new PatchModel(req.db);

  if (!/^[a-f\d]{24}$/i.test(id)) {
    return errorResponse({
      public: true,
      status: 400,
      message: 'Invalid patch ID.'
    });
  }

  Promise.resolve()
    .then(() => {

      // Determine patch format
      format = getBuildFormat(query.format);

      // Determine whether the patch will be downloaded or streamed in-line
      if (query.download && (query.download == 0 || query.download == 'false' || query.download == '')) {
        download = false;
      }

      return patchModel.getById(id);
    })
    .then(patch => {

      if (!patch) {
        throw { status: 404, public: true, message: 'Patch not found.' };
      }

      // Check if SysEx is available

      let buildFile;
      let filename;

      if (format === 'sysx') {
        buildFile = path.join(apiSettings.SYSEX_PATH, patch.seoName + '.syx');
      } else if (format === 'js') {
        buildFile = path.join(apiSettings.JS_PATH, patch.seoName + (apiSettings.JS_BUILD_TYPE === 'min' ? '.min' : '') + '.js');
      }
      if (!fs.existsSync(buildFile)) { // FIXME - Move this somewhere else
        throw {
          status: 404,
          public: true,
          message: 'Build file not available for this patch (in ' + format + ' format).'
        };
      }

      // Download file
      filename = path.basename(buildFile);
      if (download) {
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
      }
      if(download && format === 'sysx') {
        // increment download count for sysx files
        patchModel.incrementDownloadCount(patch._id);
      }
      res.setHeader('Content-length', fs.statSync(buildFile)['size']); // FIXME - Move this somewhere else
      if (format === 'sysx') {
        res.setHeader('Content-type', 'application/octet-stream');
      } else if (format === 'js') {
        res.setHeader('Content-type', 'text/javascript');
      }
      const filestream = fs.createReadStream(buildFile);
      return filestream.pipe(res);
    })
    .catch(error => errorResponse(error, res));
});

/**
 * Builds the specified patch.
 *
 * PUT /builds/{patchId}
 */
router.put('/:id', (req, res) => {

  let isWpAdmin = false;
  let wpUserId;
  const patchModel = new PatchModel(req.db);

  const id = req.params.id;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return errorResponse({
      public: true,
      status: 400,
      message: 'Invalid patch ID.'
    });
  }

  let format = 'sysx'; // default
  if (req.body.format) {
    format = getBuildFormat(req.body.format);
  }

  Promise.resolve()
    .then(() => {

      // Is user authenticated?
      if (!res.locals.authenticated) {
        throw { public: true, message: 'Access denied.', status: 401 };
      }

      // Get user details
      const userInfo = res.locals.userInfo;
      wpUserId = userInfo.id;
      process.stdout.write('WP user ID is ' + wpUserId + '\n');
      isWpAdmin = userInfo.admin;
      process.stdout.write('User is' + (isWpAdmin ? '' : ' *NOT*') + ' a WP admin.\n');

      return patchModel.getById(id);
    })
    .then(patch => {
      if (!patch) {
        throw { message: 'Patch not found.', status: 404, public: true };
      }

      // Check if user can compile patch
      if (!isWpAdmin && (!patch.author.wordpressId || patch.author.wordpressId !== wpUserId)) {
        throw { status: 401, public: true, message: 'You are not authorized to compile this patch.' };
      }

      // Compile patch
      let cmd = 'php ' + apiSettings.PATCH_BUILDER_PATH;
      if (format === 'js') {
        cmd += ' --web';
      }
      if(patch.compilationType === 'gen'){
        cmd += ' --gen';
      }
      cmd += ' ' + id;
      process.stdout.write('Running command "' + cmd + '"...\n');
      return exec(cmd)
        .then(result => {
          const response = {
            message: 'Compilation succeeded.',
            stdout: result.stdout,
            stderr: result.stderr,
            success: true,
            status: 200,
          };
          process.stdout.write('Success!\n');
          return res.status(200).json(response);
        })
        .fail(result => {
          const status = 200; // Status is '200 OK' because the compilation failed but the API call did not.
          const response = {
            message: 'Compilation failed.',
            stdout: result.stdout,
            stderr: result.stderr,
            success: false,
            status,
          };
          process.stderr.write('Failure!\n');
          return res.status(status).json(response);
        });
    })
    .catch(error => errorResponse(error, res));
});


module.exports = router;
