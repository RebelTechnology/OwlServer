<?php
/**
 * Plugin Name: OWL Patch Uploader
 * Plugin URI:  https://github.com/pingdynasty/OwlServer
 * Description: Provides an AJAX endpoint for uploading patches.
 * Version:     1.0.0
 * Author:      Sam Artuso <sam@highoctanedev.co.uk>
 * Author URI:  http://www.hoxtonowl.com/
 * License:     WTFPL 2.0 http://www.wtfpl.net/
 */

defined('ABSPATH') or die('No script kiddies please!');

define('DOING_AJAX', true);

define(TMP_DIR_PREFIX, 'tmp-');

/**
 * Sends JSON error response and terminates script.
 *
 * @param string $msg
 *     The error message.
 */
function errorOut($msg)
{
    $result = [ 'err' => true, ];
    $result['msg'] = $msg;
    wp_send_json($result);
    wp_die();
} // function errorOut

/**
 * Determines whether the specified directory is empty.
 *
 * @param string $path
 *     The path to the directory.
 *
 * @return bool
 *     Whether the specified directory is empty.
 */
function isDirEmpty($path)
{
    $handle = opendir($path);
    while (false !== ($entry = readdir($handle))) {
        if ($entry != '.' && $entry != '..') {
            return false;
        }
    }

    return true;
} // function isDirEmpty

/**
 * Determines whether a patch ID is valid.
 *
 * @param string $patchID
 *     The patch ID.
 *
 * @return bool
 *     Whether the specified patch ID is valid.
 */
function isPatchIdValid($patchId)
{
    return is_string($patchId) && strlen($patchId) == 24 && ctype_xdigit($patchId);
} // function isPatchIdValid

/**
 * Returns a patch.
 *
 * @param string $patchId
 *     The patch ID.
 *
 * @return array
 *     An associative array that represents the patch.
 */
function getPatch($patchId)
{
    if (!function_exists('curl_version')) {
        errorOut('cURL is needed for this functionality.');
    }

    $host = 'http://hoxtonowl.localhost:3000';
    if (isset($_SERVER['APPLICATION_ENV'])) {
        if ($_SERVER['APPLICATION_ENV'] == 'staging') {
            $host = 'http://staging.hoxtonowl.com/api';
        } elseif ($_SERVER['APPLICATION_ENV'] == 'production') {
            $host = 'http://www.hoxtonowl.com/api';
        }
    }
    $apiCallUrl = $host . '/patch/' . $patchId;

    $curl = curl_init($apiCallUrl);
    if (false === $curl) {
        errorOut('Unexpected error (2).');
    }
    if (!curl_setopt($curl, CURLOPT_RETURNTRANSFER, true)) {
        errorOut('Unexpected error (3).');
    }
    $data = curl_exec($curl);
    if (curl_errno($curl)) {
        errorOut('Unexpected error (4).');
    }
    if (false === $data) {
        errorOut('Unexpected error (5).');
    }
    $statusCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    if ($statusCode !== 200) { // FIXME - If we wanted to be really RESTful, any 1xx, 2xx and 3xx should be handled here.
        errorOut('Unable to verify patch ' . $patchId . ' (1, ' . $apiCallUrl . ', ' . $statusCode . ').');
    }

    $patch = json_decode($data, true);
    return $patch['result'];

} // function getPatch

/**
 * Returns information about a source file.
 *
 * @param  string  $url
 *     The file URL.
 * @return array
 *     An associative array whose keys are:
 *     * type (string) - Either 'github' or 'url'.
 *     * dir  (string) - The directory where the file is hosted, relative to the WP upload directory.
 *     * name (string) - The file name.
 */
function getSourceFileInfo($url)
{
    if (!is_string($url)) {
        errorOut('Bad source file URL (1).');
    }

    $r = parse_url($url);
    if (false === $r) {
        errorOut('Bad source file URL (2).');
    }

    $result = [ 'type' => 'url' ];
    if($r['host'] == 'github.com' || $r['host'] == 'www.github.com') {
        $result['type'] = 'github';
    } else {
        $pieces = explode('/', $r['path']);
        $result['dir'] = $pieces[count($pieces) - 2];
        $result['name'] = $pieces[count($pieces) - 1];
    }

    return $result;

} // function isFileHostedOnOurServers

/**
 * Checks that the current WordPress user is authorized to edit the specified
 * patch. If not, the script will be terminated with an error message.
 *
 * @param array $patch
 *     The patch.
 */
function checkUserIsAuthorizedToEditPatch($patch)
{
    $wpUserId = get_current_user_id();
    if (!$wpUserId) {
        errorOut('No WordPress user logged in.');
    }

    if (!is_admin()) { // admins can do whatever they want with patches

        if (!isset($patch['author']) || !is_array($patch['author'])) {
            errorOut('Unable to verify patch ' . $patchId . ' (2).');
        }

        if (!isset($patch['author']['type']) || $patch['author']['type'] !== 'wordpress') {
            errorOut('Access denied.');
        }

        if (!isset($patch['author']['wordpressId']) || $patch['author']['wordpressId'] != $wpUserId) {
            errorOut('Access denied.');
        }
    }
} // function checkUserIsAuthorizedToEditPatch

