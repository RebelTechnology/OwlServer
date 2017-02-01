'use strict';

const config = require('../lib/config');

/**
 * Tag model.
 */
class Tag {

  /**
   * Class constructor.
   *
   * @param {Object} db
   */
  constructor(db) {
    this._collection = db.get(config.mongo.collection);
  }

  /**
   * Returns all tags.
   *
   * @type {boolean} [onlyForPublicPatches=true]
   * @return {Promise<Array<string>>}
   */
  getAll(onlyForPublicPatches = true) {

    const query = {};
    if (onlyForPublicPatches) {
      query.published = true;
    }
    return this._collection.aggregate([
        { $match: query },
        { $project: { tags: 1 }},
        { $unwind: '$tags' },
        { $group: { _id: '$tags' }},
        { $project: { _id: 1, insensitive: { $toLower: '$_id' }}}, // case-insensitive ordering
        { $sort: { insensitive: 1 }},
        { $project: { _id: 1 }}
    ])
    .then(result => result.map(current => current._id));
  }
}

module.exports = Tag;
