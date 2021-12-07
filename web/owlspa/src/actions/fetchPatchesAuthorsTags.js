import {
  fetchPatches, fetchAuthors, fetchTags
} from 'actions';

const fetchPatchesAuthorsTags = () => {
  return (dispatch, getState) => {
    return Promise.all([
      dispatch(fetchPatches()),
      dispatch(fetchAuthors()),
      dispatch(fetchTags())
    ]).then(() => {
      dispatch({
        type: 'RECEIVE_PATCHES_AUTHORS_TAGS',
        state: getState()
      });
    },
    (err) => {
      console.error(err);
    })
  }
}

export default fetchPatchesAuthorsTags;
