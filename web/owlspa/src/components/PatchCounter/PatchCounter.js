import React, { Component, PropTypes } from 'react';

class PatchCounter extends Component {
  getUniqueAuthors(patches){
    return patches.reduce(function(prev, curr) {
      if(!curr.author){
        return prev;
      }
      const author = curr.author.wordpressId || curr.author.name;
      if(prev.indexOf(author) === -1){
        prev.push(author);
      }
      return prev;
    }, []);
  }
  render(){
    const { patches, myPatches } = this.props;
    const numAuthors = this.getUniqueAuthors(patches).length;
    const numPatches = patches.length;
    return (
      <div id="patch-counter">
        <div>
          <span>{numPatches} {myPatches ? null : 'public'} { numPatches === 1 ? 'patch' : 'patches' }</span>
          { myPatches ? null : (<span> by {numAuthors} { numAuthors === 1 ? 'author.' : 'authors.' } </span>) }
        </div>
      </div>
    );
  }
}

PatchCounter.proptypes = {
  patches: PropTypes.array,
  myPatches : PropTypes.bool
}

export default PatchCounter;