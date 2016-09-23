/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express = require('express');
var router  = express.Router();
var url     = require('url');
var Q       = require('q');

var patchModel      = require('../models/patch');
var wordpressBridge = require('../lib/wordpress-bridge.js');
var apiSettings     = require('../api-settings.js');

var summaryFields = {
    _id: 1,
    name: 1,
    'author.name': 1,
    'author.url': 1,
    'author.wordpressId': 1,
    tags: 1,
    seoName: 1,
    creationTimeUtc: 1,
    published: 1,
    description: 1
};

/**
 * Convenience function gets wordpress cookie if exists or returns false
 */
var getWordpressCookie = function(cookies) {
    var wpCookie = false;
    Object.keys(cookies).some(function(key){
        if(key.lastIndexOf('wordpress_logged_in_') === 0){
            wpCookie = cookies[key];
            return true;
        }
        return false;
    });
    return wpCookie;
};

/**
 * Retrieves all patches.
 *
 * GET /patches
 *
 * Possible GET parameters:
 * * author.name
 * * author.wordpressId
 *
 * FIXME - Only WP admins/patch authors should be able to retrieve all/their private patches.
 */
router.get('/', function(req, res) {

    var urlParts = url.parse(req.url, true);
    var query = urlParts.query;

    var collection = req.db.get('patches');
    var nativeCol = collection.col;

    var summaryFields2 = {};
    for (field in summaryFields) { // shallow copy
        summaryFields2[field] = summaryFields[field];
    }
    summaryFields2.lowercase = { $toLower: '$name' }; // Used below to sort patches by name

    var filter = { $match: {}};

    if ('author.name' in query && query['author.name'] !== '') {
        filter.$match['author.name'] = query['author.name'];
    }

    if ('author.wordpressId' in query && query['author.wordpressId'] !== '') {
        filter.$match['author.wordpressId'] = query['author.wordpressId'];
    }

    // filter.$match['published'] = true;

    nativeCol.aggregate(filter, { $project: summaryFields2 }, { $sort: { lowercase: 1 }}, { $project: summaryFields }, function (err, result) {
        if (err !== null) {
            return res.status(500).json({ message: err, status: 500 });
        } else {
            var response = {};
            response.count = result.length;
            response.result = result;
            return res.status(200).json(response);
        }
    });
});

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

    // to avoid unnecessary requests if wordpress cookie is available
    if(req.cookies){
        var wpCookieFromRequest = getWordpressCookie(req.cookies);
        if(wpCookieFromRequest){
            console.log('wp_cookie found in request');
            credentials = {
                type:'wordpress',
                cookie: wpCookieFromRequest
            }
        }
    }

    Q.fcall(function () {

        /* ~~~~~~~~~~~~~~~~~~~
         *  Check credentials
         * ~~~~~~~~~~~~~~~~~~~ */

        console.log('Checking credentials...');

        if (!credentials) {
        throw {
        message: "Access denied (1).",
        status: 401
        }
        }

        if (!credentials.type || 'wordpress' !== credentials.type || !credentials.cookie) {
        throw {
        message: "Access denied (2).",
        status: 401
        }
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

        /* ~~~~~~~~~~~~~~~~
         *  Validate patch
         * ~~~~~~~~~~~~~~~~ */

        isAdmin = wpUserInfo.admin;
        wpUserId = wpUserInfo.id;
        console.log('User is' + (isAdmin ? '' : ' *NOT*') + ' a WP admin.');
        console.log('WP user ID is ' + wpUserId + '');

        // If not an admin, we set the current WP user as patch author,
        // disregarding any authorship info s/he sent. If an admin,
        // we blindy trust the authorship information. Not ideal, but
        // at least keeps code leaner.
        if (!isAdmin) {
            // patchAuthor.type = 'wordpress';
            // patchAuthor.name = username;
            if (patchAuthor.name) {
                delete patchAuthor.name;
            }
        }
        
        if(!isAdmin || (isAdmin && (!newPatch.author || !newPatch.author.wordpressId))){
            patchAuthor.wordpressId = wpUserId;
        }

        newPatch.seoName = patchModel.generateSeoName(newPatch);
        return patchModel.validate(newPatch); // will throw an error if patch is not valid

    }).then(function() {

        /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         *  Make sure that no other patches are named the same
         *  (in a case insensitive fashion)
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        var regExpEscape = function(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        };

        var nameRegexp = new RegExp('^' + regExpEscape(newPatch.name) + '$', 'i');
        var seoNameRegexp = new RegExp('^' + regExpEscape(newPatch.seoName) + '$', 'i');
        return collection.findOne({ $or: [ { name: nameRegexp }, { seoName: seoNameRegexp } ] });

    }).then(function(doc) {

        /* ~~~~~~~~~~~~
         *  Save patch
         * ~~~~~~~~~~~~ */

        if (doc !== null) {
            throw {
                type: 'not_valid',
                field: 'name',
                message: 'Patch name is already taken.',
                status: 400
            }
        }

        newPatch.downloadCount = 0; // set download count
        newPatch = patchModel.sanitize(newPatch);
        
        if(!isAdmin || (isAdmin && (!newPatch.author || !newPatch.author.wordpressId))){
            newPatch.author = patchAuthor;
        }

        delete newPatch._id;
        console.log('Patch to be inserted: \n' + JSON.stringify(newPatch, null, 4));

        var now = new Date().getTime();
        if (!isAdmin) {
            newPatch.creationTimeUtc = now; // set creation date
        } else {
            if (!newPatch.creationTimeUtc) {
                newPatch.creationTimeUtc = now; // set creation date
            }
        }

        return collection.insert(newPatch);

    }).then(function (patch) {

        /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         *  Check that the new patch was actually inserted
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        console.log('New patch saved, id = ' + patch._id);
        return {
            message: 'New patch saved.',
            _id: patch._id,
            seoName: patch.seoName
        };

    }).catch(function (error) {
    
        console.log('error: ', error);

        if(error.status){
            return res.status(error.status).json(error);
        } else if(error.error){
                var status = error.error.status || 500;
            return res.status(status).json(error);
        } else {
            return res.status(500).json({
                message: error.toString(),
                status: 500
            });
        }
    }).done(function (response) {

        if ('ServerResponse' === response.constructor.name) {
            return response;
        }

        return res.status(200).json(response);

    });
});

module.exports = router;
