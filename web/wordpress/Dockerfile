FROM wordpress:5.7.2-php7.4-apache

ADD wp-content /var/www/html/wp-content
ADD wp-config.php /var/www/html/
ADD wp-settings.php /var/www/html/

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]
