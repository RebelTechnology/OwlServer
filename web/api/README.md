This project exposes some data related to the [OWL][1] project over a RESTful API.

## Patches

#### GET /patches/findAll
Retrieves all patches.

#### GET /findByTag/:tags
Retrieves all the patches that are tagged with at least one of the specified tags.
##### Parameters
`:tags` - A comma-separated, case-sensitive list of tags.

#### GET /findByAuthor/:authors
Retrieves all the patches by the specified authors.
##### Parameters
`:authors` - A comma-separated, case-sensitive list of authors.

## Authors

#### GET /authors/findAll
Retrieves a list of all authors.

## Tags

#### GET /tags/findAll
Retrieves a list of all tags.

[1]: http://hoxtonowl.com/ "Hoxton OpenWare Laboratory"
