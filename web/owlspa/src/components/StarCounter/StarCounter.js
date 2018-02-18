import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './StarCounter.css';
import { IconButton } from 'components';

class StarCounter extends Component {

  render(){
    const { onStarClick, starCount, starred } = this.props;
    return (
      <div styleName="star-counter">
        <IconButton 
          title={(starred ? 'unstar' : 'star') + ' this patch'} 
          icon={starred ? 'starred': 'star'} 
          color="#555" 
          onClick={ onStarClick } >
          {starCount} Star{`${ starCount===1 ? '' : 's' }`}
        </IconButton>
      </div>
    );
  }
}

StarCounter.propTypes = {
  onStarClick: PropTypes.func,
  starCount : PropTypes.number,
  starred: PropTypes.bool
}

StarCounter.defaultProps = {
  starCount : 0,
  starred: false
}

export default CSSModules(StarCounter, styles);