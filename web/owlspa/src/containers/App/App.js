import React, { PropTypes, Component }  from 'react';
import { NavBar, Dialog } from 'containers';
import { fetchCurrentUser } from 'actions';
import { connect } from 'react-redux';

class App extends Component {

  render(){ 
    const { location, routeParams, children } = this.props;
    return (
      <div>
        <Dialog />
        <NavBar location={location} routeParams={routeParams} />
        { children }
      </div>
    );
  }

  componentDidMount(){
    this.props.fetchCurrentUser();
  }

}

App.propTypes = {
  children: PropTypes.node
};

export default connect(null, { fetchCurrentUser })(App);