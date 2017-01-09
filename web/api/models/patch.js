/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

var urlParser = require('url');

var patchModel = {

    fields: {

        _id: {
            required: false,
            validate: function(val) {

                var err = { type: 'not_valid', field: '_id', error: { status: 400 }};

                if (typeof val !== 'string' || !(/^[0-9a-f]{24}$/i.test(val))) {
                    err.message = 'Value not valid.';
                    throw err;
                }
            }
        },

        name: {
            required: false,
            validate: function(val) {

                var err = { type: 'not_valid', field: 'name', error: { status: 400 }};

                if (typeof val !== 'string') {
                    err.message = 'Value not valid.';
                    throw err;
                };

                if(val.length < 1 || val.length > 255) {
                    err.message = 'This field should be at least 1 and at most 255 characters long.';
                    throw err;
                }
            },
            sanitize: function(val) { return val.trim(); }
        },

        seoName: {
            required: false,
            validate: function(val) {

                var err = { type: 'not_valid', field: 'seoName', error: { status: 400 }};

                if (typeof val !== 'string' || !(/^[a-z0-9\_]+$/i.test(val))) {
                    err.message = 'Value not valid.';
                    throw err;
                }

                if(val.length < 1 || val.length > 255) {
                    err.message = 'This field should be at least 1 and at most 255 characters long.';
                    throw err;
                }
            }
        },

        compilationType: {
            required: false,
            validate: function (val) {

                var err = { type: 'not_valid', field: 'compilationType', error: { status: 400 }};
                var validTypes = ['cpp', 'faust', 'pd' ,'gen'];

                if (typeof val !== 'string' || validTypes.indexOf((val).toLowerCase()) === -1) {
                    err.message = 'Value not valid.';
                    throw err;
                }
            },
            sanitize: function (val) {
                return String(val);
            }
        },

        author: {
            required: true,
            validate: function (val) {

                var err = { type: 'not_valid', field: 'author', error: { status: 400 }};

                if (typeof val !== 'object') {
                    err.message = 'Value not valid.';
                    throw err;
                }

                // Either name or wordpressId, exclusive (i.e. not both)
                if (!('name' in val) && !('wordpressId' in val)) {
                    err.message = 'Invalid author schema.';
                    throw err;
                }
                if (('name' in val) && ('wordpressId' in val)) {
                    err.message = 'Invalid author schema.';
                }

                // Validate name
                if ('name' in val) {
                    if (val.name.length < 1 || val.name.length > 255) {
                        err.message = 'Invalid author name.';
                        throw err;
                    }
                }

                // Validate WordPress user ID
                if ('wordpressId' in val) {
                    if (val.wordpressId <= 0) {
                        err.message = 'Invalid WordPress user ID.';
                        throw err;
                    }
                }

            },
            sanitize: function (val) {

                // remove illegal keys
                for (var key in val) {
                    if ('wordpressId' !== key && 'name' !== key) {
                        delete val[key];
                    }
                }

                // sanitize WP user ID
                if ('wordpressId' in val) {
                    val.wordpressId = parseInt(val.wordpressId);
                }

                return val;
            }
        },

        description: {
            required: false, // ...but required, if published == true
            validate: function(val) {

                var err = { type: 'not_valid', field: 'description', error: { status: 400 }};

                if (typeof val !== 'string') {
                    err.message = 'Value not valid.';
                    throw err;
                }

                if(val.length < 1 || val.length > 1023) {
                    err.message = 'This field should be at least 1 and at most 1023 characters long.';
                    throw err;
                }
            },
            sanitize: function(val) { return val.trim(); }
        },

        instructions: {
            required: false, // ...but required, if published == true
            validate: function(val) {

                var err = { type: 'not_valid', field: 'instructions', error: { status: 400 }};

                if (typeof val !== 'string') {
                    err.message = 'Value not valid.';
                    throw err;
                }

                if(val.length > 1023) {
                    err.message = 'This field should be at most 1023 characters long.';
                    throw err;
                }
            },
            sanitize: function(val) { return val.trim(); }
        },

        parameters: {
            required: false,
            validate: function(val) {

                var err = { type: 'not_valid', field: 'parameters', error: { status: 400 }};

                if (typeof val !== 'object') {
                    err.message = 'Value not valid.';
                    throw err;
                }
                for (var key in val) {
                    if (key !== 'a' && key !== 'b' && key !== 'c' && key !== 'd' && key !== 'e') {
                        err.message = 'Value not valid.';
                        throw err;
                    }
                    if (typeof val[key] !== 'string' || val[key].length < 1 || val[key] > 255) {
                        err.message = 'This field should be at least 1 and at most 255 characters long.';
                        err.parameter = key;
                        throw err;
                    }
                }
            },
            sanitize: function(val) {
                for (var key in val) {
                    if (key !== 'a' && key !== 'b' && key !== 'c' && key !== 'd' && key !== 'e') {
                        delete val[key];
                    }
                    val[key] = val[key].trim();
                }
                return val;
            }
        },

        inputs: {
            required: false,
            validate: function(val) {

                var err = { type: 'not_valid', field: 'inputs', error: { status: 400 }};

                if (val != 0 && val != 1 && val != 2) {
                    err.message = 'Value not valid.';
                    throw err;
                }
            },
            sanitize: function(val) {
                return parseInt(val);
            }
        },

        outputs: {
            required: false,
            validate: function(val) {

                var err = { type: 'not_valid', field: 'outputs', error: { status: 400 }};

                if (val != 0 && val != 1 && val != 2) {
                    err.message = 'Value not valid.';
                    throw err;
                }
            },
            sanitize: function(val) {
                return parseInt(val);
            }
        },

        soundcloud: {
            required: false,
            validate: function(val) {

                if ('undefined' === typeof val) {
                    return;
                }

                var err = { type: 'not_valid', field: 'soundcloud', error: { status: 400 }};

                if (Object.prototype.toString.call(val) !== '[object Array]') {
                    err.message = 'Value not valid.';
                    throw err;
                }

                for (var i = 0, max = val.length; i < max; i++) {
                    if (typeof val[i] !== 'string') {
                        err.message = 'Value not valid.';
                        throw err;
                    }
                    // https://soundcloud.com/hoxtonowl/johan-larsby-conny-distortion
                    if (!/^https?:\/\/(?:www\.)?soundcloud\.com\/.+\/.+$/i.test(val[i])) {
                        err.message = 'URL does not seem a valid SoundCloud track.';
                        err.index = i;
                        throw err;
                    }
                }
            }
        },

        github: {
            required: false,
            validate: function(val) {

                if ('undefined' === typeof val) {
                    return;
                }

                var err = { type: 'not_valid', field: 'github', error: { status: 400 }};

                if (Object.prototype.toString.call(val) !== '[object Array]') {
                    err.message = 'Value not valid (1).';
                    throw err;
                }

                var url;
                var validHosts = [
                    'hoxtonowl.localhost:8000',
                    'staging.hoxtonowl.com',
                    'hoxtonowl.com',
                    'www.hoxtonowl.com',
                    'github.com',
                    'www.github.com'
                ];
                for (var i = 0, max = val.length; i < max; i++) {

                    if (typeof val[i] !== 'string') {
                        err.message = 'Invalid URL (1).';
                        throw err;
                    }

                    url = urlParser.parse(val[i]);

                    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                        err.message = 'Invalid URL (2).';
                        err.index = i;
                        throw err;
                    }

                    if (validHosts.indexOf(url.host) === -1) {
                        err.message = 'Source files can only be hosted on our servers or on GitHub.';
                        err.index = i;
                        throw err;
                    }

                    if (url.host.indexOf('hoxtonowl') !== -1) {
                        // e.g.: http://hoxtonowl.localhost:8000/wp-content/uploads/patch-files/tmp55f9a1bd53df71.81542285/Chorus2Patch.hpp
                        // url.path = /wp-content/uploads/patch-files/tmp55f9a1bd53df71.81542285/Chorus2Patch.hpp
                        if (!/^\/wp-content\/uploads\/patch\-files\/[a-z0-9\-]+\/.+$/i.test(url.path)) {
                            err.message = 'URL does not seem to belong to a source file hosted on our servers.';
                            err.index = i;
                            throw err;
                        }
                    } else if (url.host.indexOf('github') !== -1) {
                        // e.g.: https://github.com/pingdynasty/OwlPatches/blob/master/PhaserPatch.hpp
                        if (!/^https?:\/\/(?:www\.)?github\.com\/.+\/.+\/blob\/.+\/.+$/i.test(val[i])) {
                            err.message = 'URL does not seem to be a valid GitHub blob URL.';
                            err.index = i;
                            throw err;
                        }
                    } else {
                        err.message = 'Source files can only be hosted on our servers or on GitHub.';
                        err.index = i;
                        throw err;
                    }
                }
            }
        },

        cycles: {
            required: false,
            validate: function(val) {

                var err = { type: 'not_valid', field: 'cycles', error: { status: 400 }};

                if (val < 0) {
                    err.message = 'Value not valid.';
                    throw err;
                }
            },
            sanitize: function(val) {
                return Math.round(val);
            }
        },

        bytes: {
            required: false,
            validate: function(val) {

                var err = { type: 'not_valid', field: 'bytes', error: { status: 400 }};

                if (val < 0) {
                    err.message = 'Value not valid.';
                    throw err;
                }
            },
            sanitize: function(val) {
                return Math.round(val);
            }
        },

        tags: {
            required: false,
            validate: function(val) {

                var err = { type: 'not_valid', field: 'tags', error: { status: 400 }};

                if (Object.prototype.toString.call(val) !== '[object Array]') {
                    err.message = 'Value not valid.';
                    throw err;
                }

                for (var i = 0, max = val.length; i < max; i++) {
                    if (typeof val[i] !== 'string') {
                        err.message = 'Value not valid.';
                        throw err;
                    }
                    if ('' === val) {
                        err.message = 'Value not valid.';
                        throw err;
                    }
                }
            },
            sanitize: function(val) {
                for (var i = 0, max = val.length; i < max; i++) {
                    val[i] = val[i].trim();
                }
                return val;
            }
        },

        creationTimeUtc: {
            required: false,
            validate: function (val) {

                var err = { type: 'not_valid', field: 'creationTimeUtc', error: { status: 400 }};

                if (!/^\d+$/.test(val)) {
                    err.message = 'Value not valid.';
                    throw err;
                }

            },
            sanitize: function (val) {
                return parseInt(val);
            }
        },

        published: {
            required: false,
            validate: function (val) {
                // no validation needed
            },
            sanitize: function (val) {
                // val will usually be '0', '1' (string), 0 or 1 (integer)
                return val == '0' ? false : true;
            }
        },

        downloadCount: {
            required: false,
            validate: function (val) {

                var err = { type: 'not_valid', field: 'downloadCount', error: { status: 400 }};

                if (!/^\d+$/.test(val)) {
                    err.message = 'Value not valid.';
                    throw err;
                }
            },
            sanitize: function (val) {
                return parseInt(val);
            }
        }
    },

    validate: function(patch) {

        for (var key in patchModel.fields) {

            var err = { type: 'not_valid', error: { status: 400 }};

            // Check if patch is an object
            if (typeof patch !== 'object') {
                err.message = 'Invalid data.';
                throw err;
            }

            if (typeof patch[key] === 'undefined') {

                // Check for required fields
                if (patchModel.fields[key].required === true) {
                    patchModel.throwErrorForMissingRequiredField(key);
                }

                // instructions and description are required if patch is published
                if (patch.published == true && (key === 'instructions' || key === 'description')) {
                    patchModel.throwErrorForMissingRequiredField(key);
                }

            } else {
                // Validate single fields
                patchModel.fields[key].validate(patch[key]);
                if (patchModel.fields[key].sanitize) {
                    // if a sanitization function exist, call it and then revalidate
                    // just in case...
                    patch[key] = patchModel.fields[key].sanitize(patch[key]);
                    patchModel.fields[key].validate(patch[key]);
                }
            }
        }
    },

    sanitize: function(patch) {

      var keys = Object.keys(patchModel.fields);

      for (key in patch) {
          if (keys.indexOf(key) === -1) {
              delete patch[key];
          }
      }

      // Default values:
      if (!patch.name) {
        const randomId = () => (Math.random()*0xFFFF<<0).toString(16);
        patch.name = 'untitled-' + randomId() + randomId() + randomId();
      }
      if ('undefined' === typeof patch.inputs) {
        patch.inputs = 0;
      }
      if ('undefined' === typeof patch.outputs) {
        patch.outputs = 0;
      }
      if (!patch.compilationType) {
        patch.compilationType = 'cpp';
      }
      // published
      // github
      // seoName ???
      // downloadCount ???
      // creationTimeUtc ???

      return patch;
    },

    generateSeoName: function(patch) {
        return patch.name.replace(/[^a-z0-9]+/gi, '_');
    },

    throwErrorForMissingRequiredField: function(field) {
        console.log('Error missing required field: ', field);
        const err = {};
        err.message = `Field '${field}' is required.`;
        err.type = 'field_required';
        err.field = field;
        throw err;
    }
};

module.exports = patchModel;

// EOF
