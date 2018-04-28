import React, { Component, PropTypes } from 'react';
import Note from './Note/Note';
import { owlCmd } from 'lib';
import { connect } from 'react-redux';

class MidiKeyboard extends Component {

  constructor(props){
    super(props);
    
    this.state = {
      mouseIsDown: false,
      whiteKeyList: [
        {x: 0, note: 24},
        {x: 80, note: 26},
        {x: 160, note: 28},
        {x: 240, note: 29},
        {x: 320, note: 31},
        {x: 400, note: 33},
        {x: 480, note: 35},
      ],
      blackKeyList: [
        {x: 60, note: 25},
        {x: 140, note: 27},
        {x: 300, note: 30},
        {x: 380, note: 32},
        {x: 460, note: 34}
      ],
    };
  
  }

  handleMidiKeyboardMouseDown(e){
    e.preventDefault();

    this.setState({
      mouseIsDown: true
    });
  }

  handleMidiKeyboardMouseUp(){
    this.setState({
      mouseIsDown: false
    });
  }

  handleNoteOn(note){
    const {
      owlState: {
        isConnected
      }
    } = this.props;

    isConnected && owlCmd.sendNoteOn(note, 100);
  }

  handleNoteOff(note){
    const {
      owlState: {
        isConnected
      }
    } = this.props;

    isConnected && owlCmd.sendNoteOff(note, 100);
  }

  renderOctave(octaveNumber){
    const {
      whiteKeyList,
      blackKeyList,
      mouseIsDown
    } = this.state;

    const transform = `translate(${560 * octaveNumber}, 0)`;

    return (
      <g key={octaveNumber} transform={transform} id={`octave-${octaveNumber}`}>
        { whiteKeyList.map((key,i) => {
          const note = key.note + (octaveNumber * 12);
          return (
            <Note 
              key={i} 
              mouseIsDown={mouseIsDown} 
              isWhiteKey 
              onNoteOn={() => this.handleNoteOn(note)} 
              onNoteOff={() => this.handleNoteOff(note)}
              x={key.x} 
            />
          )
        }) }
        { blackKeyList.map((key,i) => {
          const note = key.note + (octaveNumber * 12);
          return (
            <Note 
              key={i} 
              mouseIsDown={mouseIsDown} 
              onNoteOn={() => this.handleNoteOn(note)} 
              onNoteOff={() => this.handleNoteOff(note)} 
              x={key.x} 
            />
          )
        }) }
      </g>
    );
  }

  render(){
    return (
      <div>
        <svg 
          style={{cursor:'pointer', width: '100%'}}
          viewBox="0 0 2800 400" 
          height="140"
          onMouseDown={e => this.handleMidiKeyboardMouseDown(e)}
          onMouseUp={() => this.handleMidiKeyboardMouseUp()}>
          <defs></defs>
            
            {[0,1,2,3,4].map((octave) => this.renderOctave(octave))}
            
        </svg>
      </div>
    );
  }
}

const mapStateToProps = ({ owlState }) => {
  return { 
    owlState
  }
}

export default connect(mapStateToProps)(MidiKeyboard);
