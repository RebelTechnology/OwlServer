const icons = {
  edit: {
    path:'M5.672 24l1.422-1.422-3.672-3.672-1.422 1.422v1.672h2v2h1.672zM13.844 9.5c0-0.203-0.141-0.344-0.344-0.344-0.094 0-0.187 0.031-0.266 0.109l-8.469 8.469c-0.078 0.078-0.109 0.172-0.109 0.266 0 0.203 0.141 0.344 0.344 0.344 0.094 0 0.187-0.031 0.266-0.109l8.469-8.469c0.078-0.078 0.109-0.172 0.109-0.266zM13 6.5l6.5 6.5-13 13h-6.5v-6.5zM23.672 8c0 0.531-0.219 1.047-0.578 1.406l-2.594 2.594-6.5-6.5 2.594-2.578c0.359-0.375 0.875-0.594 1.406-0.594s1.047 0.219 1.422 0.594l3.672 3.656c0.359 0.375 0.578 0.891 0.578 1.422z',
    viewBox: '0 0 30 30'
  },
  delete: {
    path: 'M8 11.5v9c0 0.281-0.219 0.5-0.5 0.5h-1c-0.281 0-0.5-0.219-0.5-0.5v-9c0-0.281 0.219-0.5 0.5-0.5h1c0.281 0 0.5 0.219 0.5 0.5zM12 11.5v9c0 0.281-0.219 0.5-0.5 0.5h-1c-0.281 0-0.5-0.219-0.5-0.5v-9c0-0.281 0.219-0.5 0.5-0.5h1c0.281 0 0.5 0.219 0.5 0.5zM16 11.5v9c0 0.281-0.219 0.5-0.5 0.5h-1c-0.281 0-0.5-0.219-0.5-0.5v-9c0-0.281 0.219-0.5 0.5-0.5h1c0.281 0 0.5 0.219 0.5 0.5zM18 22.813v-14.812h-14v14.812c0 0.75 0.422 1.188 0.5 1.188h13c0.078 0 0.5-0.438 0.5-1.188zM7.5 6h7l-0.75-1.828c-0.047-0.063-0.187-0.156-0.266-0.172h-4.953c-0.094 0.016-0.219 0.109-0.266 0.172zM22 6.5v1c0 0.281-0.219 0.5-0.5 0.5h-1.5v14.812c0 1.719-1.125 3.187-2.5 3.187h-13c-1.375 0-2.5-1.406-2.5-3.125v-14.875h-1.5c-0.281 0-0.5-0.219-0.5-0.5v-1c0-0.281 0.219-0.5 0.5-0.5h4.828l1.094-2.609c0.313-0.766 1.25-1.391 2.078-1.391h5c0.828 0 1.766 0.625 2.078 1.391l1.094 2.609h4.828c0.281 0 0.5 0.219 0.5 0.5z',
    viewBox: '0 0 30 30'
  },
  cancel: {
    path: 'M810 664.667l-238-238 238-238-60-60-238 238-238-238-60 60 238 238-238 238 60 60 238-238 238 238z',
    viewBox: '100 -25 1000 1000'
  },
  save: {
    path: 'M6 24h12v-6h-12v6zM20 24h2v-14c0-0.297-0.266-0.938-0.469-1.141l-4.391-4.391c-0.219-0.219-0.828-0.469-1.141-0.469v6.5c0 0.828-0.672 1.5-1.5 1.5h-9c-0.828 0-1.5-0.672-1.5-1.5v-6.5h-2v20h2v-6.5c0-0.828 0.672-1.5 1.5-1.5h13c0.828 0 1.5 0.672 1.5 1.5v6.5zM14 9.5v-5c0-0.266-0.234-0.5-0.5-0.5h-3c-0.266 0-0.5 0.234-0.5 0.5v5c0 0.266 0.234 0.5 0.5 0.5h3c0.266 0 0.5-0.234 0.5-0.5zM24 10v14.5c0 0.828-0.672 1.5-1.5 1.5h-21c-0.828 0-1.5-0.672-1.5-1.5v-21c0-0.828 0.672-1.5 1.5-1.5h14.5c0.828 0 1.969 0.469 2.562 1.062l4.375 4.375c0.594 0.594 1.062 1.734 1.062 2.562z',
    viewBox: '0 0 30 30'
  },
  loading: {
    path: 'M24 12c-0.030-1.567-0.37-3.129-0.998-4.558-0.626-1.43-1.534-2.725-2.649-3.795s-2.436-1.918-3.867-2.476c-1.43-0.561-2.967-0.829-4.486-0.796-1.519 0.030-3.031 0.36-4.414 0.969-1.384 0.607-2.638 1.488-3.673 2.568s-1.855 2.36-2.395 3.745c-0.542 1.384-0.8 2.872-0.767 4.342 0.030 1.471 0.351 2.933 0.941 4.27 0.588 1.338 1.441 2.551 2.487 3.552s2.284 1.793 3.624 2.314c1.339 0.523 2.776 0.771 4.199 0.739 1.423-0.030 2.835-0.341 4.127-0.912 1.293-0.569 2.464-1.394 3.43-2.406s1.731-2.209 2.233-3.502c0.305-0.784 0.513-1.603 0.622-2.433 0.029 0.002 0.059 0.003 0.088 0.003 0.828 0 1.5-0.672 1.5-1.5 0-0.042-0.002-0.084-0.006-0.125h0.006zM21.617 15.983c-0.55 1.247-1.347 2.377-2.324 3.309s-2.133 1.668-3.381 2.151c-1.248 0.485-2.585 0.714-3.911 0.682-1.327-0.030-2.639-0.322-3.84-0.855-1.201-0.531-2.289-1.301-3.187-2.243s-1.606-2.057-2.070-3.259c-0.466-1.202-0.685-2.489-0.653-3.768 0.031-1.279 0.312-2.541 0.826-3.696 0.512-1.155 1.254-2.202 2.162-3.066s1.981-1.544 3.138-1.989c1.156-0.447 2.394-0.656 3.624-0.624 1.23 0.031 2.443 0.303 3.552 0.798 1.11 0.493 2.115 1.207 2.944 2.081s1.481 1.905 1.908 3.016c0.428 1.111 0.628 2.298 0.596 3.48h0.006c-0.003 0.041-0.006 0.083-0.006 0.125 0 0.774 0.586 1.41 1.338 1.491-0.146 0.816-0.387 1.613-0.721 2.367z',
    viewBox: '0 0 24 24',
    size: 20,
    spin: true
  },
  popular: {
    path:'M18 25.875l-10.125 6.75 4.5-11.25-10.125-6.75h11.25l4.5-11.25 4.5 11.25h11.25l-10.125 6.75 4.5 11.25z',
    viewBox: '3 4 30 30'
  },
  star: {
    path:'M15 21.563l8.438 5.625-3.75-9.375 8.438-5.625h-9.375l-3.75-9.375-3.75 9.375h-9.375l8.438 5.625-3.75 9.375 8.438-5.625zM15 20.393l-6.375 4.263 3-7.219-6.75-4.313h7.031l3.094-7.969 3.094 7.969h7.031l-6.75 4.313 3 7.219-6.375-4.263z',
    viewBox: '3 2 30 30'
  },
  starred: {
    path:'M15 21.563l-8.438 5.625 3.75-9.375-8.438-5.625h9.375l3.75-9.375 3.75 9.375h9.375l-8.438 5.625 3.75 9.375z',
    viewBox: '3 2 30 30'
  },
  all: {
    path:'M14.063 1.875c-7.766 0-14.063 6.296-14.063 14.063s6.296 14.063 14.063 14.063c7.767 0 14.063-6.296 14.063-14.063s-6.296-14.063-14.063-14.063zM22.019 20.625c0.251-1.185 0.41-2.443 0.462-3.75h3.734c-0.098 1.295-0.399 2.552-0.899 3.75h-3.297zM6.106 11.25c-0.251 1.185-0.41 2.443-0.462 3.75h-3.734c0.098-1.295 0.399-2.552 0.899-3.75h3.297zM20.099 11.25c0.282 1.2 0.451 2.457 0.506 3.75h-5.605v-3.75h5.099zM15 9.375v-5.488c0.427 0.124 0.851 0.333 1.266 0.626 0.779 0.549 1.524 1.395 2.154 2.446 0.436 0.727 0.813 1.536 1.128 2.417h-4.549zM9.704 6.958c0.631-1.051 1.376-1.897 2.154-2.446 0.415-0.293 0.839-0.502 1.266-0.626v5.488h-4.549c0.315-0.881 0.692-1.69 1.128-2.417zM13.125 11.25v3.75h-5.605c0.055-1.293 0.225-2.55 0.506-3.75h5.099zM2.809 20.625c-0.5-1.198-0.801-2.455-0.899-3.75h3.734c0.052 1.307 0.21 2.565 0.462 3.75h-3.297zM7.52 16.875h5.605v3.75h-5.099c-0.282-1.2-0.451-2.457-0.506-3.75zM13.125 22.5v5.488c-0.427-0.124-0.851-0.333-1.266-0.626-0.779-0.549-1.524-1.395-2.154-2.446-0.436-0.727-0.813-1.536-1.128-2.417h4.549zM18.421 24.917c-0.631 1.051-1.376 1.897-2.154 2.446-0.416 0.293-0.839 0.502-1.266 0.626v-5.488h4.549c-0.315 0.881-0.692 1.69-1.128 2.417zM15 20.625v-3.75h5.605c-0.055 1.293-0.225 2.55-0.506 3.75h-5.099zM22.481 15c-0.052-1.307-0.21-2.565-0.462-3.75h3.297c0.5 1.198 0.801 2.455 0.899 3.75h-3.734zM24.336 9.375h-2.81c-0.546-1.722-1.3-3.231-2.207-4.436 1.246 0.596 2.375 1.395 3.361 2.381 0.629 0.629 1.182 1.317 1.655 2.055zM5.445 7.32c0.986-0.986 2.115-1.785 3.361-2.381-0.907 1.205-1.66 2.715-2.207 4.436h-2.81c0.473-0.739 1.026-1.426 1.655-2.055zM3.789 22.5h2.81c0.546 1.722 1.3 3.231 2.207 4.436-1.246-0.596-2.375-1.395-3.361-2.381-0.629-0.629-1.183-1.317-1.655-2.055zM22.68 24.555c-0.986 0.986-2.115 1.785-3.361 2.381 0.907-1.205 1.66-2.715 2.207-4.436h2.81c-0.473 0.739-1.026 1.426-1.655 2.055z',
    viewBox: '0 0 30 30'
  },
  authors: {
    path:'M9.927 15c-1.741 0.050-3.315 0.804-4.436 2.143h-2.243c-1.674 0-3.248-0.804-3.248-2.662 0-1.356-0.050-5.91 2.076-5.91 0.352 0 2.093 1.423 4.353 1.423 0.77 0 1.507-0.134 2.227-0.385-0.050 0.368-0.084 0.737-0.084 1.105 0 1.523 0.485 3.030 1.356 4.286zM27.857 25.664c0 2.712-1.791 4.336-4.47 4.336h-14.632c-2.679 0-4.47-1.624-4.47-4.336 0-3.783 0.887-9.593 5.792-9.593 0.569 0 2.645 2.327 5.993 2.327s5.424-2.327 5.993-2.327c4.905 0 5.792 5.809 5.792 9.593zM10.714 4.286c0 2.36-1.925 4.286-4.286 4.286s-4.286-1.925-4.286-4.286 1.925-4.286 4.286-4.286 4.286 1.925 4.286 4.286zM22.5 10.714c0 3.549-2.879 6.429-6.429 6.429s-6.429-2.879-6.429-6.429 2.879-6.429 6.429-6.429 6.429 2.879 6.429 6.429zM32.143 14.481c0 1.858-1.574 2.662-3.248 2.662h-2.243c-1.122-1.339-2.695-2.093-4.436-2.143 0.871-1.256 1.356-2.762 1.356-4.286 0-0.368-0.033-0.737-0.084-1.105 0.72 0.251 1.456 0.385 2.227 0.385 2.26 0 4.001-1.423 4.353-1.423 2.126 0 2.076 4.554 2.076 5.91zM30 4.286c0 2.36-1.925 4.286-4.286 4.286s-4.286-1.925-4.286-4.286 1.925-4.286 4.286-4.286 4.286 1.925 4.286 4.286z',
    viewBox: '0 0 30 30'
  },
  latest: {
    path:'M30 11.25h-11.25l4.205-4.205c-2.125-2.125-4.95-3.295-7.955-3.295s-5.83 1.17-7.955 3.295c-2.125 2.125-3.295 4.95-3.295 7.955s1.17 5.83 3.295 7.955c2.125 2.125 4.95 3.295 7.955 3.295s5.83-1.17 7.955-3.295c0.177-0.177 0.347-0.36 0.511-0.547l2.822 2.469c-2.749 3.14-6.787 5.123-11.288 5.123-8.284 0-15-6.716-15-15s6.716-15 15-15c4.142 0 7.892 1.679 10.606 4.394l4.394-4.394v11.25z',
    viewBox: '0 0 30 30'
  },
  search: {
    path:'M18.213 19.15c-1.303 0.928-2.897 1.475-4.619 1.475-4.401 0-7.969-3.568-7.969-7.969s3.568-7.969 7.969-7.969c4.401 0 7.969 3.568 7.969 7.969 0 1.722-0.546 3.316-1.475 4.619l5.236 5.236c0.516 0.516 0.512 1.341-0 1.853l-0.022 0.022c-0.51 0.51-1.341 0.512-1.853 0l-5.236-5.236zM13.594 18.75c3.365 0 6.094-2.728 6.094-6.094s-2.728-6.094-6.094-6.094c-3.365 0-6.094 2.728-6.094 6.094s2.728 6.094 6.094 6.094v0z',
    viewBox: '5 4 21 21'
  },
  tags: {
    path:'M7.5 7.5c0-1.189-0.954-2.143-2.143-2.143s-2.143 0.954-2.143 2.143 0.954 2.143 2.143 2.143 2.143-0.954 2.143-2.143zM25.363 17.143c0 0.569-0.234 1.122-0.619 1.507l-8.22 8.237c-0.402 0.385-0.954 0.619-1.523 0.619s-1.122-0.234-1.507-0.619l-11.97-11.987c-0.854-0.837-1.523-2.461-1.523-3.65v-6.964c0-1.172 0.971-2.143 2.143-2.143h6.964c1.189 0 2.813 0.67 3.666 1.523l11.97 11.953c0.385 0.402 0.619 0.954 0.619 1.523zM31.791 17.143c0 0.569-0.234 1.122-0.619 1.507l-8.22 8.237c-0.402 0.385-0.954 0.619-1.523 0.619-0.871 0-1.306-0.402-1.875-0.988l7.868-7.868c0.385-0.385 0.619-0.938 0.619-1.507s-0.234-1.122-0.619-1.523l-11.97-11.953c-0.854-0.854-2.478-1.523-3.666-1.523h3.75c1.189 0 2.813 0.67 3.666 1.523l11.97 11.953c0.385 0.402 0.619 0.954 0.619 1.523z',
    viewBox: '0 0 30 30'
  },
  myPatches: {
    path:'M27.857 18.382c0 1.724-0.988 3.164-2.813 3.164-2.042 0-2.578-1.858-4.42-1.858-1.339 0-1.842 0.837-1.842 2.076 0 1.306 0.536 2.561 0.519 3.85v0.084c-0.184 0-0.368 0-0.552 0.017-1.724 0.167-3.465 0.502-5.206 0.502-1.189 0-2.427-0.469-2.427-1.842 0-1.842 1.858-2.377 1.858-4.42 0-1.825-1.44-2.813-3.164-2.813-1.758 0-3.382 0.971-3.382 2.896 0 2.126 1.624 3.047 1.624 4.202 0 0.586-0.368 1.105-0.77 1.49-0.519 0.485-1.256 0.586-1.959 0.586-1.373 0-2.746-0.184-4.102-0.402-0.301-0.050-0.619-0.084-0.921-0.134l-0.218-0.033c-0.033-0.017-0.084-0.017-0.084-0.033v-17.143c0.067 0.050 1.055 0.167 1.222 0.201 1.356 0.218 2.729 0.402 4.102 0.402 0.703 0 1.44-0.1 1.959-0.586 0.402-0.385 0.77-0.904 0.77-1.49 0-1.155-1.624-2.076-1.624-4.202 0-1.925 1.624-2.896 3.398-2.896 1.708 0 3.147 0.988 3.147 2.813 0 2.042-1.858 2.578-1.858 4.42 0 1.373 1.239 1.842 2.427 1.842 1.925 0 3.834-0.435 5.742-0.536v0.033c-0.050 0.067-0.167 1.055-0.201 1.222-0.218 1.356-0.402 2.729-0.402 4.102 0 0.703 0.1 1.44 0.586 1.959 0.385 0.402 0.904 0.77 1.49 0.77 1.155 0 2.076-1.624 4.202-1.624 1.925 0 2.896 1.624 2.896 3.382z',
    viewBox: '0 0 30 30'
  },
  plusSymbol: {
    path: 'M29.063 11.25h-10.313v-10.313c0-0.518-0.42-0.938-0.938-0.938h-5.625c-0.518 0-0.938 0.42-0.938 0.938v10.313h-10.313c-0.518 0-0.938 0.42-0.938 0.938v5.625c0 0.518 0.42 0.938 0.938 0.938h10.313v10.313c0 0.518 0.42 0.938 0.938 0.938h5.625c0.518 0 0.938-0.42 0.938-0.938v-10.313h10.313c0.518 0 0.938-0.42 0.938-0.938v-5.625c0-0.518-0.42-0.938-0.938-0.938z',
    viewBox: '0 0 30 30'
  },
  usb: {
    path: 'M664.2 84.42v72.42h66.85v-78h94.7v78h66.85V12H664.2v72.42zM263.1 25.93c-73.26 19.78-126.18 70.19-150.69 143.45l-6.69 19.5-.83 217.26-.84 217.26-8.08 8.36c-4.46 4.46-10.58 13.93-13.65 20.89-5.29 11.42-5.85 18.11-5.85 78.55v66.29h167.12V733.7c0-71.3-1.39-79.1-18.1-99.44l-9.75-11.98.56-209.74.83-209.74 9.47-17.55c10.86-19.78 27.3-35.65 47.07-45.4 11.14-5.57 17.55-6.69 40.95-6.69 26.46 0 28.69.56 45.4 9.47 17.83 9.75 33.42 25.07 41.5 40.67 11.98 22.56 11.98 22.84 11.98 329.23 0 317.54-.28 311.13 15.32 349.57 10.58 26.46 27.85 50.41 51.53 72.98 36.49 33.98 81.33 53.48 130.91 56.54 99.44 5.85 186.62-57.1 216.15-156.54 4.46-14.76 5.02-33.15 5.85-166.29l1.11-149.3 15.32-7.52c24.23-11.98 49.3-37.32 61.84-62.11l10.3-21.17.84-116.43.83-116.43H630.77v104.18c0 57.94 1.12 110.58 2.79 118.94 6.96 36.77 35.09 73.53 70.47 91.64l18.94 9.75-.84 142.06c-1.11 157.1-.56 153.47-19.5 178.26-29.8 38.72-80.22 50.7-123.12 29.53-20.89-10.3-35.65-25.35-45.96-47.35l-7.24-15.6-1.39-306.39-1.67-306.39-6.13-20.89c-11.7-37.32-27.02-62.67-54.87-90.53-28.69-28.69-46.79-40.11-81.33-52.37-21.45-7.24-28.97-8.63-60.72-9.47-29.8-.84-39.83-.01-57.1 4.73zM794.84 279.4c15.6 4.46 29.52 15.88 37.88 30.92 6.69 12.26 7.52 16.43 6.41 32.87-1.11 22.56-9.75 37.6-27.57 49.58-14.77 9.75-39 11.98-56.82 5.01-16.71-6.41-33.42-25.35-37.6-43.45-11.16-46.52 32.02-88.02 77.7-74.93zM118.26 847.62v27.85h80.78v-55.7h-80.78v27.85zM701,342a76,76 0 1,0 152,0a76,76 0 1,0 -152,0z',
    viewBox: '0 0 1000 1000'
  }
};

export default icons;