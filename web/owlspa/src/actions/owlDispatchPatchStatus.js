import { dispatch } from '../index';

const owlDispatchPatchStatus = (status) => {
	let m = status.match(/CPU: (\d{1,3}%) Memory: (\d+)/);

	let s;
	if (m) {
		s = [
			['CPU', m[1]],
			['MEMORY', m[2]],
		]
	} else {
		s = ['STATUS', status]
	}

  dispatch({
    type: 'OWL_PATCH_STATUS_RECEIVED',
    status: s,
  });
}

export default owlDispatchPatchStatus;
