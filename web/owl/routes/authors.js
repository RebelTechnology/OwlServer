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
        
        { $project: { "author": 1, lowercase: { $toLower: "$author.name" }}},
        { $group: { _id: "$author.name", url: { $first: "$author.url" }, lowercase: { $first: "$lowercase" }}},
        { $sort: { lowercase: 1 }}, 
        { $project: { _id: "$_id", url: "$url" }},
        
        function(err, result) {
            if (err !== null) {
                res.json({error: err});
            } else {
                console.log('test');
                var authors = [];
                for (var i = 0; i < result.length; i++) {
                    var author = { name: result[i]._id };
                    if (null !== result[i].url) {
                        author.url = result[i].url;
                    }
                    authors.push(author);
                }
                res.json({error: 0, count: authors.length, result: authors});
            }
        }
    );
    
    
});

module.exports = router;
