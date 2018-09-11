import React, { Component, PropTypes } from 'react';

class CompilationTypeSelector extends Component {

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
      case 'gendsp':
        return 'gen';
      case 'maxpat':
        return 'gen';
      case 'maxproj':
        return 'gen';
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

  componentWillReceiveProps(nextProps){
    if(!nextProps.compilationType && !this.props.mainSourceFile && nextProps.mainSourceFile && nextProps.mainSourceFile.name){
      this.checkAndUpdateCompilatonType(nextProps.mainSourceFile.name);
    }
  }

  render(){
    const { onCompilationTypeChange, compilationType, mainSourceFile } = this.props;
    const allCompilationTypes = ['cpp', 'pd', 'heavy', 'faust', 'gen', 'maximilian'];

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

  componentDidMount(){
    const {
      compilationType,
      mainSourceFile
    } = this.props;

    if(!compilationType && mainSourceFile && mainSourceFile.name){
      this.checkAndUpdateCompilatonType(mainSourceFile.name);
    }
  }
  
}

CompilationTypeSelector.propTypes = {
  compilationType: PropTypes.string,
  mainSourceFile: PropTypes.object,
  onCompilationTypeChange : PropTypes.func
};

export default CompilationTypeSelector;
