<?php
/**
 * @author Sam Artuso <sam@highoctanedev.co.uk>
 *
 * This is the template for the 'Patches' page.
 *
 * Note that this file is named after the page's slug, following the Wordpress
 * convention "page-{page_slug}.php".
 */

$resUri = get_template_directory_uri() . '/page-compile-patch/';

// <link rel="stylesheet"> tags to be placed in <head>
wp_enqueue_style('owl-patches-page_style_css', $resUri . 'style.css', array(), 5);
wp_enqueue_style('jquery-ui-style', get_template_directory_uri() . '/js/jquery-ui-1.11.4.custom/jquery-ui.min.css');
wp_enqueue_style('jquery-ui-style-structure', get_template_directory_uri() . '/js/jquery-ui-1.11.4.custom/jquery-ui.structure.min.css');
wp_enqueue_style('jquery-ui-style-theme', get_template_directory_uri() . '/js/jquery-ui-1.11.4.custom/jquery-ui.theme.min.css');
//wp_enqueue_style('select2', get_template_directory_uri() . '/js/select2/css/select2.min.css');

// <script> tags to be placed in <head>
wp_enqueue_script('owl-patches-page_knockout',      $resUri . 'js3rdparty/knockout-2.0.0.js');
wp_enqueue_script('jquery',                         $resUri . 'js3rdparty/jquery-1.7.1.min.js');
wp_enqueue_script('jquery-ui',                      get_template_directory_uri() . '/js/jquery-ui-1.11.4.custom/jquery-ui.min.js', array('jquery'));
wp_enqueue_script('owl-patches-page_jquery_knob',   $resUri . 'js3rdparty/jquery.knob.min.js', array('jquery'));
wp_enqueue_script('owl-patches-page_knob',          $resUri . 'js/knob.js');

wp_enqueue_script('owl-patches-page_prettify',      'https://google-code-prettify.googlecode.com/svn/trunk/src/prettify.js');
wp_enqueue_script('owl-patches-page_run_prettify',  'https://google-code-prettify.googlecode.com/svn/loader/run_prettify.js');

//wp_enqueue_script('select2', get_template_directory_uri() . '/js/select2/js/select2.min.js', array('jquery'));


wp_enqueue_script('midi-client',                    $resUri . 'js/midiclient.js');
wp_enqueue_script('owl-midi-control',               $resUri . 'js/OpenWareMidiControl.js');
wp_enqueue_script('owl-cmd',                        $resUri . 'js/owlcmd.js');

// <script> tags to be placed just before </body>
wp_enqueue_script('owl-api-client',                 get_template_directory_uri() . '/js/hoxtonowl-api-client.js', array('jquery'), false, true);
wp_enqueue_script('owl-patch',                      get_template_directory_uri() . '/js/hoxtonowl-patch.js', array(), false, true);
wp_enqueue_script('owl-patches-page_patch_manager', $resUri . 'js/patchManager.js', array('jquery', 'jquery-ui', 'owl-patch', 'owl-api-client'), false, true);
wp_enqueue_script('pd-fileutils',                   $resUri . 'js3rdparty/pd-fileutils-latest.min.js', ['owl-patches-page_patch_manager'], false, true);

?>

<?php Starkers_Utilities::get_template_parts( array( 'parts/shared/html-header', 'parts/shared/header' ) ); ?>

<?php Starkers_Utilities::get_template_parts( array( 'parts/shared/footer','parts/shared/html-footer') ); ?>
