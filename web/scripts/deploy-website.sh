#!/bin/bash
#
# Written by Sam Artuso <sam@highoctanedev.co.uk>

# Settings
CLONE_DIR='OwlServer'
REPO_URL="https://github.com/pingdynasty/$CLONE_DIR.git"

# Make sure only root can run this script
if [[ $EUID -ne 0 ]]; then
    echo "This script must be run as root" 1>&2
    exit 1
fi

# Work out directory where this script is, no matter where it is called from,
# and with which method (source, bash -c, symlinks, etc.):
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do
    DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
    SOURCE="$(readlink "$SOURCE")"
    [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"

# Work out environment
HOSTNAME=`hostname`
if [ "$HOSTNAME" = "bella" ]
then
    TARGET_ENV='staging'
    GIT_BRANCH='dev'
    SITE_URL='http://staging.hoxtonowl.com'
elif [ "$HOSTNAME" = "nestor" ]
then
    TARGET_ENV='production'
    GIT_BRANCH='master'
    SITE_URL='http://www.hoxtonowl.com'
else
    echo "Unknown hostname $HOSTNAME. Cannot determine target environment."
    echo "Aborting."
    exit 1
fi
echo "This is $HOSTNAME, assuming $TARGET_ENV environment."

# Delete previous clone
rm -rf $DIR/$CLONE_DIR

# Clone repository
echo "Cloning $CLONE_DIR repository..."
git clone --quiet $REPO_URL $DIR/$CLONE_DIR
cd $DIR/$CLONE_DIR
echo "Checking out '$GIT_BRANCH' branch..."
git checkout $GIT_BRANCH > /dev/null
git pull origin $GIT_BRANCH > /dev/null
cd - > /dev/null

# Update Wordpress
echo "Updating Wordpress files..."
rm -rf $DIR/../httpdocs/wp-content/themes/hoxton-owl-2014
mv $DIR/OwlServer/web/wordpress/wp-content/themes/hoxton-owl-2014/ $DIR/../httpdocs/wp-content/themes/
cp -a $DIR/OwlServer/web/wordpress/robots.txt $DIR/../httpdocs/
cp $DIR/OwlServer/web/wordpress/wp-content/plugins/owl-api-bridge.php $DIR/../httpdocs/wp-content/plugins/

# Update Mediawiki
echo "Updating Mediawiki files..."
rsync --quiet -avz $DIR/OwlServer/web/mediawiki/skins/HoxtonOWL2014 $DIR/../httpdocs/mediawiki/skins/

# Set privileges
echo "Setting up permissions..."
chown -R root $DIR/../httpdocs
chgrp -R hoxtonowl $DIR/../httpdocs
chmod -R 775 $DIR/../httpdocs
chmod g+s $DIR/../httpdocs
chown -R www-data $DIR/../httpdocs/wp-content/uploads
chown -R www-data $DIR/../httpdocs/mediawiki/images

chown -R root:root $DIR/../deployment
chmod 755 $DIR/../deployment
chmod 744 $DIR/../deployment/deploy-website.sh

chown -R www-data:www-data $DIR/../logs
chmod 664 $DIR/../logs/*

# Update deployment script
echo "Updating deployment script..."
cp -a $DIR/$CLONE_DIR/web/scripts/deploy-website.sh $DIR/

# Delete temp repo clone
echo "Deleting temp repo clone..."
rm -rf $DIR/$CLONE_DIR

echo "Done."

echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
echo " REMEMBER TO CLEAR APC CACHE @ $SITE_URL/apc.php !!!                    "
echo "                                                                        "
echo " Unfortunately I cannot do this for you...                              "
echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"