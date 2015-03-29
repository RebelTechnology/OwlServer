/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var Q = require('q');
Q.longStackSupport = false; // To be enabled only when debugging

var apiSettings = require('../api-settings.js');

/**
 * Downloads the SysEx file for a specific patch.
 *
 * GET /sysex/{id}
 */
router.get('/:id', function(req, res) {

    var id = req.params.id;
    var collection = req.db.get('patches');

    Q.fcall(function () {

        /*
         * Find patch
         */

        return collection.findOne({ _id: id });

    }).then(function (patch) {

        /*
         * Check if SysEx is available
         */

        if (null === patch) {
            throw { message: 'Patch not found.', status: 401 };
        }

        var sysexFile = path.join(apiSettings.SYSEX_PATH, patch['seoName'] + '.syx');
        if (!fs.existsSync(sysexFile)) {
            throw { message: 'SysEx not avilable for this patch.', status: 401 };
        }

        /*
         * Download file
         */

        console.log(sysexFile);
        var filename = path.basename(sysexFile);
        console.log(filename);
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', 'application/octet-stream');
        var filestream = fs.createReadStream(sysexFile);
        return filestream.pipe(res);

    }).fail(

        function (error) {
            //console.log('Error: ' + error.message);
            return res.status(error.status || 500).json({
               message: error.message,
               error: { status: error.status || 500 }
            });
        }
    );
});

module.exports = router;