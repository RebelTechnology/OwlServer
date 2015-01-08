/**
 * Template for api-settings.js file.
 * 
 * You should save a copy of this file in the root directory of this project,
 * where it will NOT be tracked by Git.
 * 
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 */

API_PORT = 3000;

MONGO_HOST       = 'localhost';
MONGO_PORT       = 27017;
MONGO_USE_AUTH   = false;
MONGO_USER       = '';
MONGO_PASS       = '';
MONGO_DATABASE   = 'owl_staging';
MONGO_COLLECTION = 'patches';

// Do not edit below

var mongoConnectionString = 'mongodb://';
if (MONGO_USE_AUTH) {
    mongoConnectionString += MONGO_USER + ':' + MONGO_PASS + '@';
}
mongoConnectionString += MONGO_HOST + ':' + MONGO_PORT + '/' + MONGO_DATABASE;

exports.mongoConnectionString = mongoConnectionString;
exports.port = API_PORT;
