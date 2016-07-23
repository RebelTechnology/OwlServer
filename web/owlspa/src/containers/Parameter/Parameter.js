import React, { Component, PropTypes } from 'react';
import { setWebAudioPatchParameter } from 'actions';
import classNames from 'classnames';

class Parameter extends Component {
  constructor(props){
    super(props);
    this.state = {
      previousY: null,
      parameterValue: 0
    }
  }
  componentWillMount(){
    this.setParameterValue(this.props.initialValue)
  }

  updateParamValue(e){
    const { previousY, parameterValue } = this.state;
    const { index, min, max } = this.props;
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
    this.handleParameterChange(val);
  }

  handleMouseDown = (e) => {
    e.preventDefault();
    if(!this.props.active){
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

  handleParameterChange(val){
    const { index , name, id } = this.props;
    const parameter = {
      index,
      name,
      id,
      value: val
    }
    this.props.onChange(parameter);
  }

  shouldComponentUpdate(nextProps,nextState){
    const { parameterValue, active } = this.state;
    return nextState.parameterValue !== parameterValue || nextProps.active !== active;
  }

  getParameterValueAsRotationDegrees(val){
    return Math.round((val * 2.7) - 135);
  }

  render(){
    const { name, active, index } = this.props;
    const { parameterValue } = this.state;
    const styleClases = classNames('patch-knob',{active:active});

    return (
        <div className={styleClases} onMouseDown={this.handleMouseDown}>
          <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <path style={{fill:'none',stroke:'#eee', strokeWidth:10}} d="
              M 22, 79
              A 40,40 0 1,1 78,79
              "
            />
          </svg>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            style={{position:'absolute', top:0, left:0, transform:'rotate('+ this.getParameterValueAsRotationDegrees(parameterValue)+'deg)'}} 
            width="100" 
            height="100" 
            viewBox="0 0 100 100">
            <circle cx="50" cy="10" r="6" fill={active ? '#ed7800':'#ccc'} />
          </svg>
          <span className="parameter-name">{name}</span>
          <span className="parameter-value">{parameterValue}</span>
        </div>
    );
  }
}

Parameter.propTypes = {
  name: PropTypes.string,
  id: PropTypes.string,
  active: PropTypes.bool,
  onChange: PropTypes.func,
  index: PropTypes.number.isRequired,
  initialValue: PropTypes.number
}

Parameter.defaultProps = {
  initialValue: 0,
  min:0,
  max:100,
  onChange:()=>{},
  active:false,
  name:''
}

export default Parameter;
