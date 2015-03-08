## File system permissions

To make developers able to get write access to the `httpdocs` directory,
add them to the `hoxtonowl` group:

    sudo usermod -a -G hoxtonowl <username>

If they are logged in while the command above is run, they will need to log out
and then log back in.

It's convenient for developers to set their `umask` to `022`. This way, every
other developer in the `hoxtonowl` group will be able to edit files they create.

## Upgrading

To see the version of WordPress:

    cd httpdocs
    wp core version

To see if a new version of WordPress is available:

    wp core check-update

To upgrade WordPress:

    wp core update

To upgrade all WordPress plugins to their latest version:

    wp plugin update --all