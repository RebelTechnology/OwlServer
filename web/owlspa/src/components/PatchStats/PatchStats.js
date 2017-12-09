import React, { Component, PropTypes } from 'react';
import { Tag, IconButton } from 'components';

class PatchStats extends Component {
  
  constructor(props){
    super(props);
    this.state = {
      editTagMode: false,
      tagFilter: '',
      tags: props.patch && props.patch.tags ? props.patch.tags : [],
      unsavedTags: false,
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

  handleEditTagsClick(e){
    this.setState({
      editTagMode: true
    });
  }

  handleStopEditingTags(){
    this.setState({
      editTagMode: false
    });
  }

  handleAddTag(tag){
    const {
      tags
    } = this.state;

    if(tags.indexOf(tag) > -1){
      return;
    }

    this.setState({
      tags: [
        ...tags,
        tag
      ],
      tagFilter: '',
      showTagsDropDown: false
    });
  }

  handleTagFilterInputClick(){
    this.setState({
      showTagsDropDown: true
    });
  }

  handleTagFilterChange(tagFilter){
    this.setState({
      tagFilter
    });
  }

  handleDeleteTag(tag){
    this.setState({
      tags: this.state.tags.filter(existingTag => tag !== existingTag),
      showTagsDropDown: false
    });
  }

  handleSaveTagsClick(){
    const {
      tags
    } = this.state;

    console.log('save tags: ', tags);

    this.setState({
      editTagMode: false
    });
  }

  render(){
    const { 
      patch,
      canEdit,
      availableTagList,
      isSaving
    } = this.props;
    
    const {
      editTagMode,
      tagFilter,
      tags,
      showTagsDropDown
    } = this.state;

    if(!patch){
      return (
        <div></div>
      )
    }
    return (
      <div className="patch-stats">
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
        { patch.sysExAvailable && (
          <div className="patch-stats-row">
              <span className="parameter-label">SysEx</span>
              <span className="parameter-value">
                <a className="sysExDownloadLink" href={'/api/builds/'+ patch._id +'?format=sysx&amp;download=1'}>Download</a>
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
        { (patch.downloadCount > 0) && (
          <div className="patch-stats-row">
              <span className="parameter-label">Downloads</span>
              <span className="parameter-value">{patch.downloadCount}</span>
          </div>
          )
        }
        <div className="patch-stats-row" style={{position: 'relative'}}>
          { tags && tags.map( tag => <Tag editMode={editTagMode} onDelete={() => this.handleDeleteTag(tag)} key={tag} tag={tag} />) }          
          { canEdit && !editTagMode && (
            <div className="tag" onClick={e => this.handleEditTagsClick(e)}>
              +
            </div>
          )}
        </div>
        { editTagMode && (
          <div className="patch-stats-row" style={{position: 'relative', top: '10px'}}>
            <div
              style={{
                width: '150px',
                float: 'left',
                marginRight: '10px',
                fontSize: '16px',
                fontWeight: 'normal',
                textTransform: 'uppercase',
                position: 'relative'
              }}
            >
              <input  
                style={{
                  width: '100%',
                  display: 'inline-block',
                  fontWeight: 'normal',
                  textTransform: 'uppercase',
                  lineHeight: '32px',
                  height: '32px'
                }} 
                type="text" 
                value={tagFilter} 
                onClick={ e => this.handleTagFilterInputClick()}
                onChange={(e) => this.handleTagFilterChange(e.target.value) } 
              />
              <ul
                style={{
                  display: showTagsDropDown ? 'block': 'none',
                  textAlign: 'left',
                  width: '150px',
                  position: 'absolute',
                  zIndex: 100,
                  listStyleType: 'none',
                  background: '#ddd',
                  paddingLeft: '10px',
                  margin: 0,
                  maxHeight: '180px',
                  overflowY: 'scroll'
                }}
              >
                { availableTagList && availableTagList.filter( tag => {
                  return !tagFilter || tag.toUpperCase().indexOf(tagFilter.toUpperCase()) !== -1;
                }).map( (tag, i) => {
                  return (
                    <li 
                      key={i}
                      onClick={() => this.handleAddTag(tag)} 
                      style={{ 
                        margin: 0,
                        padding: '4px 0',
                        cursor: 'pointer'
                      }}>
                    {tag}
                    </li>
                  );
                })}
              </ul>
            </div>
            <button 
              className="btn-small" 
              disabled={isSaving} 
              onClick={ e => this.handleSaveTagsClick()} >
              { isSaving ? '...saving' : 'save'  }
            </button>
          </div>
        )}
      </div>
    );
  }
}

PatchStats.propTypes = {
  patch: PropTypes.object,
  canEdit : PropTypes.bool,
  availableTagList: PropTypes.array
};

PatchStats.defaultProps = {
  availableTagList: []
};

export default PatchStats;