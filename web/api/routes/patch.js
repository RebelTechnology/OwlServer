/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express         = require('express');
var router          = express.Router();
var fs              = require('fs');
var path            = require('path');
var Q               = require('q');
Q.longStackSupport  = false; // To be enabled only when debugging

var patchModel      = require('../models/patch');
var wordpressBridge = require('../lib/wordpress-bridge.js');

var apiSettings     = require('../api-settings.js');

var regExpEscape = function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

/**
 * Checks whether a patch with the specified ID exists. If it exists,
 * the specified callback will be invoked.
 *
 * @param {string} id
 *     Patch ID.
 * @param {object} collection
 *     Patch collection.
 * @param {object} res
 *     Express's router "response" object.
 * @param {function} callback
 *     An callback to be called if the specified patch exists.
 */
var apply = function (id, collection, res, callback) {

    collection.findOne({ _id: id }, function (err, patch) {

        var response = {};
        if (null !== err) {

            // database returned an error
            return res.status(500).json({
                message: err,
                error: { status: 500 }
            });

        } else {

            if (null === patch) {

                // patch not found
                return res.status(404).json({
                    message: 'Patch not found.',
                    error: { status: 404 }
                });

            } else {

                // patch found

                // get patch sysex
                patch['sysExAvailable'] = false;
                var sysexFile = path.join(apiSettings.SYSEX_PATH, patch['seoName'] + '.syx');
                if (fs.existsSync(sysexFile)) {
                    patch['sysExAvailable'] = true;
                    patch['sysExLastUpdated'] = fs.statSync(sysexFile).mtime;
                }

                // get patch js
                patch['jsAvailable'] = false;
                var jsFile = path.join(apiSettings.JS_PATH, patch['seoName'] + '.js');
                if (fs.existsSync(jsFile)) {
                    patch['jsAvailable'] = true;
                    patch['jsLastUpdated'] = fs.statSync(jsFile).mtime;
                }

                callback(patch);

            }
        }
    });
};

/**
 * Retrieves a single patch.
 *
 * GET /patch/{id}
 */
router.get('/:id', function (req, res) {

    var id = req.params.id;
    var collection = req.db.get('patches');
    apply(id, collection, res, function (patch) {

        var response = { result: patch };
        return res.status(200).json(response);
    });
});

/**
 * Retrieves a patch by some field.
 *
 * GET /patch/?field=value&...
 */
router.get('/', function (req,res) {

    var query = {};
    var collection = req.db.get('patches');

    if (typeof req.query.seoName === 'string' ) {
        query.seoName = req.query.seoName;
    }

    if (0 === Object.keys(query).length) {
        var response = { message: 'You must specify at least 1 search parameter.', error: { status: 400 }};
        return res.status(response.error.status).json(response);
    } else {
        collection.findOne(query, function (err, patch) {

            var response = {};
            if (null !== err) {

                // database returned an error
                return res.status(500).json({
                    message: err,
                    error: { status: 500 }
                });

            } else {

                if (null === patch) {

                    // patch not found
                    return res.status(404).json({
                        message: 'Patch not found.',
                        error: { status: 404 }
                    });

                } else {

                    var response = { result: patch };
                    return res.status(200).json(response);
                }
            }
        });
    }
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
