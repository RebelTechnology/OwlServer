import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import { Link } from 'react-router';
import classNames from 'classnames';

class NavLink extends Component {
  isActiveLink({ target, location }){
    return location.pathname.indexOf(target) > -1;
  }
  render(){
    const styleClasses = classNames('secondary-nav-item', this.props.className, {active:  this.isActiveLink(this.props)});
    return (
      <Link to={this.props.target} className={styleClasses} >
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