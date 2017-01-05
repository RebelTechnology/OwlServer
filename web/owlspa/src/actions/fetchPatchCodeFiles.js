
import { parseUrl } from 'utils';
import {
  REQUEST_PATCH_CODE_FILE,
  RECEIVE_PATCH_CODE_FILE,
  REQUEST_PATCH_CODE_FILE_FAILED
} from 'constants';

const isHoxtonOwlFile = (fileUrl) => {
  if(!fileUrl){
    return false;
  }
  return parseUrl(fileUrl).authority.indexOf('hoxtonowl.com') > -1;
};

const isGithubFile = (fileUrl) => {
  if(!fileUrl){
    return false;
  }
  return parseUrl(fileUrl).authority.indexOf('github.com') > -1;
};

const fetchHoxtonFile = (fileUrl) => {
  if(!fileUrl){
    throw new error('no file url specified');
  }
  return fetch(parseUrl(fileUrl).path, {method:'GET'})
    .then(response => {
      if(response.status >= 400){
        throw new Error(response.statusText + ' ' + fileUrl);
      } else {
        return response.text();
      }
    });
};

/* 
* constructGithubApiFileUrl
*
* input:
* https://github.com/pingdynasty/OwlPatches/blob/master/Contest/ConnyPatch.hpp
*                   [---owner---][--repo---]    [branch][------file path------]
* output:
* https://api.github.com/repos/pingdynasty/OwlPatches/contents/Contest/ConnyPatch.hpp?ref=master
*                             [---owner---][--repo--]         [-------file path------]   [branch]
*/

const constructGithubApiFileUrl = (fileUrl) => {
  const fragments = parseUrl(fileUrl).path.split('/');
  const owner = fragments[1];
  const repo = fragments[2];
  const filePath = fragments.slice(5).join('/');
  const branch = fragments[4];
  return `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
};

const fetchGithubFile = (fileUrl) => {
  if(!fileUrl){
    throw new error('no file url specified');
  }
  return fetch(constructGithubApiFileUrl(fileUrl), {method:'GET', mode:'cors'})
    .then(response => {
      if(response.status >= 400){
        throw new Error(response.statusText + ' ' + url);
      } else {
        return response.json();
      }
    });
};

const decodeBase64AndRemoveNewLines = (base64) => {
  return window.atob(base64.replace(/\n/g, ''));
};

const fetchPatchCodeFiles = (fileUrls, patchId) => {
  return (dispatch) => {

    fileUrls.forEach((fileUrl, index) => {

      if( !fileUrl || (!isHoxtonOwlFile(fileUrl) && !isGithubFile(fileUrl)) ){
        dispatch({
          type: REQUEST_PATCH_CODE_FILE_FAILED,
          patchId,
          index,
          reason:'file url error'
        });
        return;
      }

      if(isHoxtonOwlFile(fileUrl)){
        dispatch({
          type: REQUEST_PATCH_CODE_FILE,
          patchId,
          index
        });
        fetchHoxtonFile(fileUrl).then( text => {
          dispatch({
            type: RECEIVE_PATCH_CODE_FILE,
            patchId,
            index,
            fileString: text,
            fileUrl
          });
        }).catch( err => {
          console.error(err);
          dispatch({
            type: REQUEST_PATCH_CODE_FILE_FAILED,
            patchId,
            index,
            reason:'// Could not fetch file.'
          });
        });
      }
      if(isGithubFile(fileUrl)){
        dispatch({
          type: REQUEST_PATCH_CODE_FILE,
          patchId,
          index
        });
        fetchGithubFile(fileUrl).then( json => {
          if(json.content && json.encoding === 'base64'){
            dispatch({
              type: RECEIVE_PATCH_CODE_FILE,
              patchId,
              index,
              fileString: decodeBase64AndRemoveNewLines(json.content),
              fileUrl
            });
          } else {
            dispatch({
              type: REQUEST_PATCH_CODE_FILE_FAILED,
              patchId,
              index,
              reason:'// This file could not be fetched. Is it from a public GitHub repository?'
            });
          }
        }).catch( err => {
          console.error(err);
          dispatch({
            type: REQUEST_PATCH_CODE_FILE_FAILED,
            patchId,
            index,
            reason:'// Could not fetch file.'
          });
        });
      }
    });

  }
}

export default fetchPatchCodeFiles;