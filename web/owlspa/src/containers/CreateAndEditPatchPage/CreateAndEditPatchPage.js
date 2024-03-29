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
  loadPatchInToEditPatchForm,
  removeGitHubFile,
  removeUploadedPatchFile,
  serverCreateOrUpdatePatch,
  serverUploadPatchFiles,
  setMainSourceFile,
  sourceFileChange,
  updateCompilationType,
  updatePatchName
} from 'actions';

class CreateAndEditPatchPage extends Component {

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
    this.props.serverUploadPatchFiles(e.target.files);
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

    const {
      routeParams: { patchSeoName },
      patchDetails
    } = this.props;

    if(patchSeoName){
      this.updatePatch(patchSeoName);
    } else {
      this.savePatch();
    }

  }

  handleSaveAndCompileClick(e){
    e.preventDefault();
    const {
      routeParams: { patchSeoName },
      patchDetails
    } = this.props;

    if(patchSeoName){
      this.updatePatch(patchSeoName, {compile: true});
    } else {
      this.savePatch({ compile: true });
    }
  }

  handleCancelClick(e){
    e.preventDefault();
    const {
      routeParams: { patchSeoName }
    } = this.props;
    if(patchSeoName){
      customHistory.push('/patch/' + patchSeoName);
    } else {
      customHistory.push('/patches/my-patches');
    }
  }

  handleCompilationTypeChange(compilationType){
    this.props.updateCompilationType(compilationType);
  }

  savePatch(options){
    const { patchName, compilationType } = this.props.editPatchForm;
    this.props.clearSourceFileErrors();
    this.props.serverCreateOrUpdatePatch({
      name: patchName,
      inputs: 2,
      outputs: 2,
      parameters: [
        { id: 0, name: "A", io: "input", type: "float" },
        { id: 1, name: "B", io: "input", type: "float" },
        { id: 2, name: "C", io: "input", type: "float" },
        { id: 3, name: "D", io: "input", type: "float" },
        { id: 4, name: "Exp", io: "input", type: "float" },
        { id: 80, name: "Pushbutton", io: "input", type: "bool" }
      ],
      compilationType: compilationType,
      published: 0,
      starList: [],
      github: this.getSortedSourceFilesMainFileFirst().map(file => file.path)
    }, options);
  }

  updatePatch(patchSeoName, options){
    const {
      editPatchForm: {
        patchName,
        compilationType
      },
      patchDetails
    } = this.props;

    this.props.clearSourceFileErrors();
    this.props.serverCreateOrUpdatePatch({
      ...patchDetails.patches[patchSeoName],
      name: patchName,
      compilationType: compilationType,
      github: this.getSortedSourceFilesMainFileFirst().map(file => file.path)
    }, options);
  }

  getSortedSourceFilesMainFileFirst(){
    const {
      editPatchForm: {
        sourceFiles
      }
    } = this.props;
    return sourceFiles.sort((a,b) => {
      if(a.mainFile){ return -1; }
      if(b.mainFile){ return 1; }
      return a.timeStamp - b.timeStamp;
    });
  }

  render(){
    const { currentUser, editPatchForm } = this.props;
    const {
      patchName,
      sourceFileErrors,
      invalidFields,
      isSavingPatch,
      isCompiling,
      sourceFiles,
      compilationType
    } = editPatchForm;

    const isEditMode = !!this.props.routeParams.patchSeoName;

    let mainSourceFile = null;

    const sortedSourceFiles = this.getSortedSourceFilesMainFileFirst().map( (file, i) => {
      if(file.mainFile){
        mainSourceFile = file;
      }
      return (
        <div className="row" key={file.name}>
          <a
            href={file.path}
            target="_blank"
            style={{width: '60%', marginLeft: '10px', marginRight: '10px'}}
            className={ classNames({ 'invalid': !!sourceFileErrors[i] }) }
            id={'frm-patch-github_' + i}
          >
            {file.name}
          </a>

          {file.mainFile ? 'Main File' : (
            <button onClick={(e)=>this.handleMainFileChange(e, file)}>
              Set Main
            </button>
          )}

          <button style={{ display: 'inline-block', marginLeft: '10px' }} onClick={(e) => this.handleRemoveFile(e, file)}>remove</button>
          { sourceFileErrors[i] ? (
            <div className="error-message" style={{ display: 'block' }}> { sourceFileErrors[i] } </div>
          ) : null }
        </div>
      );
    });

    return (
      <div className="wrapper flexbox">
        <div className="content-container">
          <div className="white-box">
            <h2>{isEditMode ? 'Edit Patch Source Files' : 'Create Patch'}</h2>
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
                      <div className="error-message" style={{ display: 'block' }}> { invalidFields.name } </div>
                    ) : null }
                </div>
              </fieldset>
                { sortedSourceFiles.length ? (
                    <CompilationTypeSelector
                      mainSourceFile={mainSourceFile}
                      compilationType={compilationType}
                      onCompilationTypeChange={(val) => this.handleCompilationTypeChange(val)}
                    />
                  ) : null
                }
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
              Supported File Types: c, h, cc, cpp, hpp, s, pd, dsp, gendsp, maxproj, maxpat, genexpr, soul, soulpatch
                  </div>
                </div>

                <div id="frm-patch-github_template" className="row repeat">
                  <label htmlFor="frm-patch-github_#index#">GitHub File Url</label>
                  <div className="form-control">
                    <input
                      type="url"
                      value={editPatchForm.gitHubURLField}
                      onChange={(e) => this.handleGitHubURLFieldChange(e)}/>
                    <button onClick={(e)=> this.handleAddGithubUrlClick(e)} style={{ marginLeft: '20px' }}>ADD</button>
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

  componentDidMount(){
    const {
      routeParams: { patchSeoName },
      patchDetails
    } = this.props;

    if(!patchSeoName){
      this.props.updatePatchName('untitled-' + this.generateUUID());
    }

    if(patchSeoName){
      if(patchDetails.patches[patchSeoName]){
        this.props.loadPatchInToEditPatchForm(patchDetails.patches[patchSeoName]);
      } else {
        customHistory.push('/patch/' + patchSeoName);
      }
    }

  }

  componentWillUnmount(){
    this.props.clearEditPatchForm();
  }
}

const mapStateToProps = ({ currentUser, editPatchForm, patchDetails }) => {
  return {
    patchDetails,
    currentUser,
    editPatchForm
  }
};

export default connect(mapStateToProps, {
  loadPatchInToEditPatchForm,
  clearEditPatchForm,
  serverUploadPatchFiles,
  removeUploadedPatchFile,
  gitHubURLFieldChange,
  addGitHubFile,
  removeGitHubFile,
  serverCreateOrUpdatePatch,
  setMainSourceFile,
  sourceFileChange,
  updateCompilationType,
  updatePatchName,
  clearSourceFileErrors
})(CreateAndEditPatchPage);
