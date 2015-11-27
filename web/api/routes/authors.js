/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var express = require('express');
var router = express.Router();
var Q = require('q');

var wordpressBridge = require('../lib/wordpress-bridge.js');
var apiSettings     = require('../api-settings.js');

/**
 * Retrieves all authors.
 *
 * GET /authors
 */
router.get('/', function(req, res) {

    /*
     * Authors can either be:
     * * WordPress users, in which case they are uniquely identified by their
     *   WordPress user ID.
     * * Other users, in which case they are uniquely identified by their name.
     *
     * All that is stored in the database about WordPress users is their
     * WordPress user ID.
     */

    var collection = req.db.get('patches');
    var authorWpIds = []; // an array whose values are WordPress user IDs
    var authorNames = {}; // an object whose keys are non-WP author names
    var result = {
        count: 0,
        result: []
    };

    var getUserInfoBatch = Q.denodeify(wordpressBridge.getUserInfoBatch);

    Q.fcall(function () {

        /*
         * Get all patches
         */

        return collection.find({});

    }).then(function (docs) {

        for (var i = 0, max = docs.length; i < max; i++) {
            if (docs[i].author.wordpressId) {
                authorWpIds.push(docs[i].author.wordpressId);
            } else {
                authorNames[docs[i].author.name] = true;
            }
        }

        /*
         * Add all authors whose name we know to the final result
         */

        for (name in authorNames) {
            result.result.push({ name: name });
            result.count++;
        }

        /*
         * Remove duplicate WP IDs
         */

        authorWpIds = authorWpIds.reduce(function (p, c) {
            if (p.indexOf(c) < 0) {
                p.push(c);
            }
            return p;
        }, []);

        /*
         * Get user "display names" from WordPress
         */

        return getUserInfoBatch(authorWpIds);

    }).then(function (users) {

        /*
         * Add user "display names" to the final result
         */

        for(userId in users) {
            result.result.push({
                name: users[userId].display_name,
                wordpressId: parseInt(userId)
            });
            result.count++;
        }

        /*
         * Sort final result in case-insensitive fashion
         */

        result.result.sort(function (a, b) {

            if (a.name.toLowerCase() < b.name.toLowerCase()) {
                return -1;
            }

            if (a.name.toLowerCase() > b.name.toLowerCase()) {
                return 1;
            }

            return 0;
        });

        return result;

    }).catch(function (error) {

        var status = error.status || 500;
        return res.status(status).json({
            message: error.toString(),
            status: status
        });

    }).done(function (response) {

        if ('ServerResponse' === response.constructor.name) {
            return response;
        }

        return res.status(200).json(response);

    });
});

module.exports = router;
