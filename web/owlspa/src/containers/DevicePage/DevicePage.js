import React, { PropTypes, Component }  from 'react';
import { connect } from 'react-redux';
import { OwlControl } from 'containers';
import { resetDevice, eraseDeviceStorage, showDeviceUUID } from 'actions';
import DevicePageTile from './DevicePageTile/DevicePageTile';
import MidiPortSelector from './MidiPortSelector/MidiPortSelector';
import PresetList from './PresetList/PresetList';

class DevicePage extends Component {

  handleEraseStorageClick(){
    if(window.confirm('Are you sure you want to erase the device storage?')){
      this.props.eraseDeviceStorage();
    }
  }

  handleResetDeviceClick(){
    if(window.confirm('Are you sure you want to reset the device?')){
      this.props.resetDevice();
    }
  }

  handleGetPatchesClick(){
    owlCmd.requestDevicePresets();
  }

  handleShowUUIDClick(){
    this.props.showDeviceUUID();
  }

  render(){ 
    
    const {
      isConnected,
      uuid
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

            { isConnected && ( 
              <DevicePageTile title="Device Commands">
                <div>
                  {uuid && <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>UUID: {uuid}</div>}
                  <button onClick={() => this.handleShowUUIDClick() }>
                    Show UUID
                  </button>
                  <button onClick={() => this.handleEraseStorageClick() }>
                    Erase Storage
                  </button>
                  <button onClick={() => this.handleResetDeviceClick() }>
                    Reset Device
                  </button>
                  <button onClick={() => this.handleGetPatchesClick() }>
                    Get Patches
                  </button>
                </div>
              </DevicePageTile>
            )}
          </div>
          { isConnected && (
            <div id="two-thirds" className="patch-library">
              <div className="white-box2">
                <PresetList />
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

}

const mapStateToProps = ({ owlState: { isConnected, presets, activePresetSlot, uuid } }) => {
  return { 
    isConnected,
    presets,
    activePresetSlot,
    uuid
  }
};

export default connect(mapStateToProps, { resetDevice, eraseDeviceStorage, showDeviceUUID })(DevicePage);
