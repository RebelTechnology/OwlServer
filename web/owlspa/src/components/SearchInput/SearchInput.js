import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './SearchInput.css';

export class SearchInput extends Component {

  render(){
    const { value, onChange } = this.props;
    return (
      <input styleName="search-input" type="text" value={value} onChange={ e => onChange(e.target.value) }/>
    );
  }
}

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func
}

export default CSSModules(SearchInput, styles);