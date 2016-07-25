import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';


class PatchPushButton extends Component {

  render(){
    const { isActive } = this.props;

    return (
      <div 
        className={classNames('patch-push-button', {active:isActive})}
        onMouseDown={(e) => isActive && this.props.onPushButtonDown(e) }
        onMouseUp={(e) => isActive && this.props.onPushButtonUp(e) }
        onTouchStart={(e) => isActive && this.props.onPushButtonDown(e) }
        onTouchEnd={(e) => isActive && this.props.onPushButtonUp(e) }>
        <div 
          style={
            {backgroundColor: this.props.ledColour}
          } 
          className="patch-push-button-led">
        </div>
        <label>Pushbutton</label>
      </div>
    );
  }

}

PatchPushButton.propTypes = {
  isActive: PropTypes.bool,
  ledColour: PropTypes.string,
  onPushButtonDown : PropTypes.func,
  onPushButtonUp : PropTypes.func
}

PatchPushButton.defaultProps = {
  isActive:false,
  ledColour:'#ececec',
  onPushButtonDown: ()=>{},
  onPushButtonUp: ()=>{}
}

export default PatchPushButton;
