import { 
  UPLOADING_PATCH_FILES,
  PATCH_FILES_UPLOADED,
  ERROR_UPLOADING_PATCH_FILE,
  REMOVE_UPLOADED_FILE,
  ADD_GITHUB_FILE,
  GITHUB_URL_FIELD_CHANGE,
  REMOVE_GITHUB_FILE } from 'constants';

const dedupeFiles = (sourceFiles , newFiles) => {
  return sourceFiles.filter(sourceFile => {
    return !newFiles.some(newFile => {
      return newFile.name === sourceFile.name;
    });
  });
}

const initialState = {
  isUploading: false,
  sourceFiles:[],
  gitHubURLField:''
};

const editPatchForm = (state = initialState, action) => {
  switch (action.type) {
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
          ...dedupeFiles(state.sourceFiles, action.gitHubFile),
          ...action.gitHubFile
        ],
        gitHubURLField: ''
      }

    case ERROR_UPLOADING_PATCH_FILE:
      return {
        ...state,
        isUploading: false
      }


    default:
      return state
  }
}

export default editPatchForm;