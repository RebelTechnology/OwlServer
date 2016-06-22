import React, { PropTypes, Component }  from 'react';
import ReactDom from 'react-dom';
import NavBar from './NavBar';

class App extends Component {
  render(){ 
    const navLinks = ['Latest', 'Tags', 'Authors', 'All', 'My Patches'];

    return (
      <div>
        <NavBar navLinks={navLinks} />
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.node,
};

export default App;