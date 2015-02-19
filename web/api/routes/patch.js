/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express    = require('express');
var router     = express.Router();
var patchModel = require('../models/patch');

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
var apply = function(id, collection, res, callback) {
    
    collection.findOne({ _id: id }, function(err, patch) {
        
        var response = {};
        if (null !== err) {
            
            // database returned an error
            res.status(500).json({
                message: err,
                error: { status: 500 }
            });
            
        } else {
            
            if (null === patch) {
                
                // patch not found
                res.status(404).json({
                    message: 'Patch not found.',
                    error: { status: 404 }
                });
                
            } else {
                
                // patch found
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
router.get('/:id', function(req, res) {
    
    var id = req.params.id;
    var collection = req.db.get('patches');
    apply(id, collection, res, function(patch) {
        
        var response = { result: patch };
        res.status(200).json(response);
    });
});

/**
 * Retrieves a patch by some field.
 * 
 * GET /patch/?field=value&...
 */
router.get('/', function(req,res) {
    
    var query = {};
    var collection = req.db.get('patches');
    
    if (typeof req.query.seoName === 'string' ) {
        query.seoName = req.query.seoName;
    }
    
    if (0 === Object.keys(query).length) {
        var response = { message: 'You must specify at least 1 search parameter.', error: { status: 400 }};
        res.status(response.error.status).json(response);
    } else {
        collection.findOne(query, function(err, patch) {
            
            var response = {};
            if (null !== err) {
                
                // database returned an error
                res.status(500).json({
                    message: err,
                    error: { status: 500 }
                });
                
            } else {
                
                if (null === patch) {
                    
                    // patch not found
                    res.status(404).json({
                        message: 'Patch not found.',
                        error: { status: 404 }
                    });
                    
                } else {
                    
                    var response = { result: patch };
                    res.status(200).json(response);
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
router.put('/:id', function(req, res) {
    
    var id = req.params.id;
    var collection = req.db.get('patches');
    apply(id, collection, res, function(patch) {
        
        patch._id = id;
        try {
            patchModel.validate(patch);
        } catch (e) {
            
        }
    });
});

/**
 * Deletes a patch.
 * 
 * DELETE /patch/{id}
 */
router.delete('/:id', function(req, res) {
    
    var id = req.params.id;
    var collection = req.db.get('patches');
    apply(id, collection, res, function(patch) {
        
        collection.remove({ _id: id }, { justOne: true }, function(err, deletedCount) {
            
            if (null !== err) {
                res.status(500).json({
                    message: err,
                    error: { status: 500 }
                });
            } else {
                res.status(200).json({
                    message: 'Patch deleted successfully.'
                });
            }
        });
    });
});

module.exports = router;