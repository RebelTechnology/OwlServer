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
    const { patches } = this.props;
    const numAuthors = this.getUniqueAuthors(patches).length;
    const numPatches = patches.length;
    return (
      <div id="patch-counter">
        <div>
          <span>{numPatches}</span> public { numPatches > 1 ? 'patches' : 'patch' }
          <span> by {numAuthors}</span> { numAuthors > 1 ? 'authors' : 'author' }.
        </div>
      </div>
    );
  }
}

PatchCounter.proptypes = {
  patches: PropTypes.array
}

export default PatchCounter;