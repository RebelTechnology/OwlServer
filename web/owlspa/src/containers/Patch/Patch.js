import React, { Component, PropTypes } from 'react';
import { Tag } from 'components';

class Patch extends Component {
  
  handlePatchClick(e, id){
    //TODO go to patch page for this patch
    console.log('patch clicked', id);
  }

  handleAuthorNameClick(e, authorName){
    e.stopPropagation();
    this.context.router.push('/patches/authors/'+ authorName);
  }

  handleTagClick(e, tagText){
    e.stopPropagation();
    this.context.router.push('/patches/tags/'+ tagText);
  }

  render(){
    const { id, name, published, authorName, description, tags } = this.props;
    return (
      <div className="patch-tile" onClick={ (e) => this.handlePatchClick(e, id) } >
        <div className="patch-title-controls">
          <div>
            <span className="patch-title">{ name }</span>
              { !published ?
                (<div className="patch-visibility">
                  PRIVATE
                </div>): null
              }
          </div> 
          { authorName ?
            (
              <div className="patch-author" onClick={ (e) => this.handleAuthorNameClick(e, authorName) } >
                <span className="author-name">{ authorName }</span>
              </div>
            ): null
          }
          <span className="patch-description-list-view">{ description }</span>     
        </div>
        <div className="patch-baseline">
          { tags ?
            tags.map( tagText => {
              return <Tag key={tagText} onClick={ (e) => this.handleTagClick(e, tagText) } >{ tagText }</Tag>
            }): null
          }
        </div>
      </div>
    );
  }
}

Patch.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  published: PropTypes.bool,
  authorName: PropTypes.string,
  description: PropTypes.string,
  tags: PropTypes.array
}

Patch.contextTypes = {
  router: PropTypes.object.isRequired
}

export default Patch;