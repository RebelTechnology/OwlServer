import React, { Component, PropTypes } from 'react';

class CompilationTypeSelector extends Component {

  componentWillMount(){
    if(this.props.mainSourceFile && this.props.mainSourceFile.name){
      this.checkAndUpdateCompilatonType(this.props.mainSourceFile.name);
    }
  }

  getFileExtention(fileName){
    const dotIndex = fileName.lastIndexOf('.');
    if( dotIndex === -1){
      return null;
    } else {
      return fileName.substr(dotIndex + 1);
    }
  }

  getCompilationTypeFromMainFileName(mainFileName){
    switch(this.getFileExtention(mainFileName)){
      case 'dsp':
        return 'faust';
      case 'pd':
        return 'pd';
      default:
        return 'cpp';
    };
  }

  checkAndUpdateCompilatonType(mainFileName){
    const newCompilationType = this.getCompilationTypeFromMainFileName(mainFileName);
      this.props.onCompilationTypeChange(newCompilationType);
  }

  componentWillReceiveProps(newProps){
    if(!this.props.mainSourceFile && newProps.mainSourceFile && newProps.mainSourceFile.name){
      this.checkAndUpdateCompilatonType(newProps.mainSourceFile.name);
    }
  }

  render(){
    const { onCompilationTypeChange, compilationType, mainSourceFile } = this.props;
    const allCompilationTypes = ['cpp', 'pd', 'faust', 'gen'];

    return (
      <fieldset>
        <legend>Compilation Type</legend>
        <div className="row">
          <label>Type</label>
          <select 
            style={{fontSize:'18px'}}
            name="compilationtype" 
            onChange={(e) => onCompilationTypeChange(e.target.value)}
            value={compilationType}>
            { allCompilationTypes.map(type => {
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
  mainSourceFile: PropTypes.object,
  onCompilationTypeChange : PropTypes.func
};

export default CompilationTypeSelector;