const parseUrl = (urlString) => {
  const urlRegex = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
  const result = urlRegex.exec(urlString)
  return {
    scheme: result[2],
    authority: result[4],
    path: result[5],
    query: result[7],
    fragment: result[9]
  }
}

export default parseUrl;