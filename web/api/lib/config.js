'use strict';

const joi = require('joi');

[
  'NODE_ENV',
  'API_PORT',
  'MONGO_CONNECTION_STRING',
  'MONGO_COLLECTION',
  'JWT_SECRET',
  'API_KEY',
  'PATCH_UPLOAD_SECRET',
  'WORDPRESS_HOSTNAME',
  'WORDPRESS_XML_RPC_USERNAME',
  'WORDPRESS_XML_RPC_PASSWORD',
  'PATCH_SOURCE_URL_FRAGMENT',
  'PATCH_BUILDER_PATH',
  'SYSEX_PATH',
  'JS_PATH',
  'JS_BUILD_TYPE',
].forEach(name => {
  if (!process.env[name]) {
    throw new Error(`Environment variable ${name} is missing!`);
  }
});

const config = {
  env: process.env.NODE_ENV,
  api: {
    port: process.env.API_PORT,
    key: process.env.API_KEY,
    jwtSecret: process.env.JWT_SECRET,
  },
  mongo: {
    connectionString: process.env.MONGO_CONNECTION_STRING,
    collection: process.env.MONGO_COLLECTION,
  },
  wordpress: {
    hostname: process.env.WORDPRESS_HOSTNAME,
    patchUploadSecret: process.env.PATCH_UPLOAD_SECRET,
    xmlRpc: {
      username: process.env.WORDPRESS_XML_RPC_USERNAME,
      password: process.env.WORDPRESS_XML_RPC_PASSWORD,
    },
    patchSourceUrlFragment: process.env.PATCH_SOURCE_URL_FRAGMENT,
  },
  patchBuilder: {
    path: process.env.PATCH_BUILDER_PATH,
    sysexPath: process.env.SYSEX_PATH,
    jsPath: process.env.JS_PATH,
    jsBuildType: process.env.JS_BUILD_TYPE,
  }
};

const configSchema = joi.object().keys({
  env: joi.string().valid([ 'staging', 'production' ]).required(),
  api: joi.object().keys({
    port: joi.number().min(1024).max(65535).required(),
    key: joi.string().required(),
    jwtSecret: joi.string().required(),
  }).required(),
  mongo: joi.object().keys({
    connectionString: joi.string().required(),
    collection: joi.string().required(),
  }),
  wordpress: joi.object().keys({
    hostname: joi.string().required(),
    patchUploadSecret: joi.string().required(),
    xmlRpc: joi.object().keys({
      username: joi.string().required(),
      password: joi.string().required(),
    }),
    patchSourceUrlFragment: joi.string().required(),
  }),
  patchBuilder: joi.object().keys({
    path: joi.string().required(),
    sysexPath: joi.string().required(),
    jsPath: joi.string().required(),
    jsBuildType: joi.string().valid([ 'min', 'js' ]).required(),
  }).required(),
});

// Validate configuration
joi.validate(config, configSchema, err => {
  if (err) {
    throw err;
  }
});

module.exports = config;
