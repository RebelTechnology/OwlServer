const debounce = (func, milliseconds) => {
  milliseconds = milliseconds || 100;
  if(typeof func !== 'function'){
    console.error('func provided not a function');
    return () => {}; //noop
  }

  let timeout = null;

  const clear = () => {
    window.clearTimeout(timeout);
    timeout = null;
  };

  const set = () => {
    timeout && window.clearTimeout(timeout);
    timeout = window.setTimeout(clear, milliseconds);
  };

  return (...args) => {
    !timeout && func(...args);
    set();
  };

};

export default debounce;
