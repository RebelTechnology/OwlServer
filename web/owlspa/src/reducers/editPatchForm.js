const setMainSourcefile = (sourceFiles, mainSourceFile) => {
  return sourceFiles.map(sourceFile => {
    return {
      ...sourceFile,
      mainFile: sourceFile.name === mainSourceFile.name
    };
  });
};

const updateExisitingSourceFiles = (sourceFiles, newFiles) => {
  return sourceFiles.map(sourceFile => {
    let updatedSourceFile =  { ...sourceFile };
    newFiles.some((newFile, i) => {
      if(newFile.name === updatedSourceFile.name){
        updatedSourceFile = {
          ...sourceFile,
          ...newFile
        }
      }
      return newFile.name === updatedSourceFile.name;
    });
    return updatedSourceFile;
  });
};

const addOnlyNewSourceFiles = (sourceFiles, newFiles) => {
  return newFiles.filter(newFile => {
    return !sourceFiles.some(sourceFile => {
      return newFile.name === sourceFile.name;
    });
  }).map(newFile => {
    newFile.timeStamp = new Date().getTime();
    return newFile;
  }).concat(sourceFiles);
};

const updateSourceFiles = (sourceFiles , newFiles) => {
  newFiles = Array.isArray(newFiles) ? newFiles : [newFiles];
  if(sourceFiles.length === 0){
    newFiles[0].mainFile = true;
  }
  let updatedSourceFiles = updateExisitingSourceFiles(sourceFiles, newFiles);
  return addOnlyNewSourceFiles(updatedSourceFiles, newFiles);
};

const pushSourceFileError = (sourceFileErrors, index, error) => {
  let newSourceFileErrors = [ ...sourceFileErrors ];
  newSourceFileErrors[index] = error;
  return newSourceFileErrors;
};

const getSourceFileList = fileList => {
  return fileList.map((filePath, i)=> {
    let fileName = filePath.split('/');
    fileName = fileName[fileName.length - 1];
    return {
      path: filePath,
      name: fileName,
      mainFile: i === 0
    }
  })
}

const initialState = {
  isUploading: false,
  isSavingPatch: false,
  isCompiling: false,
  sourceFiles: [],
  gitHubURLField: '',
  patchName: '',
  sourceFileErrors:[],
  invalidFields: {},
  compilationType:'cpp'
};

const editPatchForm = (state = initialState, action) => {
  switch (action.type) {
    case 'LOAD_PATCH_INTO_EDIT_PATCH_FORM':
      return {
        ...initialState,
        sourceFiles: getSourceFileList(action.patch.github),
        patchName: action.patch.name,
        compilationType: action.patch.compilationType || 'cpp'
      };

    case 'UPDATE_PATCH_NAME':
      return {
        ...state,
        patchName: action.patchName
      };

    case 'PATCH_SAVING':
      return {
        ...state,
        isSavingPatch: true
      };

    case 'PATCH_SAVED':
      return {
        ...state,
        isSavingPatch: false
      };

    case 'ERROR_SAVING_PATCH':
      return {
        ...state,
        isSavingPatch: false
      };

    case 'UPLOADING_PATCH_FILES':
      return {
        ...state,
        isUploading: true
      };

    case 'PATCH_FILES_UPLOADED':
      return {
        ...state,
        isUploading: false,
        sourceFiles: [
          ...updateSourceFiles(state.sourceFiles, action.files)
        ]
      };

    case 'REMOVE_UPLOADED_FILE':
      return {
        ...state,
        sourceFiles: state.sourceFiles.filter(file => {
          return file.name !== action.fileName;
        })
      };

    case 'GITHUB_URL_FIELD_CHANGE':
      return {
        ...state,
        gitHubURLField: action.gitHubURL
      };

    case 'ADD_GITHUB_FILE':
      return {
        ...state,
        sourceFiles: [
          ...updateSourceFiles(state.sourceFiles, action.gitHubFile)
        ],
        gitHubURLField: ''
      };

    case 'SOURCE_FILE_CHANGE':
      return {
        ...state,
        sourceFiles: [
          ...updateSourceFiles(state.sourceFiles, action.sourceFile)
        ]
      };

    case 'SET_MAIN_SOURCE_FILE':
      return {
        ...state,
        sourceFiles: [
          ...setMainSourcefile(state.sourceFiles, action.mainSourceFile)
        ]
      };

    case 'ERROR_UPLOADING_PATCH_FILE':
      return {
        ...state,
        isUploading: false
      };

    case 'ERROR_IN_SOURCE_FILE_URL':
      return {
        ...state,
        sourceFileErrors: pushSourceFileError(state.sourceFileErrors, action.index, action.error)
      };

    case 'CLEAR_SOURCE_FILE_ERRORS':
      return {
        ...state,
        sourceFileErrors: []
      };

    case 'INVALID_FIELD_DATA':
      return {
        ...state,
        invalidFields: {
          ...state.invalidFields,
          [action.field]: action.error
        }
      };

    case 'CLEAR_EDIT_PATCH_FORM':
     return {
        ...initialState
     };

    case 'REQUEST_COMPILE_PATCH':
      return {
        ...state,
        isCompiling : true
      };

    case 'RECEIVE_COMPILE_PATCH':
      return {
        ...state,
        isCompiling : false
      };

    case 'PATCH_COMPILATION_FAILED':
      return {
        ...state,
        isCompiling : false
      };

    case 'UPDATE_COMPILATION_TYPE':
      return {
        ...state,
        compilationType : action.compilationType
      };

    default:
      return state;
  }
}

export default editPatchForm;
