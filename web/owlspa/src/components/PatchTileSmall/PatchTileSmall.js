import React, { Component, PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import styles from './PatchTileSmall.css';
import { IconButton, StarCounter, AuthorLink, Tag, PatchDetailsTile } from 'components';

class PatchTileSmall extends Component {

  constructor(props){
    super(props);

    this.state = {
      tagFilter: '',
      showTagsDropDown: false
    };
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

  handlePatchDetailsDescriptionChange(description){
    this.setState({
      description
    });
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
      availableTagList,
      patch,
      description,
      canEdit,
      editMode,
      isSaving,
      onDeletePatchClick,
      onStarClick,
      starred,
      patchName,
      published
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
    const starCount = patch.starList ? patch.starList.length : 0;
    const author = patch.author;

    let patchVisibilityStyles = {};
    if(published){
      patchVisibilityStyles.background = 'none';
      patchVisibilityStyles.paddingLeft = 0;
    }

    return (
      <div styleName="patch-tile-small">
        <div styleName="patch-title">
          { editMode ? (
            <input
              type="text"
              style={{backgroundColor: isSaving ? '#bbb' : '#fff'}}
              disabled={isSaving}
              value={patchName}
              onChange={ e => this.props.onPatchNameChange(e.target.value) }
            />) : patchName
          }
        </div>

        <div styleName="patch-right-side">
          { canEdit && (
            <div styleName="patch-tile-controls">

              { !editMode && <IconButton title="edit patch" icon={ isSaving ? 'loading' : 'edit' } disabled={isSaving} onClick={ () => this.props.onEditClick() } /> }
              { editMode && <IconButton title="cancel" icon='cancel' disabled={isSaving} onClick={  () => this.props.onCancelClick() } /> }
              { editMode && <IconButton title="save" icon={ isSaving ? 'loading' : 'save' } disabled={isSaving} onClick={  () => this.props.onSaveClick() } /> }

              <IconButton title="delete patch" icon="delete" onClick={ onDeletePatchClick } />

              { !editMode && (
                <div className="patch-visibility" style={patchVisibilityStyles} >
                  { published ? 'PUBLISHED' : 'PRIVATE'}
                </div>
              )}

            </div>)
          }

          { editMode && (
            <div styleName="patch-title-published-editor">
              <label>
                <input
                  disabled={isSaving}
                  type="radio"
                  value="PUBLISHED"
                  name="published"
                  checked={published}
                  onChange={e => this.props.onChangePublished(true)}
                />
                PUBLISHED
              </label>
              <label>
                <input
                  disabled={isSaving}
                  type="radio"
                  value="PRIVATE"
                  name="published"
                  checked={!published}
                  onChange={e => this.props.onChangePublished(false)}
                />
                PRIVATE
              </label>
            </div>
          )}
          <div styleName="star-counter-wrapper">
            <StarCounter starCount={starCount} starred={starred} onStarClick={ onStarClick } />
          </div>
        </div>

        { author && <AuthorLink author={ author.name } /> }

        { editMode ?
          <PatchDetailsTile
            title="Description"
            text={description}
            onTextChange={d => this.handlePatchDetailsDescriptionChange(d)}
            isSaving={isSaving}
            editMode={editMode}
          /> :
          (description ? <div styleName="patch-description">{description}</div> : null)
        }

        <div styleName="tags-wrapper">
          { tags && tags.map(tag => <Tag editMode={editMode} onDelete={() => this.handleDeleteTag(tag)} key={tag} tag={tag} />) }
        </div>

        { editMode && (
          <div styleName="tag-editor">
            <input
              styleName="tag-editor-filter-input"
              style={{width: '100px'}}
              type="text"
              placeholder="add a tag"
              value={tagFilter}
              disabled={isSaving}
              onClick={ e => this.handleTagFilterInputClick() }
              onChange={ e => this.handleTagFilterChange(e.target.value) }
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
        )}
      </div>
    );
  }
}

PatchTileSmall.propTypes = {
  patch: PropTypes.object,
  patchName: PropTypes.string,
  published: PropTypes.bool,
  canEdit: PropTypes.bool,
  editMode: PropTypes.bool,
  isSaving: PropTypes.bool,
  onDeletePatchClick: PropTypes.func,
  onChangePublished: PropTypes.func,
  onPatchNameChange: PropTypes.func,
  onStarClick: PropTypes.func,
  onSaveClick: PropTypes.func,
  onCancelClick: PropTypes.func,
  onEditClick: PropTypes.func,
  starred: PropTypes.bool,
  onChangeTags: PropTypes.func,
  availableTagList: PropTypes.array,
  tags: PropTypes.array,
};

PatchTileSmall.defaultProps = {
  onChangePublished: () => {},
  onPatchNameChange: () => {},
  onSaveClick: () => {},
  onCancelClick: () => {},
  onEditClick: () => {},
  availableTagList: [],
  tags: [],
  onChangeTags: () => {},
};

export default CSSModules(PatchTileSmall, styles);
