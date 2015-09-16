<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Upload test</title>
        <script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
        <script type="text/javascript">
            $(function () {

                var fileUpload = $('#frm-patch-file');

                fileUpload.change(function (e) {

                    fileUpload.prop('disabled', true);

                    var data = new FormData();
                    var files = fileUpload[0].files;
                    for (var i = 0; i < files.length; i++) {
                        data.append('files[]', files[i]);
                    }

                    var patchId = $('#frm-patch-id').val();
                    if (patchId) {
                        data.append('patchId', patchId);
                    }

                    data.append('action', 'owl-patch-file-upload'); // WordPress action

                    $.ajax({
                        url: '/wp-admin/admin-ajax.php',
                        type: 'POST',
                        contentType: false,
                        data: data,
                        processData: false,
                        cache: false
                    }).done(function (data) {
                        fileUpload.prop('disabled', false);

                        // reset file input (see http://stackoverflow.com/questions/1043957/clearing-input-type-file-using-jquery#13351234)
                        fileUpload.wrap('<form>').closest('form').get(0).reset();
                        fileUpload.unwrap();

                        console.log(JSON.parse(data));
                    });

                });
            });
        </script>
    </head>
    <body>
        <form id="frmUpload" action="<?= $_SERVER['PHP_SELF'] ?>" method="post" enctype="multipart/form-data">
            <input id="frm-patch-file" type="file" name="files[]" multiple />
        </form>
    </body>
</html>