/**
 * Returns the the path to the directory where all source files sit.
 *
 * @return string
 *     The the path to the directory where all source files sit.
 */
function getBaseDirPath()
{
    $baseDirPath = realpath(dirname(__FILE__) . '/../uploads');
    if ($_SERVER['HTTP_HOST'] == 'hoxtonowl.localhost:8000') { // FIXME - Remove this if block
        $baseDirPath = '/home/kyuzz/Projects/HoxtonOwl.com/wp-content/uploads';
    }
    $baseDirPath .= '/patch-files';

    return $baseDirPath;
} // function getBaseDirPath

/**
 * Returns an octal number representing the privileges to use when creating
 * new directories with `mkdir`.
 *
 * @return int
 */
function getDirMod()
{
    $mod = 02775;
    if ($_SERVER['HTTP_HOST'] == 'hoxtonowl.localhost:8000') {
        $mod = 02777;
    }
    return $mod;
} // function getDirMod

/**
 * Provides an AJAX endpoint for uploading source code files.
 */
function owl_patchFileUpload()
{
    /*
     * Create base directory (if needed)
     */
    $baseDirPath = getBaseDirPath();
    if (!file_exists($baseDirPath)) {

        if (!is_dir($baseDirPath)) {
            errorOut('Unexpected error (1).');
        }

        $r = mkdir($baseDirPath, getDirMod(), true);
        if (!$r) {
            errorOut('Unable to create target dir.');
        }
    }

    if (!is_readable($baseDirPath) || !is_writable($baseDirPath)) {
        errorOut('Target dir not writeable.');
    }

    if (isset($_REQUEST['patchId'])) {

        // Validate patch ID
        $patchId = $_REQUEST['patchId'];
        if (!isPatchIdValid($patchId)) {
            errorOut('Bad patch ID.');
        }

        // Get patch
        $patch = getPatch($patchId);

        // Check that the patch actually belongs to the currently logged-in user
        checkUserIsAuthorizedToEditPatch($patchId);

    }

    /*
     * Create patch dir
     */

    if (isset($_REQUEST['patchId'])) { // if no patch ID is given, patch is assumed to be new
        $patchDirPath0 = $_REQUEST['patchId'];
    } else {
        $patchDirPath0 = TMP_DIR_PREFIX . substr($_COOKIE['PHPSESSID'], 0, 10); // one tmp directory per user session
    }
    $patchDirPath = $baseDirPath . '/' . $patchDirPath0;

    if (!file_exists($patchDirPath)) {

        $r = mkdir($patchDirPath, getDirMod(), true);
        if (!$r) {
            errorOut('Unable to create patch dir.');
        }
    }

    if (!is_dir($patchDirPath)) {
        errorOut('Unexpected error (6).');
    }

    if (!is_readable($patchDirPath) || !is_writable($patchDirPath)) {
        errorOut('Patch dir not writeable.');
    }

    /*
     * Upload files
     */

    if (!isset($_FILES) || !is_array($_FILES) || !isset($_FILES['files']) ||
        !isset($_FILES['files']['name']) || !is_array($_FILES['files']['name'])) {

        errorOut('Unexpected error (7).');
    }

    $numFiles = count($_FILES['files']['name']);
    if (isset($_FILES['files']['error'][0]) && $_FILES['files']['error'][0] === UPLOAD_ERR_NO_FILE) {
        errorOut('No files uploaded.');
    }

    $result = [ 'files' => [] ];
    for ($i = 0; $i < $numFiles; $i++) {

        $uploadedFile = $_FILES['files']['name'][$i];
        $targetFile = $patchDirPath . '/' . basename($uploadedFile);

        // Check for upload error
        if (isset($_FILES['files']['error']) && isset($_FILES['files']['error'][$i]) &&
            $_FILES['files']['error'][$i] !== 0) {

            $result['files'][] = [
                'name' => $uploadedFile,
                'err'  => true,
                'msg'  => 'Error while uploading file (1).',
            ];

            continue;
        }

        // Check file size (max: 256 kB) - see https://github.com/pingdynasty/OwlServer/issues/90#issuecomment-140127818
        if (!isset($_FILES['files']['size'][$i]) || $_FILES['files']['size'][$i] > 256000) {
            $result['files'][] = [
                'name' => $uploadedFile,
                'err'  => true,
                'msg'  => 'File is too large.',
            ];
            continue;
        }

        // Check extension - see https://github.com/pingdynasty/OwlServer/issues/90#issuecomment-140124580
        $ext = pathinfo($targetFile, PATHINFO_EXTENSION);
        if (!in_array($ext, [ 'c', 'h', 'cpp', 'hpp', 'pd', 'dsp', 's'])) {
            $result['files'][] = [
                'name' => $uploadedFile,
                'err'  => true,
                'msg'  => 'File extension not valid.',
            ];
            continue;
        }

        // Check MIME type
        if (mime_content_type($_FILES['files']['tmp_name'][$i]) == 'text/x-php') {
            $result['files'][] = [
                'name' => $uploadedFile,
                'err'  => true,
                'msg'  => 'File type not allowed.',
            ];
            continue;
        }

        // Move uploaded file to final destination
        if (move_uploaded_file($_FILES['files']['tmp_name'][$i], $targetFile)) {

            // Uploaded file moved successfully
            $result['files'][] = [
                'name' => $uploadedFile,
                'path' => $patchDirPath0 . '/' . $uploadedFile,
                'err'  => false,
                'msg'  => 'File uploaded successfully.',
            ];

        } else {

            // Error while uploading file
            $result['files'][] = [
                'name' => $uploadedFile,
                'err'  => false,
                'msg'  => 'Error while uploading file (2).',
            ];

        }
    }

    wp_send_json($result);
    wp_die();

} // function owl_patchFileUpload

