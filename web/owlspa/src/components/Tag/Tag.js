import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

class Tag extends Component {
  
  onClick(e){
    const { 
      editMode
    } = this.props;

    e.stopPropagation();

    if(editMode){
      this.props.onDelete();
    } else {
      this.props.onClick();
    }
  }

  render(){
    const { 
      tag,
      editMode
    } = this.props;
    return (
      <div className="tag" onClick={(e) => this.onClick(e)}>
        { !editMode && <Link to={`/patches/tags/${tag}`}>{tag}</Link>}
        { editMode && (
          <span style={{textTransform: 'uppercase', fontSize: '12px'}}>
            <span style={{fontWeight: 'bold'}}> x </span>
            <span>{tag}</span>
          </span>
        )}
      </div>
    );
  }
}

Tag.propTypes = {
  tag: PropTypes.string,
  editMode: PropTypes.bool,
  onClick: PropTypes.func,
  onDelete: PropTypes.func
}

Tag.defaultProps = {
  onClick: () => {},
  onDelete: () => {}
};

export default Tag;