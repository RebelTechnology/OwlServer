/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express = require('express');
var router = express.Router();
var url = require('url');

var patchModel = require('../models/patch');

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

/**
 * Creates a new patch.
 *
 * POST /patches
 */
router.post('/', function(req, res) {

    var collection = req.db.get('patches');
    var patch = req.body;

    patch.seoName = patchModel.generateSeoName(patch);
    patch.author = { name: 'OWL' }; // FIXME
    try {
        patchModel.validate(patch);
    } catch(err) {
        if ('undefined' === typeof err.error && 'undefined' === typeof err.error.status) {
            return res.status(500).json(err);
        } else {
            return res.status(err.error.status).json(err);
        }
    }

    // we make sure that no other patches are named the same (in a case insensitive fashion)
    var nameRegexp = new RegExp(regExpEscape(patch.name), 'i');
    var seoNameRegexp = new RegExp(regExpEscape(patch.seoName), 'i');
    collection.findOne({ $or: [ { name: nameRegexp }, { seoName: seoNameRegexp } ] }, function(err, doc) {

        if (null !== err) {
            // database returned an error
            return res.status(500).json({ message: err, error: { status: 500 }});
        } else {

            if (null !== doc) {

                var err = { message: 'This name is already taken.', type: 'not_valid', field: 'name', error: { status: 400 }};
                return res.status(err.error.status).json(err);

            } else {

                patch = patchModel.sanitize(patch);
                collection.insert(patch, function(err, newlyInsertedPatch) {

                    if (null !== err) {
                        // database returned an error
                        return res.status(500).json({
                            message: err,
                            error: { status: 500 }
                        });
                    } else {
                        return res.status(200).json({ message: 'New patch saved.', _id: newlyInsertedPatch._id, seoName: newlyInsertedPatch.seoName });
                    }
                });
            }
        }
    });
});

module.exports = router;