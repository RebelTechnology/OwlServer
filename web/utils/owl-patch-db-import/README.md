## What this is
A script that reads the [OWL][1] patch data from a Google Spreadsheet
and saves it to a MongoDB collection.

## How to use it
*Warning:* This script will *overwrite* existing data in MongoDB.

1. Copy the file `_misc/mongo-credentials.tpl.js` to the root directory and
   rename it `mongo-credentials.js`. Edit it, enter your database connection
   parameters and save it. Note that this file is deliberately not versioned
   with Git.
2. Install node.js dependencies:

        npm install
3. Run:

        node app.js

[1]: http://hoxtonowl.com/ "Hoxton OpenWare Laboratory"