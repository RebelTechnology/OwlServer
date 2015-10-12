/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var Q = require('q');
Q.longStackSupport = false; // To be enabled only when debugging

var wordpressBridge = require('../lib/wordpress-bridge.js');
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
        throw { message: 'Invalid format.', status: 500 };
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
        format;

    // Determine patch format
    if (req.params.format) {
        format = getBuildFormat(req.params.format);
    }

    Q.fcall(function () {

        /*
         * Find patch
         */

        return collection.findOne({ _id: id });

    }).then(function (patch) {

        var buildFile,
            filename;

        /*
         * Check if SysEx is available
         */

        if (null === patch) {
            throw { message: 'Patch not found.', status: 401 };
        }

        if (format === 'sysx') {
            buildFile = path.join(apiSettings.SYSEX_PATH, patch.seoName + '.syx');
        } else if (format === 'js') {
            buildFile = path.join(apiSettings.JS_PATH, patch.seoName + '.js');
        }
        if (!fs.existsSync(buildFile)) {
            throw { message: 'Build file not available for this patch (in ' + format + ' format).', status: 404 };
        }

        /*
         * Download file
         */

        console.log(buildFile);
        filename = path.basename(buildFile);
        console.log(filename);
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        if (format === 'sysx') {
            res.setHeader('Content-type', 'application/octet-stream');
        } else if (format === 'js') {
            res.setHeader('Content-type', 'text/javascript');
        }
        var filestream = fs.createReadStream(buildFile);
        return filestream.pipe(res);

    }).fail(

        function (error) {
            //console.log('Error: ' + error.message);
            return res.status(error.status || 500).json({
               message: error.message,
               error: { status: error.status || 500 }
            });
        }
    );
});

/**
 * Builds the specified patch.
 *
 * PUT /patch/{patchId}
 */
router.put('/:id', function (req, res) {

    var validateAuthCookie = Q.denodeify(wordpressBridge.validateAuthCookie);
    var getUserInfo = Q.denodeify(wordpressBridge.getUserInfo);

    var credentials = req.body.credentials;
    var wpCookie;
    var username;
    var isAdmin = false;
    var wpUserId;

    var collection = req.db.get('patches');
    var updatedPatch = req.body.patch;
    var patchAuthor = {};

    var id = req.params.id;
    if (!/^[a-f\d]{24}$/i.test(id)) {
        return res.status(500).json({
           message: 'Invalid ID.',
           error: { status: 500 }
        });
    }

    var format = 'sysx'; // default
    if (req.body.format) {
        format = getBuildFormat(req.body.format);
    }

    Q.fcall(function () {

        /* ~~~~~~~~~~~~~~~~~~~
         *  Check credentials
         * ~~~~~~~~~~~~~~~~~~~ */

        console.log('Checking credentials...');

        console.log(req.body);
        console.log(credentials);

        if (!credentials) {
            throw { message: 'Access denied (1).', status: 401 };
        }

        if (!credentials.type || 'wordpress' !== credentials.type || !credentials.cookie) {
            throw { message: 'Access denied (2).', status: 401 };
        }

        wpCookie = credentials.cookie;

        return validateAuthCookie(credentials.cookie); // Q will throw an error if cookie is not valid

    }).then(function () {

        /* ~~~~~~~~~~~~~~~~~~
         *  Get WP user info
         * ~~~~~~~~~~~~~~~~~~ */

        console.log('Getting WP user info...');
        username = wpCookie.split('|')[0];
        return getUserInfo(username);

    }).then(function (wpUserInfo) {

        isAdmin = wpUserInfo.admin;
        wpUserId = wpUserInfo.id;
        console.log('User is' + (isAdmin ? '' : ' *NOT*') + ' a WP admin.');
        console.log('WP user ID is ' + wpUserId + '');

        // If not an admin, we set the current WP user as patch author,
        // disregarding any authorship info s/he sent. If an admin,
        // we blindy trust the authorship information. Not ideal, but
        // at least keeps code leaner.
        if (!isAdmin) {
            patchAuthor.type = 'wordpress';
            patchAuthor.name = username;
            patchAuthor.wordpressId = wpUserId;
        }

        /*
         * Retrieve patch from database
         */

        return collection.findById(id);

    }).then(function (patch) {

        if (null === patch) {
            throw {
                message: 'Patch not found.',
                error: { status: 404 }
            };
        }

        /*
         * Check if user can compile patch
         */

        if (!isAdmin) {
            if (!patch.author.wordpressId || patch.author.wordpressId !== wpUserId) {
                throw {
                    message: 'You are not authorized to compile this patch.',
                    error: { status: 401 }
                };
            }
        }

        /*
         * Compile patch
         */

        var cmd = 'php ' + apiSettings.PATCH_BUILDER_PATH;
        if (format === 'js') {
            cmd += ' --web';
        }
        cmd += ' ' + id;
        console.log('Running command "' + cmd + '"...');
        exec(cmd, function (error, stdout, stderr) {

            var response = {
                stdout: stdout,
                stderr: stderr,
                success: error === null
            };
            if (error !== null) {
                response.error = { status: 500 };
            }
            return res.status(error !== null ? 500 : 200).json(response);

        });

    }).fail(function (error) {

        console.log(error);

        if (!error.error) {
            error.error = { status: 500 };
        }
        if (!error.error.status) {
            error.error.status = 500;
        }
        return res.status(error.error.status).json(error);
    });
});

module.exports = router;
