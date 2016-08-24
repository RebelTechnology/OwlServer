import React, { PropTypes, Component }  from 'react';
import { connect } from 'react-redux';
import { compilePatch } from 'actions';

class CreatePatchPage extends Component {
  componentWillMount(){
  }

  render(){ 
    const { currentUser } = this.props;

    return (
      <div className="wrapper flexbox">
        <div className="content-container">
          <div className="white-box">
            <h2>Create Patch</h2>
            <form>
              <fieldset id="frm-patch-github">
                <legend>Source files</legend>
                <div className="info-message" style={{marginBottom: '15px'}}>Paste one or more files from GitHub, or upload a file below.</div>
                
                  <label>
                    GitHub URL:
                    <input type="url" id="frm-patch-github_#index#" name="github[#index#]" />
                  </label>
                <div className="row">
                  <div className="file-upload-container">
                    Upload a file
                    <input type="file" size="60" id="frm-patch-file" name="files[]" multiple />
                  </div>
                  <div className="error-message" style={{marginTop: '10px'}}></div>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ currentUser }) => {
  return {
    currentUser
  }
};

export default connect(mapStateToProps)(CreatePatchPage);
