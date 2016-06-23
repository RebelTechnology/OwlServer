import React, { PropTypes, Component }  from 'react';
import ReactDom from 'react-dom';
import NavBar from '../NavBar/NavBar';

class App extends Component {
  render(){ 

    return (
      <div>
        <NavBar />
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.node,
};

export default App;