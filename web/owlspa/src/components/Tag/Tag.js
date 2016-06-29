import React, { Component, PropTypes } from 'react';

class Tag extends Component {
  render(){
    const { onClick } = this.props;
    return (
      <div className="tag" onClick={onClick}>
        <span>{ this.props.children }</span>
      </div>
    );
  }
}

Tag.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func
}

export default Tag;