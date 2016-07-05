import React, { Component, PropTypes } from 'react';
import { Tag, AuthorLink } from 'components';

class Patch extends Component {
  
  handlePatchClick(e, seoName){
    this.context.router.push('/patch/'+ seoName);
  }

  handleAuthorNameClick(e, authorName){
    e.stopPropagation();
    this.context.router.push('/patches/authors/'+ authorName);
  }

  render(){
    const { id, name, published, authorName, description, tags, seoName } = this.props;
    return (
      <div className="patch-tile" onClick={ (e) => this.handlePatchClick(e, seoName) } >
        <div className="patch-title-controls">
          <div>
            <span className="patch-title">{ name }</span>
              { !published ?
                (<div className="patch-visibility">
                  PRIVATE
                </div>): null
              }
          </div> 
          <AuthorLink author={authorName} />
          <span className="patch-description-list-view">{ description }</span>     
        </div>
        <div className="patch-baseline">
          { tags ?
            tags.map( tagText => {
              return <Tag key={tagText} tag={tagText}/>
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