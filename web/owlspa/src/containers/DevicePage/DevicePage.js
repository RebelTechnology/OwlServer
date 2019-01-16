import React, { PropTypes, Component }  from 'react';
import { connect } from 'react-redux';
import { OwlControl } from 'containers';
import DevicePageTile from './DevicePageTile/DevicePageTile';
import MidiPortSelector from './MidiPortSelector/MidiPortSelector';

class DevicePage extends Component {

  render(){ 
    
    const {
      isConnected
    } = this.props;

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
          { isConnected && (
            <div id="two-thirds" className="patch-library">
              <div className="white-box2">
                <h2 style={{ color: '#5d5d5d'}}>Presets</h2>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

}

const mapStateToProps = ({ owlState: { isConnected } }) => {
  return { 
    isConnected
  }
};

export default connect(mapStateToProps)(DevicePage);
