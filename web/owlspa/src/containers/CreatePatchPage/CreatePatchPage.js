import React, { PropTypes, Component }  from 'react';
import { connect } from 'react-redux';
import customHistory from '../../customHistory';
import classNames from 'classnames';
import { CompilationTypeSelector } from 'components';
import { 
  addGitHubFile,
  clearEditPatchForm,
  clearSourceFileErrors,
  compilePatch,
  gitHubURLFieldChange,
  removeGitHubFile,
  removeUploadedPatchFile,
  savePatch,
  setMainSourceFile,
  sourceFileChange,
  updatePatchName,
  uploadPatchFiles
} from 'actions';

class CreatePatchPage extends Component {

  componentWillMount(){
    this.props.updatePatchName('untitled-' + this.generateUUID());
  }

  generateUUID(){
    let time = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        time += performance.now();
    }
    let uuid = 'xxxxxxxxxxxx'.replace(/[x]/g, function(c) {
        let r = (time + Math.random()*16)%16 | 0;
        time = Math.floor(time/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
  }

  handlePatchNameChange(e){
    e.preventDefault();
    this.props.updatePatchName(e.target.value);
  }

  handleFileUploadChange(e){
    this.props.uploadPatchFiles(e.target.files);
  }

  handleAddGithubUrlClick(e){
    e.preventDefault();
    e.stopPropagation();
    if(this.props.editPatchForm.gitHubURLField){
      this.props.addGitHubFile(this.props.editPatchForm.gitHubURLField);
    }
  }

  handleRemoveFile(e, file){
    e.preventDefault();
    e.stopPropagation();
    this.props.clearSourceFileErrors();
    this.props.removeUploadedPatchFile(file.name);
  }

  handleGitHubURLFieldChange(e){
    this.props.gitHubURLFieldChange(e.target.value);
  }

  handleSourceFileChange(e,file){
    e.preventDefault();
    this.props.clearSourceFileErrors();
    file.path = e.target.value;
    this.props.sourceFileChange(file);
  }

  handleMainFileChange(e, file){
    this.props.setMainSourceFile(file);
  }

  handleSaveClick(e){
    e.preventDefault();
    this.savePatch();
  }

  handleSaveAndCompileClick(e){
    e.preventDefault();
    this.savePatch({ compile: true });
  }

  handleCancelClick(e){
    e.preventDefault();
    customHistory.push('/patches/my-patches');
  }

  handleCompilationTypeChange(compilationType){
    console.log('new goddamn comilation type! ', compilationType);
  }

  savePatch(options){
    const { patchName, sourceFiles } = this.props.editPatchForm;
    this.props.clearSourceFileErrors();
    this.props.savePatch({
      name: patchName,
      inputs: 2,
      outputs: 2,
      parameters: {
        a:'A',
        b:'B',
        c:'C',
        d:'D',
        e:'E'
      },
      published: 0,
      github: sourceFiles.map(file => file.path)
    }, options);  
  }

  render(){ 
    const { currentUser, editPatchForm } = this.props;
    const { patchName, sourceFileErrors, invalidFields, isSavingPatch, isCompiling, sourceFiles } = editPatchForm;
    const sortedSourceFiles = sourceFiles.sort((a,b) => {
      if(a.mainFile){ return -1; }
      if(b.mainFile){ return 1; }
      return a.timeStamp - b.timeStamp;
    }).map( (file, i) => {
      return (
        <div className="row" key={file.name}>
          <input 
            type="url" 
            value={file.path}
            style={{width: '60%', marginLeft:'10px', marginRight:'10px'}}
            className={ classNames({ 'invalid': !!sourceFileErrors[i] }) }
            onChange={(e)=>this.handleSourceFileChange(e, file)}
            id={'frm-patch-github_' + i} 
            name={'github['+ i +']'} />

          {file.mainFile ? 'Main File' : (
            <button onClick={(e)=>this.handleMainFileChange(e, file)}>
              Set Main
            </button>
          )}
          
          <button style={{ display:'inline-block', marginLeft:'10px' }} onClick={(e) => this.handleRemoveFile(e, file)}>remove</button>
          { sourceFileErrors[i] ? (
            <div className="error-message" style={{ display:'block' }}> { sourceFileErrors[i] } </div>
          ) : null }
        </div>
      );
    });

    return (
      <div className="wrapper flexbox">
        <div className="content-container">
          <div className="white-box">
            <h2>Create Patch</h2>
            <form id="patch-add-edit-form">
              <fieldset>
                <legend>Patch Name</legend>
                <div className="row">
                  <label htmlFor="frm-patch-name">Name</label>
                  <input 
                    className={ classNames('form-control', {'invalid': !!invalidFields.name }) } 
                    type="text" 
                    id="frm-patch-name" 
                    value={patchName}
                    onChange={(e) => this.handlePatchNameChange(e)}
                    name="name" />
                    { invalidFields.name ? (
                      <div className="error-message" style={{ display:'block' }}> { invalidFields.name } </div>
                    ) : null }
                </div>
              </fieldset>

              <CompilationTypeSelector 
                compilationType={'cpp'}
                allTypes={['cpp','faust','pd','gen']}
                onSelectorChange={this.handleCompilationTypeChange}
              />
              
              <fieldset id="frm-patch-github">
                <legend>Add Source Files</legend>
                <div className="info-message" style={{ marginBottom: '15px' }}>Upload files or add files from GitHub.</div>
                
                <div className="row">
                  <label>Upload Files</label>
                  <div className="form-control">
                    <div className="file-upload-container">
                      {editPatchForm.isUploading ? 'Uploading...' : 'Choose files...' }
                      {editPatchForm.isUploading ? null : (
                        <input 
                          type="file" 
                          id="frm-patch-file" 
                          name="files[]" 
                          multiple 
                          onChange={(e) => this.handleFileUploadChange(e)} />
                      )}
                    </div>
                  </div>
                  <div className="info-message" style={{marginBottom: '15px'}}>
                    Supported File Types:  .c  .h  .cpp  .hpp  .pd  .dsp  .s
                  </div>
                </div>

                <div id="frm-patch-github_template" className="row repeat">
                  <label htmlFor="frm-patch-github_#index#">GitHub File Url</label>
                  <div className="form-control">
                    <input 
                      type="url" 
                      value={editPatchForm.gitHubURLField}
                      onChange={(e) => this.handleGitHubURLFieldChange(e)}/>
                    <button onClick={(e)=> this.handleAddGithubUrlClick(e)} style={{ marginLeft:'20px' }}>ADD</button>
                  </div>
                </div>

            </fieldset>

            { sortedSourceFiles.length ? (
                <fieldset>
                  <legend>Source Files</legend>
                  { sortedSourceFiles }
                </fieldset> 
              ): null
            }
              <div className="row btn-row">
                <button 
                  disabled={ (isSavingPatch || isCompiling ) }
                  className="btn-large" 
                  onClick={(e) => this.handleSaveClick(e)} >
                  {isSavingPatch ? 'Saving . . .': 'Save'}
                  {isSavingPatch ? <i className="loading-spinner"></i> : null}
                </button>
                <button 
                  disabled={ (isSavingPatch || isCompiling )}
                  className="btn-large" 
                  onClick={(e) => this.handleSaveAndCompileClick(e)} >
                  {isSavingPatch ? 'Saving . . .' : ( isCompiling ? 'Compiling . . .' : 'Save and Compile')}
                  {isSavingPatch || isCompiling ? <i className="loading-spinner"></i> : null}
                </button>
                <button 
                  className="btn-large" 
                  onClick={(e) => this.handleCancelClick(e)} >
                  CANCEL
                </button>
            </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  componentWillUnmount(){
    this.props.clearEditPatchForm();
  }
}

const mapStateToProps = ({ currentUser, editPatchForm }) => {
  return {
    currentUser,
    editPatchForm
  }
};

export default connect(mapStateToProps, { 
  clearEditPatchForm,
  uploadPatchFiles,
  removeUploadedPatchFile,
  gitHubURLFieldChange,
  addGitHubFile,
  removeGitHubFile,
  savePatch,
  setMainSourceFile,
  sourceFileChange,
  updatePatchName,
  clearSourceFileErrors
})(CreatePatchPage);
