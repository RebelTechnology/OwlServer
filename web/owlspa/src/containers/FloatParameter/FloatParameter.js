import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './FloatParameter.css';

class FloatParameter extends Component {
  constructor(props){
    super(props);
    this.state = {
      previousY: null,
      parameterValue: 0
    }
  }

  updateParamValue(e){
    const { previousY, parameterValue } = this.state;
    const { min, max } = this.props;
    const yDifference = previousY - e.clientY;

    if(yDifference === 0){
      return;
    }

    this.setState({ previousY: e.clientY });
    const newVal = parameterValue + yDifference;

    if(newVal > max){
      if(parameterValue !== max){
        this.setParameterValue(max);
      }
      return;
    }
    if(newVal < min){
      if(parameterValue !== min){
        this.setParameterValue(min);
      }
      return;
    }
    this.setParameterValue(newVal);
  }

  setParameterValue(val){
    this.setState({parameterValue:val});
    this.props.onParamValueChange(val);
  }

  handleMouseDown = (e) => {
    const {
      editMode,
      active
    } = this.props;

    !editMode && e.preventDefault();
    
    if(!active){
      return;
    }
    
    this.setState({previousY: e.clientY});
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mousemove', this.handleMouseMove);
  }

  handleMouseUp = (e) => {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseMove = (e) => {
    e.preventDefault()
    this.updateParamValue(e);
  }

  shouldComponentUpdate(nextProps,nextState){
    const { parameterValue, active } = this.state;
    return nextState.parameterValue !== parameterValue || nextProps.active !== active;
  }

  getParameterValueAsRotationDegrees(val){
    return Math.round((val * 2.7) - 135);
  }

  render(){
    const { name, active, editMode, isSaving } = this.props;
    const { parameterValue } = this.state;

    return (
        <div 
          styleName="float-parameter"
          style={{ color: active ? '#ed7800' : '#717171' }} 
          onMouseDown={this.handleMouseDown}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <path style={{fill:'none',stroke:'#eee', strokeWidth:10}} d="
              M 22, 79
              A 40,40 0 1,1 78,79
              "
            />
          </svg>
          <svg 
            style={{position:'absolute', top:0, left:0, transform:'rotate('+ this.getParameterValueAsRotationDegrees(parameterValue)+'deg)'}} 
            width="100" 
            height="100" 
            viewBox="0 0 100 100">
            <circle cx="50" cy="10" r="6" fill={active ? '#ed7800':'#ccc'} />
          </svg>
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
          <span styleName="parameter-value">{parameterValue}</span>
        </div>
    );
  }

  componentDidMount(){
    this.setParameterValue(this.props.initialValue)
  }
  
}

FloatParameter.propTypes = {
  name: PropTypes.string,
  io: PropTypes.string,
  active: PropTypes.bool,
  onParamValueChange: PropTypes.func,
  initialValue: PropTypes.number,
  editMode: PropTypes.bool,
  onParamNameChange: PropTypes.func,
  isSaving: PropTypes.bool
}

FloatParameter.defaultProps = {
  initialValue: 0,
  min: 0,
  max: 100,
  onParamValueChange: () => {},
  onParamNameChange: () => {},
  active: false,
  name: '',
  io: 'input'
}

export default CSSModules(FloatParameter, styles);
