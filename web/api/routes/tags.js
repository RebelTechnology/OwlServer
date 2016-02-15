/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express = require('express');
var router  = express.Router();

/**
 * Retrieves all tags.
 *
 * GET /tags
 */
router.get('/', function(req, res) {

    var collection = req.db.get('patches');
    var nativeCol = collection.col;
    nativeCol.aggregate(

        { $project: { tags: 1 }},
        { $unwind: '$tags' },
        { $group: { _id: '$tags' }},
        { $project: { _id: 1, insensitive: { $toLower: '$_id' }}}, // case-insensitive ordering
        { $sort: { insensitive: 1 }},
        { $project: { _id: 1 }},

        function(err, result) {
            if (err !== null) {
                return res.status(500).json({message: err});
            } else {
                var tags = [];
                for (var i = 0; i < result.length; i++) {
                    var tag = result[i]._id;
                    tags.push(tag);
                }
                return res.status(200).json({ count: tags.length, result: tags });
            }
        }
    );
});

module.exports = router;
