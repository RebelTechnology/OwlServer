import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { SubFilterButton } from 'components';
import { togglePatchListSubFilter, resetPatchListSubFilter } from 'actions';

class SubFilter extends Component {
  handleSubFilterClick(e,filter){
    this.props.togglePatchListSubFilter(filter);
  }
  handleAllSubFilterClick(e){
    this.props.resetPatchListSubFilter();
  }
  render(){
    const { authors, tags, patchListFilter: { subFilter }, parentFilter } = this.props;

    const tagFilters = tags.items.map( tagText => {
      return (
        <SubFilterButton 
          isActive={subFilter.indexOf(tagText) !== -1} 
          onClick={(e) => this.handleSubFilterClick(e,tagText)} 
          key={tagText}>
          {tagText}
        </SubFilterButton>
      );
    });

    const authorFilters = authors.items.map( author => {
      return (
        <SubFilterButton 
          isActive={subFilter.indexOf(author.name) !== -1} 
          onClick={(e) => this.handleSubFilterClick(e,author.name)} 
          key={author.name}>
          {author.name}
        </SubFilterButton>
      );
    });
    console.log(subFilter);
    return (
      <div id="filter-bar">
        <div id="filter-wrapper" className="wrapper">
          <SubFilterButton 
            onClick={(e) => this.handleAllSubFilterClick(e)} 
            isActive={subFilter.length === 0} 
            key="All">All</SubFilterButton>
          { (parentFilter === 'authors') && authorFilters }
          { (parentFilter === 'tags') && tagFilters }
        </div>
      </div>
    );
  }
}

function mapStateToProps({ patchListFilter, authors, tags }){
  return {
    patchListFilter,
    authors,
    tags
  }
}

SubFilter.propTypes = {
  parentFilter : PropTypes.string.isRequired
}

export default connect(mapStateToProps, { togglePatchListSubFilter, resetPatchListSubFilter })(SubFilter);