'use strict';

const http = require('http');
const https = require('https');
const crypto = require('crypto');
const url = require('url');
const path = require('path');
const fs = require('fs');
const debug = require('debug')('http');

/**
 * HoxtonOWL API client.
 */
class ApiClient {

  /**
   * Class constructor.
   *
   * @param {string} baseUrl
   * @param {string} apiKey
   */
  constructor(baseUrl, apiKey) {

    const urlParts = url.parse(baseUrl);

    /**
     * The API base URL.
     *
     * @type {Object}
     * @property {string} hostname
     * @property {number} port
     * @property {string} path
     */
    this.baseUrl = {
      host: urlParts.host,
      hostname: urlParts.hostname,
      port: urlParts.port || (urlParts.protocol === 'https:' ? 443 : 80),
      path: urlParts.path !== '/' ? urlParts.path : '',
    };

    /**
     * API protocol.
     *
     * @type {string}
     */
    this.protocol = urlParts.protocol.split(':')[0];

    /**
     * The API key.
     *
     * @type {string}
     */
    this.apiKey = apiKey;

    /**
     * The authentication token.
     *
     * @type {?string}
     */
    this.token = '';
  }

  /**
   * Performs authentication and returns a JSON web token.
   *
   * @return {Promise<string>}
   */
  authenticate() {

    const nonce = this._generateNonce();
    const body = {
      nonce,
      apiKeyHash: crypto.createHash('sha256').update(nonce + this.apiKey).digest('hex')
    };

    return this._request('POST', '/session', body)
      .then(({ res, data }) => {
        if (res.statusCode !== 200) {
          throw new Error(`Error while authenticating (response status = ${res.statusCode}, message = ${data.message}).`);
        }
        this.token = data.token;
      });
  }

  /**
   * Returns all authors.
   *
   * @param {boolean} onlyForPublicPatches
   * @return {Promise<{count: number,result: Array}>}
   */
  getAuthors(onlyForPublicPatches = true) {
    let url = '/authors';
    if (!onlyForPublicPatches) {
      url += '?onlyForPublicPatches=0';
    }
    return this._request('GET', url);
  }

  /**
   * Returns all tags.
   *
   * @param {boolean} onlyForPublicPatches
   * @return {Promise<{count: number,result: Array}>}
   */
  getTags(onlyForPublicPatches = true) {
    let url = '/tags';
    if (!onlyForPublicPatches) {
      url += '?onlyForPublicPatches=0';
    }
    return this._request('GET', url);
  }

  /**
   * Returns all patches.
   *
   * @return {Promise<Array[Patch]>}
   */
  getPatches() {
    return this._request('GET', '/patches');
  }

  /**
   * Returns the specified patch.
   *
   * @param {string} patchId
   * @return {Promise<?Patch>}
   */
  getPatch(patchId) {
    return this._request('GET', `/patch/${patchId}`);
  }

  /**
   * Returns the patch with the specified SEO name.
   *
   * @param {string} seoName
   * @return {Promise<?Patch>}
   */
  getPatchBySeoName(seoName) {
    return this._request('GET', `/patch/?seoName=${seoName}`);
  }

  /**
   * Creates a new patch.
   *
   * @param {Patch} patch
   * @return {Promise}
   */
  newPatch(patch) {
    return this._request('POST', '/patches', { patch });
  }

  /**
   * Uploads one or more source files for the specified patch.
   *
   * @param {string} patchId
   * @param {Array<string>} paths - The files to upload.
   * @return {Promise}
   */
  uploadSourceFiles(patchId, paths) {
    const files = [];
    if (!Array.isArray(paths) || !paths.length) {
      throw new Error('`paths` argument must be a non-empty array.');
    }
    for (let filePath of paths) {
      const fileInfo = {};
      fileInfo.name = path.basename(filePath);
      fileInfo.data = new Buffer(fs.readFileSync(filePath, 'utf8')).toString('base64');
      files.push(fileInfo);
    }
    return this._request('POST', `/patch/${patchId}/sources`, { patchId, files });
  }

  /**
   * Builds a patch.
   *
   * @param {string} patchId
   * @return {Promise}
   */
  buildPatch(patchId) {
    return this._request('PUT', `/builds/${patchId}`);
  }

  /**
   * Downloads a patch.
   *
   * @param {string} patchId
   * @param {string} format
   * @param {fs.WriteStream} writeStream
   */
  downloadPatch(patchId, format, writeStream) {
    return new Promise((resolve, reject) => {
      const transport = { http, https };
      const requestOptions = Object.assign({}, this.baseUrl);
      requestOptions.path +=  `/builds/${patchId}?format=${format}`;
      if (this.protocol === 'https') {
        requestOptions['rejectUnauthorized'] = false; // Allows self-signed SSL certificates
      }
      debug('request: %O', requestOptions);
      transport[this.protocol].get(requestOptions, res => {
        
        /**
         * @type {Array<Buffer>}
         */
        const chunks = [];

        /**
         * Called whenever a new chunk of binary data is received.
         *
         * @param {Buffer} chunk
         */
        const onData = chunk => chunks.push(chunk);

        res.on('data', onData);
        res.on('end', () => {
          const blob = Buffer.concat(chunks);
          if (res.statusCode !== 200) {
            let parsedData;
            try {
              parsedData = JSON.parse(blob.toString('utf8'));
            } catch (err) {
              reject(err);
            }
            reject(parsedData);
          } else {
            resolve(new Promise(resolve2 => {
              writeStream.write(blob, () => resolve2({ data: { success: true, message: 'File downloaded successfully' }}));
            }));
          }
        });
        res.on('error', err => reject(err));
      });
    });
  }

  /**
   * Makes an HTTP(S) request to the HoxtonOWL API.
   *
   * @private
   * @param {string} method
   * @param {string} path
   * @param {?Object} body
   * @return {Promise<{res: IncomingMessage, data: string}>}
   */
  _request(method, path, body) {

    // Prepare request
    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive',
      }
    };
    let encodedBody;
    if (body) {
      encodedBody = JSON.stringify(body);
      requestOptions.headers['Content-Length'] = encodedBody.length;
    }
    if (this.token) {
      requestOptions.headers.Authorization = `Bearer ${this.token}`;
    }
    Object.assign(requestOptions, this.baseUrl);
    requestOptions.path += path;
    if (this.protocol === 'https') {
      Object.assign(requestOptions, { // Allows self-signed SSL certificates
        rejectUnauthorized: false,
      });
    }

    // Make request
    const transport = { http, https };
    debug('request: %O', requestOptions);
    if (body) {
      debug('body: %O', body);
    }
    return new Promise((resolve, reject) => {
      let data = '';
      const req = transport[this.protocol].request(requestOptions, res => {
        res.setEncoding('utf8');
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          let decodedData;
          if (data) {
            try {
              decodedData = JSON.parse(data);
            } catch (e) {
              reject(e);
            }
          }
          if (data) {
            debug('response: %O', decodedData);
          }
          resolve({ res, data: data ? decodedData : null });
        });
      });
      req.on('error', err => reject(err));
      if (body) {
        req.write(encodedBody);
      }
      req.end();
    });
  }

  /**
   * This method will returns a long random string every time it is invoked.
   *
   * @private
   * @return {string}
   */
  _generateNonce() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = ApiClient;
