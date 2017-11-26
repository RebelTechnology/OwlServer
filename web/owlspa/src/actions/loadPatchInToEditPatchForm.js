import {
  LOAD_PATCH_INTO_EDIT_PATCH_FORM
} from 'constants';


const loadPatchInToEditPatchForm = patch => {
  return {
    type: LOAD_PATCH_INTO_EDIT_PATCH_FORM,
    patch
  };
};

export default loadPatchInToEditPatchForm;