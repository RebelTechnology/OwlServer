/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
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

/**
 * Recompiles a patch.
 *
 * PUT /patch/{id}
 */
router.put('/:id', function(req, res) {

    var id = req.params.id;
    if (!/^[a-f\d]{24}$/i.test(id)) {
        return res.status(500).json({
           message: 'Invalid ID.',
           error: { status: 500 }
        });
    }

    var cmd = 'php ' + apiSettings.PATCH_BUILDER_PATH + ' ' + id;

    exec(cmd, function (error, stdout, stderr) {

        var response = {
            stdout: stdout,
            stderr: stderr,
            success: error === null
        };
        if (error !== null) {
            response.error = { status: 500 };
        }
        return res.status(error !== null ? 500 : 200).json(response);

    });
});

module.exports = router;