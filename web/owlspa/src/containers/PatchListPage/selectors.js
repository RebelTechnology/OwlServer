import { createSelector } from 'reselect';

const getPatches = state => state.patches.items;
const getTopFilter = state => state.patchListFilter.topFilter;
const getCurrentUser = state => state.currentUser;
const getSelectedAuthors = state => state.patchListFilter.subFilter;
const getSelectedTags = state => state.patchListFilter.subFilter;
const getSearchTerm =  state => state.patchListSearch.searchTerm;

const getPatchesByAuthors = createSelector([ getPatches, getSelectedAuthors ],(patches, selectedAuthors) => {
  return patches.filter(patch => patch.published)
    .filter(patch => {
      if(selectedAuthors.length === 0){
        return true;
      }
      if(!patch.author || !patch.author.name){
        return false;
      }
      return selectedAuthors.indexOf(patch.author.name) > -1
    });
});

const getPatchesByTags = createSelector([ getPatches, getSelectedTags ],(patches, selectedTags) => {
  return patches.filter(patch => patch.published && patch.tags).filter(patch => {
    if (selectedTags.length === 0){
      return true;
    }
    return patch.tags.some(tag => {
      return selectedTags.indexOf(tag) > -1;
    })
  });
});

const getPatchesByCurrentUser = createSelector([ getPatches, getCurrentUser ],(patches, currentUser) => {
  return patches.filter(patch => {
    if(!patch.author){
      return false;
    }
    return patch.author.name === currentUser.display_name || patch.author.wordpressId === currentUser.ID;
  });
});

const getPatchPopularity = patch => {
  const weighting = {
    downloadCount: 4,
    downloadToOwl: 2,
    browserPlays: 1,
    starCount: 20
  };

  let patchCopy = { ...patch };
  patchCopy.starCount = (patchCopy.starList && patchCopy.starList.length) || 0;

  return Object.keys(weighting).reduce((acc, key) => {
    return acc + ((patchCopy[key] || 0 ) * weighting[key]);
  }, 0);
};

const sortByPopularity = (patchA, patchB) => {
  return getPatchPopularity(patchB) - getPatchPopularity(patchA);
};

const sortByCreationTime = (a, b) => {
  return b.creationTimeUtc - a.creationTimeUtc;
};

const sortByAuthorName = (a, b) => {
  return (a.name).localeCompare(b.name);
};

const getPublicPatches = createSelector([ getPatches ], patches => {
  return patches.filter(patch => patch.published);
});

const stringContains = (stringA, stringB) => {
  return stringA.toLowerCase().indexOf(stringB.toLowerCase()) > -1;
};

const ArrContainSearchTerm = (stringsArr, searchTerm) => {
  if(!searchTerm) { return false; }
  return stringsArr.some(string => {
    if(!string) { return false; }
    return stringContains(string, searchTerm);
  });
};

const getPatchesBySearchTerm = createSelector([ getPublicPatches, getSearchTerm ],(patches, searchTerm) => {
  return patches.filter(patch => {
    const { name, description, author, tags } = patch;
    const searchArray = [name, description, author.name].concat(tags);
    return ArrContainSearchTerm(searchArray, searchTerm);
  });
});

export const getFilteredSortedPatches = createSelector([ 
  getPublicPatches,
  getTopFilter,
  getPatchesByAuthors,
  getPatchesByTags,
  getPatchesByCurrentUser,
  getPatchesBySearchTerm
], (
  publicPatches,
  topFilter,
  patchesByAuthors,
  patchesByTags,
  patchesByCurrentUser,
  patchesBySearchTerm
) => {
  switch(topFilter){
    case 'latest':
      return publicPatches.sort(sortByCreationTime);
    case 'popular':
      return publicPatches.sort(sortByCreationTime).sort(sortByPopularity);
    case 'all':
      return publicPatches.sort(sortByAuthorName);
    case 'authors':
      return patchesByAuthors;
    case 'tags':
      return patchesByTags;
    case 'my-patches':
      return patchesByCurrentUser.sort(sortByCreationTime);
    case 'search':
      return patchesBySearchTerm;
    default:
      return publicPatches;
  }
});
