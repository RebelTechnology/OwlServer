import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

class Portal extends Component {

  componentWillMount(){
    ReactDOM.render(this.props.children, document.getElementsByTagName('body')[0]);
  }

  render(){

    return null;
  }
}

Portal.propTypes = {
  children: PropTypes.node.isRequired
}

export default Portal;