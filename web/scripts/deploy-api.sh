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

# Copy files
echo "Copying files..."
rsync --quiet -avz $DIR/OwlServer/web/api/* $DIR/../$TARGET_ENV/

# Install node modules
echo "Installing node.js modules..."
cd $DIR/../$TARGET_ENV
npm install
cd - > /dev/null

# Update deployment script
echo "Updating deployment script..."
cp $DIR/$CLONE_DIR/web/scripts/deploy-api.sh $DIR/../deployment/

# Set privileges
echo "Setting up permissions..."
chown -R root /srv/owl/api
chgrp -R hoxtonowl /srv/owl/api
find /srv/owl/api -type f -exec chmod 664 '{}' \;
find /srv/owl/api -type d -exec chmod 775 '{}' \;
find /srv/owl/api -type d -exec chmod g+s '{}' \;
chmod o+x /srv/owl/api/bin/www
touch /var/log/owl-api.log
chmod o+w /var/log/owl-api.log
chown root:root /srv/owl/deployment/deploy-api.sh
chmod 744 /srv/owl/deployment/deploy-api.sh

# Delete temp repo clone
echo "Deleting temp repo clone..."
rm -rf $DIR/$CLONE_DIR

# Restart service
echo "Restarting service..."
service owl-api.production stop
service owl-api.production start

echo "Done."