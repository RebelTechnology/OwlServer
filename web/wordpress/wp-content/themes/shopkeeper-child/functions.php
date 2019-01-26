<?php 

  /* ~~~~~~~~~~~~~~~~~~~
  *  Single patch page
  * ~~~~~~~~~~~~~~~~~~~ */
  
  // Register a new var
  function add_patch_query_var($vars) {
    $vars[] = 'patch'; // name of the var as seen in the URL
    return $vars;
  }
  
  // Hook our function into query_vars
  add_filter('query_vars', 'add_patch_query_var');
  
  add_action('init', 'add_patch_rewrite_rules');
  
  function add_patch_rewrite_rules() {
    // Edit patch page
    add_rewrite_rule('edit-patch/(.+)/?$', 'index.php?pagename=edit-patch&patch=$matches[1]', 'top');
    flush_rewrite_rules();
  }

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

    wp_register_style( 'spa_css', get_template_directory_uri().'-child/page-patch-library/css/owlspa.css', '', '2.0.1', 'screen' );
    wp_register_style( 'legacy-app-style', get_template_directory_uri().'-child/page-patch-library/css/app-style.css', '', '2.0.1', 'screen' );
  }

  add_action('wp_enqueue_scripts', 'registerSpaScripts');

  function wpse_login_styles() {
    wp_enqueue_style( 'wpse-custom-login', get_stylesheet_directory_uri() . '/style-login.css' );
  }
  add_action( 'login_enqueue_scripts', 'wpse_login_styles' );

  function login_logo_url() {
    return home_url();
  }
  add_filter( 'login_headerurl', 'login_logo_url' );

  function login_logo_url_title() {
    return 'Rebel Technology';
  }
  add_filter( 'login_headertitle', 'login_logo_url_title' );

  function add_my_patches_link_to_woocommerce_my_account_page_menu( $menu_links ){
    $new = array( '/patch-library/patches/my-patches' => 'My Patches' );
    return array_slice( $menu_links, 0, 1, true ) + $new + array_slice( $menu_links, 1, NULL, true );
  }

  add_filter ( 'woocommerce_account_menu_items', 'add_my_patches_link_to_woocommerce_my_account_page_menu' );
  add_filter( 'woocommerce_get_endpoint_url', 'my_patches_redirect_endpoint', 10, 4 );
  
  function my_patches_redirect_endpoint ($url, $endpoint, $value, $permalink){
    if( $endpoint == '/patch-library/patches/my-patches'){
      $url = site_url() . $endpoint;
    }
    return $url;
  }
  