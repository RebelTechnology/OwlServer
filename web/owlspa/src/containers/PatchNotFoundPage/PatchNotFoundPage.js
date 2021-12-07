import React, { PropTypes, Component }  from 'react';

class PatchNotFoundPage extends Component {

  render(){
    return (
      <div className="wrapper flexbox">
        <div className="content-container">

          <div className="patch-library" style={{ textAlign: 'center', margin: '150px auto' }}>
            <h5>Patch not found.</h5>
            <h5>Please try searching above.</h5>
          </div>

        </div>
      </div>
    );
  }

}

export default PatchNotFoundPage
