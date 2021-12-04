import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import CSSModules from 'react-css-modules';
import { deleteDeviceResourceFromSlot } from 'actions';
import styles from './ResourceList.css';
import { IconButton } from 'components';

class ResourceList extends Component {

  handleDeleteClick(slot){
    if(window.confirm(`Confirm delete resource in slot ${slot} ?`)){
      this.props.deleteDeviceResourceFromSlot(slot);
    }
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
        {!!resources.length && (
          <div styleName="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th></th>
                </tr>
              </thead>
              <tbody>
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

export default connect(mapStateToProps, { deleteDeviceResourceFromSlot })(CSSModules(ResourceList, styles));
