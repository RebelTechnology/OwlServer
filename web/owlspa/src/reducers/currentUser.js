import { REQUEST_CURRENT_USER } from 'constants';
import { RECEIVE_CURRENT_USER } from 'constants';

const initialState = {
  isFetching: false
};

const currentUser = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_CURRENT_USER:
      return Object.assign({}, state, {
        isFetching: true
      })
    case RECEIVE_CURRENT_USER:
      return Object.assign({}, state, {
        isFetching: false,
        ...action.user
      })
    default:
      return state
  }
}

export default currentUser;