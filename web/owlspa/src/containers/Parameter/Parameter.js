import React, { Component, PropTypes } from 'react';

class Parameter extends Component {

  handleMouseDown = (e) => {
    console.log('mouse down');
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mousemove', this.handleMouseMove);
    console.log('START y:',e.clientY);
  }

  handleMouseUp = (e) => {
    console.log('mouse up');
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseMove = (e) => {
    console.log('y:',e.clientY);
  }

  render(){
    const { name } = this.props;
    return (
        <div className="patch-knob" onMouseDown={this.handleMouseDown}>
        {name}
        </div>
    );
  }

  componentWillUnmount(){
    
  }
}

Parameter.propTypes = {
  name: PropTypes.string,
  id: PropTypes.string
}

export default Parameter;