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

function errorOut($msg)
{
    $result = [ 'err' => true, ];
    $result['msg'] = $msg;
    wp_send_json($result);
    wp_die();
}

/**
 * Provides an AJAX endpoint for uploading source code files.
 */
function owl_patchFileUpload()
{
    // global $wpdb; // FIXME - is this needed?

    /*
     * Create base directory (if needed)
     */

    $baseDirPath = realpath(dirname(__FILE__) . '/../uploads');
    $baseDirPath .= '/patch-files';

    if (!file_exists($baseDirPath)) {

        if (!is_dir($baseDirPath)) {
            errorOut('Unexpected error (1).');
        }

        $r = mkdir($baseDirPath, 02775, true); // 02775 = drwxrwsr-x
        if (!$r) {
            errorOut('Unable to create target dir.');
        }
    }

    if (!is_readable($baseDirPath) || !is_writable($baseDirPath)) {
        errorOut('Target dir not writeable.');
    }

    /*
     * Validate patch ID
     */

    if (isset($_REQUEST['patchId'])) {

        $patchId = $_REQUEST['patchId'];
        if (!is_string($patchId) || strlen($patchId) != 24 || !ctype_xdigit($patchId)) {
            errorOut('Bad patch ID.');
        }

        /*
         * Check that the patch actually belongs to the currently logged-in user
         */

        $wpUserId = get_current_user_id();
        if (!$wpUserId) {
            errorOut('No WordPress user logged in.');
        }

        if (!is_admin()) { // admins can do whatever they want with patches

            if (!function_exists('curl_version')) {
                errorOut('cURL is needed for this functionality.');
            }

            $host = 'http://www.hoxtonowl.com';
            if (isset($_SERVER['APPLICATION_ENV'])) {
                if ($_SERVER['APPLICATION_ENV'] == 'staging') {
                    $host = 'http://staging.hoxtonowl.com';
                }
            }
            $apiCallUrl = $host . '/api/patch/' . $patchId;

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
                errorOut('Unable to verify patch ' . $patchId . ' (1).');
            }

            $patch = json_decode($data, true);
            $patch = $patch['result'];
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
    }

    /*
     * Create patch dir
     */

    if (isset($_REQUEST['patchId'])) { // if no patch ID is given, patch is assumed to be new
        $patchDirPath = $baseDirPath . '/' . $_REQUEST['patchId'];
    } else {
        $patchDirPath = $baseDirPath . '/' . uniqid('tmp', true);
    }

    if (!file_exists($patchDirPath)) {

        $r = mkdir($patchDirPath, 02775, true); // 02775 = drwxrwsr-x
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
                'msg'  => 'Error while uploading file.',
            ];

            continue;
        }

        // Check file size (max: 256 kB) - see https://github.com/pingdynasty/OwlServer/issues/90#issuecomment-140127818
        if (!isset($_FILES['files']['size']) || $_FILES['files']['size'] > 256000) {
            $result['files'][] = [
                'name' => $uploadedFile,
                'err'  => true,
                'msg'  => 'File is too big.',
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
        if (mime_content_type($uploadedFile) == 'text/x-php') {
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
                'err'  => false,
                'msg'  => 'File uploaded successfully.',
            ];

        } else {

            // Error while uploading file
            $result['files'][] = [
                'name' => $uploadedFile,
                'err'  => false,
                'msg'  => 'Error while moving uploaded file.',
            ];

        }
    }

    wp_send_json($result);
    wp_die();
}

add_action('wp_ajax_owl-patch-file-upload', 'owl_patchFileUpload');

// EOF
