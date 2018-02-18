import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './PatchDetailsTile.css';
import { IconButton } from 'components';

class PatchDetailsTile extends Component {

  constructor(props){
    super(props);
    
    this.state = {
      editMode: false
    }
  }

  handleEditClick(){
    this.setState({
      editMode: true
    });
  }

  componentWillReceiveProps(nextProps){
    if(!nextProps.isSaving && this.props.isSaving){
      this.setState({
        editMode: false
      });
    }
  }

  render(){
    const { canEdit, title, style, isSaving, text } = this.props;
    const { editMode } = this.state;

    return (
      <div styleName="patch-details-tile" style={style}>
        { canEdit && (
            <div styleName="patch-tile-controls">
              { !editMode && <IconButton title="edit" icon={ isSaving ? 'loading' : 'edit' } disabled={isSaving} onClick={ e => this.handleEditClick() } /> }
              { editMode && <IconButton title="save" icon={ isSaving ? 'loading' : 'save' } disabled={isSaving} onClick={ e => this.props.onSave() } /> }
            </div>
          )
        }
        <h2 style={{ marginBottom:'10px' }}>{title}</h2>
        { editMode ? (
            <textarea 
              style={{backgroundColor: isSaving ? '#bbb' : '#fff'}} 
              disabled={isSaving} 
              value={text} 
              onChange={ e => this.props.onTextChange(e.target.value) } 
            />
          ) : (
            <p>{text}</p>
          ) 
        }   
      </div>
    );
  }
}

PatchDetailsTile.defaultProps = {
  onTextChange: () => {},
  onSave: () => {},
  isSaving: false,
  text: ''
}

PatchDetailsTile.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  canEdit : PropTypes.bool,
  isSaving: PropTypes.bool,
  style: PropTypes.object,
  onTextChange: PropTypes.func,
  onSave: PropTypes.func
}

export default CSSModules(PatchDetailsTile, styles);
