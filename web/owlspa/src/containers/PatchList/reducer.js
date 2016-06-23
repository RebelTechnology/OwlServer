import { LIST_ALL_PATCHES } from './constants';

const initialState = [1,2,3,4];
function patches(state = initialState, action) {
  switch (action.type) {
    case LIST_ALL_PATCHES:
      return state
    default:
      return state;
  }
}

export default patches;