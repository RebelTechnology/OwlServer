import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './PatchStats.css';
import { Tag } from 'components';

class PatchStats extends Component {

  constructor(props){
    super(props);
    this.state = {
      tagFilter: '',
      showTagsDropDown: false
    };
  }

  bytesToHumanReadable(bytes){
    var i = Math.floor( Math.log(bytes) / Math.log(1024) );
    return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
  }

  cyclesToPercent(cycles){
    return Math.round(cycles / 35);
  }

  isoDateToLocaleString(isodate){
    if(isodate){
      return new Date(isodate).toLocaleString();
    }
  }

  handleAddTag(tag){
    const {
      tags
    } = this.props;

    if(tags.indexOf(tag) > -1){
      return;
    }

    this.setState({
      tagFilter: '',
      showTagsDropDown: false
    });

    this.props.onChangeTags([
      ...tags,
      tag
    ]);
  }

  handleTagFilterInputClick(){
    this.setState({
      showTagsDropDown: !this.state.showTagsDropDown
    });
  }

  handleTagFilterChange(tagFilter){
    this.setState({
      tagFilter
    });
  }

  handleDeleteTag(tag){
    const {
      tags
    } = this.props;

    this.setState({
      showTagsDropDown: false
    });

    this.props.onChangeTags(tags.filter(existingTag => tag !== existingTag))
  }

  render(){
    const {
      tags,
      patch,
      editMode,
      availableTagList,
      isSaving,
      savedSuccess
    } = this.props;

    const {
      tagFilter,
      showTagsDropDown
    } = this.state;

    if(!patch){
      return (
        <div></div>
      )
    }
    return (
      <div className="patch-stats">
      { /*
        <div className="patch-stats-row">
            <span className="parameter-label">Channels</span>
            <span className="parameter-value">{patch.inputs + ' in / ' + patch.outputs + ' out'}</span>
        </div>
        { patch.cycles && (
            <div className="patch-stats-row">
                <span className="parameter-label">CPU</span>
                <span className="parameter-value">{this.cyclesToPercent(patch.cycles)+'%'}</span>
            </div>
          )
        }
        { patch.bytes && (
          <div className="patch-stats-row">
              <span className="parameter-label">Memory</span>
              <span className="parameter-value">{ this.bytesToHumanReadable(patch.bytes) + ' / 1Mb'}</span>
          </div>
          )
        }
      */}
        { patch.sysExAvailable && (
          <div className="patch-stats-row">
              <span className="parameter-label">SysEx</span>
              <span className="parameter-value">
                <a className="sysExDownloadLink" href={'/api/builds/'+ patch._id +'?format=sysex&amp;download=1'}>Download</a>
                {patch.sysExLastUpdated && ' (built on ' + this.isoDateToLocaleString(patch.sysExLastUpdated) + ' )'}
              </span>
          </div>
          )
        }
        { patch.jsAvailable && (
          <div className="patch-stats-row">
            <span className="parameter-label">JS</span>
            <span className="parameter-value">
              <a className="jsDownloadLink" href={'/api/builds/'+ patch._id +'?format=js&amp;download=1'}>Download</a>
              { patch.jsLastUpdated && ' (built on ' + this.isoDateToLocaleString(patch.jsLastUpdated) + ' )'}
            </span>
          </div>
          )
        }
        { patch.cAvailable && (
          <div className="patch-stats-row">
            <span className="parameter-label">C</span>
            <span className="parameter-value">
              <a href={'/api/builds/'+ patch._id +'?format=c&amp;download=1'}>Download</a>
              { patch.cLastUpdated && ' (built on ' + this.isoDateToLocaleString(patch.cLastUpdated) + ' )'}
            </span>
          </div>
          )
        }

        { (patch.downloadCount > 0) && (
          <div className="patch-stats-row">
              <span className="parameter-label">Downloads</span>
              <span className="parameter-value">{patch.downloadCount}</span>
          </div>
          )
        }
        <div className="patch-stats-row" style={{position: 'relative'}}>
          { tags && tags.map( tag => <Tag editMode={editMode} onDelete={() => this.handleDeleteTag(tag)} key={tag} tag={tag} />) }
        </div>
        { editMode && (
          <div className="patch-stats-row" style={{position: 'relative'}}>
            <div styleName="tag-editor">
              <input
                styleName="tag-editor-filter-input"
                style={{width: '100px'}}
                type="text"
                placeholder="add a tag"
                value={tagFilter}
                disabled={isSaving}
                onClick={ e => this.handleTagFilterInputClick()}
                onChange={(e) => this.handleTagFilterChange(e.target.value) }
              />
              { showTagsDropDown && (
                <ul styleName="tag-dropdown">
                  { availableTagList && availableTagList.filter( tag => {
                    return !tagFilter || tag.toUpperCase().indexOf(tagFilter.toUpperCase()) !== -1;
                  }).filter( tag => {
                    return tags.indexOf(tag) === -1;
                  }).map( (tag, i) => {
                    return (
                      <li
                        key={i}
                        onClick={() => this.handleAddTag(tag)}
                      >
                      {tag}
                      </li>
                    );
                  })}
                </ul>
              )}

            </div>
          </div>
        )}
      </div>
    );
  }
}

PatchStats.propTypes = {
  patch: PropTypes.object,
  editMode: PropTypes.bool,
  availableTagList: PropTypes.array,
  tags: PropTypes.array,
  onChangeTags: PropTypes.func,
  isSaving: PropTypes.bool
};

PatchStats.defaultProps = {
  availableTagList: [],
  tags: [],
  onChangeTags: () => {}
};

export default CSSModules(PatchStats, styles);
