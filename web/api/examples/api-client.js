'use strict';

const http = require('http');
const https = require('https');
const crypto = require('crypto');
const url = require('url');

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
      path: urlParts.path,
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
      url += '?onlyForPublicPatches=0'
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
      url += '?onlyForPublicPatches=0'
    }
    return this._request('GET', url);
  }

  /**
   * Returns all patches.
   *
   * @return {Promise<Array[Patch]>}
   */
  getPatches() {
    return this._request('GET', '/patches')
  }

  /**
   * Returns the specified patch.
   *
   * @param {string} patchId
   * @return {Promise<Patch>}
   */
  getPatch(patchId) {
    return this._request('GET', `/patch/${patchId}`);
  }

  /**
   * Creates a new patch.
   *
   * @param {Patch} patch
   * @return {Promise}
   */
  newPatch(patch) {
    return this._request('POST', '/patches', patch);
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
    return new Promise((resolve, reject) => {
      let data = '';
      const req = transport[this.protocol].request(requestOptions, res => {
        // console.log('statusCode:', res.statusCode);
        // console.log('headers:', res.headers);
        res.setEncoding('utf8');
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ res, data: data ? JSON.parse(data) : data }));
      });
      req.on('error', e => reject(e));
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
