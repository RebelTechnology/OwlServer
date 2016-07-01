import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import { NavLink } from 'components';

class NavBar extends Component {
  render(){
    return (
      <div id="secondary-nav-bar">
        <div id="secondary-nav-bar-content">
          <NavLink className="nav-item-latest" location={this.props.location} target="patches/latest">Latest</NavLink>
          <NavLink className="nav-item-tags" location={this.props.location} target="patches/tags">Tags</NavLink>
          <NavLink className="nav-item-authors" location={this.props.location} target="patches/authors">Authors</NavLink>
          <NavLink className="nav-item-all" location={this.props.location} target="patches/all">All</NavLink>
          <NavLink className="nav-item-my-patches" location={this.props.location} target="patches/my-patches">My Patches</NavLink>
        </div>
      </div>
    );
  }
}

NavBar.propTypes = {
  location: PropTypes.object.isRequired,
  routeParams: PropTypes.object
}
export default NavBar;