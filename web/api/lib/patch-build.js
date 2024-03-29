'use strict';

const path = require('path');
const fs = require('fs');

const config = require('./config');

/**
 * Returns information about available builds.
 *
 * @param {Patch} patch
 * @return {Object}
 */
const getInfo = patch => {

  const result = {
    sysExAvailable: false,
    jsAvailable: false,
    cAvailable: false
  };

  // Get patch SysEx build
  const sysexFile = path.join(config.patchBuilder.sysexPath, patch['seoName'] + '.syx');
  if (fs.existsSync(sysexFile)) {
    result['sysExAvailable'] = true;
    result['sysExLastUpdated'] = fs.statSync(sysexFile).mtime;
  }

  // Get patch JS build
  const jsFile = path.join(config.patchBuilder.jsPath, patch['seoName'] + (config.patchBuilder.jsBuildType === 'min' ? '.min' : '') + '.js');
  if (fs.existsSync(jsFile)) {
    result['jsAvailable'] = true;
    result['jsLastUpdated'] = fs.statSync(jsFile).mtime;
  }

  // check if C build exists
  const cFilePath = path.join(config.patchBuilder.cPath, `${patch._id}/${patch.seoName}.zip`);
  if (fs.existsSync(cFilePath)) {
    result.cAvailable = true;
    result.cLastUpdated = fs.statSync(cFilePath).mtime;
  }

  return result;
};

/**
 * Downloads a patch build.
 *
 * @param {Patch} patch
 * @param {PatchModel} patchModel
 * @param {boolean} stream
 * @param {string} format
 * @param {Response} res - Express Response object.
 * @return {Response}
 */
const download = (patch, patchModel, stream, format, res) => {

  // Check if build is available
  let buildFile;
  let filename;

  if (format === 'sysex') {
    buildFile = path.join(config.patchBuilder.sysexPath, patch.seoName + '.syx');
  } else if (format === 'js') {
    buildFile = path.join(config.patchBuilder.jsPath, patch.seoName + (config.patchBuilder.jsBuildType === 'min' ? '.min' : '') + '.js');
  } else if(format === 'c'){
    buildFile = path.join(config.patchBuilder.cPath, `${patch._id}/${patch.seoName}.zip`);
  }
  if (!fs.existsSync(buildFile)) { // FIXME - Move this somewhere else
    throw {
      status: 404,
      public: true,
      message: 'Build file not available for this patch (in ' + format + ' format).'
    };
  }

  // Download file
  filename = path.basename(buildFile);
  if (!stream) {
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  }
  if(!stream && format === 'sysex') {
    // increment download count for sysex files
    patchModel.incrementDownloadCount(patch._id);
  }
  
  res.setHeader('Content-length', fs.statSync(buildFile)['size']); // FIXME - Move this somewhere else
  
  if (format === 'sysex') {
    res.setHeader('Content-type', 'application/octet-stream');
  } else if (format === 'js') {
    res.setHeader('Content-type', 'text/javascript');
  } else if (format === 'c'){
    res.setHeader('Content-type', 'application/zip');
  }
  const filestream = fs.createReadStream(buildFile);
  return filestream.pipe(res);
};

module.exports = {
  getInfo,
  download,
};
