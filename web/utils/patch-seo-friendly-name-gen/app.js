/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

// Settings
var mongoCredentials = require('./mongo-credentials.js');
var MONGO_HOST       = mongoCredentials.MONGO_HOST;
var MONGO_PORT       = mongoCredentials.MONGO_PORT;
var MONGO_USE_AUTH   = mongoCredentials.MONGO_USE_AUTH;
var MONGO_USER       = mongoCredentials.MONGO_USER;
var MONGO_PASS       = mongoCredentials.MONGO_PASS;
var MONGO_DATABASE   = mongoCredentials.MONGO_DATABASE;
var MONGO_COLLECTION = mongoCredentials.MONGO_COLLECTION;

// Import modules
var mongodb = require('mongodb');
var assert = require('assert');
var trim = require('trim');
var readline = require('readline');

function makeSeoFriendlyName(name) {
    return name.replace(/[^a-z0-9]/gi, '_');
}

var MongoClient = mongodb.MongoClient;

// Build MongoDB connection string
var connectionString = 'mongodb://';
if (MONGO_USE_AUTH) {
    connectionString += MONGO_USER + ':' + MONGO_PASS + '@';
}
connectionString +=MONGO_HOST + ':' + MONGO_PORT + '/' + MONGO_DATABASE;

// Connect to Mongo
MongoClient.connect(connectionString, function(err, db) {
    
    assert.equal(null, err);
    console.log('Connected to MongoDB.');
    
    var collection = db.collection(MONGO_COLLECTION);
    collection.find().toArray(function(err, results) {
        
        console.log('Found %d patches.', results.length);
        console.log();
        console.log('Generating SEO friendly names...');
        
        for (var i = 0, max = results.length, patch = {}, seoName = '', updated = 0; i < max; i++) {
            patch = results[i];
            seoName = makeSeoFriendlyName(patch.name);
            collection.findAndModify({ _id: patch._id }, {}, { $set: { seoName: seoName }}, {}, function(err, object) {
                if (err) {
                    console.warn(err.message);
                } else {
                    console.log(object.name + ' => ' + object.seoName);
                }
                updated++;
                if (updated === results.length) db.close();
            });
        }
    });
    
    //var rl = readline.createInterface(process.stdin, process.stdout);
    //
    //rl.question('WARNING: This script will regenerate all SEO friendly names for all patches, overwriting the old ones. Continue? (y/N): ', function(answer) {
    //    
    //    if(answer === 'y' || answer === 'Y') {
    //    
    //        // Delete previous data
    //        collection.remove({}, function(err, result) {
    //            console.log('Cleaning up database...');
    //            assert.equal(err, null);
    //            
    //            // Insert data
    //            collection.insert(patches, function(err, result) {
    //                assert.equal(err, null);
    //                console.log('Added %d patches to the database.', result.length);
    //                db.close();
    //                process.exit(0);
    //            });
    //        });
    //    
    //    } else {
    //        
    //        console.log ('Aborting.');
    //        process.exit(1);
    //        
    //    }
    //});
});