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

    wp_register_style( 'spa_css', get_template_directory_uri().'-child/page-patch-library/css/owlspa.css', '', '1.0', 'screen' );
    wp_register_style( 'legacy-app-style', get_template_directory_uri().'-child/page-patch-library/css/app-style.css', '', '1.0.0', 'screen' );
  }

  add_action('wp_enqueue_scripts', 'registerSpaScripts');

  function login_logo() { ?>
    <style type="text/css">
        #login h1 a, .login h1 a {
          background-image: url(<?php echo get_stylesheet_directory_uri(); ?>/images/logo.png);
          height: 65px;
          width: 320px;
          background-size: 320px 65px;
          background-repeat: no-repeat;
          padding-bottom: 30px;
        }
    </style>
<?php }
add_action( 'login_enqueue_scripts', 'login_logo' );
