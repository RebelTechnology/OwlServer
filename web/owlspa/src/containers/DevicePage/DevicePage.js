import React, { PropTypes, Component }  from 'react';
import { connect } from 'react-redux';
import { OwlControl } from 'containers';
import classNames from 'classnames';
import { resetDevice, eraseDeviceStorage } from 'actions';
import DevicePageTile from './DevicePageTile/DevicePageTile';
import MidiPortSelector from './MidiPortSelector/MidiPortSelector';
import PresetList from './PresetList/PresetList';
import ResourceList from './ResourceList/ResourceList';
import * as owl from 'lib/owlCmd';

class DevicePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTab: 0,
      showingPresets: true,
      showingResources: false,
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
    owl.requestDevicePresets(); // request PRESET_NAME, DEVICE_STATS and FIRMWARE_VERSION
  }

  getResources(){
    owl.requestDeviceResources(); // request PRESET_NAME, DEVICE_STATS and FIRMWARE_VERSION
  }

  handleRefreshClick() {
    if (this.state.showingPresets)
      this.getPresets();

    else if (this.state.showingResources)
      this.getResources();
  }

  handleChangeTab(_,tab){
	  if (this.state.activeTab === tab) return;

    const showingPresets = !this.state.showingPresets;
    const showingResources = !this.state.showingResources;

    this.setState({
      showingPresets,
      showingResources,
	    activeTab: tab,
    });

    if (showingPresets && this.props.presets.length === 0)
      this.getPresets();

    else if (showingResources && this.props.resources.length === 0)
      this.getResources();
  }

  render(){

    const {
      isConnected,
    } = this.props;

    const {
      activeTab,
      showingPresets,
      showingResources,
    } = this.state;

    const tabNavItems = ['Patches', 'Resources'].map((t,i) => (
      <li onClick={(e) => this.handleChangeTab(e,i)}
          key={i}
          className={ classNames({active: (i === activeTab)}) }>
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
                    Refresh
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

              { isConnected && showingResources && (
                <ResourceList />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

}

const mapStateToProps = ({ owlState: { isConnected, presets, resources, activePresetSlot } }) => {
  return {
    isConnected,
    presets,
    activePresetSlot,
    resources,
  }
};

export default connect(mapStateToProps, { resetDevice, eraseDeviceStorage })(DevicePage);
