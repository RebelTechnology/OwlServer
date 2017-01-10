/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express = require('express');
var router = express.Router();
var url = require('url');
var fs = require('fs');
var path = require('path');
var exec = require('child-process-promise').exec;
var Q = require('q');

var apiSettings = require('../api-settings.js');

/**
 * Convenience function for determining the build format.
 */
var getBuildFormat = function (format) {

    var buildFormat = 'sysx'; // default
    if (format) {
        buildFormat = format;
    }
    if (buildFormat !== 'js' && buildFormat !== 'sysx' && buildFormat !== 'sysex') {
        var e = new Error('Invalid format.');
        e.status = 500;
        throw e;
    }
    if (buildFormat === 'sysex') { // 'sysex' is just an alias for 'sysx'
        buildFormat = 'sysx';
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

    var id = req.params.id,
        buildFormat = 'sysx', // default
        collection = req.db.get('patches'),
        format,
        download = true;

    Q.fcall(function () {

        // Determine patch format
        var query = url.parse(req.url, true).query;
        if (query.format) {
            format = getBuildFormat(query.format);
        }

        if (query.download && query.download == 0 || query.download == 'false' || query.download == '') {
            download = false;
        }

        /* ~~~~~~~~~~~~
         *  Find patch
         * ~~~~~~~~~~~~ */

        return collection.findOne({ _id: id });

    }).then(function (patch) {

        var buildFile,
            filename;

        /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         *  Check if SysEx is available
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        if (null === patch) {
            var e = new Error('Patch not found.');
            e.status = 404;
            throw e;
        }

        if (format === 'sysx') {
            buildFile = path.join(apiSettings.SYSEX_PATH, patch.seoName + '.syx');
        } else if (format === 'js') {
            buildFile = path.join(apiSettings.JS_PATH, patch.seoName + (apiSettings.JS_BUILD_TYPE === 'min' ? '.min' : '') + '.js');
        }
        if (!fs.existsSync(buildFile)) {
            var e = new Error('Build file not available for this patch (in ' + format + ' format).');
            e.status = 404;
            throw e;
        }

        /* ~~~~~~~~~~~~~~~
         *  Download file
         * ~~~~~~~~~~~~~~~ */

        console.log(buildFile);
        filename = path.basename(buildFile);
        console.log(filename);
        if (download) {
            res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        }
        if(download && format === 'sysx') {
            // increment download count for sysx files
            console.log('incrementing patch download count');
            patch.downloadCount = patch.downloadCount || 0;
            patch.downloadCount++;
            collection.updateById(patch._id, patch);
        }
        res.setHeader('Content-length', fs.statSync(buildFile)['size']);
        if (format === 'sysx') {
            res.setHeader('Content-type', 'application/octet-stream');
        } else if (format === 'js') {
            res.setHeader('Content-type', 'text/javascript');
        }
        var filestream = fs.createReadStream(buildFile);
        return filestream.pipe(res);

    }).catch(function (error) {

      console.error(error);
      console.error(error.stack);
      const message = error.message || JSON.stringify(error);
      const status = error.status || 500;
      return res.status(status).json({ message, status });

    }).done(function (response) {

        if (response.constructor && 'ServerResponse' === response.constructor.name) {
            return response;
        }

        return res.status(200).json(response);

    });
});

/**
 * Builds the specified patch.
 *
 * PUT /builds/{patchId}
 */
router.put('/:id', function (req, res) {

  let isWpAdmin = false;
  let wpUserId;

  const collection = req.db.get('patches');
  let patchAuthor = {};

  var id = req.params.id;
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return res.status(500).json({
      message: 'Invalid patch ID.',
      error: { status: 500 }
    });
  }

  var format = 'sysx'; // default
  if (req.body.format) {
    format = getBuildFormat(req.body.format);
  }

  Q.fcall(() => {

    // Is user authenticated?
    if (!res.locals.authenticated) {
      throw { message: 'Access denied.', status: 401 };
    }

    const wpUserInfo = res.locals.wpUserInfo;
    isWpAdmin = wpUserInfo.admin;
    wpUserId = wpUserInfo.id;
    console.log('User is' + (isWpAdmin ? '' : ' *NOT*') + ' a WP admin.');
    console.log('WP user ID is ' + wpUserId + '');

    // If not an admin, we set the current WP user as patch author,
    // disregarding any authorship info s/he sent. If an admin,
    // we blindy trust the authorship information. Not ideal, but
    // at least keeps code leaner.
    if (!isWpAdmin) {
        // patchAuthor.type = 'wordpress';
        if (patchAuthor.name) {
            delete patchAuthor.name;
        }
        patchAuthor.wordpressId = wpUserId;
    }

    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     *  Retrieve patch from database
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

    return collection.findById(id);

  })
    .then(function (patch) {

        if (null === patch) {
            var e = new Error('Patch not found.');
            e.status = 404;
            throw e;
        }

        /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         *  Check if user can compile patch
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        if (!isWpAdmin) {
            if (!patch.author.wordpressId || patch.author.wordpressId !== wpUserId) {
                var e = new Error('You are not authorized to compile this patch.');
                e.status = 401;
                throw e;
            }
        }

        /* ~~~~~~~~~~~~~~~
         *  Compile patch
         * ~~~~~~~~~~~~~~~ */

        var cmd = 'php ' + apiSettings.PATCH_BUILDER_PATH;

        if (format === 'js') {
            cmd += ' --web';
        }

        if(patch.compilationType === 'gen'){
            cmd += ' --gen';
        }

        cmd += ' ' + id;
        console.log('Running command "' + cmd + '"...');

        return exec(cmd).then(function (result) {

            var response = {
                stdout:  result.stdout,
                stderr:  result.stderr,
                success: true,
                status:  200
            };

            console.log('Command run successfully.');

            return response;

        }).fail(function (result) {

            var response = {
                stdout:  result.stdout,
                stderr:  result.stderr,
                success: false,
                status:  200
            };

            console.log('Command failed.');

            return response;

        });

    })
    .catch(error => {
      console.error(error);
      console.error(error.stack);
      const status = error.status || 500;
      return res.status(status).json({
        message: error.message || JSON.stringify(error),
        stdout: error.stdout,
        stderr: error.stderr,
        success: false,
        status: status
      });
    })
    .done(function (response) {
      if (response.constructor && 'ServerResponse' === response.constructor.name) {
        return response;
      }
      return res.status(200).json(response);
    });
});

module.exports = router;
