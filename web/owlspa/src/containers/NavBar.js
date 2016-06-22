import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import NavLink from '../components/NavLink';

class NavBar extends Component {
  render(){
    
    let navItems = this.props.navLinks.map(title => {
      return <NavLink title={title} key={title} />
    });

    return (
      <div id="secondary-nav-bar">
        <div id="secondary-nav-bar-content">
          {navItems}
        </div>
      </div>
    );
  }
}

NavBar.propTypes = {
  navLinks: PropTypes.array.isRequired,
  children: PropTypes.node
}

export default NavBar;