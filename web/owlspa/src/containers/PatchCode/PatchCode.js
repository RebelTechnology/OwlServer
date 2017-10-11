import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchPatchCodeFiles, updatePatchCodeFile, serverSavePatchFiles } from 'actions'; 
import classNames from 'classnames';
import { parseUrl } from 'utils';
import { GenPatchFileSVG } from 'components';
import pdfu from 'pd-fileutils';
import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/c_cpp';
import 'brace/theme/github';
import 'brace/theme/monokai';

class PatchCode extends Component {
  constructor(props){
    super(props);
    this.state = {
      activeTab: 0,
      editModeActive: false,
      editorNightMode: false,
      hasGenDspFile: false,
      patchCodeFilesLoaded: false
    };
  }

  checkForNewPatchCodeFiles(props){
    const { fileUrls, patch, patchCodeFiles } = props;
    if(fileUrls && fileUrls.length && !patchCodeFiles[patch._id]){
      this.props.fetchPatchCodeFiles(fileUrls, patch._id);
    }
  }

  patchFilesConstainsGenDsp(files){
    if(!files){
      return false;
    }
    let index;
    return files.some((file, i) => {
      if(!file.fileUrl){
        return false;
      }
      const isGen = /\.gendsp$/i.test(this.getFileName(file.fileUrl));
      if(isGen){
        index = i;
      }
      return isGen;
    }) && {index};
  }

  patchCodeFilesHaveLoaded(files){
    if(!files){
      return false;
    }
    return files.every(file => {
      return !file.isLoading
    });
  }

