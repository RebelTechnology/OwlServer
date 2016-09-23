import {
  GITHUB_URL_FIELD_CHANGE
} from 'constants';


const gitHubURLFieldChange = (gitHubURL) => {
  return {
    type: GITHUB_URL_FIELD_CHANGE,
    gitHubURL
  };
}

export default gitHubURLFieldChange;