import React, { PropTypes, Component }  from 'react';
import { NavBar, Dialog } from 'containers';
import { fetchCurrentUser } from 'actions';
import { connect } from 'react-redux';

class App extends Component {
  componentWillMount(){
    this.props.fetchCurrentUser();
  }
  render(){ 
    return (
      <div>
        <Dialog />
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