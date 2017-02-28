import React, { Component, PropTypes } from 'react';
import { Tag, AuthorLink, IconButton } from 'components';

class PatchTile extends Component {
  
  handlePatchClick(e, seoName){
    this.context.router.push('/patch/'+ seoName);
  }

  handleAuthorNameClick(e, authorName){
    e.stopPropagation();
    this.context.router.push('/patches/authors/'+ authorName);
  }

  render(){
    const { id, name, published, authorName, description, tags, seoName, canEdit, loggedIn, onDeletePatchClick } = this.props;
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
            { canEdit ? (
              <div className="patch-buttons">
                <a href={'/edit-patch/' + seoName} className="patch-button patch-button-edit"></a>
                <span onClick={onDeletePatchClick} className="patch-button patch-button-delete"></span>
              </div>) : null

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

PatchTile.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  published: PropTypes.bool,
  authorName: PropTypes.string,
  description: PropTypes.string,
  tags: PropTypes.array,
  canEdit: PropTypes.bool,
  loggedIn: PropTypes.bool,
  onDeletePatchClick: PropTypes.func
}

PatchTile.contextTypes = {
  router: PropTypes.object.isRequired
}

export default PatchTile;