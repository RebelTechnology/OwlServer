import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import { deleteDevicePresetFromSlot, setDeviceActivePresetSlot } from 'actions';
import styles from './PresetList.css';
import { IconButton } from 'components';

class PresetList extends Component {

  handleDeleteClick(slot){
    if(window.confirm(`Confirm delete preset in slot ${slot} ?`)){
      this.props.deleteDevicePresetFromSlot(slot);
    }
  }

  handleSelectPresetSlot(slot){
    this.props.setDeviceActivePresetSlot(slot);
  }

  render(){
    const {
      presets,
      activePresetSlot,
      isConnected
    } = this.props;

    if(!isConnected){
      return null;
    }

    const sortedPresets = presets.sort((a, b) => a.slot - b.slot);

    return (
      <div styleName="preset-list" >
        <h2>Presets</h2>
        {!!presets.length && (
          <div styleName="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Slot</th><th>Name</th><th></th><th></th>
                </tr>
              </thead>
              <tbody>
                { sortedPresets.map((preset, i) => {
                    
                    const isActive = preset.slot === activePresetSlot;
                    const isRamSlot = preset.slot === 0;

                    return (
                      <tr key={i} className={isActive ? styles['is-active'] : null } style={{fontWeight: isActive ? 'bold': 'normal' }}>
                        <td>{ isRamSlot ? 'RAM' : preset.slot }</td>
                        <td>{preset.name}</td>
                        {isRamSlot && <td></td>}
                        {isRamSlot && <td></td>}
                        {!isRamSlot && (
                          <td>{isActive ? 'Selected' : <button onClick={() => this.handleSelectPresetSlot(preset.slot) }>Select</button>}</td>
                        )}
                        {!isRamSlot && (
                          <td>
                            {/* <IconButton 
                              style={{ padding: '0 4px', marginBottom: '3px' }}
                              title="Delete Preset" 
                              icon="delete"
                              onClick={() => this.handleDeleteClick(preset.slot)} 
                            /> */}
                          </td>
                        )}
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

}

const mapStateToProps = ({ 
  owlState: { 
    presets,
    activePresetSlot,
    isConnected
  } 
}) => {
  
  return { 
    presets,
    activePresetSlot,
    isConnected
  }
}

export default connect(mapStateToProps, { setDeviceActivePresetSlot, deleteDevicePresetFromSlot })(CSSModules(PresetList, styles));
