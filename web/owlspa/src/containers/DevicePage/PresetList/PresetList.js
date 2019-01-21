import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import { setDeviceActivePresetSlot } from 'actions';
import styles from './PresetList.css';
import { IconButton } from 'components';

class PresetList extends Component {

  handleDeleteClick(slot){
    console.log('delete clicked slot:', slot);
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

                    return (
                      <tr key={i} className={isActive ? styles['is-active'] : null } style={{fontWeight: isActive ? 'bold': 'normal' }}>
                        <td>{preset.slot}</td>
                        <td>{preset.name}</td>
                        <td>{isActive ? 'Selected' : <button onClick={() => this.handleSelectPresetSlot(i) }>Select</button>}</td>
                        <td>
                          <IconButton 
                            style={{ padding: '0 4px', marginBottom: '3px' }}
                            title="Delete Preset" 
                            icon="delete"
                            onClick={() => this.handleDeleteClick(i)} 
                          />
                        </td>
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

export default connect(mapStateToProps, { setDeviceActivePresetSlot })(CSSModules(PresetList, styles));
