#!/usr/bin/env php
<?php
/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

// `make sysx` example:
// make BUILD='/tmp/owl-patch-xxx' PATCHSOURCE='/tmp/owl-patch-xxx' PATCHFILE='OverdrivePatch.hpp' PATCHNAME='Overdrive' PATCHCLASS='OverdrivePatch' PATCHIN=2 PATCHOUT=2 sysex

use Symfony\Component\Process\Process;

require_once 'vendor/autoload.php';
require_once __DIR__ . '/settings.php';
require_once __DIR__ . '/common.php';

define('PATCH_SRC_DIR_PREFIX',   'owl-src-');
define('PATCH_BUILD_DIR_PREFIX', 'owl-build-');
define('OWL_SRC_DIR',            '/opt/OwlProgram.online/');
define('COMPILE_TIMEOUT',        80); // time-out in seconds
define('HEAVY_TOKEN',            'FNPHpsCYj0Jxa8Fwh5cDV1MU1M8OHghK');

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
    echo '  --name=<patch-name> Finds patch by name.' . PHP_EOL;
    echo '  --sysex             Build only the sysex target.' . PHP_EOL;
    echo '  --web               Build only the JavaScript target.' . PHP_EOL;
    echo PHP_EOL;
    echo 'Debug options:' . PHP_EOL;
    echo '  --only-show-files   Only show files that would be downloaded from GitHub.' . PHP_EOL;
    echo '  --only-dload-files  Download files from GitHub but do not compile the patch.' . PHP_EOL;
    echo '  --show-build-cmd    Shows command used to build patch and exit.' . PHP_EOL;
    echo '  --keep-tmp-files    Do not delete temporary source and build directories once the build has finished.' . PHP_EOL;
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

    $bits = explode('/', $githubFile);
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
    $opts = [
        'http' => [
            'method' => 'GET',
            'header' => "User-agent: Mozilla/5.0\r\n",
        ]
    ];
    $context = stream_context_create($opts);
    $data = file_get_contents($endpoint, false, $context);

    // Write GitHub rate limit to disk:
    $rateLimitHeader = 'X-RateLimit-Remaining';
    foreach ($http_response_header as $header) {
        if (substr($header, 0, strlen($rateLimitHeader)) == $rateLimitHeader) {
            $bits = explode(':', $header);
            $limit = trim($bits[1]);
            $f = fopen('/tmp/github-rate-limit', 'a');
            @chmod('/tmp/github-rate-limit', 0666);
            fwrite($f, sprintf('%s - %d', date('c'), $limit) . PHP_EOL);
            break;
        }
    }

    // Decode data
    $json = json_decode($data);
    if (null === $json) {
        outputError('Invalid JSON.');
        echo $data . PHP_EOL;
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
} // function downloadGithubFile

/**
 * Returns information about a source file.
 *
 * @todo FIXME This function is duplicated in `owl-patch-uploader.php`.
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

} // function getSourceFileInfo

/* ~~~~~~~~~~~~~~~~~~~~
 *  Script entry-point
 * ~~~~~~~~~~~~~~~~~~~~ */

/*
 * Parse command line arguments
 */

$shortopts  = 'h';
$longopts  = [
    'help',
    'only-show-files',
    'only-dload-files',
    'show-build-cmd',
    'patch-files:',
    'keep-tmp-files',
    'name:',
    'web',
    'sysex',
];
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

$showBuildCmd = false;
if (isset($options['show-build-cmd']) && false === $options['show-build-cmd']) {
    $showBuildCmd = true;
}

$buildCmd = 'make sysx';

$keepTmpFiles = false;
if (isset($options['keep-tmp-files']) && false === $options['keep-tmp-files']) {
    $keepTmpFiles = true;
}

if (isset($options['name'])) {
    $patchName = $options['name']; // if patch name is specified as a command line option,
                                   // we will search for patch ID later on in this script
} else {
    $patchId = $argv[count($argv) - 1];
    if (strlen($patchId) !== 24 || !ctype_xdigit($patchId)) {
        usage();
        exit(1);
    }
}

