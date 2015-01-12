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

    # Reverse proxy for REST API 
    ProxyRequests Off 
    ProxyVia On
    <Location /api/>
        ProxyPass http://staging.hoxtonowl.com:3001/
        ProxyPassReverse http://staging.hoxtonowl.com:3001/
        Order allow,deny
        Allow from all 
    </Location> 
    
    <Directory /home/owl/wordpress>
        Options FollowSymLinks -Indexes
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

        # Some security tweaks
        <Files .htaccess>
            Order allow,deny
            Deny from all
        </Files>
        <Files readme.html>
            Order allow,deny
            Deny from all
        </Files>
        <Files readme.txt>
            Order allow,deny
            Deny from all
        </Files>
        <Files install.php>
            Order allow,deny
            Deny from all
        </Files>
        <Files wp-config.php>
            Order allow,deny
            Deny from all
        </Files>
        <IfModule mod_rewrite.c>
                RewriteEngine On
                
                # Rules to protect wp-includes
                RewriteRule ^wp-admin/includes/ - [F]
                RewriteRule !^wp-includes/ - [S=3]
                RewriteCond %{SCRIPT_FILENAME} !^(.*)wp-includes/ms-files.php
                RewriteRule ^wp-includes/[^/]+\.php$ - [F]
                RewriteRule ^wp-includes/js/tinymce/langs/.+\.php - [F]
                RewriteRule ^wp-includes/theme-compat/ - [F]
                
                # Rules to prevent php execution in uploads
                RewriteRule ^(.*)/uploads/(.*).php(.?) - [F]
                
                # Rules to block unneeded HTTP methods
                RewriteCond %{REQUEST_METHOD} ^(TRACE|DELETE|TRACK) [NC]
                RewriteRule ^(.*)$ - [F]
                
                # Rules to block suspicious URIs
                RewriteCond %{QUERY_STRING} \.\.\/ [NC,OR]
                RewriteCond %{QUERY_STRING} ^.*\.(bash|git|hg|log|svn|swp|cvs) [NC,OR]
                RewriteCond %{QUERY_STRING} etc/passwd [NC,OR]
                RewriteCond %{QUERY_STRING} boot\.ini [NC,OR]
                RewriteCond %{QUERY_STRING} ftp\:  [NC,OR]
                RewriteCond %{QUERY_STRING} http\:  [NC,OR]
                RewriteCond %{QUERY_STRING} https\:  [NC,OR]
                RewriteCond %{QUERY_STRING} (\<|%3C).*script.*(\>|%3E) [NC,OR]
                RewriteCond %{QUERY_STRING} mosConfig_[a-zA-Z_]{1,21}(=|%3D) [NC,OR]
                RewriteCond %{QUERY_STRING} base64_encode.*\(.*\) [NC,OR]
                RewriteCond %{QUERY_STRING} ^.*(%24&x).* [NC,OR]
                RewriteCond %{QUERY_STRING} ^.*(127\.0).* [NC,OR]
                RewriteCond %{QUERY_STRING} ^.*(globals|encode|localhost|loopback).* [NC,OR]
                RewriteCond %{QUERY_STRING} ^.*(request|concat|insert|union|declare).* [NC]
                RewriteCond %{QUERY_STRING} !^loggedout=true
                RewriteCond %{QUERY_STRING} !^action=jetpack-sso
                RewriteCond %{QUERY_STRING} !^action=rp
                RewriteCond %{HTTP_COOKIE} !^.*wordpress_logged_in_.*$
                RewriteCond %{HTTP_REFERER} !^http://maps\.googleapis\.com(.*)$
                RewriteRule ^(.*)$ - [F]
                
                # Rules to block foreign characters in URLs
                RewriteCond %{QUERY_STRING} ^.*(%0|%A|%B|%C|%D|%E|%F).* [NC]
                RewriteRule ^(.*)$ - [F]
        </IfModule>


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
