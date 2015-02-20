/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express    = require('express');
var router     = express.Router();
var patchModel = require('../models/patch');

var regExpEscape = function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

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
            return res.status(500).json({
                message: err,
                error: { status: 500 }
            });
            
        } else {
            
            if (null === patch) {
                
                // patch not found
                return res.status(404).json({
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
        return res.status(200).json(response);
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
        return res.status(response.error.status).json(response);
    } else {
        collection.findOne(query, function(err, patch) {
            
            var response = {};
            if (null !== err) {
                
                // database returned an error
                return res.status(500).json({
                    message: err,
                    error: { status: 500 }
                });
                
            } else {
                
                if (null === patch) {
                    
                    // patch not found
                    return res.status(404).json({
                        message: 'Patch not found.',
                        error: { status: 404 }
                    });
                    
                } else {
                    
                    var response = { result: patch };
                    return res.status(200).json(response);
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
    var patch = req.body;
    
    apply(id, collection, res, function(discardMe) {
        
        patch._id = id;
        patch.seoName = patchModel.generateSeoName(patch);
        patch.author = { name: 'OWL' }; // FIXME
        try {
            patchModel.validate(patch);
        } catch (err) {
            if ('undefined' === typeof err.error && 'undefined' === typeof err.error.status) {
                return res.status(500).json(err);
            } else {
                return res.status(err.error.status).json(err);
            }
        }
        
        // we make sure that no other patches are named the same (in a case insensitive fashion)
        var nameRegexp = new RegExp(regExpEscape(patch.name), 'i');
        var seoNameRegexp = new RegExp(regExpEscape(patch.seoName), 'i');
        collection.findOne({_id: { $ne: collection.id(patch._id) }, $or: [{ name: nameRegexp }, { seoName: seoNameRegexp }]}, function(err, doc) {
            if (null !== err) {
                // database returned an error
                return res.status(500).json({ message: err, error: { status: 500 }});
            } else {
                if (null !== doc) {
                    var err = { message: 'This name is already taken.', type: 'not_valid', field: 'name', error: { status: 400 }};
                    return res.status(err.error.status).json(err);
                } else {
                    patch = patchModel.sanitize(patch);
                    collection.updateById(patch._id, patch, function(err, updated) {
                        if (null !== err) {
                            // database returned an error
                            return res.status(500).json({
                                message: err,
                                error: { status: 500 }
                            });
                        } else {
                            var response = {
                                message: 'Patch updated.',
                                _id: patch._id,
                                seoName: patch.seoName,
                                updated: updated
                            };
                            res.status(200).json(response);
                        }
                    });
                }
            }
        });
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
                return res.status(500).json({
                    message: err,
                    error: { status: 500 }
                });
            } else {
                return res.status(200).json({
                    message: 'Patch deleted successfully.'
                });
            }
        });
    });
});

module.exports = router;