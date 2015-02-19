/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

// Settings
var SPREADSHEET_ID = '1ocSb1dTeOm8YgeqDOAGsfLddZrGxzAbymuq0bz5ZQ3Q';
var AUTHOR_URLS = {
    "Oli Larkin": "http://hoxtonowl.com/forums/users/hibrasil/"
};

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
var GoogleSpreadsheet = require("google-spreadsheet");
var trim = require('trim');
var readline = require('readline');

var patchSheet = new GoogleSpreadsheet(SPREADSHEET_ID);

console.log('Retrieving Google Spreadsheet...');
patchSheet.getRows(1, function(err, records) {
    
    assert.equal(null, err);
    console.log('Found %d patches.', records.length);
    
        patches = [];
        for (var i = 0; i < records.length; i++) {
            
            var patch = {
                name: records[i].name,
                parameters: {},
                inputs: parseInt(records[i].inputs),
                outputs: parseInt(records[i].outputs)
            };
            
            if ('' !== trim(records[i].author)) {
                patch.author = {
                    name: trim(records[i].author)
                };
                if (patch.author.name in AUTHOR_URLS) {
                    patch.author.url = AUTHOR_URLS[patch.author.name];
                }
            }
            
            if ('' !== trim(records[i].description)) {
                patch.description = trim(records[i].description);
            }
            
            if ('' !== trim(records[i].instructions)) {
                patch.instructions = trim(records[i].instructions);
            }
            
            patch.tags = [];
            if ('' !== trim(records[i].tags)) {
                patch.tags = records[i].tags.split(',');
                patch.tags = patch.tags.map(function(s) { return s.trim(); });
            }
            
            if ('' !== trim(records[i].parametera)) {
                patch.parameters.a = trim(records[i].parametera);
            }
            
            if ('' !== trim(records[i].parameterb)) {
                patch.parameters.b = trim(records[i].parameterb);
            }
            
            if ('' !== trim(records[i].parameterc)) {
                patch.parameters.c = trim(records[i].parameterc);
            }
            
            if ('' !== trim(records[i].parameterd)) {
                patch.parameters.d = trim(records[i].parameterd);
            }
            
            if ('' !== trim(records[i].parametere)) {
                patch.parameters.e = trim(records[i].parametere);
            }
            
            if ('' !== records[i].armcyclespersample) {
                patch.cycles = parseInt(records[i].armcyclespersample);
            }
            
            if ('' !== records[i].byteswithgain) {
                patch.bytes = parseInt(records[i].byteswithgain);
            }
            
            if ('' !== trim(records[i].soundcloud)) {
                patch.soundcloud = [ records[i].soundcloud ];
            }
            
            if ('' !== trim(records[i].github) && '' !== trim(records[i].repo)) {
                patch.github = [ 'https://github.com/' + records[i].repo + '/blob/master/' + records[i].github ];
            }
            
            if ('' !== trim(records[i].notes)) {
                patch.notes = trim(records[i].notes);
            }
            
            patches.push(patch);
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
            
            var rl = readline.createInterface(process.stdin, process.stdout);
            
            rl.question('WARNING: This script will overwrite existing data in MongoDB. Continue? (y/N): ', function(answer) {
                
                if(answer === 'y' || answer === 'Y') {
                
                    // Delete previous data
                    collection.remove({}, function(err, result) {
                        console.log('Cleaning up database...');
                        assert.equal(err, null);
                        
                        // Insert data
                        collection.insert(patches, function(err, result) {
                            assert.equal(err, null);
                            console.log('Added %d patches to the database.', result.length);
                            db.close();
                            process.exit(0);
                        });
                    });
                
                } else {
                    
                    console.log ('Aborting.');
                    process.exit(1);
                    
                }
            });
        });
});
