import { createSelector } from 'reselect';

const getPatches = state => state.patches.items;
const getTopFilter = state => state.patchListFilter.topFilter;
const getCurrentUser = state => state.currentUser;
const getSubFilter = state => state.patchListFilter.subFilter;
const getSearchTerm =  state => state.patchListSearch.searchTerm;

const getPublicPatches = createSelector([ getPatches ], patches => {
  return patches.filter(patch => patch.published);
});

const getPatchesBySubFilter = createSelector([ getTopFilter, getPublicPatches, getSubFilter ],(topFilter, patches, subFilter) => {
  return patches.filter(patch => {
    if(subFilter.length === 0){
      return true;
    }
    switch(topFilter){
      case 'authors':
        return !!patch.author && !!patch.author.name && subFilter.indexOf(patch.author.name) > -1;
      case 'tags':
        return !!patch.tags && patch.tags.some(tag => subFilter.indexOf(tag) > -1);
      default:
        return false;
    }
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

const getPatchesByCurrentUserSortByTime = createSelector([ getPatchesByCurrentUser ], patches => {
  return patches.slice().sort(sortByCreationTime);
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

const getPublicPatchesSortByTime = createSelector([ getPublicPatches ], publicPatches => {
  return publicPatches.slice().sort(sortByCreationTime);
});

const getPublicPatchesSortByPopularityAndTime = createSelector([ getPublicPatchesSortByTime ], patches => {
  return patches.slice().sort(sortByPopularity);
});

const getPublicPatchesSortByAuthor = createSelector([ getPublicPatches ], publicPatches => {
  return publicPatches.slice().sort(sortByAuthorName);
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
  getTopFilter,
  getPublicPatchesSortByTime,
  getPublicPatchesSortByAuthor,
  getPublicPatchesSortByPopularityAndTime,
  getPatchesBySubFilter,
  getPatchesByCurrentUserSortByTime,
  getPatchesBySearchTerm,
], (
  topFilter,
  publicPatchesSortByTime,
  publicPatchesSortByAuthor,
  publicPatchesSortByPopularityAndTime,
  patchesBySubFilter,
  patchesByCurrentUserSortByTime,
  patchesBySearchTerm
) => {
  switch(topFilter){
    case 'latest':
      return publicPatchesSortByTime;
    case 'popular':
      return publicPatchesSortByPopularityAndTime;
    case 'all':
      return publicPatchesSortByAuthor;
    case 'authors':
      return patchesBySubFilter;
    case 'tags':
      return patchesBySubFilter;
    case 'my-patches':
      return patchesByCurrentUserSortByTime;
    case 'search':
      return patchesBySearchTerm;
    default:
      return publicPatchesSortByTime;
  }
});
