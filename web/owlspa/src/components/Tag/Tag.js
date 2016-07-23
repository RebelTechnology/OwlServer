import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

class Tag extends Component {
  onClick(e){
    e.stopPropagation();
  }
  render(){
    const { tag } = this.props;
    return (
      <div className="tag" onClick={(e) => this.onClick(e)}>
        <Link to={`/patches/tags/${tag}`}>{tag}</Link>
      </div>
    );
  }
}

Tag.propTypes = {
  tag: PropTypes.string
}

export default Tag;