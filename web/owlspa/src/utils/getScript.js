const getScript = (scriptUrl) => {
  return new Promise( (resolve, reject) => {
    let script = document.createElement('script');
    let prior = document.getElementsByTagName('script')[0];
    script.async = 1;
    prior.parentNode.insertBefore(script, prior);
    script.onload = script.onreadystatechange = ( e, isAbort ) => {
      if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
        script.onload = script.onreadystatechange = null;
        script = undefined;
      }
      if(isAbort){
        reject('unable to load script: '+ scriptUrl);
      } else {
        resolve();
      }
    };
    script.src = scriptUrl;
  });
}

export default getScript;
