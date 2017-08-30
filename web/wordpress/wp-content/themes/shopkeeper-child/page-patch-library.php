<?php
	
	global $shopkeeper_theme_options;
	
	$page_id = "";
	if ( is_single() || is_page() ) {
		$page_id = get_the_ID();
	} else if ( is_home() ) {
		$page_id = get_option('page_for_posts');		
	}

    $page_header_src = "";

    if (has_post_thumbnail()) $page_header_src = wp_get_attachment_url( get_post_thumbnail_id( $page_id ) );

    $page_title_option = "on";
	
	if (get_post_meta( $page_id, 'page_title_meta_box_check', true )) {
		$page_title_option = get_post_meta( $page_id, 'page_title_meta_box_check', true );
	}
    
?>

<?php get_header(); ?>

	<div id="primary" class="content-area">
       
      <div id="content" class="site-content" role="main">
      
          <div id="owl-spa"></div>

      </div><!-- #content -->           
        
  </div><!-- #primary -->

<?php 
    wp_enqueue_script('spa_bundle'); 
    wp_enqueue_style( 'legacy-app-style' ); 
    wp_enqueue_style( 'spa_css' ); 
?>

<?php get_footer(); ?>
