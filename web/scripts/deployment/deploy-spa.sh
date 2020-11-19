#!/bin/bash
#must be run as root 

target='prod'
branch='master'
#default to prod and master unless otherwise specified with -e dev flag

echo "deploying spa"

getopts ":e:" opt; 

if [ $OPTARG == 'dev' ]
then
  target='dev'
  branch='dev'
fi

echo "target environment is $target and github branch is $branch"

git checkout $branch
git pull origin $branch
cd /opt/OwlServer/web/owlspa
npm install
npm run build:$target
cp -r /opt/OwlServer/web/wordpress/wp-content/themes/shopkeeper-child/page-patch-library/* /home/bitnami/apps/wordpress/htdocs/wp-content/themes/shopkeeper-child/page-patch-library/
