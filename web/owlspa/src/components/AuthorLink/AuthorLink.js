import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './AuthorLink.css';
import { Link } from 'react-router';

class AuthorLink extends Component {
  onClick(e){
    e.stopPropagation();
  }
  render(){
    const { author } = this.props;
    if (!author){
      return null;
    }
    return (

      <div styleName="patch-author" onClick={this.onClick} >
        <Link styleName="author-name" to={`/patches/authors/${author}`}>{author}</Link>
      </div>
    );
  }
}

AuthorLink.propTypes = {
  author: PropTypes.string
}

export default CSSModules(AuthorLink, styles);