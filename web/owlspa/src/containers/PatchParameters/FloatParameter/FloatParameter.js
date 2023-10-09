import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './FloatParameter.css';
import { debounce } from 'utils';
import { IconButton } from 'components';

class FloatParameter extends Component {
  constructor(props){
    super(props);

    this.state = {
      previousY: null,
      value: 0,
    }

    this.debouncedUpdateClientY = debounce( e => {
      const clientY = e.touches ? Math.round(e.touches[0].clientY) : e.clientY;
      this.updateParamValue(clientY);
    }, 10);

  }

  updateParamValue(clientY){
    const { previousY, value } = this.state;
    const { min, max } = this.props;
    const yDifference = previousY - clientY;

    if(yDifference === 0){
      return;
    }

    this.setState({ previousY: clientY });
    const newVal = value + yDifference;

    if(newVal > max){
      if(value !== max){
        this.setParameterValue(max);
      }
      return;
    }
    if(newVal < min){
      if(value !== min){
        this.setParameterValue(min);
      }
      return;
    }

    this.setParameterValue(newVal);
  }

  setParameterValue(val){
    if (this.props.param)
      this.props.param.value = this.perc_to_midi(val);

    this.setState({ value: val });
    this.props.onParamValueChange(this.perc_to_midi(val));
  }

  handlePointerDown = (e) => {
    const {
      editMode,
      active
    } = this.props;

    !editMode && e.preventDefault();

    if(!active){
      return;
    }

    if(e.touches){
      this.setState({previousY: Math.round(e.touches[0].clientY) });
      document.addEventListener('touchmove', this.handlePointerMove);
      return;
    }

    this.setState({previousY: e.clientY });
    document.addEventListener('mouseup', this.handlePointerUp);
    document.addEventListener('mousemove', this.handlePointerMove);
  }

  handlePointerUp = (e) => {
    if(e.touches){
      document.removeEventListener('touchmove', this.handlePointerMove);
    } else {
      document.removeEventListener('mousemove', this.handlePointerMove);
      document.removeEventListener('mouseup', this.handlePointerUp);
    }
  }

  handlePointerMove = (e) => {
    e.preventDefault();
    this.debouncedUpdateClientY(e);
  }

  midi_to_perc(v = 0) {
    return Math.round((v / 127) * 100);
  }

  perc_to_midi(v = 0) {
    return Math.round(v * 1.27);
  }

  shouldComponentUpdate(nextProps,nextState) {
    if (this.props.param)
      this.setState({ value: this.midi_to_perc(this.props.param.value) });

    return (this.state.value !== nextState.value) || (nextProps.active !== this.state.active);
  }

  getParameterValueAsRotationDegrees(val) {
    return Math.round((val * 2.7) - 135);
  }

  render() {
    const { name, active, editMode, isSaving, io, id, availableIds } = this.props;

    const isInputParam = io === 'input';
    const activeColor = isInputParam ? '#ed7800' : '#007095';
    const pidEntry = availableIds.find(item => item.id === id);
    const pid = pidEntry ? pidEntry.displayName.split('_')[1] : "N/A";

    const editModeWrapperStyles = editMode ? {
      background: isInputParam ? '#f9c996' : '#73b9d0',
      borderRadius: '5px',
      marginRight: '9px',
      marginTop: '9px'
    } : {};

    return (
      <div style={editModeWrapperStyles}>
        <div
          styleName="float-parameter"
          style={{
            cursor: active && isInputParam ? 'ns-resize' : 'auto',
            color: activeColor,
            margin: editMode ? '48px 38px 80px' : '25px 15px 27px',
          }}
          onTouchStart={e => isInputParam && active && this.handlePointerDown(e) }
          onTouchEnd={e => isInputParam && active && this.handlePointerUp(e) }
          onMouseDown={e => isInputParam && this.handlePointerDown(e) }>
          { editMode && (
            <IconButton
              title="delete parameter"
              style={{ margin: 0, position: 'absolute', top: '-38px', left: '-23px', zIndex: '99' }}
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
          <svg width="100" height="100" viewBox="0 0 100 100">
            <path style={{fill: 'none', stroke: '#eee', strokeWidth: 10}} d="
              M 22, 79
              A 40,40 0 1,1 78,79
              "
            />
          </svg>
          <svg
            style={{position: 'absolute', top: 0, left: 0, transform: 'rotate('+ this.getParameterValueAsRotationDegrees(this.state.value)+'deg)'}}
            width="100"
            height="100"
            viewBox="0 0 100 100">
            <circle cx="50" cy="10" r="6" fill={ active ? activeColor : '#ccc' } />
          </svg>
          <span styleName="parameter-name">
            { editMode ? (
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
          <span styleName="parameter-value">{this.state.value}</span>
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

  componentDidMount() {
    if (this.props.param)
      this.setParameterValue(this.midi_to_perc(this.props.param.value));
  }

}

FloatParameter.propTypes = {
  name: PropTypes.string,
  id: PropTypes.number,
  io: PropTypes.string,
  active: PropTypes.bool,
  onParamValueChange: PropTypes.func,
  editMode: PropTypes.bool,
  availableIds: PropTypes.array,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  isSaving: PropTypes.bool,
  param: PropTypes.object,
}

FloatParameter.defaultProps = {
  value: 0,
  min: 0,
  max: 100,
  onParamValueChange: () => {},
  onEdit: () => {},
  onDelete: () => {},
  active: false,
  name: '',
  io: 'input',
  param: {},
}

export default CSSModules(FloatParameter, styles);