/**
 * Performs a clean-up of patch files.
 *
 * This function is called immediately after a patch is created or updated.
 *
 * Patch files usually live in a directory named after the ID of the patch they
 * belong to. However, when a new patch is being created (through the "add patch"
 * form), the patch doesn't exist yet, and doesn't have a patch ID yet. If the
 * user uploads any source files, they will be uploaded onto a temporary directory.
 * This function will move source files from the temporary directory to the
 * temporary one.
 *
 * Another thing this function also does, is to delete from disk any source files
 * the user has removed from the database.
 */
function owl_patchFileCleanUp()
{

    // Make sure patch ID is valid
    if (!isset($_REQUEST['patchId'])) {
        errorOut('Patch ID not provided.');
    }

    $patchId = $_REQUEST['patchId'];
    if (!isPatchIdValid($patchId)) {
        errorOut('Bad patch ID.');
    }

    // Get patch
    $patch = getPatch($patchId);

    // Check user can edit the patch
    checkUserIsAuthorizedToEditPatch($patch);

    // Check if there are any files that need to be moved from temporary
    // directories
    $baseDirPath = getBaseDirPath();
    $sourceFiles = $patch['github'];
    foreach ($sourceFiles as $sourceFile) {
        $sourceFileInfo = getSourceFileInfo($sourceFile);
        if ('url' == $sourceFileInfo['type']) {
            if (substr($sourceFileInfo['dir'], 0, strlen(TMP_DIR_PREFIX)) == TMP_DIR_PREFIX) { // File need to be moved

                // Does file exist on server? Is it readable?
                $srcDir = $baseDirPath . '/' . $sourceFileInfo['dir'];
                $srcFile = $srcDir . '/' . $sourceFileInfo['name'];
                if (!file_exists($srcDir)) {
                    // Directory does not exist on server
                    continue;
                }
                if (!file_exists($srcFile)) {
                    // File does not exist on server
                    continue;
                }
                if (!is_readable($srcFile)) {
                    // Source file unreadable, won't attempt to move it
                    continue;
                }

                // Does destination directory exist on server? (Create it if not)
                $dstDir = $baseDirPath . '/' . $patchId;
                if (!file_exists($dstDir)) {
                    if (!mkdir($dstDir, getDirMod(), true)) {
                        errorOut('Unable to create directory "' . $dstDir . '".');
                    }
                }

                // Move file
                $dstFile = $dstDir . '/' . $sourceFileInfo['name'];
                if (!rename($srcFile, $dstFile)) {
                    errorOut('Unable to move "' . $srcFile . '" to "' . $dstFile . '".');
                }

                // If tmp directory is empty, delete it
                if (!is_readable($dstDir) || !is_writeable($dstDir)) {
                    // Destination directory unreadable/unwriteable, won't attempt to delete it
                    continue;
                }

                if (isDirEmpty($dstDir)) {
                    @rmdir($dstDir);
                }
            }
        }
    }

    // Delete files that were removed from the database
    $sourceFiles = $patch['github'];
    $localFilesInDb = [];
    foreach ($sourceFiles as $sourceFile) {
        $sourceFileInfo = getSourceFileInfo($sourceFile);
        if ('url' == $sourceFileInfo['type']) {
            $localFilesInDb[] = $sourceFileInfo['name'];
        }
    }

    $dstDir = $baseDirPath . '/' . $patchId;
    $filesOnDisk = [];
    if ($handle = opendir($dstDir)) {
        while (false !== ($entry = readdir($handle))) {
            if ($entry != '.' && $entry != '..') {
                $filesOnDisk[] = $entry;
            }
        }
    }

    $filesToDelete = array_diff($filesOnDisk, $localFilesInDb);
    foreach ($filesToDelete as $fileToDelete) {
        $fileToDeletePath = $dstDir . $fileToDelete;
        if (is_file($fileToDeletePath) && is_writeable($fileToDeletePath)) {
            @unlink($fileToDelete);
        }
    }

    $result = [ 'error' => false ];
    wp_send_json($result);
    wp_die();

} // function owl_patchFileCleanUp

add_action('wp_ajax_owl-patch-file-cleanup', 'owl_patchFileCleanUp');
add_action('wp_ajax_owl-patch-file-upload', 'owl_patchFileUpload');

// EOF
