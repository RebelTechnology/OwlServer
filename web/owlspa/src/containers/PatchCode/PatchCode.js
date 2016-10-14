import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchPatchCodeFiles, updatePatchCodeFile, serverSavePatchFiles } from 'actions'; 
import classNames from 'classnames';
import { parseUrl } from 'utils';
import pdfu from 'pd-fileutils';
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/c_cpp';
import 'brace/theme/github';

class PatchCode extends Component {
  constructor(props){
    super(props);
    this.state = {
      activeTab: 0,
      editModeActive: false
    };
  }

  componentWillMount(){
    this.checkForNewPatchCodeFiles(this.props);
  }

  checkForNewPatchCodeFiles(props){
    const { fileUrls, patch, patchCodeFiles } = props;
    if(fileUrls && fileUrls.length && !patchCodeFiles[patch._id]){
      this.props.fetchPatchCodeFiles(fileUrls, patch._id);
    }
  }

  handleTabClick(e,tabIndex){
    e.preventDefault();
    e.stopPropagation();
    this.setState({activeTab: tabIndex});
  }

  getFileName(url){
    return url.split('/').slice(-1)[0];
  }

  isGitHubfile(fileUrl){
    const domain = parseUrl(fileUrl).authority;
    return domain.indexOf('github.com') > -1;
  }

  isHoxtonFile(fileUrl){
    const domain = parseUrl(fileUrl).authority;
    return domain.indexOf('hoxtonowl.com') > -1;
  }

  getDownloadUrl(fileUrl){
    if(this.isGitHubfile(fileUrl)){
      return fileUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob','');
    }
    return fileUrl;
  }

  getSvgString(fileString){
    const pdPatch = pdfu.parse(fileString);
    // this badness because pdfu removes the first random svg on the body when it starts :/
    const randomSvg = document.createElement('svg');
    document.body.insertBefore(randomSvg, document.body.firstChild);
    return pdfu.renderSvg(pdPatch, {svgFile: false});
  }

  handleEditPatchCodeFileClick(e, fileUrl){
    e.preventDefault();
    e.stopPropagation();
    this.setState({ editModeActive: !this.state.editModeActive });
  }

  componentWillReceiveProps(nextProps){
    this.checkForNewPatchCodeFiles(nextProps);
  }

  getActiveTabFileString(patchId, index){
    const { patchCodeFiles } = this.props;
    if(!patchId || typeof index === 'undefined' || !patchCodeFiles[patchId] || !patchCodeFiles[patchId][index]){
      return null;
    }
    return patchCodeFiles[patchId][index].fileString;
  }

  getOnlyHoxtonHostedFiles(fileList){
    return fileList.filter(file => {
      return this.isHoxtonFile(file.fileUrl);
    })
  }

  handlePatchCodeFileChange(index, newFileString){
    const { patch, updatePatchCodeFile } = this.props;
    updatePatchCodeFile(patch._id, index, newFileString);
  }

  handleSavePatchFiles(e){
    const { serverSavePatchFiles, patch, patchCodeFiles } = this.props;
    const fileList = this.getOnlyHoxtonHostedFiles(patchCodeFiles[patch._id]);
    serverSavePatchFiles(patch, fileList);
  }

  handleSaveAndCompilePatchFiles(e){
    const { serverSavePatchFiles, patch, patchCodeFiles } = this.props;
    const fileList = this.getOnlyHoxtonHostedFiles(patchCodeFiles[patch._id]);
    serverSavePatchFiles(patch, fileList, {compile: true});
  }

  getPatchCodeHasBeenEdited(files = []){
    return files.some(file => file.edited);
  }

