import React from 'react';

function PatchList(props) {
  return (
    <div>
      LIST!!!
      {props.children}
    </div>
  );
}

PatchList.propTypes = {
  children: React.PropTypes.node,
};

export default PatchList;