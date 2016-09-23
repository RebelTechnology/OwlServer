export const REQUEST_PATCHES = 'REQUEST_PATCHES';
export const RECEIVE_PATCHES = 'RECEIVE_PATCHES';

export const REQUEST_AUTHORS = 'REQUEST_AUTHORS';
export const RECEIVE_AUTHORS = 'RECEIVE_AUTHORS';

export const REQUEST_TAGS = 'REQUEST_TAGS';
export const RECEIVE_TAGS = 'RECEIVE_TAGS';

export const REQUEST_CURRENT_USER = 'REQUEST_CURRENT_USER';
export const RECEIVE_CURRENT_USER = 'RECEIVE_CURRENT_USER';

export const REQUEST_PATCH_DETAILS = 'REQUEST_PATCH_DETAILS'; 
export const RECEIVE_PATCH_DETAILS = 'RECEIVE_PATCH_DETAILS';

export const REQUEST_DELETE_PATCH = 'REQUEST_DELETE_PATCH';
export const PATCH_DELETED = 'PATCH_DELETED';

export const REQUEST_COMPILE_PATCH = 'REQUEST_COMPILE_PATCH';
export const RECEIVE_COMPILE_PATCH = 'RECEIVE_COMPILE_PATCH';
export const PATCH_COMPILATION_FAILED = 'PATCH_COMPILATION_FAILED';

export const SET_PATCHLIST_TOP_FILTER = 'SET_PATCHLIST_TOP_FILTER';

export const TOGGLE_FILTER_IN_SUB_FILTER = 'TOGGLE_FILTER_IN_SUB_FILTER';
export const RESET_PATCHLIST_SUB_FILTER = 'RESET_PATCHLIST_SUB_FILTER';
export const ADD_TO_INITIAL_CACHED_SUB_FILTER = 'ADD_TO_INITIAL_CACHED_SUB_FILTER';

export const RECEIVE_PATCHES_AUTHORS_TAGS = 'RECEIVE_PATCHES_AUTHORS_TAGS';

export const REQUEST_PATCH_JAVASCRIPT = 'REQUEST_PATCH_JAVASCRIPT';
export const LOADED_PATCH_JAVASCRIPT = 'LOADED_PATCH_JAVASCRIPT';
export const RESET_PATCH_JAVASCRIPT = 'RESET_PATCH_JAVASCRIPT';

export const SET_WEB_AUDIO_PATCH = 'SET_WEB_AUDIO_PATCH';
export const RESET_WEB_AUDIO_PATCH = 'RESET_WEB_AUDIO_PATCH';

export const SET_WEB_AUDIO_PATCH_PARAMETER = 'SET_WEB_AUDIO_PATCH_PARAMETER';
export const RESET_WEB_AUDIO_PATCH_PARAMETERS = 'RESET_WEB_AUDIO_PATCH_PARAMETERS';

export const SET_PATCH_PLAYING = 'SET_PATCH_PLAYING';

export const REQUEST_PATCH_CODE_FILE = 'REQUEST_PATCH_CODE_FILE';
export const RECEIVE_PATCH_CODE_FILE = 'RECEIVE_PATCH_CODE_FILE';
export const REQUEST_PATCH_CODE_FILE_FAILED = 'REQUEST_PATCH_CODE_FILE_FAILED';

export const NEW_DIALOG = 'NEW_DIALOG';
export const CLOSE_DIALOG = 'CLOSE_DIALOG';
export const SET_ACTIVE_DIALOG_TAB = 'SET_ACTIVE_DIALOG_TAB';

export const REQUEST_CONNECT_TO_OWL = 'REQUEST_CONNECT_TO_OWL';
export const RECEIVE_CONNECTION_FROM_OWL = 'RECEIVE_CONNECTION_FROM_OWL';

export const BEGIN_LOAD_PATCH_ON_TO_OWL = 'BEGIN_LOAD_PATCH_ON_TO_OWL';
export const COMPLETE_LOAD_PATCH_ON_TO_OWL = 'COMPLETE_LOAD_PATCH_ON_TO_OWL';

export const OWL_PRESET_CHANGE = 'OWL_PRESET_CHANGE';
export const OWL_FIRMWARE_VERSION_RECEIVED = 'OWL_FIRMWARE_VERSION_RECEIVED';
export const OWL_PATCH_STATUS_RECEIVED = 'OWL_PATCH_STATUS_RECEIVED';
export const OWL_PROGRAM_MESSAGE_RECEIVED = 'OWL_PROGRAM_MESSAGE_RECEIVED';

export const UPLOADING_PATCH_FILES = 'UPLOADING_PATCH_FILES'; 
export const PATCH_FILES_UPLOADED = 'PATCH_FILES_UPLOADED'; 
export const ERROR_UPLOADING_PATCH_FILE = 'ERROR_UPLOADING_PATCH_FILE';
export const REMOVE_UPLOADED_FILE = 'REMOVE_UPLOADED_FILE';

export const GITHUB_URL_FIELD_CHANGE = 'GITHUB_URL_FIELD_CHANGE';
export const ADD_GITHUB_FILE = 'ADD_GITHUB_FILE';
export const REMOVE_GITHUB_FILE = 'REMOVE_GITHUB_FILE';
export const SOURCE_FILE_CHANGE = 'SOURCE_FILE_CHANGE';
export const UPDATE_PATCH_NAME = 'UPDATE_PATCH_NAME';

export const PATCH_SAVING = 'PATCH_SAVING';
export const PATCH_SAVED = 'PATCH_SAVED';
export const ERROR_SAVING_PATCH = 'ERROR_SAVING_PATCH';
export const ERROR_IN_SOURCE_FILE_URL = 'ERROR_IN_SOURCE_FILE_URL';
export const CLEAR_SOURCE_FILE_ERRORS = 'CLEAR_SOURCE_FILE_ERRORS';
export const CLEAR_EDIT_PATCH_FORM = 'CLEAR_EDIT_PATCH_FORM';
export const INVALID_FIELD_DATA = 'INVALID_FIELD_DATA';

export const API_END_POINT = '//' + window.location.host + '/api';
export const WORDPRESS_AJAX_END_POINT = '//' + window.location.host + '/wp-admin/admin-ajax.php';
export const PATCH_UPLOAD_DIR = window.location.protocol + '//' + window.location.host + '/wp-content/uploads/patch-files/';

