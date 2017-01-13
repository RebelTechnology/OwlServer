'use strict';

const fs = require('fs');
const request = require('request');

const requestOptions = {
  url: 'https://staging.hoxtonowl.com/wp-admin/admin-ajax.php',
  rejectUnauthorized: false, // disable in production!
  formData: {
    patchId: '5877b81f73bad92568a8d13c',
    action: 'owl-patch-file-upload',
    secret: '97b6cd0817ca777cf21d10f0dbac25ee696e39d832d76739b78ea238288d38ee',
    'files[0]': fs.createReadStream('/home/kyuzz/tmp/owl/SirenPatch.hpp'),
    'files[1]': fs.createReadStream('/home/kyuzz/tmp/owl/SirenPatch2.hpp'),
    // apparently 'files[x]' is the format that PHP likes when it comes to upload multiple files
  }
};

// then update the patch to include the new files
// then clean up the patch source files

request.post(requestOptions, (err, httpResponse, body) => {
  if (err) {
    return console.error('upload failed:', err);
  }
  console.log('Server responded with:', body);
});
