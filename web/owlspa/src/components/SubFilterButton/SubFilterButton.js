import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

class SubFilterButton extends Component {
  render(){
    const { onClick, isActive } = this.props;
    const styleClasses = classNames('tag-filter-button', { 'active': isActive });
    return (
        <div className={styleClasses} onClick={onClick} >
          {this.props.children}
        </div>
    );
  }
}

SubFilterButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  isActive: PropTypes.bool
}

export default SubFilterButton;
