/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express = require('express');
var router = express.Router();

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
        { $unwind: "$tags" },
        { $group: { _id: "$tags" }},
        { $sort: { _id: 1}},
        
        function(err, result) {
            if (err !== null) {
                res.status(500).json({error: err});
            } else {
                var tags = [];
                for (var i = 0; i < result.length; i++) {
                    var tag = result[i]._id;
                    tags.push(tag);
                }
                res.status(200).json({ count: tags.length, result: tags });
            }
        }
    );
    
    
});

module.exports = router;
