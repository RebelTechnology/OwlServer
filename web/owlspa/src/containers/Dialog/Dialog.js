import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { setActiveDialogTab, closeDialog } from 'actions';
import Modal from 'react-modal';
import classNames from 'classnames';

class Dialog extends Component {

  closeModal(){
    console.log('closing modal');
    this.props.closeDialog();
  }

  afterOpenModal(){

  }

  setActiveDialogTab(e,i){
    e.preventDefault();
    e.stopPropagation();
    if(typeof i === 'number'){
      this.props.setActiveDialogTab(i);
    }
  }

  render(){

    const { dialog } = this.props;

    if(!dialog){
      return null;
    }

    const { activeDialogTab } = dialog;

    const customStyles = {
      content : {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
      }
    };

    const activeDialogTabContents = dialog.tabs[activeDialogTab] ? dialog.tabs[activeDialogTab].contents : null;

    return (
      <Modal
        isOpen={dialog.isOpen}
        onAfterOpen={this.afterOpenModal}
        onRequestClose={() => this.closeModal()}
        style={customStyles}>
        <div className="modal-dialog">
          <h1 className={classNames('dialog-header',{'error':dialog.isError})}>{dialog.header}</h1>
          <ul className="dialog-tabs">
            {dialog.tabs.map((tab,i) => {
              return (
                <li 
                  className={classNames({active:i === activeDialogTab,error:tab.isError})}
                  key={i} 
                  onClick={(e)=>this.setActiveDialogTab(e,i)} >
                  {tab.header}
                </li>
              )
            })}
          </ul>
          <div className="dialog-body">
            { activeDialogTabContents }
          </div>
          <div className="dialog-footer">
            <button onClick={() => this.closeModal()}>close</button>
          </div>
        </div>
       
      </Modal>
    )
  }

  compontentWillUnmount(){
    this.props.closeDialog();
  }
}


const mapStateToProps = ({ dialog }) => {
  return { 
    dialog
  }
}

export default connect(mapStateToProps, { setActiveDialogTab, closeDialog })(Dialog);
