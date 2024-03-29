import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './PatchStats.css';

class PatchStats extends Component {

  constructor(props){
    super(props);
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

  render(){
    const {
      patch,
      editMode,
      isSaving,
      savedSuccess
    } = this.props;

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
      </div>
    );
  }
}

PatchStats.propTypes = {
  patch: PropTypes.object,
  editMode: PropTypes.bool,
  isSaving: PropTypes.bool
};

PatchStats.defaultProps = {};

export default CSSModules(PatchStats, styles);
