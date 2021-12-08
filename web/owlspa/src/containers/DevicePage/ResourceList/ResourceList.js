import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import { deleteDeviceResourceFromSlot, storeResourceOnDevice } from 'actions';
import styles from './ResourceList.css';
import { IconButton } from 'components';

class ResourceList extends Component {

  handleDeleteClick(slot){
    if(window.confirm(`Confirm delete resource in slot ${slot} ?`)){
      this.props.deleteDeviceResourceFromSlot(slot);
    }
  }

	handleFileUploadChange(e) {
		console.log(e.target.files.length);

		if (e.target.files.length > 0)
			this.props.storeResourceOnDevice(e.target.files[0]);
	}

  render(){

    const {
      resources,
      isConnected
    } = this.props;

    if(!isConnected){
      return null;
    }

    const sortedResources = resources.sort((a, b) => a.slot - b.slot);

    return (
      <div styleName="resource-list" >
        {!!resources && (
          <div styleName="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td></td>
                  <td></td>
                  <td>
                    <label className="btn"
                           style={{ padding: '20px', lineHeight: '0', display: 'inline-block', marginTop: '3px' }}
                           htmlFor="resource-add-file">Add</label>

                    <input style={{ display: 'none' }}
                           id="resource-add-file"
                           type="file"
                           onChange={(e) => this.handleFileUploadChange(e)} />
                  </td>
                </tr>

                { sortedResources.map((resource, i) => {
                    return (
                      <tr key={i}>
                        <td>{resource.name}</td>
                        <td><button onClick={() => this.handleDeleteClick(resource.slot)}>Delete</button></td>
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
    resources,
    isConnected
  }
}) => {

  return {
    resources,
    isConnected
  }
}

export default connect(mapStateToProps, { deleteDeviceResourceFromSlot, storeResourceOnDevice })(CSSModules(ResourceList, styles));
