import { combineReducers } from 'redux';

import authors from './authors';
import currentUser from './currentUser';
import dialog from './dialog';
import editPatchForm from './editPatchForm';
import owlState from './owlState';
import patchSourceCodeFiles from './patchSourceCodeFiles';
import patchDetails from './patchDetails';
import patches from './patches';
import patchJavaScript from './patchJavaScript';
import patchListFilter from './patchListFilter';
import patchListSearch from './patchListSearch';
import patchPlaying from './patchPlaying';
import tags from './tags';
import thunk from 'redux-thunk';
import webAudioPatch from './webAudioPatch';
import webAudioPatchParameters from './webAudioPatchParameters';

const reducers = combineReducers({
  authors,
  currentUser,
  dialog,
  editPatchForm,
  owlState,
  patches,
  patchListFilter,
  patchListSearch,
  patchDetails,
  patchJavaScript,
  patchPlaying,
  patchSourceCodeFiles,
  tags,
  webAudioPatch,
  webAudioPatchParameters
});

export default reducers;
