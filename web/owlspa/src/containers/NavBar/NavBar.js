import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import NavLink from '../../components/NavLink/NavLink';

class NavBar extends Component {
  render(){

    return (
      <div id="secondary-nav-bar">
        <div id="secondary-nav-bar-content">
          <NavLink className="nav-item-latest" target="latest">Latest</NavLink>
          <NavLink className="nav-item-tags" target="tags">Tags</NavLink>
          <NavLink className="nav-item-authors" target="authors">Authors</NavLink>
          <NavLink className="nav-item-all" target="all">All</NavLink>
          <NavLink className="nav-item-my-patches" target="my-patches">My Patches</NavLink>
        </div>
      </div>
    );
  }
}

export default NavBar;