<?php 

  function add_owl_spa_rewrite_rules() {
    // all subpaths off patch-library/ redirect to patch-library/ so bundle.js is always served by WP and then js can control routing client side.
    add_rewrite_rule('patch-library/(.+)/?$', 'index.php?pagename=patch-library', 'top');
    flush_rewrite_rules();
  }

  add_action('init', 'add_owl_spa_rewrite_rules');

  function registerSpaScripts() {
    // spa js bundle
    wp_register_script('spa_bundle',
    get_template_directory_uri() . '-child/page-patch-library/js/bundle.js',
    array('jquery'),
    '1.0' );

    wp_register_style( 'spa_css', get_template_directory_uri().'-child/page-patch-library/css/owlspa.css', '', '1.0', 'screen' );
    wp_register_style( 'legacy-app-style', get_template_directory_uri().'-child/page-patch-library/css/app-style.css', '', '1.0.0', 'screen' );
  }

  add_action('wp_enqueue_scripts', 'registerSpaScripts');
