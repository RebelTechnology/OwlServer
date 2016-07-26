#!/usr/bin/env php
<?php
/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

use Symfony\Component\Process\Process;
use Lijinma\Color;

require_once 'vendor/autoload.php';
require_once __DIR__ . '/settings.php';
require_once __DIR__ . '/common.php';

const DEFAULT_INTERVAL = 120; // 2 minutes

/**
 * Prints info on how to invoke this script.
 */
function usage() {
    global $argv;
    echo 'Usage: ' . $argv[0] . PHP_EOL;
    echo PHP_EOL;
    echo 'Options:' . PHP_EOL;
    echo '  -h, --help          Show this help and exit.' . PHP_EOL;
    echo PHP_EOL;
    echo 'Options:' . PHP_EOL;
    echo '  --interval=<seconds> Interval in seconds before compiling the next patch. Defaults ' . DEFAULT_INTERVAL . ' to seconds.' . PHP_EOL;
    echo '  --skip=<X> 	 	 Skip the first X items.' . PHP_EOL;
    echo '  --limit=<X> 	 Process max X items.' . PHP_EOL;
    echo '  --web                Compiles a patch into JavaScript instead of into .sysx.' . PHP_EOL;
    echo '  --no-color           Suppresses coloured output.' . PHP_EOL;
    echo '  --dry-run            Dry run.' . PHP_EOL;
} // function usage

$shortopts  = 'h';
$longopts  = [
    'help',
    'interval:',
    'skip:',
    'limit:',
    'no-color',
    'web',
];
$options = getopt($shortopts, $longopts);

if ((isset($options['h']) && false === $options['h']) || (isset($options['help']) && false === $options['help'])) {
    usage();
    exit(1);
}

$makeTarget = MAKE_TARGET_SYSX;
if (isset($options['web']) && false === $options['web']) {
    $makeTarget = MAKE_TARGET_MINIFY;
}

$interval = DEFAULT_INTERVAL;
if (isset($options['interval'])) {
    $interval = intval($options['interval']);
}

$skip = 0;
if (isset($options['skip'])) {
    $skip = intval($options['skip']);
}

$limit = 0;
if (isset($options['limit'])) {
    $limit = intval($options['limit']);
}

$colouredOutput = true;
if (isset($options['no-color']) && false === $options['no-color']) {
    $colouredOutput = false;
}

$dryRun = false;
if (isset($options['dry-run']) && false === $options['dry-run']) {
    $dryRun = true;
}

/*
 * Get all patches
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
$p = $patches->find();
if($limit != 0)
  $p->limit($limit);
if($skip != 0)
  $p->skip($skip);

$total = $p->count();
echo 'Found ' . $total . ' patches.' . PHP_EOL;

$failedPatches = [];
$count = 0;
$successful = 0;

foreach ( $p as $id => $patch ) {

    // Don't try to compile patches with no source code available
    $patchType = getPatchType($patch);
    if (PATCH_TYPE_UNKNOWN == $patchType) {
        echo 'Skipping ' . $patch['name'] .' (' . $id . ')... ' . PHP_EOL;
        continue;
    }

    echo 'Compiling ' . $patch['name'] .' (' . $id . ')... ' . PHP_EOL;
    $cmd = 'php ' . __DIR__ . '/patch-builder.php ' . ($makeTarget == MAKE_TARGET_MINIFY ? ' --web ' : ' ') . $id . ' > /dev/null 2> /dev/null';
    $exitStatus = 0;
    if (!$dryRun) {
        system($cmd, $exitStatus);
    }

    if ($exitStatus == 0) {
        echo ($colouredOutput ? Color::GREEN : '') . 'Patch built successfully!' . "\033[0m" . PHP_EOL;
        $successful++;
    } else {
        $failedPatches[] = [ $patch['name'], $patchType ];
        echo ($colouredOutput ? Color::RED : '') . 'Ooops! patch did not build! (make exit status = ' . $exitStatus. ')' . "\033[0m" . PHP_EOL;
    }
    $count++;
    $pc = 100 * $count / $total;
    $pcSuccessfull = 100 * $successful / $total;
    echo sprintf(
        'Tried to compile %d out of %d patches so far (%.1f%%), of which %d compiled successfully (%.1f%%).' . PHP_EOL,
        $count,
        $total,
        $pc,
        $successful,
        $pcSuccessfull
    );
    echo PHP_EOL;
    echo 'Now sleeping for ' . $interval . ' seconds... zZzZzZzZz...' . PHP_EOL;
    $remaining = $interval;
    while ($remaining) {
        echo "\r" . '-' . $remaining . '...';
        sleep(1);
        $remaining--;
    }
    echo "\r         " . PHP_EOL;
}

echo "Leaving off at patch " . ($skip + $count) . " out of " . $total . PHP_EOL;

if (count($failedPatches)) {
echo PHP_EOL;
echo 'Patches that did not build' . PHP_EOL;
echo '--------------------------' . PHP_EOL;
$mask = '%11s   %-30s';
foreach ($failedPatches as $failedPatch) {
    printf($mask . PHP_EOL, $failedPatch[1], $failedPatch[0]);
}
} else {
    echo 'Hurray! All patches built successfully!' . PHP_EOL;
}
