<?php

wp_enqueue_script('owl-api-client', get_template_directory_uri() . '/js/hoxtonowl-api-client.js', array(), false, true);
wp_enqueue_script('owl-patch',      get_template_directory_uri() . '/js/hoxtonowl-patch.js', array(), false, true);
wp_enqueue_script('owl-patches-add-edit-form-sheepit', get_template_directory_uri() . '/js/jquery.sheepItPlugin-1.1.1.min.js', array('jquery'));
wp_enqueue_script('owl-patch-form', get_template_directory_uri() . '/js/hoxtonowl-patch-form.js', array('jquery'), false, true);
wp_enqueue_script('select2', get_template_directory_uri() . '/js/select2/js/select2.min.js', array('jquery'));
wp_enqueue_style('select2', get_template_directory_uri() . '/js/select2/css/select2.min.css');

$pagename = get_query_var('pagename');
$patch = get_query_var('patch');
$mode = 'add';
if ($pagename == 'edit-patch') {
    $mode = 'edit';
}
$isAdmin = current_user_can('administrator');

Starkers_Utilities::get_template_parts( array( 'parts/shared/html-header', 'parts/shared/header' ) );
?>

<div class="wrapper flexbox">

    <div id="breadcrumb"><?php the_breadcrumb(); ?></div>

    <div class="content-area">
        <div class="white-box">

            <article>

                <?php if (is_user_logged_in()): ?>

                <h2><?php the_title(); ?></h2><br />
                <form id="patch-add-edit-form">
                    <a name="form-top"></a>
                    <input type="hidden" name="id" id="frm-patch-id" value="">
                    <input type="hidden" name="downloadCount" id="frm-patch-downloadCount" value="">
                    <input type="hidden" name="starList" id="frm-patch-starList" value="">
                    <div class="row">
                        <label for="frm-patch-name" class="required">Name</label> <input class="form-control" type="text" id="frm-patch-name" name="name" required>
                        <div class="error-message"></div>
                    </div>

                    <?php if ($isAdmin): ?>
                    <div class="row">
                        <label class="required">Author</label>
                        <label class="frm-patch-author-radio"><input type="radio" id="frm-patch-author-type-wordpress" name="author-type" checked> WordPress user:</label>
                        <select id="frm-patch-author-wordpressId" name="author-wordpressId"></select>
                        <div class="error-message"></div>
                    </div>
                    <div class="row">
                        <label>&nbsp;</label>
                        <label class="frm-patch-author-radio"><input type="radio" id="frm-patch-author-type-other" name="author-type"> Other: </label>
                        <input type="text" id="frm-patch-author-name" name="author-name">
                        <div class="error-message"></div>
                    </div>
                    <?php endif; ?>

                    <div class="row">
                        <label for="frm-patch-published">Published?</label>
                        <select class="form-control" id="frm-patch-published" name="published">
                            <option value="1">Yes</option>
                            <option value="0" selected>No</option>
                        </select>
                        <div class="error-message"></div>
                        <div class="info-message">Unpublished patches will be visible only to their authors.</div>
                    </div>

                    <div class="row">
                        <label for="frm-patch-description" class="required">Description</label> <textarea class="form-control" id="frm-patch-description" name="description" required></textarea>
                        <div class="error-message"></div>
                    </div>
                    <div class="row">
                        <label for="frm-patch-instructions" class="required">Instructions</label> <textarea class="form-control" id="frm-patch-instructions" name="instructions" required></textarea>
                        <div class="error-message"></div>
                    </div>

                    <fieldset>
                        <legend>Parameters</legend>
                        <div class="row">
                            <label for="frm-patch-parameters-a">A</label> <input type="text" class="form-control" id="frm-patch-parameters-a" name="parameters-a">
                            <div class="error-message"></div>
                        </div>
                        <div class="row">
                            <label for="frm-patch-parameters-b">B</label> <input type="text" class="form-control" id="frm-patch-parameters-b" name="parameters-b">
                            <div class="error-message"></div>
                        </div>
                        <div class="row">
                            <label for="frm-patch-parameters-c">C</label> <input type="text" class="form-control" id="frm-patch-parameters-c" name="parameters-c">
                            <div class="error-message"></div>
                        </div>
                        <div class="row">
                            <label for="frm-patch-parameters-d">D</label> <input type="text" class="form-control" id="frm-patch-parameters-d" name="parameters-d">
                            <div class="error-message"></div>
                        </div>
                        <div class="row">
                            <label for="frm-patch-parameters-e">E</label> <input type="text" class="form-control" id="frm-patch-parameters-e" name="parameters-e">
                            <div class="error-message"></div>
                        </div>
                    </fieldset>
                    <div class="row">
                        <label for="frm-patch-inputs">Inputs</label>
                        <select class="form-control" id="frm-patch-inputs" name="inputs">
                            <option>0</option>
                            <option>1</option>
                            <option>2</option>
                        </select>
                        <div class="error-message"></div>
                    </div>
                    <div class="row">
                        <label for="frm-patch-outputs">Outputs</label>
                        <select class="form-control" id="frm-patch-outputs" name="outputs">
                            <option>0</option>
                            <option>1</option>
                            <option>2</option>
                        </select>
                        <div class="error-message"></div>
                    </div>
                    <fieldset id="frm-patch-samples">
                        <legend>Soundcloud samples</legend>
                        <div id="frm-patch-samples_template" class="row repeat">
                            <label for="frm-patch-samples_#index#">Sample</label>
                            <div class="form-control">
                                <input type="url" id="frm-patch-samples_#index#" name="sample[#index#]">
                                <div id="frm-patch-samples_remove_current" class="remove"><a href="#"><span>Remove</span></a></div>
                                <div class="error-message no-margin"></div>
                            </div>
                        </div>
                        <div id="frm-patch-samples_noforms_template"></div>
                        <div id="frm-patch-samples_controls">
                            <div id="frm-patch-samples_add" class="add"><a href="#"><span>Add</span></a></div>
                        </div>
                    </fieldset>
                    <fieldset id="frm-patch-compilation-type">
                        <legend>Compilation Type</legend>
                        <div class="row">
                            <label for="frm-patch-compilation-type-select">Type</label> 
                            <select id="frm-patch-compilation-type-select" style="font-size:18px" name="compilationtype">
                                <option value="cpp" selected="selected">cpp</option>
                                <option value="pd">pd</option>
                                <option value="faust">faust</option>
                                <option value="gen">gen</option>
                            </select>
                            <div class="error-message"></div>
                        </div>
                    </fieldset>
                    <fieldset id="frm-patch-github">
                        <legend>Source files</legend>
                        <div class="info-message" style="margin-bottom: 15px;">Paste one or more files from GitHub, or use the upload button.</div>
                        <div id="frm-patch-github_template" class="row repeat">
                            <label for="frm-patch-github_#index#">File</label>
                            <div class="form-control">
                                <input type="url" id="frm-patch-github_#index#" name="github[#index#]">
                                <div id="frm-patch-github_remove_current" class="remove"><a href="#"><span>Remove</span></a></div>
                                <div class="error-message no-margin"></div>
                            </div>
                        </div>
                        <div id="frm-patch-github_noforms_template"></div>
                        <div id="frm-patch-github_controls">
                            <div id="frm-patch-github_add" class="add"><a href="#"><span>Add</span></a></div>
                        </div>

                        <div class="row">
                            <label>Upload a file</label>
                            <div class="form-control">
                                <div class="file-upload-container">
                                    Choose files...
                                    <input type="file" id="frm-patch-file" name="files[]" multiple />
                                </div>
                            </div>
                            <div class="error-message" style="margin-top: 10px;"></div>
                        </div>
                    </fieldset>
                    <div class="row">
                        <label for="frm-patch-tags">Tags</label>
                        <select class="form-control" id="frm-patch-tags" name="tags" multiple="multiple"></select>
                        <div class="error-message" style="margin-top: 13px;"></div>
                    </div>
                    <?php if ($isAdmin): ?>
                    <div class="row">
                        <label for="frm-patch-creationTimeUtc">Creation time</label>
                        <input type="text" class="form-control" id="frm-patch-creationTimeUtc" name="creationTimeUtc" value="">
                        <div class="error-message"></div>
                        <div class="info-message">This field is only visible to admins. Please use ISO 8601 combined date/time format. If left blank, it will default to the current time.</div>
                    </div>
                    <?php endif; ?>
                    <div class="row btn-row">
                        <input type="button" id="frm-patch-btn-submit" value="Save">
                        <input type="button" id="frm-patch-btn-cancel" value="Cancel">
                    </div>

                    <p><br><br><br><br><small><strong>NOTE: </strong> Fields marked with a <strong>*</strong> are mandatory.</small></p>
                </form>

                <?php else: // if (is_user_logged_in()) ?>

                <h2>Access denied</h2><br />
                <p>To access this page, please <a href="/register">register</a> or log in first.</p>

                <?php endif; // if (is_user_logged_in()) ?>

            </article>

        </div>
    </div>

    <div class="widget-area">
        <?php dynamic_sidebar( 'right_sidebar_1' ); ?>
    </div>

    <div class="clear"></div>

</div>
<?php
global $current_user;

if (is_user_logged_in()): ?>
<div style="display: none;">
    <div id="wordpress-user-is-admin"><?= current_user_can('administrator') ? 1 : 0 ?></div>
</div>
<?php endif; ?>

<?php Starkers_Utilities::get_template_parts( array( 'parts/shared/footer','parts/shared/html-footer' ) ); ?>
