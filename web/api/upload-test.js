'use strict';

const fs = require('fs');
const request = require('request');

const requestOptions = {
  url: 'https://staging.hoxtonowl.com/wp-admin/admin-ajax.php',
  rejectUnauthorized: false, // disable in production!
  formData: {
    patchId: '5877b81f73bad92568a8d13c',
    action: 'owl-patch-file-upload',
    secret: '97b6cd0817ca777cf21d10f0dbac25ee696e39d832d76739b78ea238288d38eeafb26f28d1b4ff7ce63fe2043d81db13',
    'files[0]': fs.createReadStream('/home/kyuzz/tmp/owl/SirenPatch.hpp'),
    'files[1]': fs.createReadStream('/home/kyuzz/tmp/owl/SirenPatch2.hpp'),
  }
};

request.post(requestOptions, (err, httpResponse, body) => {
  if (err) {
    return console.error('upload failed:', err);
  }
  console.log('Server responded with:', body);
});
