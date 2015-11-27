/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express = require('express');
var router  = express.Router();
var fs      = require('fs');
var path    = require('path');
var Q       = require('q');

var patchModel      = require('../models/patch');
var wordpressBridge = require('../lib/wordpress-bridge.js');
var apiSettings     = require('../api-settings.js');

/**
 * Adds the WP user "display name" to the patch's author info, if necessary.
 */
var getUserWpDisplayName = function (patch) {

    var getUserInfoBatch = Q.denodeify(wordpressBridge.getUserInfoBatch);

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

        return getUserInfoBatch([ parseInt(patch.author.wordpressId) ]).then(function (result) {

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
var finishPatch = function (patch) {

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
router.get('/:id', function (req, res) {

    var id = req.params.id;
    var collection = req.db.get('patches');

    Q.fcall(function () {

        /*
         * Get patch by ID
         */

        return collection.findOne({ _id: id });

    }).then(getUserWpDisplayName)
    .then(finishPatch)
    .fail(function (error) {

        var status = error.status || 500;
        return res.status(status).json({
            message: error.toString(),
            status: status
        });

    }).done(function (response) {

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
 */
router.get('/', function (req, res) {

    var query = {};
    var collection = req.db.get('patches');

    if (typeof req.query.seoName === 'string' ) {
        query.seoName = req.query.seoName;
    }

    if (0 === Object.keys(query).length) {
        var e = new Error('You must specify at least 1 search parameter.');
        e.status = 400;
        throw e;
    }

    Q.fcall(function () {

        /*
         * Find patch
         */

        return collection.findOne(query);

    }).then(getUserWpDisplayName)
    .then(finishPatch)
    .fail(function (error) {

        var status = error.status || 500;
        return res.status(status).json({
            message: error.toString(),
            status: status
        });

    }).done(function (response) {

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

    }).then(

        /* ~~~~~~~~~~~~~~~~~~
         *  Get WP user info
         * ~~~~~~~~~~~~~~~~~~ */

        function () {

            console.log('Getting WP user info...');
            username = wpCookie.split('|')[0];
            return getUserInfo(username);
        }

    ).then(

        /* ~~~~~~~~~~~~~~~~
         *  Validate patch
         * ~~~~~~~~~~~~~~~~ */

        function (wpUserInfo) {

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

            updatedPatch.seoName = patchModel.generateSeoName(updatedPatch);
            return patchModel.validate(updatedPatch); // will throw an error if patch is not valid

        }

    ).then(

        /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         *  Make sure that no other patches are named the same
         *  (in a case insensitive fashion)
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        function () {

            var regExpEscape = function (str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            };

            var nameRegexp = new RegExp('^' + regExpEscape(updatedPatch.name) + '$', 'i');
            var seoNameRegexp = new RegExp('^' + regExpEscape(updatedPatch.seoName) + '$', 'i');
            return collection.findOne({
                $and: [
                    { _id: { $ne: collection.id(updatedPatch._id) } },
                    { $or: [ { name: nameRegexp }, { seoName: seoNameRegexp } ] }
                ]
            });

        }

    ).then(

        /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         *  Retrieve patch before updating it
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        function (doc) {

            if (null !== doc) {
                throw {
                    message: 'This name is already taken.',
                    type: 'not_valid',
                    field: 'name',
                    error: {
                        status: 400
                    }
                };
            }

            return collection.findById(updatedPatch._id);

        }

    ).then(

        /* ~~~~~~~~~~~~
         *  Save patch
         * ~~~~~~~~~~~~ */

        function (patch) {

            if (null === patch) {
                throw {
                    message: 'Patch not found!',
                    error: {
                        status: 400
                    }
                };
            }

            if (!isAdmin) {
                if (!patch.author.wordpressId || patch.author.wordpressId !== wpUserId) {
                    throw {
                        message: 'You are not authorized to edit this patch.',
                        error: {
                            status: 401
                        }
                    };
                }
            }

            updatedPatch = patchModel.sanitize(updatedPatch);
            if (!isAdmin) {
                updatedPatch.author = patchAuthor;
            }

            if (!isAdmin) {
                updatedPatch.creationTimeUtc = patch.creationTimeUtc;
            } else {
                if (!updatedPatch.creationTimeUtc) {
                    updatedPatch.creationTimeUtc = patch.creationTimeUtc;
                }
            }

            console.log('Patch to be updated: \n' + JSON.stringify(updatedPatch, null, 4));
            return collection.updateById(updatedPatch._id, updatedPatch);

        }

    ).then(

        /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         *  Confirms that the patch was actually inserted
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
        function (patch) {

            console.log('Patch ' + updatedPatch._id + ' updated.');
            return res.status(200).json({
                message: 'Patch updated.',
                _id:     updatedPatch._id,
                seoName: updatedPatch.seoName
            });

        }

    ).fail(

        function (error) {

            console.log(error);

            if (!error.error) {
                error.error = { status: 500 };
            }
            if (!error.error.status) {
                error.error.status = 500;
            }
            return res.status(error.error.status).json(error);
        }
    );
});

/**
 * Deletes a patch.
 *
 * DELETE /patch/{id}
 */
router.delete('/:id', function (req, res) {

    var validateAuthCookie = Q.denodeify(wordpressBridge.validateAuthCookie);
    var getUserInfo = Q.denodeify(wordpressBridge.getUserInfo);

    var id = req.params.id;
    var credentials = req.body;
    var wpCookie;
    var collection = req.db.get('patches');
    var username;
    var isAdmin = false;
    var wpUserId;

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

    }).then(

        /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         *  Check if user is WordPress admin
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        function () {

            console.log('Checking if WP admin...');
            username = wpCookie.split('|')[0];
            console.log('WP username: ' + username);

            return getUserInfo(username);
        }

    ).then(

        /* ~~~~~~~~~~~~~~~~~~~~~~
         *  Find specified patch
         * ~~~~~~~~~~~~~~~~~~~~~~ */

        function (wpUserInfo) {

            isAdmin = wpUserInfo.admin;
            wpUserId = wpUserInfo.id;
            console.log('User is' + (isAdmin ? '' : ' *NOT*') + ' a WP admin.');
            console.log('WP user ID = ' + wpUserId);

            console.log('Finding patch ' + id + '...');
            return collection.findOne({ _id: id });
        }

    ).then(

        /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         *  Check if user can delete patch
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        function (patch) {

            // This code must be here because we need the value of patch.author.name
            if (!isAdmin && (!patch.author.type || patch.author.type !== 'wordpress' ||
                patch.author.name !== username)) {

                console.log(patch.author);
                throw { message: 'You are not authorized to delete this patch.', status: 401 };
            }

            return patch; // just bubble up the patch we found previously to the next step
        }

    ).then(

        /* ~~~~~~~~~~~~~~~~~~~~~~~
         *  Actually delete patch
         * ~~~~~~~~~~~~~~~~~~~~~~~ */

        function (patch) {

            if (null === patch) {
                throw { message: 'Patch not found.', status: 404 };
            }

            console.log('Removing patch ' + id + '...');
            return collection.remove({ _id: id });
        }

    ).then(

        /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         *  Check that patch was actually deleted
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        function (deletedCount) {

            console.log('deleteCount = ' + JSON.stringify(deletedCount));
            if (1 !== deletedCount) {
                return res.status(500).json({
                   message: 'Unexpected error while trying to delete patch.',
                   error: { status: 500 }
                });
            }

             return res.status(200).json({
                 message: 'Patch deleted successfully.'
             });
        }

    ).fail(

        function (error) {
            //console.log('Error: ' + error.message);
            return res.status(error.status || 500).json({
               message: error.message,
               error: { status: error.status || 500 }
            });
        }
    );
});

module.exports = router;
