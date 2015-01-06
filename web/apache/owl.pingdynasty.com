<VirtualHost *:80>
    
    # Basic settings
    ServerName www.hoxtonowl.com
    ServerAlias hoxtonowl.com owl.pingdynasty.com
    DocumentRoot /home/owl/wordpress

    # Logging

    ErrorLog /var/log/apache2/owl.pingdinasty.com.error.log
    LogLevel debug
    CustomLog /var/log/apache2/owl.pingdynasty.com.log combined
    php_flag display_errors off
    SetEnv APPLICATION_ENV production
    
    <Directory /home/owl/wordpress>
        Options FollowSymLinks
        #AllowOverride Limit Options FileInfo
        AllowOverride None
        DirectoryIndex index.php
        
        php_flag display_errors on

        <Files "xmlrpc.php">
            Order Allow,Deny
            deny from all
        </Files>
        
        <IfModule mod_rewrite.c>
            
            RewriteEngine On
            RewriteBase /

            # Mediawiki clean URLs:
            RewriteRule ^/?wiki(/.*)?$ %{DOCUMENT_ROOT}/mediawiki/index.php [L]

            # Misc rewrites:
            RewriteRule ^/?gettingstarted(/)?$ /wiki/Getting_Started [R=301,L]

            # Better security:
            RewriteRule ^wp-admin/includes/ - [F,L]
            RewriteRule !^wp-includes/ - [S=3]
            RewriteRule ^wp-includes/[^/]+\.php$ - [F,L]
            RewriteRule ^wp-includes/js/tinymce/langs/.+\.php - [F,L]
            RewriteRule ^wp-includes/theme-compat/ - [F,L]

            # WordPress:
            RewriteRule ^index\.php$ - [L]
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule . /index.php [L]

        </IfModule>

        # Enable CORS for cross-origin request of web fonts for social media thingie
        # Note that this requires the 'headers' module to be enabled: sudo a2enmod headers
        Header set Access-Control-Allow-Origin "*"

    </Directory>

    <Directory /home/owl/wordpress/_meta>
        Order Deny,Allow
        deny from all
    </Directory>

    <Directory /home/owl/wordpress/_deploy/>
        AuthName "Secure Area"
        AuthType Basic
        AuthUserFile /home/owl/.htpasswd
        require valid-user 
    </Directory>

    <Directory /home/owl/wordpress/mediawiki/images/>
        <Files *.php>
            deny from all
        </Files>
    </Directory>

    <Directory /home/owl/wordpress/wp-content/upload/>
        <Files *.php>
            deny from all
        </Files>
    </Directory>
</VirtualHost>
