/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express = require('express');
var router = express.Router();

/**
 * Retrieves a single patch.
 * 
 * GET /patch/{id}
 */
router.get('/:id', function(req, res) {
    
    var id = req.params.id;
    var collection = req.db.get('patches');
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
                response.result = patch;
                res.status(200).json(response);
                
            }
        }
    });
});

/**
 * Updates a patch.
 * 
 * PUT /patch/{id}
 */
router.put('/:id', function(req, res) {
    // TODO
});

/**
 * Deletes a patch.
 * 
 * DELETE /patch/{id}
 */
router.delete('/:id', function(req, res) {
    
    var id = req.params.id;
    var collection = req.db.get('patches');
    collection.findOne({ _id: id }, function(err, patch) {
        
        var response = {};
        
        if (null !== err) {
            
            // database returned error
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
            }
        }
    });
});

module.exports = router;