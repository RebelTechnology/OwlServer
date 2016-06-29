import { combineReducers } from 'redux';
import thunk from 'redux-thunk';
import patches from './patches';

const rootReducer = combineReducers({
    patches
});

export default rootReducer;