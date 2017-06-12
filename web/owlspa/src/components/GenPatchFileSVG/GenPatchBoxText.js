import React, { Component, PropTypes } from 'react';

class GenPatchBoxText extends Component {
  
  constructor(props){
    super(props);
    this.state = {
      textRows: null
    }
  }

  splitTextIntoTextRows(textWidth){
    const { text, boxWidth, comment } = this.props;
    const commentRightPad = comment ? 10 : 0;
    const charWidth = textWidth / text.length;
    const wordsArr =  text.split(' ');
    const textRows = wordsArr.reduce((acc, word) => {
      const currentIndex = (acc.length - 1) < 0 ? 0 : acc.length - 1;
      const currentRow = acc[currentIndex];
      if(!currentRow){
        acc[currentIndex] =  word;
        return acc;
      }
      const tempRow = currentRow + ' ' +  word;
      if ((tempRow.length * charWidth) < ((boxWidth - 14) - commentRightPad )){
        acc[currentIndex] = tempRow;
      } else {
        acc.push(word);
      }
      return acc;
    },[]);
    this.setState({
      textRows
    });
  }

  onRef(textElem){
    if(!textElem || this.textElem){
      return;
    }
    this.textElem = textElem;
    const { boxWidth } = this.props;
    const textWidth = textElem.getBBox().width;    
    if(boxWidth < textWidth){
      this.splitTextIntoTextRows(textWidth);
    }
  }

  renderTextRows(){
    const { textRows } = this.state;
    const { x, y } = this.props;
    return textRows.map((text, i) => {
      return <tspan key={i} x={x} y={y + (i * 12)}>{text}</tspan>
    })
  }

  render(){
    const { x, y, text, color } = this.props;
    if(!text){ 
      return null; 
    }
    const { textRows } = this.state;
  
    return (
      <text
        x={x}
        y={y}
        ref={elem => this.onRef(elem)}
        fontFamily="Arial"
        fontSize="11"
        fill={color} >
        { !textRows && text }
        { textRows && this.renderTextRows() }
      </text>
    );
  }
}

GenPatchBoxText.proptypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  color: PropTypes.string,
  comment: PropTypes.bool,
  text: PropTypes.string,
  boxWidth: PropTypes.number
}

GenPatchBoxText.defaultProps = {
  color: '#eee',
  comment: false
}

export default GenPatchBoxText;