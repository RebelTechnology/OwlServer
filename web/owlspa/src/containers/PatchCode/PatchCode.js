import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchPatchCodeFiles } from 'actions';
import classNames from 'classnames';
import { parseUrl } from 'utils';
import pdfu from 'pd-fileutils';

class PatchCode extends Component {
  constructor(props){
    super(props);
    this.state = {
      activeTab: 0
    };
  }

  componentWillMount(){
    const { fileUrls, patchId, patchCodeFiles } = this.props;
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

  render(){
    const { fileUrls, patchCodeFiles, patchId } = this.props;
    const { activeTab } = this.state;

    if(!fileUrls || fileUrls.length === 0){
      return null;
    }

    const isGitHubfile = this.isGitHubfile(fileUrls[activeTab]);
    const activeTabFileString = patchCodeFiles[patchId] ? patchCodeFiles[patchId][activeTab] : null;
    const activeTabFileName = this.getFileName(fileUrls[activeTab]);
    const isPdFile = /\.pd$/i.test(activeTabFileName);
    let pdPatchSvg = null;

    if(isPdFile && typeof activeTabFileString === 'string' && activeTabFileString !== 'Loading...'){
      pdPatchSvg = <div dangerouslySetInnerHTML={{__html: this.getSvgString(activeTabFileString)}} />
    }
    
    const tabNavItems = fileUrls.map((fileUrl, i )=> {
      return (
        <li onClick={(e) => this.handleTabClick(e,i)} key={i} className={ classNames({active:(i === activeTab)}) }>
          <span>{this.getFileName(fileUrl)}</span>
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
              { isPdFile ? pdPatchSvg : (
                <pre className="prettyprint">
                  {activeTabFileString}
                </pre>)
              }
            </div>
          </div>
      </div>
    );
  }
}

PatchCode.propTypes = {
  fileUrls: PropTypes.array,
  patchId: PropTypes.string
}

const mapStateToProps = ({ patchCodeFiles }) => {
  return {
    patchCodeFiles
  }
}

export default connect(mapStateToProps, { fetchPatchCodeFiles })(PatchCode);