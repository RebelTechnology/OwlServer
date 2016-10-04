import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchPatchCodeFiles } from 'actions';
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
      activeTab: 0
    };
  }

  componentWillMount(){
    this.checkForNewPatchCodeFiles(this.props);
  }

  checkForNewPatchCodeFiles(props){
    const { fileUrls, patchId, patchCodeFiles } = props;
    if(fileUrls && fileUrls.length && !patchCodeFiles[patchId]){
      this.props.fetchPatchCodeFiles(fileUrls, patchId);
    }
  }

  handleTabClick(e,tabIndex){
    e.preventDefault();
    e.stopPropagation();
    this.setState({activeTab:tabIndex});
  }

  getFileName(url){
    return url.split('/').slice(-1)[0];
  }

  isGitHubfile(fileUrl){
    if(!fileUrl){
      return false;
    }
    const domain = parseUrl(fileUrl).authority;
    return  domain.indexOf('github.com') > -1;
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

  handleEditPatchCodeClick(e, fileUrl){
    e.preventDefault();
    e.stopPropagation();
    console.log('open editor for file: ', fileUrl);
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

  handlePatchCodeFileChange(index, newFileString){
    const { patchId } = this.props;
    console.log('file updated for patch:', patchId, 'at index:', index);
  }

  render(){
    const { fileUrls, patchCodeFiles, patchId, canEdit } = this.props;
    const { activeTab } = this.state;

    if(!fileUrls || fileUrls.length === 0){
      return null;
    }

    const isGitHubfile = this.isGitHubfile(fileUrls[activeTab]);
    const activeTabFileString = this.getActiveTabFileString(patchId, activeTab);
    const activeTabFileName = this.getFileName(fileUrls[activeTab]);
    let isPdFile = /\.pd$/i.test(activeTabFileName);
    let pdPatchSvg = null;

    if(isPdFile && typeof activeTabFileString === 'string' && activeTabFileString !== 'Loading...'){
      pdPatchSvg = <div dangerouslySetInnerHTML={{__html: this.getSvgString(activeTabFileString)}} />
    }
    
    const tabNavItems = fileUrls.map((fileUrl, i )=> {
      return (
        <li onClick={(e) => this.handleTabClick(e,i)} key={i} className={ classNames({active:(i === activeTab)}) }>
          <span>{this.getFileName(fileUrl)}</span>
          { (canEdit && !isGitHubfile && !isPdFile) ? (
              <a 
                className="file-edit-link"
                onClick={(e) => this.handleEditPatchCodeClick(e,i)} 
              >
              </a>
            ) : null 
          }
          <a onClick={(e)=> e.stopPropagation()} target="_blank" className="file-download-link" href={this.getDownloadUrl(fileUrl)}></a>
        </li>
      )
    });

    return (
      <div className="white-box2" id="git-code">
          <h2 className="bolder">Patch code</h2>
          <div id="github-files">
            <ul className="tab-nav">
              {tabNavItems}
            </ul>
            <div className="tab-content">
              { isGitHubfile ? <a href={fileUrls[activeTab]} target="_blank" className="github-link">Open this file on GitHub</a> : null}
              
              { !isPdFile && activeTabFileString ? ( 
                <AceEditor
                  mode="c_cpp"
                  theme="github"
                  width="100%"
                  height="800px"
                  readOnly={false}
                  onChange={ val => this.handlePatchCodeFileChange(activeTab, val)}
                  onLoad={console.log('editor loaded')}
                  value={activeTabFileString}
                  name="ace-editor-unique-id"
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
  patchId: PropTypes.string,
  canEdit: PropTypes.bool
}

const mapStateToProps = ({ patchCodeFiles }) => {
  return {
    patchCodeFiles
  }
}

export default connect(mapStateToProps, { fetchPatchCodeFiles })(PatchCode);
