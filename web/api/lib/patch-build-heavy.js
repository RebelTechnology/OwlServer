'use strict';

const path = require('path');
const fs = require('fs');
const del = require('del');
const mkdirp = require('mkdirp');
const { exec } = require('child-process-promise');
const request = require('request');
const config = require('./config');

const {
  wordpress: {
    patchFilesSourcePath
  },
  patchBuilder : {
    buildSourcePath,
    buildTempPath,
    cPath,
  } = {}
} = config;

const parseUrl = (urlString) => {
  const urlRegex = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
  const result = urlRegex.exec(urlString)
  return {
    scheme: result[2],
    authority: result[4],
    path: result[5],
    query: result[7],
    fragment: result[9]
  }
};

const removeAndCreateBuildDirs = patch => {
  const patchDir = `/${patch._id}/`;
  const buildDirPaths = [buildSourcePath, buildTempPath, cPath].map( path => path + patchDir);

  del.sync(buildDirPaths, { force: true });
  buildDirPaths.forEach(path => {
    mkdirp.sync(path);
    fs.chmodSync(path, 0o755);
  });

};

const constructGithubApiFileUrl = (fileUrl) => {
  const fragments = parseUrl(fileUrl).path.split('/');
  const owner = fragments[1];
  const repo = fragments[2];
  const filePath = fragments.slice(5).join('/');
  const branch = fragments[4];
  return `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
};

const fetchPatchSourceFileAndWriteToSrcDir = (url, patch) => {
  return new Promise(( resolve, reject ) => {
    if(!url){
      return reject('missing file url');
    }

    const urlSections = url.split('/');
    const filename = urlSections[urlSections.length - 1].split('?')[0];
    const filePath = `${buildSourcePath}/${patch._id}/${filename}`;

    request.get({ url, headers:{ 'User-Agent': 'OwlServer'}, encoding: 'utf8', json: true }, (err, response, body) => {

      if(err){
        return reject(`failed to fetch a patch source file: ${filename} at ${url}`);
      }

      fs.writeFile(filePath, body.content, 'base64',  (err) => {
        if(err){
          return reject('failed to write source file');
        }
        resolve();
      });
    });

  })
};

const isAHostedFile = fileUrl => {
  return fileUrl.indexOf('https://www.rebeltech.org') === 0 ||
    fileUrl.indexOf('https://dev.rebeltech.org') === 0 ||
    fileUrl.indexOf('http://staging.hoxtonowl.com') === 0;
};

const isAGitHubFile = fileUlr => {
  return fileUlr.indexOf('://github.com') > -1 || fileUlr.indexOf('://www.github.com') > -1;
};

const getFilename = fileUrl => {
  if(!fileUrl){
    return;
  }

  const urlSections = fileUrl.split('/');
  const filename = urlSections[urlSections.length - 1].split('?')[0];
  return filename;
}

const copyFile = (source, target) => {
  return new Promise(function(resolve, reject) {
    if(!source || !target){
      return reject('missing source or target paths for copy');
    }

    const readStream = fs.createReadStream(source);
    const writeStream = fs.createWriteStream(target, { mode: 0o664 });
    readStream.on('error', reject);
    writeStream.on('error', reject);
    writeStream.on('finish', resolve);
    readStream.pipe(writeStream);
  });
}

const getPatchSourceFilesAndCopyToBuilSrcDir = patch => {
  return new Promise((resolve, reject) => {

    const actionPromises = [];

    patch.github.forEach(sourceFileUrl => {
      process.stdout.write(`copying source file ${sourceFileUrl}\n`);

      if(isAGitHubFile(sourceFileUrl)){

        const fileUrl = constructGithubApiFileUrl(sourceFileUrl)
        actionPromises.push(fetchPatchSourceFileAndWriteToSrcDir(fileUrl, patch));

      } else if(isAHostedFile(sourceFileUrl)){

        const urlSections = sourceFileUrl.split('/');
        const filename = urlSections[urlSections.length - 1];
        const fileDir = urlSections[urlSections.length - 2];
        const sourcePath = `${patchFilesSourcePath}/${fileDir}/${filename}`;
        const targetPath = `${buildSourcePath}/${patch._id}/${filename}`;
        actionPromises.push(copyFile(sourcePath, targetPath));
      }

    });

    resolve(Promise.all(actionPromises));
  });
};

const getHeavyBuildSciptParametersStringFromPatch = parameters => {
  return parameters.map(({id, name, io, type}) => `PAR_${id}_NAME="${name}" PAR_${id}_TYPE="${type}" PAR_${id}_IO="${io}"`).join(' ');
};

const buildHeavy = (patch) => {

  return new Promise(( resolve, reject ) => {

    if(!patch){
      return reject('missing patch');
    }

    if(!patch._id){
      return reject('missing patch id');
    }

    if(!buildSourcePath || !buildTempPath || !cPath){
      return reject('missing one or more environment variable build paths');
    }

    if(!patch.github || !patch.github.length){
      return reject('patch has no files to compile');
    }

    removeAndCreateBuildDirs(patch);
    // TODO check if source files have changed rather than re-creating these dirs

    const copyFilesAndRunBuildPromise = getPatchSourceFilesAndCopyToBuilSrcDir(patch).then(() => {

      const sourceDir = `${buildSourcePath}/${patch._id}`;
      const buildDir = `${buildTempPath}/${patch._id}`;
      const mainFilename = getFilename(patch.github[0]);
      const parametersString = getHeavyBuildSciptParametersStringFromPatch(patch.parameters);

      const cmdVars = `PATCHNAME="${patch.name}" PATCH_SEO_NAME="${patch.seoName}" SOURCE_DIR="${sourceDir}" BUILD_DIR="${buildDir}" TARGET_DIR="${cPath}" MAIN_FILENAME="${mainFilename}" ${parametersString}`;
      const cmd = `${cmdVars} sh ${config.patchBuilder.heavyBuildScriptPath}`;

      process.stdout.write(`executing command: ${cmd} \n`);

      return exec(cmd)
        .then( ({ stdout, stderr }) => {
          return {
            success: true,
            stdout,
            stderr
          };
        })
        .catch( ({ stdout, stderr }) => {
          return {
            success: false,
            stdout,
            stderr
          };
        });
    });

    resolve(copyFilesAndRunBuildPromise);

  });

};

module.exports = {
  buildHeavy
};
