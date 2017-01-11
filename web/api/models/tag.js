'use strict';

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
    this._collection = db.get('patches');
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
    return this._collection.aggregate(
        { $match: query },
        { $project: { tags: 1 }},
        { $unwind: '$tags' },
        { $group: { _id: '$tags' }},
        { $project: { _id: 1, insensitive: { $toLower: '$_id' }}}, // case-insensitive ordering
        { $sort: { insensitive: 1 }},
        { $project: { _id: 1 }}
      )
      .then(result => result.map(current => current._id))
      .catch(err => {
        process.stderr.write(err + '\n');
        process.stderr.write(err.stack + '\n');
        return Promise.reject(new Error('Internal error.')); // masks real error
      });
  }
}

module.exports = Tag;
