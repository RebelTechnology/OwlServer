const getScript = (scriptUrl, callback) => {
  var script = document.createElement('script');
  var prior = document.getElementsByTagName('script')[0];
  script.async = 1;
  prior.parentNode.insertBefore(script, prior);

  script.onload = script.onreadystatechange = function( _, isAbort ) {
    if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
      script.onload = script.onreadystatechange = null;
      script = undefined;

      if(callback) {
        callback(isAbort);
      }
    }
  };

  script.src = scriptUrl;
}

export default getScript;