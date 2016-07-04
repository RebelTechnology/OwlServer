import React, { PropTypes, Component }  from 'react';
import ReactDom from 'react-dom';
import { NavBar } from 'containers';
import { fetchCurrentUser } from 'actions';
import { connect } from 'react-redux';

class App extends Component {
  componentWillMount(){
    this.props.fetchCurrentUser();
  }
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

export default connect(null, { fetchCurrentUser })(App);