/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express = require('express');
var router = express.Router();

var summaryFields = { 
    _id: 1,
    name: 1,
    'author.name': 1,
    'author.url': 1,
    tags: 1,
    seoName: 1
};

RegExp.escape = function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

/*
 * GET /patches/findOne
 */
router.get('/findOne/:id', function(req, res) {
    
    var id = req.params.id;
    var collection = req.db.get('patches');
    collection.findOne({ _id: id }, function(err, patch) {
        var response = { error: null === err ? 0 : err };
        if (null === err) {
            response.result = patch;
        }
        res.json(response);
    });
});

/*
 * GET /patches/findAll
 */
router.get('/findAll', function(req, res) {
    
    var collection = req.db.get('patches');
    collection.find({}, { fields: summaryFields, sort: 'name' }, function(err, patchSummaries) {
        var response = { error: null === err ? 0 : err };
        if (null === err) {
            response.count = patchSummaries.length;
            response.result = patchSummaries;
        }
        res.json(response);
    });
});

/*
 * GET /patches/findByTag
 */
router.get('/findByTag/:tagList', function(req, res) {
    
    var tags = req.params.tagList.split(',');
    var collection = req.db.get('patches');
    var orClause = [];
    for (var i = 0; i < tags.length; i++) {
        orClause.push({ tags: new RegExp(RegExp.escape(tags[i]), 'i')}); // case insensitive search
    }
    collection.find({$or: orClause }, { fields: summaryFields }, function(err, patchSummaries) {
        var response = { error: null === err ? 0 : err };
        if (null === err) {
            response.count = patchSummaries.length;
            response.result = patchSummaries;
        }
        res.json(response);
    });
});

/*
 * GET /patches/findByAuthor
 */
router.get('/findByAuthor/:authorList', function(req, res) {
    
    var authors = req.params.authorList.split(',');
    var collection = req.db.get('patches');
    var orClause = [];
    for (var i = 0; i < authors.length; i++) {
        orClause.push({ 'author.name': new RegExp(RegExp.escape(authors[i]), 'i')}); // case insensitive search
    }
    collection.find({$or: orClause }, { fields: summaryFields }, function(err, patchSummaries) {
        var response = { error: null === err ? 0 : err };
        if (null === err) {
            response.count = patchSummaries.length;
            response.result = patchSummaries;
        }
        res.json(response);
    });
});

/*
 * GET /patches/findOneBySeoName
 */
router.get('/findOneBySeoName/:seoName', function(req, res) {
    
    var seoName = req.params.seoName;
    var collection = req.db.get('patches');
    collection.findOne({ seoName: seoName }, function(err, patch) {
        var response = { error: null === err ? 0 : err };
        if (null === err) {
            response.result = patch;
        }
        res.json(response);
    });
});

module.exports = router;
