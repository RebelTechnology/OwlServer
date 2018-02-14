import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { 
  fetchPatchSourceCodeFiles,
  updatePatchSourceCodeFile,
  serverSavePatchFiles 
} from 'actions'; 
import classNames from 'classnames';
import { parseUrl } from 'utils';
import { GenPatchFileSVG, Icon } from 'components';
import customHistory from '../../customHistory';
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
      patchSourceCodeFilesLoaded: false
    };
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

  patchSourceCodeFilesHaveLoaded(files){
    if(!files){
      return false;
    }
    return files.every(file => {
      return !file.isLoading
    });
  }

  ifPatchSourceCodeFilesContainsGenDspSetAsActiveTab({ patchSourceCodeFiles, patch }){
    const { patchSourceCodeFilesLoaded } = this.state;
    if(!patchSourceCodeFiles || !patch || this.state.hasGenDspFile || !patchSourceCodeFilesLoaded || this.state.hasGenDspFile){
      return;
    }
    const hasGenDspFile = this.patchFilesConstainsGenDsp(patchSourceCodeFiles[patch._id]);
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
    if(!fileUrl){
      return false;
    }

    const domain = parseUrl(fileUrl).authority;
    return domain.indexOf('github.com') > -1;
  }

  isHoxtonFile(fileUrl){
    if(!fileUrl){
      return false;
    }
    
    const domain = parseUrl(fileUrl).authority;
    return domain.indexOf('rebeltech.org') > -1;
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

  setFlagIfPatchSourceCodeFilesHaveLoaded({ patchSourceCodeFiles, patch }){
    const { patchSourceCodeFilesLoaded } = this.state;
    if(!patch || !patchSourceCodeFiles || patchSourceCodeFilesLoaded){
      return;
    }
    if(this.patchSourceCodeFilesHaveLoaded(patchSourceCodeFiles[patch._id])){
      this.setState({
        patchSourceCodeFilesLoaded: true
      });
    }

  }

  componentWillUpdate(nextProps, nextState){
    this.setFlagIfPatchSourceCodeFilesHaveLoaded(nextProps);
    this.ifPatchSourceCodeFilesContainsGenDspSetAsActiveTab(nextProps);
    if(nextProps.fileUrls && nextProps.patch && (nextProps.fileUrls !== this.props.fileUrls)){
      this.props.fetchPatchSourceCodeFiles(nextProps.fileUrls, nextProps.patch._id);
    }
  }

  getErrorIfErroredFetchingFile(patchId, activeTab){
    const { patchSourceCodeFiles } = this.props;
    if(!patchId || typeof activeTab === 'undefined' || !patchSourceCodeFiles[patchId] || !patchSourceCodeFiles[patchId][activeTab]){
      return null;
    }
    return patchSourceCodeFiles[patchId][activeTab].errorFetching;
  }

  getActiveTabFileString(patchId, activeTab){
    const { patchSourceCodeFiles } = this.props;
    if(!patchId || typeof activeTab === 'undefined' || !patchSourceCodeFiles[patchId] || !patchSourceCodeFiles[patchId][activeTab]){
      return null;
    }
    return patchSourceCodeFiles[patchId][activeTab].fileString;
  }

  getOnlyHoxtonHostedFiles(fileList){
    return fileList.filter(file => {
      return this.isHoxtonFile(file.fileUrl);
    })
  }

  handlePatchCodeFileChange(index, newFileString){
    const { patch, updatePatchSourceCodeFile } = this.props;
    updatePatchSourceCodeFile(patch._id, index, newFileString);
  }

  handleSavePatchFiles(e){
    const { serverSavePatchFiles, patch, patchSourceCodeFiles } = this.props;
    const fileList = this.getOnlyHoxtonHostedFiles(patchSourceCodeFiles[patch._id]);
    serverSavePatchFiles(patch, fileList);
  }

  handleSaveAndCompilePatchFiles(e, options={}){
    if(options.unsavedFileChanges){
      const { serverSavePatchFiles, patch, patchSourceCodeFiles } = this.props;
      const fileList = this.getOnlyHoxtonHostedFiles(patchSourceCodeFiles[patch._id]);
      serverSavePatchFiles(patch, fileList, {compile: true});
    } else {
      this.props.onCompileClick(e);
    }
  }

  handleAddFileClick(){
    customHistory.push('/edit-patch/'+ this.props.patch.seoName);
  }

  getPatchCodeHasBeenEdited(files = []){
    return files.some(file => file.edited);
  }

  render(){
    const { fileUrls, patchSourceCodeFiles, patch, canEdit } = this.props;
    const { activeTab, editModeActive, editorNightMode } = this.state;

    if(!fileUrls){
      return null;
    }

    const errorFetchingFile = this.getErrorIfErroredFetchingFile(patch._id, activeTab);
    const activeTabFileString = this.getActiveTabFileString(patch._id, activeTab);
    const isGitHubfile = this.isGitHubfile(fileUrls[activeTab]);
    const activeTabFileName = fileUrls.length && this.getFileName(fileUrls[activeTab]);
    const filesAreSaving = patchSourceCodeFiles[patch._id] && patchSourceCodeFiles[patch._id].some(file => file.isSaving);
    const isPdFile = /\.pd$/i.test(activeTabFileName);
    const isGenFile = /\.gendsp$/i.test(activeTabFileName);
    const unsavedFileChanges = patchSourceCodeFiles[patch._id] && this.getPatchCodeHasBeenEdited(patchSourceCodeFiles[patch._id]);
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
          { i === activeTab && (
            <a onClick={(e)=> e.stopPropagation()} target="_blank" download={fileName} className="file-download-link" href={this.getDownloadUrl(fileUrl)}></a>
          )}
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
              {canEdit && (
                <li onClick={ e => this.handleAddFileClick()}>
                  <Icon name="plusSymbol" size={14} />
                </li>
              )}
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
    const {
      fileUrls,
      patch
    } = this.props;
    if(patch && fileUrls){
      this.props.fetchPatchSourceCodeFiles(fileUrls, patch._id);
    }
    this.setFlagIfPatchSourceCodeFilesHaveLoaded(this.props);
    this.ifPatchSourceCodeFilesContainsGenDspSetAsActiveTab(this.props);
  }

}

PatchCode.propTypes = {
  fileUrls: PropTypes.array,
  patch: PropTypes.object,
  canEdit: PropTypes.bool,
  onCompileClick: PropTypes.func
}

const mapStateToProps = ({ patchSourceCodeFiles }) => {
  return {
    patchSourceCodeFiles
  }
}

export default connect(mapStateToProps, { 
  fetchPatchSourceCodeFiles,
  updatePatchSourceCodeFile,
  serverSavePatchFiles
})(PatchCode);
