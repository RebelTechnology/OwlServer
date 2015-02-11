<?php
/**
 * The template for displaying all pages.
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages
 * and that other 'pages' on your WordPress site will use a
 * different template.
 *
 * Please see /external/starkers-utilities.php for info on Starkers_Utilities::get_template_parts()
 *
 * @package 	WordPress
 * @subpackage 	Starkers
 * @since 		Starkers 4.0
 */
?>
<?php Starkers_Utilities::get_template_parts( array( 'parts/shared/html-header', 'parts/shared/header' ) ); ?>

<div class="wrapper flexbox">

    <div id="breadcrumb"><?php the_breadcrumb(); ?></div>

    <div class="content-area">
        <div class="white-box">
            
            <article>
                <h2><?php the_title(); ?></h2><br />
                <p>
                    <?php Starkers_Utilities::get_template_parts( array( 'parts/patch-form' ) ); ?>
                </p>
            </article>
            
        </div>
    </div>

    <div class="widget-area">
        <?php dynamic_sidebar( 'right_sidebar_1' ); ?>
    </div>

    <div class="clear"></div>

</div>

<?php Starkers_Utilities::get_template_parts( array( 'parts/shared/footer','parts/shared/html-footer' ) ); ?>