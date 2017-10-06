#!/bin/bash
#must be run as root 

echo "deploying spa"
git pull origin newWordpressTheme
cd /opt/OwlServer/web/owlspa
npm install
npm run builddev
cp -r /opt/OwlServer/web/wordpress/wp-content/themes/shopkeeper-child/page-patch-library/* /home/bitnami/apps/wordpress/htdocs/wp-content/themes/shopkeeper-child/page-patch-library/
