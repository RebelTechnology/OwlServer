#!/usr/bin/env php
<?php
/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

use Symfony\Component\Process\Process;

require_once 'vendor/autoload.php';
require_once __DIR__ . '/settings.php';

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
echo 'Found ' . $p->count() . ' patches.' . PHP_EOL;

while ($patch = $p->getNext()) {
    echo 'Compiling "' . $patch['name'] .'"... ';
    $cmd = 'php ' . __DIR__ . '/patch-builder.php ' . $patch['_id'];
    $process = new Process($cmd);
    $process->run();
    if ($process->isSuccessful()) {
        echo 'OK!';
    } else {
        echo 'Failed!';
    }
    echo PHP_EOL;
}