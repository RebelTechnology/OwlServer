<?php
	/**
	 * Starkers functions and definitions
	 *
	 * For more information on hooks, actions, and filters, see http://codex.wordpress.org/Plugin_API.
	 *
 	 * @package 	WordPress
 	 * @subpackage 	Starkers
 	 * @since 		Starkers 4.0
	 */

	/* ========================================================================================================================
	
	Required external files
	
	======================================================================================================================== */

	require_once( 'external/starkers-utilities.php' );

	/* ========================================================================================================================
	
	Theme specific settings

	Uncomment register_nav_menus to enable a single menu with the title of "Primary Navigation" in your theme
	
	======================================================================================================================== */

	add_theme_support('post-thumbnails');
	
	// register_nav_menus(array('primary' => 'Primary Navigation'));

	/* ========================================================================================================================
	
	Actions and Filters
	
	======================================================================================================================== */

	add_action( 'wp_enqueue_scripts', 'starkers_script_enqueuer' );

	add_filter( 'body_class', array( 'Starkers_Utilities', 'add_slug_to_body_class' ) );

	/* ========================================================================================================================
	
	Custom Post Types - include custom post types and taxonimies here e.g.

	e.g. require_once( 'custom-post-types/your-custom-post-type.php' );
	
	======================================================================================================================== */



	/* ========================================================================================================================
	
	Scripts
	
	======================================================================================================================== */

	/**
	 * Add scripts via wp_head()
	 *
	 * @return void
	 * @author Keir Whitaker
	 */

	function starkers_script_enqueuer() {
		//wp_register_script( 'site', get_template_directory_uri().'/js/site.js', array( 'jquery' ) );
		//wp_enqueue_script( 'site' );

		wp_register_style( 'screen', get_stylesheet_directory_uri().'/style.css', '', '', 'screen' );
        wp_enqueue_style( 'screen' );
	}	

	/* ========================================================================================================================
	
	Comments
	
	======================================================================================================================== */

	/**
	 * Custom callback for outputting comments 
	 *
	 * @return void
	 * @author Keir Whitaker
	 */
	function starkers_comment( $comment, $args, $depth ) {
		$GLOBALS['comment'] = $comment; 
		?>
		<?php if ( $comment->comment_approved == '1' ): ?>	
		<li>
			<article id="comment-<?php comment_ID() ?>">
				<!-- <?php echo get_avatar( $comment ); ?> -->
				<h4><?php comment_author_link() ?></h4>
				<p class="comment-meta-line"><time><a href="#comment-<?php comment_ID() ?>" pubdate><?php comment_date() ?> at <?php comment_time() ?></a></time></p>
				<?php comment_text() ?>
			</article>
		<?php endif;
	}

	/* Main navigation menu */
	function owl_register_theme_menu(){
		register_nav_menu( 'primary', 'Main Navigation Menu' );
	}
	add_action( 'init', 'owl_register_theme_menu' );

	/* Widgets */
	function owl_widgets_init() {

		register_sidebar( array(
			'name' => 'Right sidebar',
			'id' => 'right_sidebar_1',
			'before_widget' => '<div>',
			'after_widget' => '</div>',
			'before_title' => '<h3 class="widget-title">',
			'after_title' => '</h3>',
		));
	}
	add_action( 'widgets_init', 'owl_widgets_init' );

    /* Breadcrumb */
    function the_breadcrumb() {
        
        global $post;
        global $wp_query;
        
        echo '<ul id="breadcrumbs">';
        if (is_tag()) {
            single_tag_title();
        } elseif (is_day()) {
            echo"<li>Archive for ";
            the_time('F jS, Y');
            echo'</li>';
        } elseif (is_month()) {
            echo"<li>Archive for ";
            the_time('F, Y');
            echo'</li>';
        } elseif (is_year()) {
            echo"<li>Archive for ";
            the_time('Y');
            echo'</li>';
        } elseif (is_author()) {
            echo"<li>Author Archive";
            echo'</li>';
        } elseif (isset($_GET['paged']) && !empty($_GET['paged'])) {
            echo "<li>Blog Archives";
            echo'</li>';
        } elseif (is_search()) {
            echo"<li>Search Results";
            echo'</li>';
        } else {
            echo '<li><a href="';
            echo get_option('home');
            echo '">';
            echo 'Home';
            echo '</a></li><li class="separator"> / </li>';
            if (is_category() || is_single()) {
                echo '<li>';
                if ('forum' === $post->post_type || 'topic' === $post->post_type) {
                    echo '<a href="/forums">Forums</a></li> ';
                } else {
                    $categories = get_the_category();
                    if (1 === count($categories) && $categories[0]->cat_ID === 1) { // 1 = news
                        echo '<a href="/news">News</a></li> ';
                    } else {
                        the_category(' </li><li class="separator"> / </li><li> ');
                    }
                }
                if (is_single()) {
                    echo '</li><li class="separator"> / </li><li>';
                    the_title();
                    echo '</li>';
                }
            } elseif (is_page()) {
                if($post->post_parent) {
                    $anc = get_post_ancestors( $post->ID );
                    $title = get_the_title();
                    foreach ( $anc as $ancestor ) {
                        $output = '<li><a href="'.get_permalink($ancestor).'" title="'.get_the_title($ancestor).'">'.get_the_title($ancestor).'</a></li> <li class="separator">/</li>';
                    }
                    echo $output;
                    echo '<strong title="'.$title.'"> '.$title.'</strong>';
                } else {
                    echo '<li><strong> ' . get_the_title() . '</strong></li>';
                }
            } elseif (is_home()) { // news page
                echo '<li>News</li>';
            } elseif ('forum' === $post->post_type) {
                echo '<li><a href="/forums">Forums</a></li>';
            }
        }
        echo '</ul>';
    }
    
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
        
        // Single patch page
        add_rewrite_rule('(patch-library)/patch/(.+)/?$', 'index.php?pagename=$matches[1]&patch=$matches[2]', 'top');
        
        // Edit patch page
        add_rewrite_rule('edit-patch/(.+)/?$', 'index.php?pagename=edit-patch&patch=$matches[1]', 'top');
        
        flush_rewrite_rules();
    }

    function add_owl_spa_rewrite_rules() {
        // all subpaths off patch-library-spa/ redirect to patch-library-spa/ so bundle.js is always served by WP and then js can control routing client side.
        add_rewrite_rule('patch-library-spa/(.+)/?$', 'index.php?pagename=patch-library-spa', 'top');
        flush_rewrite_rules();
    }

    add_action('init', 'add_owl_spa_rewrite_rules');
