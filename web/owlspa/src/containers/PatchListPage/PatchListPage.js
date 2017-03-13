import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { setPatchListTopFilter, fetchPatchesAuthorsTags, deletePatch, setPatchListSearchTerm } from 'actions';
import { PatchTile , SubFilter } from 'containers';
import { PatchCounter, CreatePatchTile, SearchInput } from 'components';

class PatchListPage extends Component {
  
  componentWillReceiveProps(nextProps){
    if(nextProps.routeParams.topFilter !== this.props.routeParams.topFilter){
      this.props.setPatchListTopFilter(nextProps.routeParams.topFilter);
    }
  }

  filterPatchesByAuthor(patches, subFilter){
    return patches.filter(patch => patch.published)
      .filter(patch => {
        if(subFilter.length === 0){
          return true;
        }
        if(!patch.author || !patch.author.name){
          return false;
        }
        return subFilter.indexOf(patch.author.name) > -1
      });
  }

  filterPatchesByTag(patches, subFilter){
    return patches.filter(patch => patch.published && patch.tags).filter(patch => {
      if (subFilter.length === 0){
        return true;
      }
      return patch.tags.some(tag => {
        return subFilter.indexOf(tag) > -1;
      })
    });
  }

  filterPatchesByCurrentUser(patches, currentUser){
    return patches.filter(patch => {
      if(!patch.author){
        return false;
      }
      return patch.author.name === currentUser.display_name || patch.author.wordpressId === currentUser.ID;
    });
  }

  getPatchPopularity(patch){
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
  }

  sortByPopularity(a, b){
    return this.getPatchPopularity(b) - this.getPatchPopularity(a)
  }

  sortByCreationTime(a, b){
    return b.creationTimeUtc - a.creationTimeUtc;
  }

  getFilteredSortedPatches(patches, patchListFilter, currentUser){
    switch(patchListFilter.topFilter){
      case 'latest':
        return patches.filter(patch => patch.published).sort((a,b) => this.sortByCreationTime(a,b));
      case 'popular':
        return patches.filter(patch => patch.published)
          .sort((a,b) => this.sortByCreationTime(a,b))
          .sort((a,b) => this.sortByPopularity(a,b));
      case 'all':
        return patches.filter(patch => patch.published).sort((a,b) => (a.name).localeCompare(b.name));
      case 'authors':
        return this.filterPatchesByAuthor(patches, patchListFilter.subFilter);
      case 'tags':
        return this.filterPatchesByTag(patches, patchListFilter.subFilter);
      case 'my-patches':
        return this.filterPatchesByCurrentUser(patches, currentUser).sort((a,b) => this.sortByCreationTime(a,b));
      case 'search':
        return patches.filter(patch => patch.published);
      default:
        return patches.filter(patch => patch.published);
    }
  }

  handleOnDeletePatchClick(e, patch){
    e.preventDefault();
    e.stopPropagation();
    this.props.deletePatch(patch);
  }

  handleSearchInputChange(value){
    this.props.setPatchListSearchTerm(value);
  }

  currentUserCanEdit(patch){
    if(!patch){
      return false;
    }
    const { currentUser:user } = this.props;
    const { author } = patch;
    if(author && (user.ID || user.display_name)){
      return author.name === user.display_name || author.wordpressId === user.ID;
    }
    return false;
  }

  render(){
    const { patches, patchListFilter, patchListFilter: { topFilter, searchTerm }, routeParams, currentUser } = this.props;
    const filteredPatches = this.getFilteredSortedPatches(patches.items, patchListFilter, currentUser);
    const patchesToBeRendered = filteredPatches.map( patch => {
      return (
        <PatchTile 
          key={patch._id}
          id={patch._id}
          name={patch.name}
          published={patch.published}
          authorName={patch.author.name}
          description={patch.description}
          tags={patch.tags}
          seoName={patch.seoName}
          canEdit={this.currentUserCanEdit(patch)}
          loggedIn={currentUser.loggedIn}
          onDeletePatchClick={(e) => this.handleOnDeletePatchClick(e, patch)}
        />
      );
    });

    return (
      <div>
        {(topFilter === 'authors' || topFilter === 'tags') ? <SubFilter routeParams={routeParams} /> : null}
        <div className="wrapper flexbox">
          <div className="content-container">
            { topFilter === 'search' && <SearchInput value={searchTerm} onChange={value => this.handleSearchInputChange(value) } /> }
            <PatchCounter patches={filteredPatches} myPatches={topFilter === 'my-patches'} />
            { topFilter === 'my-patches' && <CreatePatchTile /> }
            { patchesToBeRendered }
          </div>
        </div>
      </div>
    );
  }

  componentDidMount(){
    this.props.fetchPatchesAuthorsTags();
    this.props.setPatchListTopFilter(this.props.routeParams.topFilter);
  }

}

PatchListPage.PropTypes = {
  patches : PropTypes.array,
  filter: PropTypes.string
};

function mapStateToProps({ patches, patchListFilter, currentUser }){
  return {
    patches,
    patchListFilter,
    currentUser
  }
}

export default connect(mapStateToProps, {
  setPatchListTopFilter,
  setPatchListSearchTerm,
  fetchPatchesAuthorsTags,
  deletePatch
})(PatchListPage);
