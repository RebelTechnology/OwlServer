'use strict';

const { getUserInfoBatch } = require('../lib/wordpress-bridge.js');

/**
 * Author model.
 */
class Author {

  /**
   * Class constructor.
   *
   * @param {Object} db
   */
  constructor(db) {
    this._db = db;
  }

  /**
   * Returns all patches.
   *
   * @type {boolean} [onlyWithPublicPatches=true]
   * @return {Promise<Array<{name: string, wordpressId: ?number}>>}
   */
  getAll(onlyWithPublicPatches = true) {

    /*
     * Authors can either be:
     * * WordPress users, in which case they are uniquely identified by their
     *   WordPress user ID.
     * * Other users, in which case they are uniquely identified by their name.
     *
     * All that is stored in the database about WordPress users is their
     * WordPress user ID.
     */

    const collection = this._db.get('patches');
    let authorWpIds = []; // an array whose values are WordPress user IDs
    const authorNames = {}; // an object whose keys are non-WP author names
    const result = [];

    let query = {};
    if (onlyWithPublicPatches) {
      query = { published: onlyWithPublicPatches };
    }
    console.log('author model: query = '); // FIXME
    console.log(query); // FIXME
    return Promise.resolve()
      .then(() => collection.find(query, { fields: { author: 1, published: 1 }}))
      .then(patches => {
        console.log('author model: patches.length = '); // FIXME
        console.log(patches.length); // FIXME
        for (let i = 0, max = patches.length; i < max; i++) {
          if (patches[i] && patches[i].author) {
            if (patches[i].author.wordpressId) {
              authorWpIds.push(patches[i].author.wordpressId);
            } else {
              authorNames[patches[i].author.name] = true;
            }
          }
        }

        // Add all non-WP authors to the final result
        for (let name in authorNames) {
          result.push({ name });
        }

        // Remove duplicate WP IDs
        authorWpIds = authorWpIds.reduce((p, c) => {
          if (p.indexOf(c) < 0) {
            p.push(c);
          }
          return p;
        }, []);

        // Get user "display names" from WordPress
        return getUserInfoBatch(authorWpIds);
      })
      .then(users => {

        // Add user "display names" to the final result
        for (let userId in users) {
          result.push({
            name: users[userId].display_name,
            wordpressId: parseInt(userId),
          });
        }

        // Sort final result in case-insensitive fashion
        result.sort((a, b) => {
          if (a.name.toLowerCase() < b.name.toLowerCase()) {
            return -1;
          }
          if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return 1;
          }
          return 0;
        });

        return result;
      })
  }
}

module.exports = Author;
