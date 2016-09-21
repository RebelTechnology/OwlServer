import { 
  UPLOADING_PATCH_FILES,
  PATCH_FILES_UPLOADED,
  ERROR_UPLOADING_PATCH_FILE,
  REMOVE_UPLOADED_FILE,
  ADD_GITHUB_FILE,
  SOURCE_FILE_CHANGE,
  GITHUB_URL_FIELD_CHANGE,
  REMOVE_GITHUB_FILE,
  UPDATE_PATCH_NAME,
  ERROR_SAVING_PATCH,
  ERROR_IN_SOURCE_FILE_URL,
  CLEAR_SOURCE_FILE_ERRORS,
  INVALID_FIELD_DATA,
  PATCH_SAVING,
  PATCH_SAVED } from 'constants';

const dedupeFiles = (sourceFiles , newFiles) => {
  return sourceFiles.filter(sourceFile => {
    return !newFiles.some(newFile => {
      return newFile.name === sourceFile.name;
    });
  });
}

const pushSourceFileError = (sourceFileErrors, index, error) => {
  let newSourceFileErrors = [ ...sourceFileErrors ];
  newSourceFileErrors[index] = error;
  return newSourceFileErrors;
};

const initialState = {
  isUploading: false,
  isSavingPatch: false,
  sourceFiles: [],
  gitHubURLField: '',
  patchName: '',
  sourceFileErrors:[],
  invalidFields: {}
};

const editPatchForm = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_PATCH_NAME:
      return { 
        ...state,
        patchName: action.patchName
      }

    case PATCH_SAVING:
      return { 
        ...state,
        isSavingPatch: true
      }

    case PATCH_SAVED:
      return { 
        ...state,
        isSavingPatch: false
      }

    case UPLOADING_PATCH_FILES:
      return { 
        ...state,
        isUploading: true
      }

    case PATCH_FILES_UPLOADED:
      return { 
        ...state,
        isUploading: false,
        sourceFiles: [
          ...dedupeFiles(state.sourceFiles, action.files),
          ...action.files
        ]
      }

    case REMOVE_UPLOADED_FILE:
      return { 
        ...state,
        sourceFiles: state.sourceFiles.filter(file => {
          return file.name !== action.fileName;
        })
      }

    case GITHUB_URL_FIELD_CHANGE:
      return { 
        ...state,
        gitHubURLField: action.gitHubURL
      }

    case ADD_GITHUB_FILE:
      return { 
        ...state,
        sourceFiles: [
          ...dedupeFiles(state.sourceFiles, [action.gitHubFile]),
          action.gitHubFile
        ],
        gitHubURLField: ''
      }

    case SOURCE_FILE_CHANGE:
      return {
        ...state,
        sourceFiles: [
          ...dedupeFiles(state.sourceFiles, [action.sourceFile]),
          action.sourceFile
        ]
      }

    case ERROR_UPLOADING_PATCH_FILE:
      return {
        ...state,
        isUploading: false
      }

    case ERROR_IN_SOURCE_FILE_URL:
      return {
        ...state,
        sourceFileErrors: pushSourceFileError(state.sourceFileErrors, action.index, action.error)
      }

    case CLEAR_SOURCE_FILE_ERRORS:
      return {
        ...state,
        sourceFileErrors: []
      }

    case INVALID_FIELD_DATA:
      return {
        ...state,
        invalidFields: {
          ...state.invalidFields,
          [action.field]: action.error
        }
      }

    default:
      return state
  }
}

export default editPatchForm;
