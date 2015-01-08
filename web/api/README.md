This project exposes some data related to the [OWL][1] project over a RESTful API.

## Patches

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

## Authors

#### GET /authors/findAll
Retrieves a list of all authors.

## Tags

#### GET /tags/findAll
Retrieves a list of all tags.

[1]: http://hoxtonowl.com/ "Hoxton OpenWare Laboratory"
