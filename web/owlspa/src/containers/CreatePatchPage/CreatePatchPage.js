import React, { PropTypes, Component }  from 'react';
import { connect } from 'react-redux';
import { 
  compilePatch,
  uploadPatchFiles, 
  removeUploadedPatchFile,
  addGitHubFile,
  removeGitHubFile,
  gitHubURLFieldChange 
} from 'actions';

class CreatePatchPage extends Component {
  componentWillMount(){
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

  render(){ 
    const { currentUser, editPatchForm } = this.props;
    const sourceFiles = editPatchForm.sourceFiles.map( file => {
      return (
        <div className="row" key={file.name}>
          <span style={{ display:'inline-block', marginLeft:'10px' }} >{ file.name }</span>
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
              <fieldset id="frm-patch-github">
                <legend>Add Source Files</legend>
                <div className="info-message" style={{ marginBottom: '15px' }}>Upload files or add files from GitHub.</div>
                <div id="frm-patch-github_template" className="row repeat">
                    <label htmlFor="frm-patch-github_#index#">GitHub File Url</label>
                    <div className="form-control">
                        <input 
                          type="url" 
                          id="frm-patch-github_#index#" 
                          name="github[#index#]" 
                          value={editPatchForm.gitHubURLField}
                          onChange={(e) => this.handleGitHubURLFieldChange(e)}/>
                        <button onClick={(e)=> this.handleAddGithubUrlClick(e)} style={{ marginLeft:'20px' }}>ADD</button>
                    </div>
                </div>
                <div id="frm-patch-github_noforms_template"></div>

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
            </fieldset>

            { editPatchForm.sourceFiles.length ? (
                <fieldset>
                  <legend>Source Files</legend>
                  { sourceFiles }
                </fieldset> 
              ): null
            }

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
  removeGitHubFile 
})(CreatePatchPage);
