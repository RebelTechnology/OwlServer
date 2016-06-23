import { combineReducers } from 'redux';
import patches from './containers/PatchList/reducer';

const rootReducer = combineReducers({
    patches
});

export default rootReducer;