import React, { Component, PropTypes } from 'react';

class GenPatchBoxCode extends Component {
  
  constructor(props){
    super(props);
    this.state = {
      lineArr: null,
      verticalOffset: 0
    };
  }

  componentWillMount(){
    this.splitCodeIntoLines();
  }

  splitCodeIntoLines(){
    const { code } = this.props;
    let lineArr = code.split('\r\n').concat('');

    this.setState({
      lineArr
    });
  }


  renderCodeRows(){
    const { lineArr } = this.state;
    const { x, y } = this.props;
    return lineArr.map((line, i) => {
      return (
          <tspan key={i}>
            <tspan fill="#999" x={x} y={y + (i * 14)}>{i + 1}</tspan>
            <tspan style={{whiteSpace: 'pre' }} letterSpacing="1" x={x + 16} y={y + (i * 14)}>{line}</tspan>
          </tspan>
        );
    })
  }

  render(){
    const { x, y, code, color } = this.props;
    if(!code){ 
      return null; 
    }
    const { lineArr } = this.state;
  
    return (
      <text
        x={x}
        y={y}
        fontFamily="Arial"
        fontSize="12"
        fill={color} >
        { lineArr && this.renderCodeRows() }
      </text>
    );
  }
}

GenPatchBoxCode.proptypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  color: PropTypes.string,
  code: PropTypes.string
}

GenPatchBoxCode.defaultProps = {
  color: '#000'
}

export default GenPatchBoxCode;