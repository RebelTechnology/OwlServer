import React, { Component, PropTypes } from 'react';

class CompilationTypeSelector extends Component {

  render(){
    const { onSelectorChange, allTypes, compilationType} = this.props;

    if(!allTypes || !compilationType){
      return null;
    }

    return (
      <fieldset>
        <legend>Compilation</legend>
        <div className="row">
          <label>Type</label>
          <select 
            style={{fontSize:'18px'}}
            name="compilationtype" 
            onChange={(e) => onSelectorChange(e.target.value)}
            value={compilationType}>
            { allTypes.map(type => {
                return (<option key={type} value={type}>{type}</option>);
              }) 
            }
          </select>
        </div>
      </fieldset>
    );
  }
}

CompilationTypeSelector.propTypes = {
  compilationType: PropTypes.string,
  allTypes: PropTypes.array,
  onSelectorChange : PropTypes.func
};

export default CompilationTypeSelector;