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
    this._db = db;
  }

  /**
   * Returns all tags.
   *
   * @type {boolean} [onlyForPublicPatches=true]
   * @return {Promise<Array<string>>}
   */
  getAll(onlyForPublicPatches = true) {
    const collection = this._db.get('patches');
    const nativeCol = collection.col;
    const query = {};
    if (onlyForPublicPatches) {
      query.published = true;
    }
    return new Promise((resolve, reject) => {
      nativeCol.aggregate(
        { $match: query },
        { $project: { tags: 1 }},
        { $unwind: '$tags' },
        { $group: { _id: '$tags' }},
        { $project: { _id: 1, insensitive: { $toLower: '$_id' }}}, // case-insensitive ordering
        { $sort: { insensitive: 1 }},
        { $project: { _id: 1 }},
        (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result.map(current => current._id));
        }
      );
    });
  }
}

module.exports = Tag;
