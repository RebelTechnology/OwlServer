import React, { PropTypes, Component }  from 'react';
import { connect } from 'react-redux';
import { OwlControl } from 'containers';
import classNames from 'classnames';
import DevicePageTile from './DevicePageTile/DevicePageTile';
import MidiPortSelector from './MidiPortSelector/MidiPortSelector';
import PresetList from './PresetList/PresetList';
import { owlCmd } from 'lib';

class DevicePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 0,
      showingPresets: true,
    };
  }

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

  getPresets(){
    owlCmd.requestDevicePresets(); // request PRESET_NAME, DEVICE_STATS and FIRMWARE_VERSION
  }

  handleRefreshClick() {
    if (this.state.showingPresets)
      this.getPresets();

  }

  handleChangeTab(_,activeTab){
    const showingPresets = !this.state.showingPresets;
    this.setState({
      showingPresets,
      activeTab,
    });

    if (showingPresets && this.props.presets.length === 0)
      this.getPresets();

  }

  render(){

    const {
      isConnected,
    } = this.props;

    const {
      activeTab,
      showingPresets,
    } = this.state;

    const tabNavItems = ['Patches'].map((t,i) => (
      <li onClick={(e) => this.handleChangeTab(e,i)} key={i} className={ classNames({active:(i === activeTab)}) }>
        <span>{t}</span>
      </li>
    ));

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
                  <button onClick={() => this.handleRefreshClick() }>
                    { showingPresets && "Refresh Patches" }
                  </button>
                  <button onClick={() => this.handleEraseStorageClick() }>
                    Erase Storage
                  </button>
                  <button onClick={() => this.handleResetDeviceClick() }>
                    Reset Device
                  </button>
                </div>
              </DevicePageTile>
            )}
          </div>

          <div id="two-thirds">
            <ul className="tab-nav">
              {tabNavItems}
            </ul>

            <div className="tab-content" style={{ overflow: 'auto', backgroundColor: 'white' }}>
              { isConnected && showingPresets && (
                <PresetList />
              )}

            </div>
          </div>
        </div>
      </div>
    );
  }

}

const mapStateToProps = ({ owlState: { isConnected, presets, activePresetSlot } }) => {
  return {
    isConnected,
    presets,
    activePresetSlot,
  }
};

export default connect(mapStateToProps, { resetDevice, eraseDeviceStorage })(DevicePage);
