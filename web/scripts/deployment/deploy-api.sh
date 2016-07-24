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
if [ "$HOSTNAME" = "ulrike" -o "$HOSTNAME" = "bella" ]
then
    TARGET_ENV='staging'
    GIT_BRANCH='dev'
elif [ "$HOSTNAME" = "nestor" ]
then
    TARGET_ENV='production'
    GIT_BRANCH='master'
else
    echo "Unknown hostname $HOSTNAME. Cannot determine target environment."
    echo "Aborting."
    exit 1
fi
echo "This is $HOSTNAME, assuming $TARGET_ENV environment."

# # Delete previous clone
# rm -rf $DIR/$CLONE_DIR

# Clone or update repository
if [ ! -d $DIR/$CLONE_DIR ]
then
    echo "Cloning $CLONE_DIR repository..."
    git clone --quiet $REPO_URL $DIR/$CLONE_DIR
fi
echo "Checking out '$GIT_BRANCH' branch..."
cd $DIR/$CLONE_DIR
git checkout $GIT_BRANCH > /dev/null
git pull origin $GIT_BRANCH > /dev/null
cd - > /dev/null

# Copy files
echo "Copying files..."
mv $DIR/../api/api-settings.js /tmp
mv $DIR/../api/node_modules /tmp
# rm -rf $DIR/../api
# cp -a $DIR/OwlServer/web/api $DIR/../
rsync -rav $DIR/OwlServer/web/api $DIR/../
mv /tmp/api-settings.js $DIR/../api/
mv /tmp/node_modules $DIR/../api/

## Install node modules
#if [ ! -d "$DIR/../api/node_modules" ]; then
#    echo "Installing node.js modules..."
#    cd $DIR/../api
#    npm install
#    cd - > /dev/null
#fi

# Update deployment script
echo "Updating deployment script..."
cp $DIR/$CLONE_DIR/web/scripts/deployment/deploy-api.sh $DIR/

# Set privileges
echo "Setting up permissions..."
chown -R root $DIR/../api
chgrp -R hoxtonowl $DIR/../api
find $DIR/../api -type f -exec chmod 664 '{}' \;
find $DIR/../api -type d -exec chmod 775 '{}' \;
find $DIR/../api -type d -exec chmod g+s '{}' \;
chmod o+x $DIR/../api/bin/www
touch /var/log/owl-api.log
chmod o+w /var/log/owl-api.log
chown root:root $DIR/deploy-api.sh
chmod 744 $DIR/deploy-api.sh

# Delete temp repo clone
# echo "Deleting temp repo clone..."
# rm -rf $DIR/$CLONE_DIR

# Restart service
echo "Restarting service..."
service owl-api stop
service owl-api start

echo "Done."
