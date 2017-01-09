/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express = require('express');
var router = express.Router();
var url = require('url');
var Q = require('q'); // TODO: Remove dependency on Q

var patchModel = require('../models/patch');
var apiSettings = require('../api-settings.js');
const authTypes = require('../middleware/auth/auth-types');

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

 router.post('/', (req, res) => {

    let isWpAdmin = false;
    let wpUserId;

    const collection = req.db.get('patches');
    let newPatch = req.body.patch;
    const patchAuthor = {};

    Q.fcall(() => {

      // Is user authenticated?
      if (!res.locals.authenticated) {
        throw { message: 'Access denied.', status: 401 };
      }

      const userInfo = res.locals.userInfo;
      if (userInfo.type === authTypes.AUTH_TYPE_WORDPRESS) {
        wpUserId = userInfo.wpUserId;
        console.log('WP user ID is ' + wpUserId + '');
        isWpAdmin = userInfo.wpAdmin;
        console.log('User is' + (isWpAdmin ? '' : ' *NOT*') + ' a WP admin.');

        // If not a WP admin, we set the current WP user as patch author,
        // disregarding any authorship info s/he sent.
        if(!isWpAdmin || (isWpAdmin && (!newPatch.author || !newPatch.author.wordpressId))) {
          patchAuthor.wordpressId = wpUserId;
        }
      } else if (userInfo.type === authTypes.AUTH_TYPE_TOKEN) { // token authentication
        patchAuthor.name = userInfo.name;
      }

      newPatch.author = patchAuthor;
      newPatch.seoName = patchModel.generateSeoName(newPatch);
      return patchModel.validate(newPatch); // will throw an error if patch is not valid

    }).then(function() {

        /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
         *  Make sure that no other patches are named the same
         *  (in a case insensitive fashion)
         * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

        const regExpEscape = str => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");;

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

        delete newPatch._id;
        console.log('Patch to be inserted: \n' + JSON.stringify(newPatch, null, 4));

        // Set patch creation date
        var now = new Date().getTime();
        if (!isWpAdmin) {
          newPatch.creationTimeUtc = now;
        } else {
          if (!newPatch.creationTimeUtc) {
            newPatch.creationTimeUtc = now;
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

        const message = error.message || JSON.stringify(error);
        const status = error.status || 500;
        return res.status(status).json({ message, status });

    }).done(function (response) {

        if ('ServerResponse' === response.constructor.name) {
            return response;
        }

        return res.status(200).json(response);

    });
});

module.exports = router;
