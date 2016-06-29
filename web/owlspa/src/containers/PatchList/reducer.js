import { REQUEST_PATCHES } from 'constants';
import { RECEIVE_PATCHES } from 'constants';
//import { LIST_ALL_PATCHES } from './constants';

// const initialState = [1,2,3,4];
// function patches(state = initialState, action) {
//   switch (action.type) {
//     case LIST_ALL_PATCHES:
//       return state
//     default:
//       return state;
//   }
// }

const initialState = {
  isFetching: false,
  items: []
};

const patches = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_PATCHES:
      return Object.assign({}, state, {
        isFetching: true
      })
    case RECEIVE_PATCHES:
      return Object.assign({}, state, {
        isFetching: false,
        items: action.patches
      })
    default:
      return state
  }
}

export default patches;