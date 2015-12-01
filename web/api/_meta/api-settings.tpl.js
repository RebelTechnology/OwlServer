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

module.exports.WORDPRESS_XML_RPC_ENDPOINT = 'hoxtonowl.localhost:8000';
module.exports.WORDPRESS_XML_RPC_USERNAME = 'owlapi';
module.exports.WORDPRESS_XML_RPC_PASSWORD = 'secret';

// Path to the script that builds patches
module.exports.PATCH_BUILDER_PATH = '/var/www/hoxtonowl.com/subdomains/staging/patch-builder/patch-builder.php';

// Path to the directory where all patch Sysx files are kept
module.exports.SYSEX_PATH = '/var/www/hoxtonowl.com/subdomains/staging/patch-builder/build';
// Path to the directory where all patch JS files are kept
module.exports.JS_PATH = '/var/www/hoxtonowl.com/subdomains/staging/patch-builder/build-js';

module.exports.JS_BUILD_TYPE = 'min'; // If we're building minified JS patches, this should be
                                      // set to 'min'.

if (global.Q) {
  Q.longStackSupport = true; // dev mode only
}

//////////////////////////////
// Please do not edit below //
//////////////////////////////

var mongoConnectionString = 'mongodb://';
if (MONGO_USE_AUTH) {
    mongoConnectionString += MONGO_USER + ':' + MONGO_PASS + '@';
}
mongoConnectionString += MONGO_HOST + ':' + MONGO_PORT + '/' + MONGO_DATABASE;

module.exports.mongoConnectionString = mongoConnectionString;
module.exports.port = API_PORT;
