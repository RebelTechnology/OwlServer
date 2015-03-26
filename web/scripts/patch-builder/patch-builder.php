#!/usr/bin/env php
<?php
/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

// Patches without GitHub files
// ----------------------------
// db.patches.find({ $or: [ { github: { $exists: false }}, { $where: 'this.github.length === 0' }]}).pretty();
//
// Patches with at least a GitHub file
// -----------------------------------
// db.patches.find({ $or: [ { github: { $exists: true }}, { $where: 'this.github && this.github.length > 0' }]}).pretty();
//
// Patches with 1 GitHub file
// --------------------------
// db.patches.find({ github: { $exists: true, $size: 1 }}).pretty();
// 54b55ccb14601612321d0ccd
//
// Patches with 2 GitHub file
// --------------------------
// db.patches.find({ github: { $exists: true, $size: 2 }}).pretty();
// 54b55ccb14601612321d0c93
//
// Patches with 3 GitHub file
// --------------------------
// db.patches.find({ github: { $exists: true, $size: 3 }}).pretty();
// 54b55ccb14601612321d0c9c

use Symfony\Component\Process\Process;

require_once 'vendor/autoload.php';

define('TMP_DIR_PREFIX', 'owl-patch-');
define('OWL_SRC_DIR', '/opt/OwlProgram.online/'); // FIXME
define('COMPILE_TIMEOUT', 30); // seconds

/**
 * Prints info on how to invoke this script.
 */
function usage() {
    global $argv;
    echo 'Usage: ' . $argv[0] . ' <patch-id>' . PHP_EOL;
    echo PHP_EOL;
    echo 'Options:' . PHP_EOL;
    echo '  -h, --help          Show this help and exit.' . PHP_EOL;
    echo '  --only-show-files   Only show files that would be downloaded from GitHub.' . PHP_EOL;
    echo '  --only-dload-files  Download files from GitHub but do not compile the patch.' . PHP_EOL;
}

/**
 * Outputs an error messge to stdout.
 *
 * @param  string $msg The error message.
 */
function outputError($msg) {
    $stderr = fopen('php://stderr', 'w+');
    fwrite($stderr, 'ERROR: ' . $msg . PHP_EOL);
}

/**
 * Creates a temporary directory.
 *
 * @param  string $prefix Prefix.
 * @return string         The path of the temporary directory.
 */
function tempdir($prefix = null) {
    $template = "{$prefix}XXXXXX";
    $tmpdir = '--tmpdir=' . sys_get_temp_dir();
    return exec("mktemp -d $tmpdir $template");
}

/**
 * Downloads a file from GitHub.
 *
 * @param  string $githubFile The GitHub file to download.
 * @param  string $dstPath    The path where to download the file,
 * @return string|boolean     The name of the downloaded file, or false if the
 *                            the download failed.
 */
function downloadGithubFile($githubFile, $dstPath) {

    if (!filter_var($githubFile, FILTER_VALIDATE_URL)) {
        outputError('Invalid URL (1).');
        return false;
    }

    if (substr($githubFile, 0, 19) !== 'https://github.com/') {
        outputError('Invalid URL (2).');
        return false;
    }

    $bits     = explode('/', $githubFile);
    if (count($bits) < 8) {
        outputError('Invalid URL (3).');
        return false;
    }

    // Work out GitHub API call
    $repo     = implode('/', array_slice($bits, 3, 2));
    $branch   = $bits[6];
    $path     = implode('/', array_slice($bits, 7));
    $filename = $bits[count($bits) - 1];
    $endpoint = 'https://api.github.com/repos/' . $repo . '/contents/' . $path . '?ref=' . $branch;

    // Make HTTPS request
    $opts = array('http' => array(
        'method' => 'GET',
        'header' => "User-agent: Mozilla/5.0\r\n",
    ));
    $context = stream_context_create($opts);
    $data = file_get_contents($endpoint, false, $context);

    // Decode data
    $json = json_decode($data);
    if (null === $json) {
        outputError('Invalid JSON.');
        return false;
    }
    $data = base64_decode($json->content);
    if (false === $data) {
        outputError('Cannot base64-decode data.');
        return false;
    }

    // Write file to disk
    $f = fopen($dstPath . '/' . $filename, 'w');
    fwrite($f, $data);

    return $filename;
}

