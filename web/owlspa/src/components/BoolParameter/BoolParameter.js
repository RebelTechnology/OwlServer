import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './BoolParameter.css';

class BoolParameter extends Component {

  constructor(props){
    super(props);
    this.state = {
      ledColour: '#ececec'
    }
  }

  handleButtonDown(e){
    this.setState({
      ledColour: 'green'
    });

    this.props.onPushButtonDown(e);
  }

  handleButtonUp(e){
    this.setState({
      ledColour: '#ececec'
    });

    this.props.onPushButtonUp(e);
  }

  render(){
    const { 
      isActive,
      name,
      isSaving,
      editMode
    } = this.props;

    const {
      ledColour
    } = this.state;

    return (
      <div 
        style={{ color: isActive ? '#ed7800' : '#717171' }}
        styleName="boolparam-push-button"
        onMouseDown={(e) => isActive && this.handleButtonDown(e) }
        onMouseUp={(e) => isActive && this.handleButtonUp(e) }
        onTouchStart={(e) => isActive && this.handleButtonDown(e) }
        onTouchEnd={(e) => isActive && this.handleButtonUp(e) }>
        <div 
          style={{ 
            boxShadow: isActive ? 'inset 0px 0px 2px 2px rgba(0,0,0,0.25)' : '0px 0px 2px 2px rgba(0,0,0,0.3)',
            backgroundColor: isActive ? ledColour : '#ececec' 
          }} 
          styleName="boolparam-push-button-led">
        </div>
        <span styleName="parameter-name">
          {editMode ? (
            <input 
              style={{textTransform: 'uppercase'}}
              disabled={isSaving}
              onChange={e => this.props.onParamNameChange(e.target.value)} 
              type="text" 
              maxLength="19"
              value={name} />
            ) : name 
          }
        </span>
      </div>
    );
  }

}

BoolParameter.propTypes = {
  isActive: PropTypes.bool,
  name: PropTypes.string,
  editMode: PropTypes.bool,
  io: PropTypes.string,
  onParamNameChange: PropTypes.func,
  isSaving: PropTypes.bool,
  onPushButtonDown : PropTypes.func,
  onPushButtonUp : PropTypes.func
};

BoolParameter.defaultProps = {
  isActive:false,
  onPushButtonDown: ()=>{},
  onPushButtonUp: ()=>{}
};

export default CSSModules(BoolParameter, styles);
