<header>

<div id="primary-nav-bar">
    <div id="primary-nav-container">
        <a href="<?php echo get_option('home'); ?>"><img id="logo" src="<?php echo get_bloginfo('template_directory');?>/images/logo.png" alt="Hoxton Owl"></a>
        <ul id="primary-nav-items">
            <?php wp_nav_menu(array('container_class' => 'main-nav', 'theme_location' => 'primary')); ?>
        </ul>
        <ul id="reg-signin-items">
<?php

if (!is_user_logged_in()) {
?>
            <li><a href="<?php echo wp_registration_url(); ?>">Register</a></li>
            <li><a href="<?php echo wp_login_url( $redirect ); ?>">Sign In</a></li>
<?php

} else {
    $currentUser = wp_get_current_user();
?>
            <li><a href="/forums/users/<?php echo htmlspecialchars($currentUser->user_login); ?>/edit/"><?php echo htmlspecialchars($currentUser->user_login); ?></a></li>
            <li><a href="<?php echo wp_logout_url(); ?>">Log Out</a></li>
<?php
}
?>
            <li><a href="http://www.rebeltech.org/shop/" class="order-button">Order</a></li>
        </ul>
    </div>
</div>

</header>