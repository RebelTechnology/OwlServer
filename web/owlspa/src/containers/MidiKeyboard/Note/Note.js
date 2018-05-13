import React, { Component, PropTypes } from 'react';

class Note extends Component {

  constructor(props){
    super(props);
    this.state = {
      noteIsOn: false
    };
  }

  handleNoteOn(){
    this.setState({
      noteIsOn: true
    });

    this.props.onNoteOn();
  }

  handleNoteOff(){
    this.setState({
      noteIsOn: false
    });

    this.props.onNoteOff();
  }
  
  onMouseEnter(){
    const {
      mouseIsDown
    } = this.props;

    if(!mouseIsDown){
      return;
    }

    this.handleNoteOn();
  }

  onMouseLeave(){
    const {
      mouseIsDown
    } = this.props;

    if(!mouseIsDown){
      return;
    }

    this.handleNoteOff();
  }

  onMouseDown(){
    this.handleNoteOn();
  }

  onMouseUp(){
    this.handleNoteOff();
  }

  componentWillReceiveProps(nextProps){
    if(!this.props.noteIsDown && nextProps.noteIsDown){
      this.handleNoteOn();
    }

    if(this.props.noteIsDown && !nextProps.noteIsDown){
      this.handleNoteOff();
    }
  }

  render(){
    const {
      type,
      isWhiteKey,
      x,
      height,
      width
    } = this.props;

    const {
      noteIsOn
    } = this.state;

    return (
      <rect 
        onMouseUp={ e => this.onMouseUp() } 
        onMouseDown={ e => this.onMouseDown() } 
        onMouseEnter={ e => this.onMouseEnter() } 
        onMouseLeave={ e => this.onMouseLeave() } 
        stroke={ isWhiteKey ? '#555555' : '979797' } 
        fill={ noteIsOn ? '#e19758' : isWhiteKey ? '#FFFFF7' : '4B4B4B' }
        x={x}
        y="0" 
        width={ isWhiteKey ? width : Math.floor(width / 2) }
        height={ isWhiteKey ?  height : Math.floor(height * 0.7 )}
      />
    );
  }
}

Note.propTypes = {
  mouseIsDown: PropTypes.bool,
  onNoteOn: PropTypes.func,
  onNoteOff: PropTypes.func,
  isWhiteKey: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number,
  x: PropTypes.number,
  noteIsDown: PropTypes.bool,
};

Note.defaultProps = {
  x:0,
  width: 80,
  height: 400,
  onNoteOn: () => {},
  onNoteOff: () => {}
};

export default Note;
