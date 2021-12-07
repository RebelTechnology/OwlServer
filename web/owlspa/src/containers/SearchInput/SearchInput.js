import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { setPatchListSearchTerm } from 'actions';
import CSSModules from 'react-css-modules';
import styles from './SearchInput.css';

export class SearchInput extends Component {

  handleSearchInputChange(e){
    e.preventDefault();
    this.props.setPatchListSearchTerm(e.target.value);
  }

  render(){
    const { patchListSearch:{searchTerm} } = this.props;
    return (
      <div styleName="search-input">
        <input autoFocus type="text" value={searchTerm || ''} onChange={ e => this.handleSearchInputChange(e) } />
      </div>
    );
  }
}

const mapStateToProps = ({ patchListSearch }) => {
  return {
    patchListSearch
  }
}

export default connect(mapStateToProps, { setPatchListSearchTerm })(CSSModules(SearchInput, styles));
