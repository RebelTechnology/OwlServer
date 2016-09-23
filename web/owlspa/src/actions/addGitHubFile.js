import {
  ADD_GITHUB_FILE
} from 'constants';


const addGitHubFile = (gitHubUrl) => {
  return {
    type: ADD_GITHUB_FILE,
    gitHubFile : {name: gitHubUrl, path: gitHubUrl, type: 'gitHub'}
  };
}

export default addGitHubFile;