import React, { Component, PropTypes } from 'react';
import { Tag } from 'components';

class PatchStats extends Component {
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

  render(){
    const { patch, canEdit } = this.props;

    if(!patch){
      return (
        <div></div>
      )
    }
    return (
      <div className="patch-stats">
        <div>
          <div className="patch-stats-row">
              <span className="parameter-label">Channels</span>
              <span className="parameter-value">{patch.inputs + ' in / ' + patch.outputs + ' out'}</span>
          </div>
          { patch.cycles ? (
              <div className="patch-stats-row">
                  <span className="parameter-label">CPU</span>
                  <span className="parameter-value">{this.cyclesToPercent(patch.cycles)+'%'}</span>
              </div>
            ): null
          }
          { patch.bytes ? (
            <div className="patch-stats-row">
                <span className="parameter-label">Memory</span>
                <span className="parameter-value">{ this.bytesToHumanReadable(patch.bytes) + ' / 1Mb'}</span>
            </div>
            ): null
          }
          { patch.sysExAvailable ? (
            <div className="patch-stats-row">
                <span className="parameter-label">SysEx</span>
                <span className="parameter-value">
                  <a className="sysExDownloadLink" href={'/api/builds/'+ patch._id +'?format=sysx&amp;download=1'}>Download</a>
                  {patch.sysExLastUpdated ? ' (built on ' + this.isoDateToLocaleString(patch.sysExLastUpdated) + ' )' : null}
                </span>
            </div>
            ): null
          }
          { patch.jsAvailable ? (
            <div className="patch-stats-row">
              <span className="parameter-label">JS</span>
              <span className="parameter-value">
                <a className="jsDownloadLink" href={'/api/builds/'+ patch._id +'?format=js&amp;download=1'}>Download</a>
                { patch.jsLastUpdated ? ' (built on ' + this.isoDateToLocaleString(patch.jsLastUpdated) + ' )': null}
              </span>
            </div>
            ) : null
          }
          { patch.downloadCount ? (
            <div className="patch-stats-row">
                <span className="parameter-label">Downloads</span>
                <span className="parameter-value">{patch.downloadCount}</span>
            </div>
            ): null
          }
          { canEdit ? (
            <div className="patch-stats-row">
              <span className="parameter-label">Build</span>
              <span className="parameter-value">
                { patch.isCompiling ? 'Compiling ... ': (
                    <a className="compileLink sysex" onClick={(e) => this.props.onCompileClick(e)} >Compile Patch</a>
                  )
                }
              </span>
            </div>): null
          }
          <div className="patch-stats-row">
            { patch.tags ? patch.tags.map( tag => <Tag key={tag} tag={tag} />): null }
          </div>
        </div>
      </div>
    );
  }
}

PatchStats.propTypes = {
  patch: PropTypes.object,
  canEdit : PropTypes.bool,
  onCompileClick: PropTypes.func
}

export default PatchStats;