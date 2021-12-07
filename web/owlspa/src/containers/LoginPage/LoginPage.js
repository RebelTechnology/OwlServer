import React, { PropTypes, Component }  from 'react';

class LoginPage extends Component {

  redirectUserToLoginThenRedirect = page => {
    document.location.href = `${document.location.origin}/wp-login.php?redirect_to=${document.location.origin}/patch-library/${page}`;
  }

  render(){
    return (
      <div className="wrapper flexbox">
        <div className="content-container">

          <div className="patch-library" style={{ textAlign: 'center', margin: '150px auto' }}>
            <h5>Redirecting to Login...</h5>

          </div>

        </div>
      </div>
    );
  }

  componentDidMount(){
    this.redirectUserToLoginThenRedirect('patches/my-patches');
  }

}



export default LoginPage
