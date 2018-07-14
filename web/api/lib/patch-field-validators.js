'use strict';

const urlParser = require('url');

class PatchFieldValidationError extends Error {
  constructor(field, message = 'Illegal value.') {
    super(message);
    this.field = field;
    this.type = 'not_valid';
    this.public = true;
  }
}

const patchFieldValidators = {

  _id: {
    required: false,
    validate(val) {
      if (typeof val !== 'string' || !(/^[0-9a-f]{24}$/i.test(val))) {
        throw new PatchFieldValidationError('_id');
      }
    }
  },

  name: {
    required: false,
    validate(val) {
      if (typeof val !== 'string') {
        throw new PatchFieldValidationError('name');
      }

      if(val.length < 1 || val.length > 255) {
        throw new PatchFieldValidationError('name', 'This field should be at least 1 and at most 255 characters long.');
      }
    },
    sanitize(val) {
      return val.trim();
    }
  },

  seoName: {
    required: false,
    validate(val) {
      if (typeof val !== 'string' || !(/^[a-z0-9\_]+$/i.test(val))) {
        throw new PatchFieldValidationError('seoName');
      }

      if (val.length < 1 || val.length > 255) {
        throw new PatchFieldValidationError('seoName', 'This field should be at least 1 and at most 255 characters long.');
      }
    }
  },

  compilationType: {
    required: false,
    validate(val) {
      const validTypes = [ 'cpp', 'faust', 'pd', 'gen' ];
      if (typeof val !== 'string' || !validTypes.includes(val.toLowerCase())) {
        throw new PatchFieldValidationError('compilationType');
      }
    },
    sanitize(val) {
      return String(val);
    }
  },

  author: {
    required: true,
    validate(val) {

      if (typeof val !== 'object') {
        throw new PatchFieldValidationError('author');
      }

      // Either name or wordpressId, exclusive (i.e. not both)
      if (!('name' in val) && !('wordpressId' in val)) {
        throw new PatchFieldValidationError('author', 'Illegal author schema (1).');
      }
      //if (('name' in val) && ('wordpressId' in val)) {
      //  throw new PatchFieldValidationError('author', 'Illegal author schema (2).');
      //}

      // Validate name
      if ('name' in val) {
        if (typeof val.name !== 'string') {
          throw new PatchFieldValidationError('author', 'Illegal author name.');
        }
        if (val.name.length < 1 || val.name.length > 255) {
          throw new PatchFieldValidationError('author', 'Illegal author name.');
        }
      }

      // Validate WordPress user ID
      if ('wordpressId' in val) {
        if (val.wordpressId != parseInt(val.wordpressId, 10)) {
          throw new PatchFieldValidationError('author', 'Illegal WordPress user ID.');
        }
        if (val.wordpressId <= 0) {
          throw new PatchFieldValidationError('author', 'Illegal WordPress user ID.');
        }
      }
    },
    sanitize(val) {

      // Remove illegal keys
      for (let key in val) {
        if ('wordpressId' !== key && 'name' !== key) {
          delete val[key];
        }
      }

      // Sanitize WP user ID
      if ('wordpressId' in val) {
        val.wordpressId = parseInt(val.wordpressId, 10);
      }

      return val;
    }
  },

  description: {
    required: false, // ...but required, if published == true
    validate(val) {
      if (typeof val !== 'string') {
        throw new PatchFieldValidationError('description');
      }

      if(val.length > 1023) {
        throw new PatchFieldValidationError('description', 'This field should be at most 1023 characters long.');
      }
    },
    sanitize(val) {
      return val.trim();
    }
  },

  instructions: {
    required: false, // ...but required, if published == true
    validate(val) {
      if (typeof val !== 'string') {
        throw new PatchFieldValidationError('instructions');
      }

      if (val.length > 1023) {
        throw new PatchFieldValidationError('instructions', 'This field should be at most 1023 characters long.');
      }
    },
    sanitize(val) {
      return val.trim();
    }
  },

  parameters: {
    required: false,
    requiredParameterProperties: [
      { name: 'id', type: 'number' }, 
      { name: 'name', type: 'string' },
      { name: 'io', type: 'string', values: ['input', 'output'] }, 
      { name: 'type', type: 'string', values: ['bool', 'float'] }
    ],
    validate(val) {
      if (!Array.isArray(val)) {
        throw new PatchFieldValidationError('parameters');
      }

      val.forEach(parameter => {
        
        this.parameters.requiredParameterProperties.forEach((requiredProp) => {
          const parameterValue = parameter[requiredProp.name];
          
          if(typeof parameterValue !== requiredProp.type){
            throw new PatchFieldValidationError('parameters', `"${requiredProp.name}" must be a ${requiredProp.type}, received: ${typeof parameterValue}`);
          }

          if(typeof parameterValue === 'string' && ( parameterValue.length < 1 || parameterValue.length > 255)){
            throw new PatchFieldValidationError('parameters', `"${requiredProp.name}" must be between 1 and 255 characters, received length of ${parameterValue.length}`);
          }

          if(!!requiredProp.values && requiredProp.values.indexOf(parameterValue) === -1){
            throw new PatchFieldValidationError('parameters', `"${requiredProp.name}" must be one of: ${requiredProp.values.join(',')}, received: ${parameterValue}`);
          }

        });

      });

    },
    sanitize(val) {
      return val.map(parameter => {
        return this.parameters.requiredParameterProperties.reduce((acc, requiredProp) => {
          acc[requiredProp.name] = requiredProp.type === 'string' ? parameter[requiredProp.name].trim() : parameter[requiredProp.name];
          return acc;
        }, {});
      });
    }
  },

  inputs: {
    required: false,
    validate(val) {
      if (val != 0 && val != 1 && val != 2) {
        throw new PatchFieldValidationError('inputs');
      }
    },
    sanitize(val) {
      return parseInt(val, 10);
    }
  },

  outputs: {
    required: false,
    validate(val) {
      if (val != 0 && val != 1 && val != 2) {
        throw new PatchFieldValidationError('outputs');
      }
    },
    sanitize(val) {
      return parseInt(val, 10);
    }
  },

  soundcloud: {
    required: false,
    validate(val) {

      if ('undefined' === typeof val) {
        return;
      }

      if (!Array.isArray(val)) {
        throw new PatchFieldValidationError('soundcloud');
      }

      for (let i = 0, max = val.length; i < max; i++) {
        if (typeof val[i] !== 'string') {
          throw new PatchFieldValidationError('soundcloud');
        }
        // https://soundcloud.com/hoxtonowl/johan-larsby-conny-distortion
        if (!/^https?:\/\/(?:www\.)?soundcloud\.com\/.+\/.+$/i.test(val[i])) {
          const err = new PatchFieldValidationError('soundcloud', 'URL does not seem a valid SoundCloud track.');
          err.index = i;
          throw err;
        }
      }
    }
  },

  github: {
    required: false,
    validate(val) {

      if ('undefined' === typeof val) {
        return;
      }

      if (!Array.isArray(val)) {
        throw new PatchFieldValidationError('github', 'Illegal value.');
      }

      let url;
      const validRebelTechHosts = [
        'hoxtonowl.localhost:8000',
        'staging.hoxtonowl.com',
        'hoxtonowl.com',
        'www.hoxtonowl.com',
        'dev.rebeltech.org',
        'www.rebeltech.org'
      ];

      const validGitHubHosts = [
        'github.com',
        'www.github.com'
      ];

      const validHosts = validRebelTechHosts.concat(validGitHubHosts);

      for (let i = 0, max = val.length; i < max; i++) {
        if (typeof val[i] !== 'string') {
          const err = new PatchFieldValidationError('github', 'Invalid URL (1).');
          err.index = i;
          throw err;
        }

        url = urlParser.parse(val[i]);

        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          const err = new PatchFieldValidationError('github', 'Invalid URL protocol.');
          err.index = i;
          throw err;
        }

        if (validHosts.indexOf(url.host) === -1) {
          const err = new PatchFieldValidationError('github', 'Host Error, source files can only be hosted on our servers or on GitHub.');
          err.index = i;
          throw err;
        }

        if (validRebelTechHosts.indexOf(url.host) > -1) {
          // e.g.: http://hoxtonowl.localhost:8000/wp-content/uploads/patch-files/tmp55f9a1bd53df71.81542285/Chorus2Patch.hpp
          // url.path = /wp-content/uploads/patch-files/tmp55f9a1bd53df71.81542285/Chorus2Patch.hpp
          if (!/^\/wp-content\/uploads\/patch\-files\/[a-z0-9\-]+\/.+$/i.test(url.path)) { // FIXME - Use process.env.PATCH_SOURCE_URL_FRAGMENT instead
            const err = new PatchFieldValidationError('github', 'URL does not seem to belong to a source file hosted on our servers.');
            err.index = i;
            throw err;
          }
        } else if (validGitHubHosts.indexOf(url.host) > -1) {
          // e.g.: https://github.com/pingdynasty/OwlPatches/blob/master/PhaserPatch.hpp
          if (!/^https?:\/\/(?:www\.)?github\.com\/.+\/.+\/blob\/.+\/.+$/i.test(val[i])) {
            const err = new PatchFieldValidationError('github', 'URL does not seem to be a valid GitHub blob URL.');
            err.index = i;
            throw err;
          }
        } else {
          const err = new PatchFieldValidationError('github', 'Source files can only be hosted on our servers or on GitHub.');
          err.index = i;
          throw err;
        }
      }
    }
  },

  cycles: {
    required: false,
    validate(val) {
      if (val !== parseInt(val, 10)) {
        throw new PatchFieldValidationError('cycles', 'Value must be an integer.');
      }
      if (val < 0) {
        throw new PatchFieldValidationError('cycles');
      }
    },
    sanitize(val) {
      return Math.round(val);
    }
  },

  bytes: {
    required: false,
    validate(val) {
      if (val !== parseInt(val, 10)) {
        throw new PatchFieldValidationError('bytes', 'Value must be an integer.');
      }
      if (val < 0) {
        throw new PatchFieldValidationError('bytes');
      }
    },
    sanitize(val) {
      return Math.round(val);
    }
  },

  tags: {
    required: false,
    validate(val) {
      if (!Array.isArray(val)) {
        throw new PatchFieldValidationError('tags');
      }

      for (let i = 0, max = val.length; i < max; i++) {
        if (!val || typeof val[i] !== 'string') {
          const err = new PatchFieldValidationError('tags');
          err.index = i;
          throw err;
        }
      }
    },
    sanitize(val) {
      for (let i = 0, max = val.length; i < max; i++) {
        val[i] = val[i].trim();
      }
      return val;
    }
  },

  creationTimeUtc: {
    required: false,
    validate(val) {
      if (!/^\d+$/.test(val)) {
        throw new PatchFieldValidationError('creationTimeUtc');
      }
    },
    sanitize(val) {
      return parseInt(val, 10);
    }
  },

  published: {
    required: false,
    // no validation needed
    validate(val) {}, // eslint-disable-line no-unused-vars
    sanitize(val) {
      // val will usually be '0', '1' (string), 0 or 1 (integer)
      return val == '0' ? false : true;
    }
  },

  downloadCount: {
    required: false,
    validate(val) {
      if (!/^\d+$/.test(val) || val < 0) {
        throw new PatchFieldValidationError('downloadCount');
      }
    },
    sanitize(val) {
      return parseInt(val, 10);
    }
  },

  starList: {
    required: false,
    validate(val) {
      if (!Array.isArray(val)) {
        throw new PatchFieldValidationError('starList');
      }
      val.forEach(star => {
        if(!star.userId || typeof star.userId !== 'number'){
          throw new PatchFieldValidationError('starList', 'userId property missing or wrong in starlist');
        }
      });
    },
    sanitize(val) {
      return val.filter(star => {
        return typeof star.userId === 'number';
      }).filter(star => {
        if(star.timeStamp){
          return typeof star.timeStamp === 'number';
        }
        return true;
      }).map(star => {
        return {
          userId: star.userId,
          timeStamp: star.timeStamp || 0
        };
      });
    }
  },
};

module.exports = patchFieldValidators;
