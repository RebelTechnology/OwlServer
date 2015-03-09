<?php

wp_enqueue_script('owl-api-client', get_template_directory_uri() . '/js/hoxtonowl-api-client.js', array(), false, true);
wp_enqueue_script('owl-patch',      get_template_directory_uri() . '/js/hoxtonowl-patch.js', array(), false, true);
// wp_enqueue_script('owl-patches-add-edit-form-chosen-js', get_template_directory_uri() . '/js/chosen/chosen.jquery.min.js', array('jquery'));
// wp_enqueue_style('owl-patches-add-edit-form-chosen-css', get_template_directory_uri() . '/js/chosen/chosen.css');
wp_enqueue_script('owl-patches-add-edit-form-sheepit', get_template_directory_uri() . '/js/jquery.sheepItPlugin-1.1.1.min.js', array('jquery'));
wp_enqueue_script('owl-patch-form', get_template_directory_uri() . '/js/hoxtonowl-patch-form.js', array('jquery'), false, true);
wp_enqueue_script('select2', get_template_directory_uri() . '/js/select2/js/select2.min.js', array('jquery'));
wp_enqueue_style('select2', get_template_directory_uri() . '/js/select2/css/select2.min.css');


$pagename = get_query_var('pagename');
if ($pagename == 'edit-patch') {
    $patch = get_query_var('patch');
    if (!empty($patch)) {
    }
}

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
                    <div class="row">
                        <label for="frm-patch-name" class="required">Name</label> <input class="form-control" type="text" id="frm-patch-name" name="name" required>
                        <div class="error-message"></div>
                    </div>

                    <?php if (current_user_can('administrator')): ?>
                    <div class="row">
                        <label class="required">Author</label>
                        <label class="frm-patch-author-radio"><input type="radio" id="frm-patch-author-type-wordpress" name="author-type"> WordPress user:</label>
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
                        <label for="frm-patch-inputs" class="required">Inputs</label>
                        <select class="form-control" id="frm-patch-inputs" name="inputs" required>
                            <option>0</option>
                            <option>1</option>
                            <option>2</option>
                        </select>
                        <div class="error-message"></div>
                    </div>
                    <div class="row">
                        <label for="frm-patch-outputs" class="required">Outputs</label>
                        <select class="form-control" id="frm-patch-outputs" name="outputs" required>
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
                    <fieldset id="frm-patch-github">
                        <legend>GitHub files</legend>
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
                    </fieldset>
                    <div class="row">
                        <label for="frm-patch-cycles">CPU cycles</label> <input class="form-control" type="number" min="0" id="frm-patch-cycles" name="cycles"><label class="percent">%</label>
                        <div class="error-message"></div>
                    </div>
                    <div class="row">
                        <label for="frm-patch-bytes">Memory bytes</label> <input class="form-control" type="number" min="0" id="frm-patch-bytes" name="bytes">
                        <div class="error-message"></div>
                    </div>
                    <div class="row">
                        <label for="frm-patch-tags">Tags</label>
                        <select data-placeholder="Pick one or more tags..." class="form-control chosen-select" id="frm-patch-tags" name="tags" multiple="multiple"></select>
                        <div class="error-message" style="margin-top: 13px;"></div>
                    </div>
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

<?php Starkers_Utilities::get_template_parts( array( 'parts/shared/footer','parts/shared/html-footer' ) ); ?>