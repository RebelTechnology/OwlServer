/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express = require('express');
var router  = express.Router();
var url     = require('url'); // FIXME - is this really necessary?
var Q       = require('q');
Q.longStackSupport = true; // FIXME - To be enabled only when debugging

var patchModel = require('../models/patch');
var wordpressBridge = require('../lib/wordpress-bridge.js');

var summaryFields = {
    _id: 1,
    name: 1,
    'author.name': 1,
    'author.url': 1,
    tags: 1,
    seoName: 1
};

var regExpEscape = function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

/**
 * Retrieves all patches.
 *
 * GET /patches?author.name=
 */
router.get('/', function(req, res) {

    var urlParts = url.parse(req.url, true);
    var query = urlParts.query;

    var collection = req.db.get('patches');
    var nativeCol = collection.col;

    var summaryFields2 = summaryFields;
    summaryFields2.lowercase = { $toLower: '$name' };

    var filter = { $match: {}};
    if (query['author.name']) {
        filter.$match['author.name'] = query['author.name'];
    }

    nativeCol.aggregate(filter, { $project: summaryFields2 }, { $sort: { lowercase: 1 }}, function (err, result) {
        if (err !== null) {
            return res.status(500).json({error: err});
        } else {
            var response = {};
            response.count = result.length;
            response.result = result;
            return res.status(200).json(response);
        }
    });
});

///**
// * Creates a new patch.
// *
// * POST /patches
// */
//router.post('/', function(req, res) {
//
//    var collection = req.db.get('patches');
//    var patch = req.body;
//
//    patch.seoName = patchModel.generateSeoName(patch);
//    patch.author = { name: 'OWL' }; // FIXME
//    try {
//        patchModel.validate(patch);
//    } catch(err) {
//        if ('undefined' === typeof err.error && 'undefined' === typeof err.error.status) {
//            return res.status(500).json(err);
//        } else {
//            return res.status(err.error.status).json(err);
//        }
//    }
//
//    // we make sure that no other patches are named the same (in a case insensitive fashion)
//    var nameRegexp = new RegExp(regExpEscape(patch.name), 'i');
//    var seoNameRegexp = new RegExp(regExpEscape(patch.seoName), 'i');
//    collection.findOne({ $or: [ { name: nameRegexp }, { seoName: seoNameRegexp } ] }, function(err, doc) {
//
//        if (null !== err) {
//            // database returned an error
//            return res.status(500).json({ message: err, error: { status: 500 }});
//        } else {
//
//            if (null !== doc) {
//
//                var err = { message: 'This name is already taken.', type: 'not_valid', field: 'name', error: { status: 400 }};
//                return res.status(err.error.status).json(err);
//
//            } else {
//
//                patch = patchModel.sanitize(patch);
//                collection.insert(patch, function(err, newlyInsertedPatch) {
//
//                    if (null !== err) {
//                        // database returned an error
//                        return res.status(500).json({
//                            message: err,
//                            error: { status: 500 }
//                        });
//                    } else {
//                        return res.status(200).json({ message: 'New patch saved.', _id: newlyInsertedPatch._id, seoName: newlyInsertedPatch.seoName });
//                    }
//                });
//            }
//        }
//    });
//});

/**
 * Creates a new patch.
 *
 * POST /patches
 */
router.post('/', function(req, res) {

    var validateAuthCookie = Q.denodeify(wordpressBridge.validateAuthCookie);
    var getUserInfo = Q.denodeify(wordpressBridge.getUserInfo);

    var credentials = req.body.credentials;
    var wpCookie;
    var username;
    var isAdmin = false;
    var wpUserId;

    var collection = req.db.get('patches');
    var newPatch = req.body.patch;
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

        function() {

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

            newPatch.seoName = patchModel.generateSeoName(newPatch);
            return patchModel.validate(newPatch); // will throw an error if patch is not valid

        }

    ).then(

        /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         *  Make sure that no other patches are named the same
         *  (in a case insensitive fashion)
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        function() {

            var nameRegexp = new RegExp(regExpEscape(newPatch.name), 'i');
            var seoNameRegexp = new RegExp(regExpEscape(newPatch.seoName), 'i');
            return collection.findOne({ $or: [ { name: nameRegexp }, { seoName: seoNameRegexp } ] });

        }

    ).then(

        /* ~~~~~~~~~~~~
         *  Save patch
         * ~~~~~~~~~~~~ */

        function(doc) {

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

            newPatch = patchModel.sanitize(newPatch);
            if (!isAdmin) {
                newPatch.author = patchAuthor;
            }

            delete newPatch._id;
            console.log('Patch to be inserted: \n' + JSON.stringify(newPatch, null, 4));
            return collection.insert(newPatch);

        }

    ).then(

        /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         *  Check that the new patch was actually inserted
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
        function (patch) {

            console.log('New patch saved, id = ' + patch._id);
            return res.status(200).json({
                message: 'New patch saved.',
                _id: patch._id,
                seoName: patch.seoName
            });

        }

    ).fail(

        function (error) {
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

module.exports = router;