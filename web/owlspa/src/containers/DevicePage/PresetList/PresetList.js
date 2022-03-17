import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import { deleteDevicePresetFromSlot } from 'actions';
import styles from './PresetList.css';
import { IconButton } from 'components';
import * as owl from '../../../lib/owlCmd';

class PresetList extends Component {

  handleDeleteClick(slot){
    if(window.confirm(`Confirm delete preset in slot ${slot} ?`)){
      this.props.deleteDevicePresetFromSlot(slot);
    }
  }

  handleSelectPresetSlot(slot){
    owl.setDeviceActivePresetSlot(slot);
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

    return (
      <div styleName="preset-list" >
        {!!presets.length && (
          <div styleName="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Slot</th><th>Name</th><th>Size</th><th></th><th></th>
                </tr>
              </thead>
              <tbody>
                { presets
                  .sort((a,b) => a.slot - b.slot)
                  .map((p, i) => {
                    const active = p.slot === activePresetSlot;
                    const ram = p.slot === 0;

                    return (
                      <tr key={i} className={active ? styles['is-active'] : null } style={{fontWeight: active ? 'bold': 'normal' }}>
                        <td>{ ram ? 'RAM' : p.slot }</td>
                        <td>{p.name}</td>
                        <td><code>{p.size}</code></td>
                        {ram && <td></td>}
                        {ram && <td></td>}
                        {!ram && (
                          <td>{active ? 'Selected' : <button onClick={() => this.handleSelectPresetSlot(p.slot) }>Select</button>}</td>
                        )}
                        {!ram && (
                          <td><button onClick={() => this.handleDeleteClick(p.slot)}>Delete</button></td>
                        )}
                      </tr>
                    );
                  })
                }
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

export default connect(mapStateToProps, { deleteDevicePresetFromSlot })(CSSModules(PresetList, styles));
