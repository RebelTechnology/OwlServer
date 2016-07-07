import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

class Parameter extends Component {
  constructor(props){
    super(props);
    this.state = {
      parameterValue: 35,
      startY: null,
      paramMin:0,
      paramMax:100
    }
  }

  updateParamValue(e){
    const { startY, paramMax, paramMin, parameterValue } = this.state;

    const val = startY - e.clientY;
    
    if(val > paramMax){
      if(parameterValue !== paramMax){
        this.setState({parameterValue: paramMax});
      }
      return;
    }
    if(val < paramMin){
      if(parameterValue !== paramMin){
        this.setState({parameterValue: paramMin});
      }
      return;
    }
    this.setState({parameterValue: val });
  }

  handleMouseDown = (e) => {
    e.preventDefault();
    if(!this.props.active){
      return;
    }
    this.setState({startY: e.clientY});
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

  getParameterValueAsRotationDegrees(){
    const val = this.state.parameterValue;
    return Math.round((val * 2.7) - 135);
  }

  render(){
    const { name, active } = this.props;
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
          style={{position:'absolute', top:0, left:0, transform:'rotate('+ this.getParameterValueAsRotationDegrees()+'deg)'}} 
          width="100" 
          height="100" 
          viewBox="0 0 100 100">
          <circle cx="50" cy="10" r="6" fill={active ? '#ed7800':'#ccc'} />
        </svg>
          <span className="parameter-name">{name}</span>
          <span className="parameter-value">{this.state.parameterValue}</span>
        </div>
    );
  }
}

Parameter.propTypes = {
  name: PropTypes.string,
  id: PropTypes.string,
  active: PropTypes.bool
}

export default Parameter;