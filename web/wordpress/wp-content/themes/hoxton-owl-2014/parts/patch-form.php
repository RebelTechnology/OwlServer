<?php

//wp_enqueue_script('jquery', get_template_directory_uri() . '/page-patch-library/js3rdparty/jquery-1.7.1.min.js');
wp_enqueue_script('owl-api-client', get_template_directory_uri() . '/js/hoxtonowl-api-client.js', array(), false, true);
wp_enqueue_script('owl-patch',      get_template_directory_uri() . '/js/hoxtonowl-patch.js', array(), false, true);
wp_enqueue_script('owl-patches-add-edit-form-chosen-js', get_template_directory_uri() . '/js/chosen/chosen.jquery.min.js', array('jquery'));
wp_enqueue_style('owl-patches-add-edit-form-chosen-css', get_template_directory_uri() . '/js/chosen/chosen.css');
wp_enqueue_script('owl-patches-add-edit-form-sheepit', get_template_directory_uri() . '/js/jquery.sheepItPlugin-1.1.1.min.js', array('jquery'));
wp_enqueue_script('owl-patches-add-edit-form-js', get_template_directory_uri() . '/js/add-edit-patch.js', array('jquery'));

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
                    <div class="row">
                        <label for="frm-patch-name" class="required">Name</label> <input class="form-control" type="text" id="frm-patch-name" name="name">
                    </div>
                    <div class="row">
                        <label for="frm-patch-description" class="required">Description</label> <textarea class="form-control" id="frm-patch-description" name="description"></textarea>
                    </div>
                    <div class="row">
                        <label for="frm-patch-instructions" class="required">Instructions</label> <textarea class="form-control" id="frm-patch-instructions" name="instructions"></textarea>
                    </div>
                    
                    <fieldset>
                        <legend>Parameters</legend>
                        <div class="row">
                            <label for="frm-patch-parameters-a">A</label> <input type="text" class="form-control" id="frm-patch-parameters-a" name="parameters-a">
                        </div>
                        <div class="row">
                            <label for="frm-patch-parameters-b">B</label> <input type="text" class="form-control" id="frm-patch-parameters-b" name="parameters-b">
                        </div>
                        <div class="row">
                            <label for="frm-patch-parameters-c">C</label> <input type="text" class="form-control" id="frm-patch-parameters-c" name="parameters-c">
                        </div>
                        <div class="row">
                            <label for="frm-patch-parameters-d">D</label> <input type="text" class="form-control" id="frm-patch-parameters-d" name="parameters-d">
                        </div>
                        <div class="row">
                            <label for="frm-patch-parameters-e">E</label> <input type="text" class="form-control" id="frm-patch-parameters-e" name="parameters-e">
                        </div>
                    </fieldset>
                    
                    <div class="row">
                        <label for="frm-patch-armCyclesPerSample">CPU cycles</label> <input class="form-control" type="number" id="frm-patch-armCyclesPerSample" name="armCyclesPerSample">
                    </div>
                    <div class="row">
                        <label for="frm-patch-bytesWithGain">Memory bytes</label> <input class="form-control" type="number" id="frm-patch-bytesWithGain" name="bytesWithGain">
                    </div>
                    <div class="row">
                        <label for="frm-patch-inputs" class="required">Inputs</label>
                        <select class="form-control" id="frm-patch-inputs" name="inputs">
                            <option>0</option>
                            <option>1</option>
                            <option>2</option>
                        </select>
                    </div>
                    <div class="row">
                        <label for="frm-patch-outputs" class="required">Outputs</label>
                        <select class="form-control" id="frm-patch-outputs" name="outputs">
                            <option>0</option>
                            <option>1</option>
                            <option>2</option>
                        </select>
                    </div>
                    <div class="row">
                        <label for="frm-patch-tags">Tags</label>
                        <select data-placeholder="Pick one or more tags..." class="form-control chosen-select" id="frm-patch-tags" name="tags" multiple="multiple">
                            
                        </select>
                    </div>
                    
                    <fieldset id="frm-patch-samples">
                        <legend>Soundcloud samples</legend>
                        <div id="frm-patch-samples_template" class="row repeat">
                            <label for="frm-patch-samples_#index#">Sample</label>
                            <div class="form-control">
                                <input type="url" id="frm-patch-samples_#index#" name="sample[#index#]">
                                <div id="frm-patch-samples_remove_current" class="remove"><a href="#"><span>Remove</span></a></div>
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
                            </div>
                        </div>
                        <div id="frm-patch-github_noforms_template"></div>
                        <div id="frm-patch-github_controls">
                            <div id="frm-patch-github_add" class="add"><a href="#"><span>Add</span></a></div>
                        </div>
                    </fieldset>
                    
                    <div class="row btn-row">
                        <input type="submit" id="frm-patch-btn-submit" value="Save">
                        <input type="reset" id="frm-patch-btn-reset" value="Reset">
                        <input type="button" id="frm-patch-btn-cancel" value="Cancel">
                    </div>
                    
                    <p><small><strong>NOTE: </strong> Fields marked with a <strong>*</strong> are mandatory.</small></p>
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