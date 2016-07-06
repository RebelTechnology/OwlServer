import React, { Component, PropTypes } from 'react';

class GitCode extends Component {

  render(){
    const { github } = this.props;

    if(!github || github.length === 0){
      return null;
    }

    return (
      <div className="white-box2" id="git-code">
          <h2 className="bolder">Patch code</h2>
          <div id="github-files">
          GITHUB FILES.
          </div>
      </div>
    );
  }
}

GitCode.propTypes = {
  github: PropTypes.array
}

export default GitCode;