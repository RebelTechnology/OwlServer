<header>

<div id="primary-nav-bar">
    <div id="primary-nav-container">
        <a href="<?php echo get_option('home'); ?>"><img id="logo" src="<?php echo get_bloginfo('template_directory');?>/images/logo.png" alt="Hoxton Owl"></a>
        <ul id="primary-nav-items">
            <?php wp_nav_menu( array( 'container_class' => 'main-nav', 'theme_location' => 'primary' ) ); ?>
        </ul>
        <ul id="reg-signin-items">
            <!--<li><a href="#">Register</a></li>
            <li><a href="#">Sign in</a></li>-->
            <li><a href="http://www.rebeltech.org/shop/" class="order-button">Order</a></li>
        </ul>
    </div>
</div>

</header>