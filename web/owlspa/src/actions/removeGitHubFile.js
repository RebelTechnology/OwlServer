const removeGitHubFile = (filePath) => {
  return {
    type: 'REMOVE_GITHUB_FILE',
    filePath
  };
}

export default removeGitHubFile;
