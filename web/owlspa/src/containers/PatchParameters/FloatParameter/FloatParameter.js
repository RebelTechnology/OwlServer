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
      parameterValue: 0
    }

    this.debouncedUpdateClientY = debounce( e => {
      const clientY = e.touches ? Math.round(e.touches[0].clientY) : e.clientY;
      this.updateParamValue(clientY);
    }, 10);

  }

  updateParamValue(clientY){
    const { previousY, parameterValue } = this.state;
    const { min, max } = this.props;
    const yDifference = previousY - clientY;

    if(yDifference === 0){
      return;
    }

    this.setState({ previousY: clientY });
    const newVal = parameterValue + yDifference;

    if(newVal > max){
      if(parameterValue !== max){
        this.setParameterValue(max);
      }
      return;
    }
    if(newVal < min){
      if(parameterValue !== min){
        this.setParameterValue(min);
      }
      return;
    }
    this.setParameterValue(newVal);
  }

  setParameterValue(val){
    this.setState({parameterValue:val});
    this.props.onParamValueChange(val);
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

  shouldComponentUpdate(nextProps,nextState){
    const { parameterValue, active } = this.state;
    return nextState.parameterValue !== parameterValue || nextProps.active !== active;
  }

  getParameterValueAsRotationDegrees(val){
    return Math.round((val * 2.7) - 135);
  }

  render(){
    const { name, active, editMode, isSaving, io, id, availableIds } = this.props;
    const { parameterValue } = this.state;

    const isInputParam = io === 'input';
    const activeColor = isInputParam ? '#ed7800' : '#007095';
    const pid = String.fromCharCode('A'.charCodeAt(0)+id);

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
            color: active ? activeColor : '#717171',
            margin: editMode ? '48px 38px 80px' : '25px 15px 27px',
          }}
          onTouchStart={e => isInputParam && active && this.handlePointerDown(e) }
          onTouchEnd={e => isInputParam && active && this.handlePointerUp(e) }
          onMouseDown={e => isInputParam && this.handlePointerDown(e)}>
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

          { !editMode && (<span styleName="parameter-io">{ isInputParam ? 'INPUT {pid}' : 'OUTPUT {pid}' }</span>)}
          <svg width="100" height="100" viewBox="0 0 100 100">
            <path style={{fill:'none',stroke:'#eee', strokeWidth:10}} d="
              M 22, 79
              A 40,40 0 1,1 78,79
              "
            />
          </svg>
          <svg 
            style={{position:'absolute', top:0, left:0, transform:'rotate('+ this.getParameterValueAsRotationDegrees(parameterValue)+'deg)'}} 
            width="100" 
            height="100" 
            viewBox="0 0 100 100">
            <circle cx="50" cy="10" r="6" fill={ active ? activeColor : '#ccc' } />
          </svg>
          <span styleName="parameter-name">
            { editMode ? (
              <input 
                style={{
                  textTransform: 'uppercase',
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
          <span styleName="parameter-value">{parameterValue}</span>
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
    this.setParameterValue(this.props.initialValue)
  }
  
}

FloatParameter.propTypes = {
  name: PropTypes.string,
  id: PropTypes.number,
  io: PropTypes.string,
  active: PropTypes.bool,
  onParamValueChange: PropTypes.func,
  initialValue: PropTypes.number,
  editMode: PropTypes.bool,
  availableIds: PropTypes.array,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  isSaving: PropTypes.bool
}

FloatParameter.defaultProps = {
  initialValue: 0,
  min: 0,
  max: 100,
  onParamValueChange: () => {},
  onEdit: () => {},
  onDelete: () => {},
  active: false,
  name: '',
  io: 'input'
}

export default CSSModules(FloatParameter, styles);
