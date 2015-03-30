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
 * Downloads the SysEx file for a specific patch.
 *
 * GET /sysex/{id}
 */
router.get('/:id', function(req, res) {

    var id = req.params.id;
    var collection = req.db.get('patches');

    Q.fcall(function () {

        /*
         * Find patch
         */

        return collection.findOne({ _id: id });

    }).then(function (patch) {

        /*
         * Check if SysEx is available
         */

        if (null === patch) {
            throw { message: 'Patch not found.', status: 401 };
        }

        var sysexFile = path.join(apiSettings.SYSEX_PATH, patch['seoName'] + '.syx');
        if (!fs.existsSync(sysexFile)) {
            throw { message: 'SysEx not avilable for this patch.', status: 401 };
        }

        /*
         * Download file
         */

        console.log(sysexFile);
        var filename = path.basename(sysexFile);
        console.log(filename);
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', 'application/octet-stream');
        var filestream = fs.createReadStream(sysexFile);
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
 * Recompiles a patch.
 *
 * PUT /patch/{id}
 */
router.put('/:id', function(req, res) {

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

    Q.fcall(function () {

        /* ~~~~~~~~~~~~~~~~~~~
         *  Check credentials
         * ~~~~~~~~~~~~~~~~~~~ */

        console.log('Checking credentials...');

        if (!credentials) {
            throw { message: 'Access denied (1).', status: 401 };
        }

        if (!credentials.type || 'wordpress' !== credentials.type || !credentials.cookie) {
            throw { message: 'Access denied (2).', status: 401 };
        }

        wpCookie = credentials.cookie;

        return validateAuthCookie(credentials.cookie); // Q will throw an error if cookie is not valid

    }).then(function() {

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
                error: { status: 400 }
            };
        }

        /*
         * Check if user can compile patch
         */

        if (!isAdmin) {
            if (!patch.author.wordpressId || patch.author.wordpressId !== wpUserId) {
                throw {
                    message: 'You are not authorized to edit compile patch.',
                    error: { status: 401 }
                };
            }
        }

        /*
         * Compile patch
         */

        var cmd = 'php ' + apiSettings.PATCH_BUILDER_PATH + ' ' + id;
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