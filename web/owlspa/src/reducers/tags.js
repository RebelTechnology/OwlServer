import { REQUEST_TAGS } from 'constants';
import { RECEIVE_TAGS } from 'constants';

const initialState = {
  isFetching: false,
  items: []
};

const tags = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_TAGS:
      return Object.assign({}, state, {
        isFetching: true
      })
    case RECEIVE_TAGS:
      return Object.assign({}, state, {
        isFetching: false,
        items: action.tags
      })
    default:
      return state
  }
}

export default tags;