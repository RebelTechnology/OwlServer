import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import customHistory from '../../customHistory';
import { setPatchListTopFilter, fetchPatchesAuthorsTags, deletePatch, setPatchListSearchTerm } from 'actions';
import { PatchTile , SubFilter, SearchInput } from 'containers';
import { PatchCounter, CreatePatchTile } from 'components';
import { getFilteredSortedPatches } from './selectors';

class PatchListPage extends Component {

  componentWillReceiveProps(nextProps){
    if(nextProps.routeParams.topFilter === 'my-patches' && nextProps.currentUser.loggedIn === false){
      customHistory.push('/login');
    }


    if(nextProps.routeParams.topFilter !== this.props.routeParams.topFilter){
      this.props.setPatchListTopFilter(nextProps.routeParams.topFilter);
    }
  }

  currentUserCanEdit(patch){
    if(!patch){
      return false;
    }
    const { currentUser: user } = this.props;
    const { author } = patch;
    if(author && (user.ID || user.display_name)){
      return author.name === user.display_name || author.wordpressId === user.ID;
    }
    return false;
  }

  render(){
    const { filteredSortedPatches, patchListFilter: { topFilter }, routeParams, currentUser } = this.props;
    const patchesToBeRendered = filteredSortedPatches.map( patch => {
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
          loggedIn={currentUser.loggedIn}
        />
      );
    });

    return (
      <div>
        {(topFilter === 'authors' || topFilter === 'tags') ? <SubFilter routeParams={routeParams} /> : null}
        <div className="wrapper flexbox" style={{minHeight: 'calc(100vh - 137px)'}}>
          <div className="content-container">
            { topFilter === 'search' && <SearchInput /> }
            <PatchCounter patches={filteredSortedPatches} myPatches={topFilter === 'my-patches'} />
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

const mapStateToProps = state => {
  const { patchListFilter, currentUser } = state;
  return {
    patchListFilter,
    currentUser,
    filteredSortedPatches: getFilteredSortedPatches(state)
  }
};

export default connect(mapStateToProps, {
  setPatchListTopFilter,
  setPatchListSearchTerm,
  fetchPatchesAuthorsTags,
  deletePatch
})(PatchListPage);
