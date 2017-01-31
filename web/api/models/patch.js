'use strict';

const monk = require('monk');
const escapeStringRegexp = require('escape-string-regexp');

const Patch = require('../lib/patch');

const summaryFields = {
  '_id':                1,
  'name':               1,
  'author.name':        1,
  'author.url':         1,
  'author.wordpressId': 1,
  'tags':               1,
  'seoName':            1,
  'creationTimeUtc':    1,
  'published':          1,
  'description':        1,
  'downloadCount':      1
};

/**
 * Patch model.
 */
class PatchModel {

  /**
   * Class constructor.
   *
   * @param {Object} db
   */
  constructor(db) {
    this._collection = db.get(process.env.MONGO_COLLECTION);
  }

  /**
   * Returns all patches that match the given query.
   *
   * @param {Object} filters - A key/value map for filtering patches. At present
   *                           these fields are supported: 'author.name' and
   *                           'author.wordpressId'
   * @return {Promise<Array<Patch>>}
   */
  find(filters = {}) {
    const queryFilter = { $match: {}};
    if (filters['author.name'] && typeof filters['author.name'] === 'string') {
      queryFilter.$match['author.name'] = filters['author.name'];
    }
    if (filters['author.wordpressId'] && typeof filters['author.wordpressId'] === 'string') {
      queryFilter.$match['author.wordpressId'] = filters['author.wordpressId'];
    }
    const projection = Object.assign({}, summaryFields, { lowercase: { $toLower: '$name' }});
    return this._collection.aggregate([
      queryFilter,
      { $project: projection },
      { $sort: { lowercase: 1 }},
      { $project: summaryFields }
    ]);
  }

  /**
   * Retrieves the patch with the specified patch ID.
   *
   * @param {string} _id
   * @return {Promise<Patch>}
   */
  getById(_id) {
    return this._getOne({ _id });
  }

  /**
   * Retrieves the patch with the specified SEO name.
   *
   * @param {string} seoName
   * @return {Promise<Patch>}
   */
  getBySeoName(seoName) {
    return this._getOne({ seoName });
  }

  /**
   * Returns whether the specified name has already been taken.
   *
   * A specific patch ID to ignore can be optionally specified.
   *
   * @param {string} name
   * @param {string} seoName
   * @param {?string} ignorePatchId
   * @return {Promise<boolean>}
   */
  patchNameTaken(name, seoName, ignorePatchId) {

    const nameRegexp = new RegExp('^' + escapeStringRegexp(name) + '$', 'i');
    const seoNameRegexp = new RegExp('^' + escapeStringRegexp(seoName) + '$', 'i');
    let query;
    if (ignorePatchId) {
      query = {
        $and: [
          { _id: { $ne: monk.id(ignorePatchId)}},
          { $or: [ { name: nameRegexp }, { seoName: seoNameRegexp }]},
        ]
      };
    } else {
      query = { $or: [ { name: nameRegexp }, { seoName: seoNameRegexp } ] };
    }
    return this._collection.findOne(query).then(doc => !!doc);
  }

  /**
   * Retrieves a single patch from the database.
   *
   * @private
   * @param {Object} query
   * @return {Promise<?Patch>}
   */
  _getOne(query) {
    return this._collection.findOne(query)
      .then(result => {
        if (!result) { // Patch not found
          return null;
        }
        const patch = new Patch();
        Object.assign(patch, result);
        return patch;
      });
  }

  /**
   * Creates a new patch.
   *
   * @param {Patch} patch
   * @return {Promise}
   */
  insert(patch) {
    return this._collection.insert(patch);
  }

  /**
   * Updates the specified patch.
   *
   * @param {string} _id
   * @param {Patch} patch
   * @return {Promise}
   */
  update(_id, patch) {
    return this._collection.update({ _id }, patch, { multi: false });
  }

  /**
   * Adds a new source file to the specified patch.
   *
   * This method will not add duplicates.
   *
   * @param {string} _id
   * @param {Array<string>} sources
   * @return {Promise}
   */
  addSources(_id, sources) {
    if (!Array.isArray(sources)) {
      return Promise.reject(new Error('`sources` must be an array.'));
    }
    if (!sources.some(source => typeof source === 'string')) {
      return Promise.reject(new Error('All elements of `sources` must be strings.'));
    }
    const update = { $addToSet: { github: { $each: sources }}};
    return this._collection.update({ _id }, update, { multi: false });
  }

  /**
   * Increments the download count of the specified patch.
   *
   * @param {string} _id
   * @return {Promise}
   */
  incrementDownloadCount(_id) {
    return this._collection.update({ _id }, { $inc: { downloadCount: 1 }}, { multi: false });
  }

  /**
   * Deletes a patch.
   *
   * @param {string} _id
   * @return {Promise}
   */
  delete(_id) {
    return this._collection.remove({ _id });
  }
}

module.exports = PatchModel;