$makeTarget = MAKE_TARGET_SYSX;
if (isset($options['web']) && false === $options['web']) {
    $makeTarget = MAKE_TARGET_MINIFY; // Same as MAKE_TARGET_WEB, but yields minified JS file
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

if (isset($patchName)) {
    // Patch name was provided in command line
    $patch = $patches->findOne([ 'name' => $patchName ]);
} else {
    // Patch ID was provided in command line
    $patch = $patches->findOne([ '_id' => new MongoId($patchId) ]);
}

// Sanitize some values later used as command line arguments:
if (isset($patch['inputs'])) {
    $patch['inputs']  = intval($patch['inputs']);
}

if (isset($patch['outputs'])) {
    $patch['outputs'] = intval($patch['outputs']);
}

if (null === $patch) {
    outputError('Patch not found.');
    exit(1);
}

if (!isset($patchId)) { // patch name was provided in command line
    $patchId = $patch['_id'];
}

/*
 * Create temporary directories
 */

$patchSourceDir = tempdir(PATCH_SRC_DIR_PREFIX);
$patchBuildDir = tempdir(PATCH_BUILD_DIR_PREFIX);
if (!$onlyDloadFiles && !$keepTmpFiles) {
    register_shutdown_function(function () use ($patchSourceDir, $patchBuildDir) {
        exec('rm -rf ' . $patchSourceDir);
        exec('rm -rf ' . $patchBuildDir);
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
    outputError('DEBUG: Showing patch file URLs. Aborting...');
    var_dump($patch['github']);
    exit(1);
}

$sourceFiles = [];
foreach ($patch['github'] as $githubFile) {

    $sourceFileInfo = getSourceFileInfo($githubFile);
    if ('url' === $sourceFileInfo['type']) {

        $srcDir = realpath(dirname(__FILE__) . '/../httpdocs/wp-content/uploads/patch-files/');
        $srcFile = $srcDir . '/' . $patchId . '/' . $sourceFileInfo['name'];
        $dstFile = $patchSourceDir . '/' . $sourceFileInfo['name'];
        if (!@copy($srcFile, $dstFile)) {
            outputError('Unable to copy patch source file "' . $sourceFileInfo['name'] . '".');
            exit(1);
        }

        $sourceFiles[] = $sourceFileInfo['name'];

    } else {

        $r = downloadGithubFile($githubFile, $patchSourceDir);
        if (!$r) {
            outputError('Download of ' . $githubFile . ' failed.');
            exit(1);
        }
        $sourceFiles[] = $r;
    }
}

if ($onlyDloadFiles) {
    outputError('DEBUG: Downloaded source files to ' . $patchSourceDir . '. Aborting...');
    var_dump($patch['github']);
    exit(1);
}

/*
 * Work out crazy command needed to compile patch
 *
 */

if($buildCmd = 'make sysx') {

    // First source file only
    // See: https://github.com/pingdynasty/OwlServer/issues/66#issuecomment-86660216
    $sourceFile = $sourceFiles[0];
    $className = substr($sourceFile, 0, strrpos($sourceFile, '.'));
    $patchSourceFileExt = pathinfo($sourceFile, PATHINFO_EXTENSION);

    $cmd  = 'make ';
        // Specify where to find Emscripten's config file
        $cmd = 'EM_CACHE="/opt/.emscripten_cache" EM_CONFIG="/opt/.emscripten" make ';
    $cmd .= 'BUILD=' .  escapeshellarg($patchBuildDir)  . ' ';
    $cmd .= 'PATCHSOURCE=' . escapeshellarg($patchSourceDir) . ' ';
    $cmd .= 'PATCHNAME=' .   escapeshellarg($patch['name'])  . ' ';
    $cmd .= 'PATCHIN=' .     $patch['inputs']  .' ';
    $cmd .= 'PATCHOUT='.     $patch['outputs'] .' ';

    switch ($patchSourceFileExt) {

    case 'dsp': // Faust
        $cmd .= 'FAUST=' . escapeshellarg($className) . ' ';
        break;

    case 'pd': // PureData
        $cmd .= 'HEAVY=' . escapeshellarg($className) . ' ';
        $cmd .= 'HEAVYTOKEN=' . escapeshellarg(HEAVY_TOKEN) . ' ';
        break;

    default: // C/C++ patch
        $cmd .= 'PATCHFILE=' . escapeshellarg($sourceFile) . ' ';
        $cmd .= 'PATCHCLASS=' . escapeshellarg($className) . ' ';
    }
    $cmd .= $makeTarget;

    if (!(isset($options['sysex']) && false === $options['sysex'])
         && MAKE_TARGET_SYSX == $makeTarget) {
      $cmd .= ' ' . MAKE_TARGET_MINIFY; // build both web (minified) and sysex
    }

} else {
    echo 'Unexpected error!' . PHP_EOL;
    exit(1);
}

if ($showBuildCmd) {
    echo 'Build command: ' . $cmd . PHP_EOL;
    exit(1);
}

/*
 * Compile patch
 */

// If we're compiling a PureData patch, we need to build the patch twice.
// The first build will fail, and the second one will (hopefully) succeed.
// See: https://github.com/pingdynasty/OwlServer/issues/80#issuecomment-128419020
// if ($patchSourceFileExt == 'pd') {
//     system('cd ' . escapeshellarg(OWL_SRC_DIR) . ' ; ' . $cmd); // we just ignore the result of this command, whatever it is
// }

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
    exit($exitCode);
}
outputMessage('Build successful!');

if (MAKE_TARGET_SYSX == $makeTarget) {

    /*
     * Move .syx file to download location
     */

    $syxFilePath = $patchBuildDir . '/patch.syx';
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

    $jsFilePath = $patchBuildDir . '/web/patch.min.js';
    if (file_exists($jsFilePath) && is_file($jsFilePath) && is_readable($jsFilePath)) {
      $dstDir = __DIR__ . '/build-js/';
      $r = rename($jsFilePath, $dstDir . $patch['seoName'] . 'min.js');
    }


} elseif (MAKE_TARGET_WEB == $makeTarget || MAKE_TARGET_MINIFY == $makeTarget) {

    /*
     * Move `patch.js` to download location
     */

    $ext = MAKE_TARGET_WEB == $makeTarget ? '.js' : '.min.js';
    $jsFilePath = $patchBuildDir . '/web/patch' . $ext;
    if (!file_exists($jsFilePath) || !is_file($jsFilePath) || !is_readable($jsFilePath)) {
        outputError('Unable to access ' . $jsFilePath . '.');
    }

    $dstDir = __DIR__ . '/build-js/';
    $r = rename($jsFilePath, $dstDir . $patch['seoName'] . $ext);
    if (!$r) {
        outputError('Unable to move ' . $jsFilePath . ' to ' . $dstDir . '.');
        exit(1);
    }
}

// EOF