  ifPatchCodeFilesContainsGenDspSetAsActiveTab({ patchCodeFiles, patch }){
    const { patchCodeFilesLoaded } = this.state;
    if(!patchCodeFiles || !patch || this.state.hasGenDspFile || !patchCodeFilesLoaded || this.state.hasGenDspFile){
      return;
    }
    const hasGenDspFile = this.patchFilesConstainsGenDsp(patchCodeFiles[patch._id]);
    if(hasGenDspFile){
      this.setState({
        hasGenDspFile: true,
        activeTab: hasGenDspFile.index
      });
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

  handleEditPatchCodeClick(e){
    e.preventDefault();
    e.stopPropagation();
    this.setState({ editModeActive: !this.state.editModeActive });
  }

  editorToggelDayNightMode(e){
    e.preventDefault();
    e.stopPropagation();
    this.setState({ editorNightMode: !this.state.editorNightMode });
  }

  setFlagIfPatchCodeFilesHaveLoaded({ patchCodeFiles, patch }){
    const { patchCodeFilesLoaded } = this.state;
    if(!patch || !patchCodeFiles || patchCodeFilesLoaded){
      return;
    }
    if(this.patchCodeFilesHaveLoaded(patchCodeFiles[patch._id])){
      this.setState({
        patchCodeFilesLoaded: true
      });
    }

  }

  componentWillUpdate(nextProps, nextState){
    this.setFlagIfPatchCodeFilesHaveLoaded(nextProps);
    this.ifPatchCodeFilesContainsGenDspSetAsActiveTab(nextProps);
    this.checkForNewPatchCodeFiles(nextProps);
  }

  getErrorIfErroredFetchingFile(patchId, activeTab){
    const { patchCodeFiles } = this.props;
    if(!patchId || typeof activeTab === 'undefined' || !patchCodeFiles[patchId] || !patchCodeFiles[patchId][activeTab]){
      return null;
    }
    return patchCodeFiles[patchId][activeTab].errorFetching;
  }

  getActiveTabFileString(patchId, activeTab){
    const { patchCodeFiles } = this.props;
    if(!patchId || typeof activeTab === 'undefined' || !patchCodeFiles[patchId] || !patchCodeFiles[patchId][activeTab]){
      return null;
    }
    return patchCodeFiles[patchId][activeTab].fileString;
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

  handleSaveAndCompilePatchFiles(e, options={}){
    if(options.unsavedFileChanges){
      const { serverSavePatchFiles, patch, patchCodeFiles } = this.props;
      const fileList = this.getOnlyHoxtonHostedFiles(patchCodeFiles[patch._id]);
      serverSavePatchFiles(patch, fileList, {compile: true});
    } else {
      this.props.onCompileClick(e);
    }
  }

  getPatchCodeHasBeenEdited(files = []){
    return files.some(file => file.edited);
  }

  render(){
    const { fileUrls, patchCodeFiles, patch, canEdit } = this.props;
    const { activeTab, editModeActive, editorNightMode } = this.state;

    if(!fileUrls || fileUrls.length === 0 || !patchCodeFiles || !patchCodeFiles[patch._id]){
      return null;
    }

    const errorFetchingFile = this.getErrorIfErroredFetchingFile(patch._id, activeTab);
    const activeTabFileString = this.getActiveTabFileString(patch._id, activeTab);
    const isGitHubfile = this.isGitHubfile(fileUrls[activeTab]);
    const activeTabFileName = this.getFileName(fileUrls[activeTab]);
    const filesAreSaving = patchCodeFiles[patch._id].some(file => file.isSaving);
    const isPdFile = /\.pd$/i.test(activeTabFileName);
    const isGenFile = /\.gendsp$/i.test(activeTabFileName);
    const unsavedFileChanges = this.getPatchCodeHasBeenEdited(patchCodeFiles[patch._id]);
    const isHoxtonFile = this.isHoxtonFile(fileUrls[activeTab]);
    const editorReadOnly = !canEdit || filesAreSaving || !isHoxtonFile || !editModeActive;
    let pdPatchSvg = null;
    let genFileJson;
    const showPatchCodeEditControls = !isPdFile && !isGenFile;

    if(isPdFile && typeof activeTabFileString === 'string' && activeTabFileString !== 'Loading...'){
      pdPatchSvg = <div dangerouslySetInnerHTML={{__html: this.getSvgString(activeTabFileString)}} />
    }

    if(isGenFile && activeTabFileString){
      genFileJson = JSON.parse(activeTabFileString);
    }
    
    const tabNavItems = fileUrls.map((fileUrl, i )=> {
      const fileName = this.getFileName(fileUrl);
      return (
        <li onClick={(e) => this.handleTabClick(e,i)} key={i} className={ classNames({active:(i === activeTab)}) }>
          <span>{fileName}</span>
          { i === activeTab ? (
            <a onClick={(e)=> e.stopPropagation()} target="_blank" download={fileName} className="file-download-link" href={this.getDownloadUrl(fileUrl)}></a>
          ) : null }
        </li>
      )
    });

    return (
      <div className="white-box2" id="git-code">
          <h2 className="bolder">Patch code</h2>
          { canEdit && (
            <h6 className="patchcode-toolbar" style={{marginBottom:'10px'}}>
              { showPatchCodeEditControls && (
                <button 
                  onClick={e => this.handleEditPatchCodeClick(e)}
                  disabled={filesAreSaving}
                  style={ editModeActive ? {backgroundColor:'#c52374', borderBottomColor: '#86154e'} : {} }
                  className="btn-large edit-patch-code">
                  { editModeActive ? 'EDITING' : 'EDIT'}
                </button>
              )}
              { showPatchCodeEditControls && (
                <button 
                  onClick={e => this.handleSavePatchFiles(e)}
                  disabled={filesAreSaving || !unsavedFileChanges}
                  className="btn-large save-patch-code">
                  {filesAreSaving ? '. . . SAVING': 'SAVE'}
                  {filesAreSaving && <i className="loading-spinner"></i>}
                </button>
              )}
              <button 
                onClick={e => this.handleSaveAndCompilePatchFiles(e, {unsavedFileChanges})}
                disabled={filesAreSaving || patch.isCompiling}
                className="btn-large save-and-compile-patch-code">
                {unsavedFileChanges ? 'SAVE & COMPILE' : 'COMPILE' }
                { (filesAreSaving || patch.isCompiling) && <i className="loading-spinner"></i> }
              </button>
              <button 
                onClick={e => this.editorToggelDayNightMode(e)}
                className="btn-large">
                {editorNightMode ? 'DAY': 'NIGHT'}
              </button>
            </h6>
          )}
          
          <div id="github-files" className={ classNames({'edit-mode': editModeActive }) }>
            <ul className="tab-nav">
              {tabNavItems}
            </ul>
            <div className="tab-content" style={editorNightMode ? {backgroundColor: '#272822'} : {}}>
              { errorFetchingFile }

              { isGitHubfile && <a href={fileUrls[activeTab]} target="_blank" className="github-link">Open this file on GitHub</a> }
              
              { showPatchCodeEditControls && (activeTabFileString === '' || activeTabFileString) && ( 
                <AceEditor
                  mode="c_cpp"
                  theme={ editorNightMode ? 'monokai' : 'github'}
                  width="100%"
                  height="800px"
                  readOnly={editorReadOnly}
                  onChange={ val => this.handlePatchCodeFileChange(activeTab, val)}
                  value={activeTabFileString}
                  name="ace-editor-unique-id"
                  className="ace-editor"
                  style={{zIndex:'0'}}
                  editorProps={{$blockScrolling:'Infinity'}}
                />)
              }

              { isPdFile && pdPatchSvg }

              { isGenFile && genFileJson && <GenPatchFileSVG data={genFileJson} /> }

            </div>
          </div>
      </div>
    );
  }

  componentDidMount(){
    this.checkForNewPatchCodeFiles(this.props);
    this.setFlagIfPatchCodeFilesHaveLoaded(this.props);
    this.ifPatchCodeFilesContainsGenDspSetAsActiveTab(this.props);
  }

}

PatchCode.propTypes = {
  fileUrls: PropTypes.array,
  patch: PropTypes.object,
  canEdit: PropTypes.bool,
  onCompileClick: PropTypes.func
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
