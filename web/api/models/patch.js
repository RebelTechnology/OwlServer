'use strict';

const escapeStringRegexp = require('escape-string-regexp');

const Patch = require('../lib/patch');

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
    this._collection = db.get('patches');
  }

  /**
   * Retrieves the patch with the specified patch ID.
   *
   * @param {string} id
   * @return {Promise<Patch>}
   */
  getById(id) {
    return this._getOne({ _id: id });
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
          { _id: { $ne: this._collection.id(ignorePatchId)}},
          { $or: [ { name: nameRegexp }, { seoName: seoNameRegexp }]},
        ]
      };
    } else {
      query = { $or: [ { name: nameRegexp }, { seoName: seoNameRegexp } ] };
    }
    return this._collection.findOne(query)
    .then(doc => !!doc)
    .catch(err => {
      process.stderr.write(err + '\n');
      process.stderr.write(err.stack + '\n');
      return Promise.reject(new Error('Internal error.')); // masks real error
    });
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
      })
      .catch(err => {
        process.stderr.write(err + '\n');
        process.stderr.write(err.stack + '\n');
        return Promise.reject(new Error('Internal error.')); // masks real error
      });
  }

  /**
   * Updates the specified patch.
   *
   * @param {string} _id
   * @param {Patch} patch
   * @return {Promise}
   */
  update(_id, patch) {
    return this._collection.update({ _id }, patch)
    .catch(err => {
      process.stderr.write(err + '\n');
      process.stderr.write(err.stack + '\n');
      return Promise.reject(new Error('Internal error.')); // masks real error
    });
  }
}

module.exports = PatchModel;
