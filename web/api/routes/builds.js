'use strict';

const router = require('express').Router();
const exec = require('child-process-promise').exec;

const PatchModel = require('../models/patch');
const { authTypes, API_USER_NAME } = require('../middleware/auth/constants');
const { download: downloadBuild } = require('../lib/patch-build');
const { buildHeavy } = require('../lib/patch-build-heavy');
const errorResponse = require('../lib/error-response');
const config = require('../lib/config');

/**
 * Convenience function for validating and normalizing the build format.
 *
 * @param {string} format
 * @return {string}
 */
const getBuildFormat = (buildFormat='sysex') => {

  if (buildFormat === 'syx') { // 'syx' is just an alias for 'sysex'
    buildFormat = 'sysex'; // normalize
  }

  // validate
  if (buildFormat !== 'js' && buildFormat !== 'sysex' && buildFormat !== 'c') {
    throw { public: true, message: 'Invalid format.', status: 500 };
  }

  return buildFormat;
};

/**
 * Downloads the build for the specified patch.
 *
 * GET /builds/{patchId}[?format={sysex|js}]
 *
 * The `format` parameter defaults to `sysex`.
 */
router.get('/:id', function (req, res) {

  const id = req.params.id;
  const query = req.query;
  let format;
  let stream = false;
  const patchModel = new PatchModel(req.db);

  if (!/^[a-f\d]{24}$/i.test(id)) { // FIXME - This code should not be here
    return errorResponse({ public: true, status: 400, message: 'Invalid patch ID.' }, res);
  }

  // Determine whether the patch will be downloaded or streamed in-line
  if (query.download && (query.download == 0 || query.download == 'false' || query.download == '')) {
    stream = true;
  }

  // Determine patch format
  try {
    format = getBuildFormat(query.format);
  } catch (error) {
    return errorResponse(error, res);
  }

  patchModel.getById(id)
    .then(patch => {
      if (!patch) {
        throw { status: 404, public: true, message: 'Patch not found.' };
      }
      return downloadBuild(patch, patchModel, stream, format, res);
    })
    .catch(error => errorResponse(error, res));
});

/**
 * Builds the specified patch.
 *
 * PUT /builds/{patchId}
 */
router.put('/:id', (req, res) => {

  // Is user authenticated?
  if (!res.locals.authenticated) {
    return errorResponse({ public: true, message: 'Access denied.', status: 401 }, res);
  }

  // Get user details
  let isWpAdmin = false;
  let wpUserId;
  const userInfo = res.locals.userInfo;
  if (userInfo.type === authTypes.AUTH_TYPE_WORDPRESS) {
    wpUserId = userInfo.wpUserId;
    process.stdout.write('WP user ID is ' + wpUserId + '\n');
    isWpAdmin = userInfo.wpAdmin;
    process.stdout.write('User is' + (isWpAdmin ? '' : ' *NOT*') + ' a WP admin.\n');
  }

  // Validate patch ID
  const id = req.params.id;
  if (!/^[a-f\d]{24}$/i.test(id)) { // FIXME - This code should not be here
    return errorResponse({ public: true, status: 400, message: 'Invalid patch ID.' }, res);
  }

  // Build format
  let format = 'sysex'; // default
  if (req.body.format) {
    try {
      format = getBuildFormat(req.body.format);
    } catch (error) {
      return errorResponse(error, res);
    }
  }

  const patchModel = new PatchModel(req.db);
  patchModel.getById(id)
    .then(patch => {

      if (!patch) {
        throw { message: 'Patch not found.', status: 404, public: true };
      }

      // Check if user can compile patch
      if (userInfo.type === authTypes.AUTH_TYPE_WORDPRESS) {
        if (!isWpAdmin && (!patch.author.wordpressId || patch.author.wordpressId !== wpUserId)) {
          throw { status: 401, public: true, message: 'You are not authorized to compile this patch.' };
        }
      } else if (userInfo.type === authTypes.AUTH_TYPE_TOKEN) {
        if (patch.author.name !== API_USER_NAME) {
          throw { status: 401, public: true, message: 'You are not authorized to compile this patch.' };
        }
      }

      // Compile patch for heavy
      if (patch.compilationType === 'heavy') {

        process.stdout.write('Compiling with Heavy\n');
        
        return buildHeavy(patch).then(({ success, stdout, stderr }) => {
          res.status(200).json({
            message: success ? 'Compilation succeeded' : 'Compilation failed',
            stdout,
            stderr,
            success,
            status: 200,
          });
        });

      }

      // Compile for other types
      let cmd = 'php ' + config.patchBuilder.path;
      if (format === 'js') {
        cmd += ' --web';
      }
      if (patch.compilationType === 'gen') {
        cmd += ' --gen';
      } else if (patch.compilationType === 'maximilian') {
        cmd += ' --maximilian';
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
