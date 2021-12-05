const fetchCurrentUser = () => {
  return (dispatch) => {

    dispatch({
      type: 'REQUEST_CURRENT_USER'
    });

    return fetch('/wp-admin/admin-ajax.php?action=owl-get-current-user-info', {credentials: 'same-origin'})
      .then(response => {
        return response.json();
      })
      .then( response => {
          if (response.status >= 400) {
            console.error('bad status:', response.status);
          } else {
            dispatch({
              type: 'RECEIVE_CURRENT_USER',
              user: response.result
            });
          }
        },
        (err) => {
          console.error(err);
        }
      );
  }
}

export default fetchCurrentUser;
