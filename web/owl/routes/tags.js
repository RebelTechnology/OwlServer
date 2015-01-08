/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express = require('express');
var router = express.Router();

/*
 * GET /authors/findAll
 */
router.get('/findAll', function(req, res) {
    
    var collection = req.db.get('patches');
    var nativeCol = collection.col;
    nativeCol.aggregate(
        
        { $project: { tags: 1 }},
        { $unwind: "$tags" },
        { $group: { _id: "$tags" }},
        { $sort: { _id: 1}},
        
        function(err, result) {
            if (err !== null) {
                res.json({error: err});
            } else {
                var tags = [];
                for (var i = 0; i < result.length; i++) {
                    var tag = result[i]._id;
                    tags.push(tag);
                }
                res.json({error: 0, count: tags.length, result: tags});
            }
        }
    );
    
    
});

module.exports = router;
