import { 
  REQUEST_PATCHES,
  RECEIVE_PATCHES,
  RECEIVE_PATCHES_AUTHORS_TAGS,
  PATCH_DELETED } from 'constants';


const initialState = {
  isFetching: false,
  items: []
};

// patches should be fixed in the db on the server to avoid this.
const addMissingAuthorNamesToPatches = ({patches, authors}) => {
  return patches.items.map(patch => {
    if(patch.author && patch.author.wordpressId && !patch.author.name){
      authors.items.some(author => {
        if(author.wordpressId === patch.author.wordpressId){
          patch.author.name = author.name;
          return true;
        }
        return false;
      });
    }
    return patch;
  })
}

const patches = (state = initialState, action) => {
  switch (action.type) {
    case REQUEST_PATCHES:
      return {
        ...state,
        isFetching: true
      }
    case RECEIVE_PATCHES:
      return {
        ...state,
        isFetching: false,
        items: action.patches
      }
    case RECEIVE_PATCHES_AUTHORS_TAGS:
      return {
        ...state,
        items: addMissingAuthorNamesToPatches(action.state)
      }
    case PATCH_DELETED:
      return {
        ...state,
        items: state.items.filter( patch => {
          return patch.seoName !== action.patchSeoName;
        })
      }
    default:
      return state
  }
}

export default patches;