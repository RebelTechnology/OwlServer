import React, { PropTypes, Component }  from 'react';
import { OwlControl } from 'containers';
import DevicePageTile from './DevicePageTile/DevicePageTile';
import MidiPortSelector from './MidiPortSelector/MidiPortSelector';

class DevicePage extends Component {

  constructor(props){
    super(props);
    this.state = {
      midiInput: null,
      midiOutput: null
    }
  }

  handleMidiInputChange(midiInput){
    this.setState({
      midiInput
    });
  }

  handleMidiOutputChange(midiOutput){
    this.setState({
      midiOutput
    });
  }

  handleConnectButtonClick(){
    console.log('connect');
  }

  render(){ 
    const {
      midiInput,
      midiOutput
    } = this.state;

    return (
      <div className="wrapper flexbox" style={{ minHeight: '400px' }}>
        <div className="content-container">

          <div id="one-third" className="patch-library">
            <DevicePageTile title="Device Status">
              <div>
                <OwlControl />
                <MidiPortSelector />
              </div>
            </DevicePageTile>
          </div>

        </div>
      </div>
    );
  }

}

export default DevicePage
