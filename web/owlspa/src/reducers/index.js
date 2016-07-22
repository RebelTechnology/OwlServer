import { combineReducers } from 'redux';
import thunk from 'redux-thunk';
import patches from './patches';
import dialog from './dialog';
import tags from './tags';
import authors from './authors';
import patchListFilter from './patchListFilter';
import currentUser from './currentUser';
import patchDetails from './patchDetails';
import patchJavaScript from './patchJavaScript';
import webAudioPatchParameters from './webAudioPatchParameters';
import webAudioPatch from './webAudioPatch';
import patchPlaying from './patchPlaying';
import patchCodeFiles from './patchCodeFiles';

const rootReducer = combineReducers({
  authors,
  dialog,
  patches,
  patchListFilter,
  patchDetails,
  tags,
  currentUser,
  patchJavaScript,
  webAudioPatchParameters,
  webAudioPatch,
  patchPlaying,
  patchCodeFiles
});

export default rootReducer;