import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import { Link } from 'react-router';

class NavLink extends Component {
  render(){
    const styleClasses = 'secondary-nav-item ' + this.props.className;
    return (
      <Link to={this.props.target} className={styleClasses} activeClassName="active">
        {this.props.children}
      </Link>
    );
  }
}

NavLink.propTypes = {
  children: PropTypes.node,
  target: PropTypes.string.isRequired,
  className: PropTypes.string
};

export default NavLink;