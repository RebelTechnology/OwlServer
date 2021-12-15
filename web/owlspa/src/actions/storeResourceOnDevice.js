import * as owl from 'lib/owlCmd';

import newDialog from './newDialog';

const storeResourceOnDevice = (file) => {
  return (dispatch) => {
    owl.pollStatusStop();

    dispatch({
      type: 'BEGIN_LOAD_RESOURCE_ON_TO_OWL'
    });
		console.log("loooo?")

    return owl.storeResourceOnDevice(file)
      .then(
				result => {
					dispatch({
						type: 'COMPLETE_LOAD_RESOURCE_ON_TO_OWL',
						resourceLoaded: true
					});
				},
				err => {
					dispatch({
						type: 'COMPLETE_LOAD_RESOURCE_ON_TO_OWL',
						resourceLoaded: false
					});

					console.error(err);

					dispatch(newDialog({
						header: 'Failed to load resource on to OWL',
						isError: true,
						tabs: [{
							header: 'Error',
							isError: true,
							contents: 'Failed to load resource to OWL'
						}]
					}));
				}
			)
			.then(owl.pollStatus);
  }
}

export default storeResourceOnDevice;
