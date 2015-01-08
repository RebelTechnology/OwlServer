This project exposes some data related to the [OWL][1] project over a RESTful API.

## Requirements
* Node.js

## Installing
1. Clone directory `web/api` from repository.
2. Copy file `_meta/api-settings.tpl.js` to root directory and rename it to `api-settings.js`:

        cp _meta/api-settings.tpl.js api-settings.js
3. You're likey to want to change variables `API_PORT` and/or `MONGO_DATABASE` in this new file. We are using a port and a MongoDB database for each environment (staging, production).
4. Install node.js modules:

        npm install
5. Enjoy!

       ./bin/www

## API documentation

### Patches

#### GET /patches/findOne/:id
Retrieves the patch with the given ID (if it exists).

#### GET /patches/findAll
Retrieves all patches.

#### GET /findByTag/:tags
Retrieves a summary for each patch tagged with at least one of the specified tags.
##### Parameters
`:tags` - A comma-separated list of tags.

#### GET /findByAuthor/:authors
Retrieves a summary for each patch by the specified authors.
##### Parameters
`:authors` - A comma-separated list of authors.

### Authors

#### GET /authors/findAll
Retrieves a list of all authors.

### Tags

#### GET /tags/findAll
Retrieves a list of all tags.

[1]: http://hoxtonowl.com/ "Hoxton OpenWare Laboratory"
