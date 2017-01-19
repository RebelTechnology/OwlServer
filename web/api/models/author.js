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
    this._collection = db.get(process.env.MONGO_COLLECTION);
  }

  /**
   * Returns all authors.
   *
   * @type {boolean} [onlyForPublicPatches=true]
   * @return {Promise<Array<{name: string, wordpressId: ?number}>>}
   */
  getAll(onlyForPublicPatches = true) {

    /*
     * Authors can either be:
     * * WordPress users, in which case they are uniquely identified by their
     *   WordPress user ID.
     * * Other users, in which case they are uniquely identified by their name.
     *
     * All that is stored in the database about WordPress users is their
     * WordPress user ID.
     */

    let authorWpIds = []; // an array whose values are WordPress user IDs
    const authorNames = {}; // an object whose keys are non-WP author names
    const result = [];

    let query = {};
    if (onlyForPublicPatches) {
      query = { published: onlyForPublicPatches };
    }
    return Promise.resolve()
      .then(() => this._collection.find(query, { fields: { author: 1, published: 1 }}))
      .then(patches => {
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
      });
  }

  /*
  // With Mongo's map-reduce:
  db.patches.mapReduce(function () {
    var onlyForPublicPatches = true;
    if ((onlyForPublicPatches && this.published) || !onlyForPublicPatches) {
      emit(this.author, { author: this.author })
    }
  }, function (name, data) {
    var result = {};
    if (data[0].author.name) {
      result.name = data[0].author.name;
    }
    if (data[0].author.wordpressId) {
      result.wordpressId = data[0].author.wordpressId;
    }
    return result;
  }, { out: 'mapreduce_authors' })
  db.mapreduce_authors.find()
   */
}

module.exports = Author;
