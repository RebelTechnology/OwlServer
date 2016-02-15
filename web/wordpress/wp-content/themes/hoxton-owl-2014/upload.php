<?php

ini_set('display_errors', 0);

const TARGET_DIR = '/tmp/uploads/';

// echo '<pre>';
// var_dump($_FILES['files']);
// echo '</pre>';

$numFiles = count($_FILES['files']['name']);
if (isset($_FILES['files']['error'][0]) && $_FILES['files']['error'][0] === UPLOAD_ERR_NO_FILE) {
    $result = [
        'err'  => true,
        'code' => 1,
        'msg'  => 'No files uploaded.',
    ];
    echo json_encode($result);
    exit();
}

$result = [
    'files' => []
];
for ($i = 0; $i < $numFiles; $i++) {
    $targetFile = TARGET_DIR . basename($_FILES['files']['name'][$i]);

    // check if upload error
    if (isset($_FILES['files']['error']) && isset($_FILES['files']['error'][$i]) &&
        $_FILES['files']['error'][$i] !== 0) {

        $result['files'][] = [
            'name' => $_FILES['files']['name'][$i],
            'err'  => true,
            'msg'  => 'Error while uploading "' . $_FILES['files']['name'][$i] . '".',
        ];

        continue;
    }

    // check file size (max: 256 kB)

    // disallow certain file formats

    if (move_uploaded_file($_FILES['files']['tmp_name'][$i], $targetFile)) {

        // Uploaded file moved successfully
        $result['files'][] = [
            'name' => $_FILES['files']['name'][$i],
            'err'  => false,
            'msg'  => 'File uploaded successfully.',
        ];

    } else {

        // Error while uploading file
        $result['files'][] = [
            'name' => $_FILES['files']['name'][$i],
            'err'  => false,
            'msg'  => 'Error while uploading file "' . $_FILES['files']['error'][$i] . '".',
        ];

    }
}

echo json_encode($result);
