import React, { PropTypes, Component }  from 'react';
import { connect } from 'react-redux';
import { 
  compilePatch,
  uploadPatchFiles, 
  removeUploadedPatchFile,
  addGitHubFile,
  removeGitHubFile,
  gitHubURLFieldChange,
  sourceFileChange,
  updatePatchName,
  savePatch
} from 'actions';

class CreatePatchPage extends Component {

  componentWillMount(){
    this.props.updatePatchName('untitled-patch-' + this.generateUUID());
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
    this.props.removeUploadedPatchFile(file.name);
  }

  handleGitHubURLFieldChange(e){
    this.props.gitHubURLFieldChange(e.target.value);
  }

  handleSourceFileChange(e,file){
    e.preventDefault();
    file.path = e.target.value;
    this.props.sourceFileChange(file);
  }

  handleSaveClick(e){
    e.preventDefault();
    const { patchName, sourceFiles } = this.props.editPatchForm;
    this.props.savePatch({
      name: patchName,
      description: '',
      inputs: 2,
      outputs: 2,
      published: 0,
      github: sourceFiles.map(file => file.path)
    });  
  }

  handleSaveAndCompileClick(e){
    e.preventDefault();
    console.log('save and compile');
  }

  handleCancelClick(e){
    e.preventDefault();
   console.log('CANCEL');
  }

  render(){ 
    const { currentUser, editPatchForm } = this.props;
    const { patchName } = editPatchForm;
    const sourceFiles = editPatchForm.sourceFiles.sort((a,b)=>{
      return (a.name).localeCompare(b.name);
    }).map( (file, i) => {
      return (
        <div className="row" key={file.name}>
          <input 
            type="url" 
            value={file.path}
            style={{width: '70%', marginLeft:'10px'}}
            onChange={(e)=>this.handleSourceFileChange(e, file)}
            id={'frm-patch-github_' + i} 
            name={'github['+ i +']'} />
          <button style={{ display:'inline-block', marginLeft:'10px' }} onClick={(e) => this.handleRemoveFile(e, file)}>remove</button>
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
                    className="form-control" 
                    type="text" 
                    id="frm-patch-name" 
                    value={patchName}
                    onChange={(e) => this.handlePatchNameChange(e)}
                    name="name" />
                </div>
              </fieldset>
              <fieldset id="frm-patch-github">
                <legend>Add Source Files</legend>
                <div className="info-message" style={{ marginBottom: '15px' }}>Upload files or add files from GitHub.</div>
                
                <div className="row">
                    <label>Upload Files</label>
                    <div className="form-control">
                        <div className="file-upload-container">
                            Choose files...
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

            { editPatchForm.sourceFiles.length ? (
                <fieldset>
                  <legend>Source Files</legend>
                  { sourceFiles }
                </fieldset> 
              ): null
            }
              <div className="row btn-row">
                <button onClick={(e) => this.handleSaveClick(e)} >SAVE</button>
                <button onClick={(e) => this.handleSaveAndCompileClick(e)} >SAVE &amp; COMPILE</button>
                <button onClick={(e) => this.handleCancelClick(e)} >CANCEL</button>
            </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ currentUser, editPatchForm }) => {
  return {
    currentUser,
    editPatchForm
  }
};

export default connect(mapStateToProps, { 
  uploadPatchFiles,
  removeUploadedPatchFile,
  gitHubURLFieldChange,
  addGitHubFile,
  removeGitHubFile,
  savePatch,
  sourceFileChange,
  updatePatchName
})(CreatePatchPage);