/* ~~~~~~~~~~~~~~~~~~~~
 *  Script entry-point
 * ~~~~~~~~~~~~~~~~~~~~ */

/*
 * Parse command line arguments
 */

$shortopts  = 'h';
$longopts  = array(
    'help',
    'only-show-files',
    'only-dload-files',
);
$options = getopt($shortopts, $longopts);

if ((isset($options['h']) && false === $options['h']) || (isset($options['help']) && false === $options['help'])) {
    usage();
    exit(1);
}

$onlyShowFiles = false;
if (isset($options['only-show-files']) && false === $options['only-show-files']) {
    $onlyShowFiles = true;
}

$onlyDloadFiles = false;
if (isset($options['only-dload-files']) && false === $options['only-dload-files']) {
    $onlyShowFiles = false;
    $onlyDloadFiles = true;
}

$patchId = $argv[count($argv) - 1];
if (strlen($patchId) !== 24 || !ctype_xdigit($patchId)) {
    usage();
    exit(1);
}

/*
 * Get patch
 */
$mongoClient = new MongoClient('mongodb://localhost:27017'); // FIXME !!!
$db = $mongoClient->owl_staging;                             // FIXME !!!
$patches = $db->patches;
$patch = $patches->findOne(array('_id' => new MongoId($patchId)));
if (null === $patch) {
    outputError('Patch not found.');
    exit(1);
}

/*
 * Create temporary directory
 */
$tempDir = tempdir(TMP_DIR_PREFIX);
if (!$onlyDloadFiles) {
    register_shutdown_function(function () use ($tempDir) {
        exec('rm -rf ' . $tempDir);
    });
}

/*
 * Get GitHub files
 */
if (!isset($patch['github']) || count($patch['github']) === 0) {
    outputError('No source code available for this patch.');
}

if ($onlyShowFiles) {
    outputError('DEBUG: Showing source code file URLs. Aborting...');
    var_dump($patch['github']);
    exit(1);
}

$sourceFiles = array();
foreach ($patch['github'] as $githubFile) {
    $r = downloadGithubFile($githubFile, $tempDir);
    if (!$r) {
        outputError('Download of ' . $githubFile . ' failed.');
        exit(2);
    }
    $sourceFiles[] = $r;
}

if ($onlyDloadFiles) {
    outputError('DEBUG: Downloaded source files to ' . $tempDir . '. Aborting...');
    var_dump($patch['github']);
    exit(1);
}

/*
 * Work out crazy command needed to compile patch
 *
 * See: https://github.com/pingdynasty/OwlServer/issues/66#issuecomment-85998573
 */
$cmd = 'make BUILD=' . $tempDir . ' ';

// We hash-include only the first file
// See: https://github.com/pingdynasty/OwlServer/issues/66#issuecomment-86660216
$sourceFile = $sourceFiles[0];
$cmd .= 'ONLINE_INCLUDES=\'#include \\"' . $sourceFile . '\\"\' ';
// The filename must be ClassName.hpp
// See: https://github.com/pingdynasty/OwlServer/issues/66#issuecomment-86669862
$className = substr($sourceFile, 0, strrpos($sourceFile, '.'));
$cmd .= 'ONLINE_REGISTER=\'REGISTER_PATCH(' . $className . ', \\"' . $patch['name'] . '\\", 2, 2);\' online';

/*
 * Compile patch
 */
$process = new Process($cmd, OWL_SRC_DIR, null, null, COMPILE_TIMEOUT);
try {
    $process->start();
    $process->wait(function ($type, $buffer) use ($process) {
        if (Process::ERR === $type) {
            echo 'ERR > ' . $buffer;
        } else {
            echo 'OUT > ' . $buffer;
        }
        $process->checkTimeout();
    });
} catch (ProcessTimedOutException $e) {
    outputError('Patch build timed out!');
}

// EOF