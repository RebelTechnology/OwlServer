'use strict';

const patchFieldValidators = require('./patch-field-validators');

class PatchValidationError extends Error {
  constructor(message = 'Illegal patch.') {
    super(message);
    this.field = field;
    this.type = 'not_valid';
    this.status = 400;
  }
}

class Patch {

  validate() {
    for (let field in patchFieldValidators) {

      if (typeof this[field] === 'undefined') {

        // Check for required fields
        if (patchFieldValidators[field].required === true) {
          this.throwErrorForMissingRequiredField(field);
        }

        // instructions and description are required if patch is published
        if (this.published && (field === 'instructions' || field === 'description')) {
          this.throwErrorForMissingRequiredField(field);
        }
      } else {

        // Validate single fields
        patchFieldValidators[field].validate(this[field]);
        if (patchFieldValidators[field].sanitize) {
          // if a sanitization function exist, call it and then revalidate
          // just in case...
          this[field] = patchFieldValidators[field].sanitize(this[field]);
          patchFieldValidators[field].validate(this[field]);
        }
      }
    }
  }

  sanitize() {

    // Default values:
    if (!this.inputs) {
      this.inputs = 0;
    }
    if (!this.outputs) {
      this.outputs = 0;
    }
    if (!this.parameters) {
      this.parameters = {};
    }
    if (!this.compilationType) {
      this.compilationType = 'cpp';
    }
    this.published = this.published ? true : false;
    this.github = [];
    if (!this.downloadCount) {
      this.downloadCount = 0;
    }
    // The below fields should all be generated somewhere else:
    // - seoName
    // - creationTimeUtc

    // Delete unrecognized fields
    var keys = Object.keys(patchFieldValidators);
    for (let key in this) {
      if (keys.indexOf(key) === -1) {
        delete this[key];
      }
    }
  }

  generateRandomName() {
    if (!this.name) {
      const randomId = () => (Math.random() * 0xFFFF<<0).toString(16);
      this.name = 'untitled-' + randomId() + randomId() + randomId();
    }
  }

  generateSeoName() {
    this.seoName = this.name.replace(/[^a-z0-9]+/gi, '_');
  }

  throwErrorForMissingRequiredField(field) {
    console.log('Error missing required field: ', field);
    const err = {};
    err.message = `Field '${field}' is required.`;
    err.type = 'field_required';
    err.field = field;
    throw err;
  }
}

module.exports = Patch;
