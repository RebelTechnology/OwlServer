import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import { NavLink } from 'components';
import { connect } from 'react-redux';

class NavBar extends Component {

  render(){
    const { currentUser, location } = this.props;

    return (
      <div id="secondary-nav-bar">
        <div id="secondary-nav-bar-content">
          <NavLink icon="latest" location={location} target="patches/latest">Latest</NavLink>
          <NavLink icon="popular" location={location} target="patches/popular">Popular</NavLink>
          <NavLink icon="tags" location={location} target="patches/tags">Tags</NavLink>
          <NavLink icon="authors" location={location} target="patches/authors">Authors</NavLink>
          <NavLink icon="all" location={location} target="patches/all">All</NavLink>
          <NavLink icon="search" location={location} target="patches/search">Search</NavLink>
          <NavLink icon="myPatches" location={location} target={currentUser.loggedIn ? 'patches/my-patches' : 'login'}>My Patches</NavLink>
          <NavLink icon="usb" location={location} target="device">Device</NavLink>
        </div>
      </div>
    );
  }
}

NavBar.propTypes = {
  location: PropTypes.object.isRequired,
  routeParams: PropTypes.object
}

const mapStateToProps = ({ currentUser }) => {
  return { 
    currentUser
  }
}

export default connect(mapStateToProps)(NavBar);