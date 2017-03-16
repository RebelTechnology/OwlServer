import { combineReducers } from 'redux';
import authors from './authors';
import currentUser from './currentUser';
import dialog from './dialog';
import editPatchForm from './editPatchForm';
import owlState from './owlState';
import patchCodeFiles from './patchCodeFiles';
import patchDetails from './patchDetails';
import patchDetailsEditMode from './patchDetailsEditMode';
import patches from './patches';
import patchJavaScript from './patchJavaScript';
import patchListFilter from './patchListFilter';
import patchListSearch from './patchListSearch';
import patchPlaying from './patchPlaying';
import tags from './tags';
import thunk from 'redux-thunk';
import webAudioPatch from './webAudioPatch';
import webAudioPatchParameters from './webAudioPatchParameters';

const rootReducer = combineReducers({
  authors,
  currentUser,
  dialog,
  editPatchForm,
  owlState,
  patches,
  patchListFilter,
  patchListSearch,
  patchDetails,
  patchDetailsEditMode,
  patchJavaScript,
  patchPlaying,
  patchCodeFiles,
  tags,
  webAudioPatch,
  webAudioPatchParameters
});

export default rootReducer;