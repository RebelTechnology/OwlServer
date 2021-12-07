import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import { Link } from 'react-router';
import CSSModules from 'react-css-modules';
import styles from './NavLink.css';
import { Icon } from 'components';

class NavLink extends Component {
  isActiveLink(){
    const { target, location } = this.props;
    return location.pathname.indexOf(target) > -1;
  }
  render(){
    const { target, children, icon, onClick } = this.props;
    return (
      <Link
        to={target}
        styleName="nav-link"
        onClick={ onClick }
        style={{
          opacity: this.isActiveLink() ? 1 : 0.5
        }}
      >
        <Icon size={40} color={true ? '#fff' : '#fff'} textPosition="bottom" name={icon} />
        {children}
      </Link>
    );
  }
}

NavLink.propTypes = {
  icon: PropTypes.string.isRequired,
  children: PropTypes.node,
  target: PropTypes.string.isRequired,
  className: PropTypes.string
};

NavLink.defaultProps = {
  onClick: () => {}
};

export default  CSSModules(NavLink, styles);
