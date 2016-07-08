import { combineReducers } from 'redux';
import thunk from 'redux-thunk';
import patches from './patches';
import tags from './tags';
import authors from './authors';
import patchListFilter from './patchListFilter';
import currentUser from './currentUser';
import patchDetails from './patchDetails';
import patchJavaScript from './patchJavaScript';
import webAudioPatchParameters from './webAudioPatchParameters';

const rootReducer = combineReducers({
  authors,
  patches,
  patchListFilter,
  patchDetails,
  tags,
  currentUser,
  patchJavaScript,
  webAudioPatchParameters
});

export default rootReducer;