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
          <NavLink className="nav-item-latest" location={location} target="patches/latest">Latest</NavLink>
          <NavLink className="nav-item-popular" location={location} target="patches/popular">Popular</NavLink>
          <NavLink className="nav-item-tags" location={location} target="patches/tags">Tags</NavLink>
          <NavLink className="nav-item-authors" location={location} target="patches/authors">Authors</NavLink>
          <NavLink className="nav-item-all" location={location} target="patches/all">All</NavLink>
          { currentUser.loggedIn && <NavLink className="nav-item-my-patches" location={location} target="patches/my-patches">My Patches</NavLink> }
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