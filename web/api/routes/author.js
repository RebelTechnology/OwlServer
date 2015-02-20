/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express = require('express');
var router = express.Router();

/**
 * Returns whether the specified author exists (204) or not (404).
 * 
 * GET /author/{author}
 * 
 * @todo
 */
router.get('/:author', function(req, res) {
    var response = {
        message: 'Not implemented',
        error: { status: 405 }
    };
    return res.status(405).json(response);
});

module.exports = router;
