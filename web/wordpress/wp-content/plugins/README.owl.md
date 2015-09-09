## WARNING

I blocked the updates for plugin "Theme my login" because it's got an uncompatibility
problem with WP 4.3 that interferes with password reset. To fix the problem,
I edited line 1104 of `theme-my-login/includes/class-theme-my-login.php` from:

    $wpdb->update( $wpdb->users, array( 'user_activation_key' => $hashed ), array( 'user_login' => $user_login ) );

to:

    $wpdb->update( $wpdb->users, array( 'user_activation_key' => time().":".$hashed ), array( 'user_login' => $user_login ) );

See https://wordpress.org/support/topic/reset-password-email-with-expired-key
for details. The solution for the issue is shown in answer #4.
