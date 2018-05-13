import React, { Component, PropTypes } from 'react';
import Note from './Note/Note';
import { owlCmd } from 'lib';
import { connect } from 'react-redux';

class MidiKeyboard extends Component {

  constructor(props){
    super(props);
    
    this.state = {
      mouseIsDown: false,
      notesDown: [],
      octaveShift: 0,
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

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  
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
      },
      webAudioPatch
    } = this.props;

    isConnected && owlCmd.sendNoteOn(note, 100);
    webAudioPatch.instance && webAudioPatch.instance.processMidi(0x90, note, 100);
  }

  handleNoteOff(note){
    const {
      owlState: {
        isConnected
      },
      webAudioPatch
    } = this.props;

    isConnected && owlCmd.sendNoteOff(note, 100);
    webAudioPatch.instance && webAudioPatch.instance.processMidi(0x80, note, 100);
  }

  addNoteDown(note){
    const {
      notesDown,
      octaveShift
    } = this.state;

    const noteToAdd = note + (octaveShift * 12);

    if(notesDown.indexOf(noteToAdd) === -1){
      this.setState({
        notesDown: [
          ...notesDown,
          noteToAdd
        ]
      })
    }
  }

  removeNoteDown(note){
    const {
      notesDown,
      octaveShift
    } = this.state;

    const noteToRemove = note + (octaveShift * 12);

    this.setState({
      notesDown: notesDown.filter(note => note !== noteToRemove)
    });
  }

  shiftOctave(amount){
    const {
      octaveShift
    } = this.state;

    if(octaveShift === -3 && (amount < 0)){
      return;
    }

    if(octaveShift === 3 && (amount > 0)){
      return;
    }

    this.setState({
      octaveShift: octaveShift + amount
    });

  }

  handleKeyDown(e) {
    switch(e.code){
      //white keys
      case 'KeyA':
        this.addNoteDown(48);
        return;
      case 'KeyS':
        this.addNoteDown(50);
        return;
      case 'KeyD':
        this.addNoteDown(52);
        return;
      case 'KeyF':
        this.addNoteDown(53);
        return;
      case 'KeyG':
        this.addNoteDown(55);
        return;
      case 'KeyH':
        this.addNoteDown(57);
        return;
      case 'KeyJ':
        this.addNoteDown(59);
        return;
      case 'KeyK':
        this.addNoteDown(60);
        return;
      case 'KeyL':
        this.addNoteDown(62);
        return;
      //black keys
      case 'KeyW':
        this.addNoteDown(49);
        return;
      case 'KeyE':
        this.addNoteDown(51);
        return;
      case 'KeyT':
        this.addNoteDown(54);
        return;
      case 'KeyY':
        this.addNoteDown(56);
        return;
      case 'KeyU':
        this.addNoteDown(58);
        return;
      case 'KeyO':
        this.addNoteDown(61);
        return;
      default:
        return;
    };
  }

  handleKeyUp(e) {
    switch(e.code){
      case 'KeyA':
        this.removeNoteDown(48);
        return;
      case 'KeyS':
        this.removeNoteDown(50);
        return;
      case 'KeyD':
        this.removeNoteDown(52);
        return;
      case 'KeyF':
        this.removeNoteDown(53);
        return;
      case 'KeyG':
        this.removeNoteDown(55);
        return;
      case 'KeyH':
        this.removeNoteDown(57);
        return;
      case 'KeyJ':
        this.removeNoteDown(59);
        return;
      case 'KeyK':
        this.removeNoteDown(60);
        return;
      case 'KeyL':
        this.removeNoteDown(62);
        return;
      //black keys
      case 'KeyW':
        this.removeNoteDown(49);
        return;
      case 'KeyE':
        this.removeNoteDown(51);
        return;
      case 'KeyT':
        this.removeNoteDown(54);
        return;
      case 'KeyY':
        this.removeNoteDown(56);
        return;
      case 'KeyU':
        this.removeNoteDown(58);
        return;
      case 'KeyO':
        this.removeNoteDown(61);
        return;
      //octave shift keys
      case 'KeyZ':
        this.shiftOctave(-1);
        return;
      case 'KeyX':
        this.shiftOctave(1);
        return;
      default:
        return;
    };
  }

  startListengingToKeyboardEvents(){
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  stopListengingToKeyboardEvents(){
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  componentWillMount(){
    this.startListengingToKeyboardEvents();
  }

  renderOctave(octaveNumber){
    const {
      whiteKeyList,
      blackKeyList,
      mouseIsDown,
      notesDown
    } = this.state;

    const transform = `translate(${560 * octaveNumber}, 0)`;

    return (
      <g key={octaveNumber} transform={transform} id={`octave-${octaveNumber}`}>
        { whiteKeyList.map((key,i) => {
          const note = key.note + (octaveNumber * 12);
          const noteIsDown = notesDown.indexOf(note) > -1;
          return (
            <Note 
              key={i} 
              noteIsDown={noteIsDown}
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
          const noteIsDown = notesDown.indexOf(note) > -1;
          return (
            <Note 
              key={i} 
              noteIsDown={noteIsDown}
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

  componentWillUnmount(){
    this.stopListengingToKeyboardEvents();
  }
}

const mapStateToProps = ({ owlState, webAudioPatch }) => {
  return { 
    owlState,
    webAudioPatch
  }
}

export default connect(mapStateToProps)(MidiKeyboard);
