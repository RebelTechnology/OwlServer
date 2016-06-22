import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';

class NavLink extends Component {
  render(){
    return (
      <div class="secondary-nav-item">
        {this.props.title}
      </div>
    );
  }
}

NavLink.propTypes = {
  title: PropTypes.string.isRequired
};

export default NavLink;