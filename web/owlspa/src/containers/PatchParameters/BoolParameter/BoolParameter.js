import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './BoolParameter.css';
import { IconButton } from 'components';

class BoolParameter extends Component {

  constructor(props){
    super(props);

    this.state = {
      ledColour: '#ececec',
      value: 0,
    }
  }

  handleButtonDown(e){
    this.setParameterValue(127);
    this.props.onPushButtonDown(e);
  }

  handleButtonUp(e){
    this.setParameterValue(0);
    this.props.onPushButtonUp(e);
  }

  setParameterValue(val){
    this.setState({
      value: val,
      ledColour: (val ? 'green' : '#ececec')
    });
  }

  render(){
    const {
      isActive,
      name,
      isSaving,
      editMode,
      io,
      id,
      availableIds
    } = this.props;

    const {
      ledColour,
      value,
    } = this.state;

    const isInputParam = io === 'input';
    const activeColor = isInputParam ? '#ed7800' : '#007095';
    const pidEntry = availableIds.find(item => item.id === id);
    const pid = pidEntry ? "B"+pidEntry.displayName.split('_')[1] : "N/A";

    const editModeWrapperStyles = editMode ? {
      background: isInputParam ? '#f9c996' : '#73b9d0',
      borderRadius: '5px',
      marginRight: '9px',
      marginTop: '9px'
    } : {};

    return (
      <div style={editModeWrapperStyles}>
        <div
          style={{
            cursor: isActive && isInputParam ? 'pointer' : 'auto',
            color: activeColor,
            margin: editMode ? '53px 31px 44px' : '40px 8px 0px',
            height: editMode ? '93px' : '92px'
          }}
          styleName="boolparam-push-button"
          onMouseDown={e => isInputParam && isActive && this.handleButtonDown(e) }
          onMouseUp={e => isInputParam && isActive && this.handleButtonUp(e) }
          onTouchStart={e => isInputParam && isActive && this.handleButtonDown(e) }
          onTouchEnd={e => isInputParam && isActive && this.handleButtonUp(e) }>
          { editMode && (
            <IconButton
              title="delete parameter"
              style={{ margin: 0, position: 'absolute', top: '-42px', left: '-12px', zIndex: '999' }}
              icon="delete"
              onClick={ this.props.onDelete }
            />
          )}
          { editMode && (
              <select styleName="parameter-io-dropdown" onChange={e => this.props.onEdit({ io: e.target.value })} value={io}>
                <option value="input">INPUT</option>
                <option value="output">OUTPUT</option>
              </select>
            )}
          { !editMode && (<span styleName="parameter-io">{ isInputParam ? pid+' IN' : pid+' OUT' }</span>)}
          <div
            style={{
              boxShadow: isActive ? 'inset 0px 0px 2px 2px rgba(0,0,0,0.25)' : '0px 0px 2px 2px rgba(0,0,0,0.3)',
              backgroundColor: isActive ? ledColour : '#ececec'
            }}
            styleName="boolparam-push-button-led">
          </div>
          <span styleName="parameter-name">
            {editMode ? (
              <input
                style={{
                  padding: '9px',
                  height: '35px'
                }}
                disabled={isSaving}
                onChange={e => this.props.onEdit({ name: e.target.value })}
                type="text"
                maxLength="19"
                value={name} />
              ) : name
            }
          </span>

          { editMode && (
            <div styleName="parameter-id-dropdown" >
              <span>ID: </span>
              <select onChange={e => this.props.onEdit({ id: Number(e.target.value) })} value={id}>
                { availableIds.map((idEntry, i) => <option key={i} value={idEntry.id}>{idEntry.displayName}</option>) }
              </select>
            </div>
          )}

        </div>
      </div>
    );
  }

  componentDidMount(){
    if (this.props.param)
      this.setParameterValue(this.props.param.value);
  }

  shouldComponentUpdate(nextProps,nextState) {
    let v = this.props.param ? this.props.param.value : undefined;

    if (v !== undefined) this.setState({
      value: v,
      ledColour: (v ? 'green' : '#ececec'),
    });

    return (v !== this.state.value);
  }

}

BoolParameter.propTypes = {
  isActive: PropTypes.bool,
  name: PropTypes.string,
  id: PropTypes.number,
  editMode: PropTypes.bool,
  availableIds: PropTypes.array,
  io: PropTypes.string,
  onEdit: PropTypes.func,
  isSaving: PropTypes.bool,
  onPushButtonDown: PropTypes.func,
  onPushButtonUp: PropTypes.func,
  param: PropTypes.object,
};

BoolParameter.defaultProps = {
  isActive: false,
  onEdit: () => {},
  onDelete: () => {},
  onPushButtonDown: ()=>{},
  onPushButtonUp: ()=>{},
  param: {},
};

export default CSSModules(BoolParameter, styles);