  render(){
    const { fileUrls, patchCodeFiles, patch, canEdit } = this.props;
    const { activeTab, editModeActive } = this.state;

    if(!fileUrls || fileUrls.length === 0 || !patchCodeFiles || !patchCodeFiles[patch._id]){
      return null;
    }

    const isGitHubfile = this.isGitHubfile(fileUrls[activeTab]);
    const activeTabFileString = this.getActiveTabFileString(patch._id, activeTab);
    const activeTabFileName = this.getFileName(fileUrls[activeTab]);
    const filesAreSaving = patchCodeFiles[patch._id].some(file => file.isSaving);
    const isPdFile = /\.pd$/i.test(activeTabFileName);
    const unsavedFileChanges = this.getPatchCodeHasBeenEdited(patchCodeFiles[patch._id]);
    const isHoxtonFile = this.isHoxtonFile(fileUrls[activeTab]);
    const editorReadOnly = !canEdit || filesAreSaving || !isHoxtonFile || !editModeActive;
    let pdPatchSvg = null;

    if(isPdFile && typeof activeTabFileString === 'string' && activeTabFileString !== 'Loading...'){
      pdPatchSvg = <div dangerouslySetInnerHTML={{__html: this.getSvgString(activeTabFileString)}} />
    }
    
    const tabNavItems = fileUrls.map((fileUrl, i )=> {
      return (
        <li onClick={(e) => this.handleTabClick(e,i)} key={i} className={ classNames({active:(i === activeTab)}) }>
          <span>{this.getFileName(fileUrl)}</span>
          { (canEdit && this.isHoxtonFile(fileUrl)) && i === activeTab ? (
              <a 
                className="file-edit-link"
                onClick={(e) => this.handleEditPatchCodeFileClick(e,i)} 
              >
              </a>
            ) : null 
          }
          { i === activeTab ? (
            <a onClick={(e)=> e.stopPropagation()} target="_blank" className="file-download-link" href={this.getDownloadUrl(fileUrl)}></a>
          ) : null }
        </li>
      )
    });

    return (
      <div className="white-box2" id="git-code">
          <h2 className="bolder">Patch code</h2>
          {unsavedFileChanges ? (
            <h6 style={{marginBottom:'10px'}}>
                <span style={{
                  color: '#e19758',
                  textTransform: 'uppercase',
                  fontSize: '14px',
                  display: 'inline-block',
                  marginRight: '15px'
                }}>. . . Unsaved Changes</span>
              <button 
                onClick={e => this.handleSavePatchFiles(e)}
                disabled={filesAreSaving}
                className="btn-large save-patch-code">
                {filesAreSaving ? '. . . SAVING': 'SAVE'}
                {filesAreSaving ? <i className="loading-spinner"></i> : null}
              </button>
              <button 
                onClick={e => this.handleSaveAndCompilePatchFiles(e)}
                disabled={filesAreSaving}
                className="btn-large save-and-compile-patch-code">
                {filesAreSaving ? '. . . SAVING': 'SAVE & COMPILE'}
                {filesAreSaving ? <i className="loading-spinner"></i> : null}
              </button>
            </h6>
          ) : null}
          
          <div id="github-files" className={ classNames({'edit-mode': editModeActive }) }>
            <ul className="tab-nav">
              {tabNavItems}
            </ul>
            <div className="tab-content">
              { isGitHubfile ? <a href={fileUrls[activeTab]} target="_blank" className="github-link">Open this file on GitHub</a> : null}
              
              { !isPdFile && (activeTabFileString === '' || activeTabFileString) ? ( 
                <AceEditor
                  mode="c_cpp"
                  theme="github"
                  width="100%"
                  height="800px"
                  readOnly={editorReadOnly}
                  onChange={ val => this.handlePatchCodeFileChange(activeTab, val)}
                  value={activeTabFileString}
                  name="ace-editor-unique-id"
                  className="ace-editor"
                  style={{zIndex:'0'}}
                  editorProps={{$blockScrolling:'Infinity'}}
                />
                ) : null
              }
              { isPdFile ? pdPatchSvg : null}
            </div>
          </div>
      </div>
    );
  }
}

PatchCode.propTypes = {
  fileUrls: PropTypes.array,
  patch: PropTypes.object,
  canEdit: PropTypes.bool
}

const mapStateToProps = ({ patchCodeFiles }) => {
  return {
    patchCodeFiles
  }
}

export default connect(mapStateToProps, { 
  fetchPatchCodeFiles,
  updatePatchCodeFile,
  serverSavePatchFiles
})(PatchCode);
