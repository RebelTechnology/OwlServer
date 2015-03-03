<VirtualHost *:80>

        ServerName staging.hoxtonowl.com:80
        DocumentRoot /var/www/hoxtonowl.com/subdomains/staging/httpdocs

        ErrorLog /var/www/hoxtonowl.com/subdomains/staging/logs/error.log
        LogLevel debug
	    CustomLog /var/www/hoxtonowl.com/subdomains/staging/logs/access.log combined
        php_flag display_errors on
        SetEnv APPLICATION_ENV staging

        # Reverse proxy for REST API
        ProxyRequests Off
        ProxyVia On
        <Location /api/>
            ProxyPass http://127.0.0.1:3000/
            ProxyPassReverse http://127.0.0.1:3000/
            Order allow,deny
            Allow from all
        </Location>

        <Directory /var/www/hoxtonowl.com/subdomains/staging/httpdocs/>
		    Options FollowSymLinks
	        AllowOverride Limit Options FileInfo
            Order allow,deny
            allow from all
            DirectoryIndex index.php

            <Files "xmlrpc.php">
                Order Allow,Deny
                deny from all
            </Files>

            <IfModule mod_rewrite.c>

                RewriteEngine On
                RewriteBase /

                # Mediawiki clean URLs:
                RewriteRule ^/?wiki(/.*)?$ %{DOCUMENT_ROOT}/mediawiki/index.php [L]

                # Wordpress:
                RewriteRule ^index\.php$ - [L]
                RewriteCond %{REQUEST_FILENAME} !-f
                RewriteCond %{REQUEST_FILENAME} !-d
                RewriteRule . /index.php [L]
            </IfModule>
        </Directory>
</VirtualHost>
