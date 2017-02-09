'use strict';

const wordpress = require('wordpress');
const request = require('request');

const config = require('./config');

const client = wordpress.createClient({
  url: config.wordpress.hostname,
  username: config.wordpress.xmlRpc.username,
  password: config.wordpress.xmlRpc.password,
});

/**
 * Tries to validate a user cookie.
 *
 * @param {string} cookie
 * @return {Promise<string,Error>}
 */
const validateAuthCookie = cookie => {
  return new Promise((resolve, reject) => {
    client.call('owl.validateAuthCookie', cookie, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Returns information about a WP user.
 *
 * @param {string} username
 * @return {Promise<Object,Error>}
 */
const getUserInfo = username => {
  return new Promise((resolve, reject) => {
    client.call('owl.getUserInfo', username, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Returns information about the WP users identified by the given user IDs.
 *
 * @param {Array} userIds
 * @return {Promise<Array<Object>,Error>}
 */
const getUserInfoBatch = userIds => {
  return new Promise((resolve, reject) => {
    client.call('owl.getUserInfoBatch', userIds, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Uploads one or more source files for the specified patch.
 *
 * Unlike the other methods above, this one doesn't use the `wordpress` client,
 * because it doesn't support file uploads. So this code is more "low-level"
 * than the code above and overrides the WordPress XML-RPC client completely.
 *
 * @param {string} patchId
 * @param {Array<Object<string,string>>} files - An array of objects, each with a `name` and `data`
 *                                               string property, containing respectively the name
 *                                               of each file to upload and a base64 encoded repre-
 *                                               sentation of its content.
 * @return {Promise}
 */
const uploadSources = (patchId, files) => {

  const requestOptions = {
    url: `https://${config.wordpress.hostname}/wp-admin/admin-ajax.php`,
    rejectUnauthorized: config.env === 'production', // if `false`, will allow self-signed SSL certificates
    formData: {
      patchId: patchId,
      action: 'owl-patch-file-upload',
      secret: config.wordpress.patchUploadSecret,
    }
  };

  files.forEach((file, i) => {
    // Apparently 'files[x]' is the format that PHP likes when it comes to
    // upload multiple files, so we abide by it.
    requestOptions.formData[`files[${i}]`] = {
      value: Buffer.from(file.data, 'base64'),
      options: { filename: file.name },
    };
  });

  return new Promise((resolve, reject) => {
    request.post(requestOptions, (err, httpResponse, body) => {
      if (err) {
        const err = new Error('File upload failed.');
        err.public = true;
        reject(err);
      }
      let decodedBody;
      try {
        decodedBody = JSON.parse(body);
      } catch (e) {
        reject(new Error());
      }
      resolve(decodedBody);
    });
  });
};

module.exports = {
  validateAuthCookie,
  getUserInfo,
  getUserInfoBatch,
  uploadSources,
};
