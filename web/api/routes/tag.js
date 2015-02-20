/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express = require('express');
var router = express.Router();

/**
 * Returns whether the specified tag exists (204) or not (404).
 * 
 * GET /tag/{tag}
 * 
 * @todo
 */
router.get('/:tag', function(req, res) {
    var response = {
        message: 'Not implemented',
        error: { status: 405 }
    };
    return res.status(405).json(response);
});

module.exports = router;
