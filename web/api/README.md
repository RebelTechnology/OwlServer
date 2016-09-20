This project exposes some data related to the [OWL][1] project over a RESTful API.

## Requirements
* Node.js

## How to run
1. Copy file `_meta/api-settings.tpl.js` to root directory and rename it to `api-settings.js`:

        cp _meta/api-settings.tpl.js api-settings.js
2. You're likey to want to change variables `API_PORT` and/or `MONGO_DATABASE` in this new file. We are using a port and a MongoDB database for each environment (staging, production).
3. Install node.js modules:

        npm install
4. Enjoy!

        ./bin/www

**NOTE:** The method above is suitable for quickly testing the API locally. If
you want to run it in production, consider using a SysV init script. Here's [an
example](_meta/init-scripts/owl-api).

## API documentation

### Patches

#### GET /patch/:id
Retrieves the patch with the given ID. Returns `404 Not found` if the specified
patch could not be found.

#### GET /patches/
Retrieves all patches.

#### POST /patches/
Creates a new patch.

#### PUT /patch/:id
Updates a patch. Returns `404 Not found` if the specified patch could not be
found.

#### DELETE /patch/:id
Deletes a patch.  Returns `404 Not found` if the specified patch could not be
found.

### Authors

#### GET /authors/
Retrieves a list of all authors.

### Tags

#### GET /tags/
Retrieves a list of all tags.

### Builds (Compilation)

#### GET /builds/:id[?format={sysex|sysx|js}]
Returns the build for the specified patch.
The `format` parameter defaults to `sysx`.

#### PUT /builds/:id
Builds the specified patch.

[1]: http://hoxtonowl.com/ "Hoxton OpenWare Laboratory"
