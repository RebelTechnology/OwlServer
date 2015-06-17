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
require_once __DIR__ . '/settings.php';

define('TMP_DIR_PREFIX', 'owl-patch-');
define('OWL_SRC_DIR', '/opt/OwlProgram.online/');
define('COMPILE_TIMEOUT', 30); // time-out in seconds

$stdout = fopen('php://stdout', 'w+');
$stderr = fopen('php://stderr', 'w+');

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
 * @param  string $msg The message.
 */
function outputMessage($msg) {
    global $stdout;
    fwrite($stdout, 'INFO: ' . $msg . PHP_EOL);
}

/**
 * Outputs an error messge to stderr.
 *
 * @param  string $msg The error message.
 */
function outputError($msg) {
    global $stderr;
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

$mongoConnectionString  = 'mongodb://';
if (MONGO_USE_AUTH) {
    $mongoConnectionString .= MONGO_USER . ':' . MONGO_PASS . '@';
}
$mongoConnectionString .= MONGO_HOST . ':' . MONGO_PORT;
$mongoDb = MONGO_DATABASE;
$collection = MONGO_COLLECTION;

try {
    $mongoClient = new MongoClient($mongoConnectionString);
    $db = $mongoClient->$mongoDb;
    $patches = $db->$collection;
} catch (Exception $e) {
    outputError('Unable to connect to MongoDb.');
    exit(1);
}
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
    exit(1);
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
        exit(1);
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
    $process->wait(function ($type, $buffer) use ($process, $stdout, $stderr) {
        if (Process::ERR === $type) {
            fwrite($stderr, $buffer);
        } else {
            fwrite($stdout, $buffer);
        }
        $process->checkTimeout();
    });
} catch (ProcessTimedOutException $e) {
    outputError('Patch build timed out!');
    exit(255);
}

$exitCode = $process->getExitCode();
outputMessage('make exit code is ' . $exitCode . '.');
if (0 !== $exitCode) {
    outputError('Patch build failed.');
    exit(255);
}
outputMessage('Build successful!');

/*
 * Move .syx file to download location
 */

$syxFilePath = $tempDir . '/online.syx';
if (!file_exists($syxFilePath) || !is_file($syxFilePath) || !is_readable($syxFilePath)) {
    outputError('Unable to access ' . $syxFilePath . '.');
    exit(1);
}

$dstDir = __DIR__ . '/build/';
$r = rename($syxFilePath, $dstDir . $patch['seoName'] . '.syx');
if (!$r) {
    outputError('Unable to move ' . $syxFilePath . ' to ' . $dstDir . '.');
    exit(1);
}

// EOF
