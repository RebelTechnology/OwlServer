import React, { Component, PropTypes } from 'react';
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

      <div className="patch-author" onClick={this.onClick} >
        <Link className="author-name" to={`/patches/authors/${author}`}>{author}</Link>
      </div>
    );
  }
}

AuthorLink.propTypes = {
  author: PropTypes.string
}

export default AuthorLink;