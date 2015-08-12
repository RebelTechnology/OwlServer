#!/usr/bin/env php
<?php
/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

use Symfony\Component\Process\Process;
use Lijinma\Color;

require_once 'vendor/autoload.php';
require_once __DIR__ . '/settings.php';

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
    echo '  --no-color           Suppresses coloured output.' . PHP_EOL;
}

$shortopts  = 'h';
$longopts  = [
    'help',
    'interval:',
    'no-color',
];
$options = getopt($shortopts, $longopts);

if ((isset($options['h']) && false === $options['h']) || (isset($options['help']) && false === $options['help'])) {
    usage();
    exit(1);
}

$interval = DEFAULT_INTERVAL;
if (isset($options['interval'])) {
    $interval = intval($options['interval']);
    if (0 === $interval) {
        echo 'ERROR: Interval cannot be 0 seconds.' . PHP_EOL;
        exit(1);
    }
}

$colouredOutput = true;
if (isset($options['no-color']) && false === $options['no-color']) {
    $colouredOutput = false;
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
$total = $p->count();
echo 'Found ' . $total . ' patches.' . PHP_EOL;

$failedPatches = [];
$count = 0;
$successfull = 0;
while ($patch = $p->getNext()) {

    // Don't try to compile patches with no source code available
    if (!isset($patch['github']) || count($patch['github']) < 1) {
        continue;
    }

    echo 'Compiling ' . $patch['name'] .' (' . $patch['_id'] . ')... ' . PHP_EOL;
    $cmd = 'php ' . __DIR__ . '/patch-builder.php ' . $patch['_id'] . ' > /dev/null 2> /dev/null';
    $exitStatus = 0;
    system($cmd, $exitStatus);
    if ($exitStatus == 0) {
        echo ($colouredOutput ? Color::GREEN : '') . 'Patch built successfully!' . PHP_EOL;
        $successfull++;
    } else {
        $failedPatches[] = $patch['name'];
        echo ($colouredOutput ? Color::RED : '') . 'Ooops! patch did not build! (make exit status = ' . $exitStatus. ')' . PHP_EOL;
    }
    $count++;
    $pc = 100 * $successfull / $total;
    echo sprintf(
        'Tried to compile %d out of %d patches so far, of which %d compiled successfully (%.1f%%).' . PHP_EOL,
        $count,
        $total,
        $successfull,
        $pc
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

if (count($failedPatches)) {
echo PHP_EOL;
echo 'Patches that did not build' . PHP_EOL;
echo '--------------------------' . PHP_EOL;
foreach ($failedPatches as $failedPatch) {
    echo $failedPatch . PHP_EOL;
}
} else {
    echo 'Hurray! All patches built successfully!' . PHP_EOL;
}
