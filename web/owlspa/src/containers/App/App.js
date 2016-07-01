import React, { PropTypes, Component }  from 'react';
import ReactDom from 'react-dom';
import { NavBar } from 'containers';

class App extends Component {
  render(){ 
    return (
      <div>
        <NavBar location={this.props.location} routeParams={this.props.routeParams} />
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.node,
};

export default App;