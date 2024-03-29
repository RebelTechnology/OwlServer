This project exposes some data related to the [OWL][1] project over a RESTful API.

## Requirements
* Node.js >= 6.6.*

## How to run
1. Copy file `_meta/example.env` to root directory, rename it to `.env` and
   edit the settings as needed.
2. Install node.js modules:

        npm install

3. Enjoy!

        ./bin/www

**NOTE:** The method above is suitable for quickly testing the API locally. If
you want to run it in production, consider using a SysV init script. Here's [an
example](\_meta/init-scripts/owl-api).

## API documentation

Methods marked with a `*` require authentication.

### Patches

#### GET /patch/:id
Retrieves the patch with the given ID. Returns `404 Not found` if the specified
patch could not be found.

#### GET /patches/
Retrieves all patches.

#### \*POST /patches/
Creates a new patch.

#### \*PUT /patch/:id
Updates a patch. Returns `404 Not found` if the specified patch could not be
found.

#### \*DELETE /patch/:id
Deletes a patch.  Returns `404 Not found` if the specified patch could not be
found.

#### \*POST /patch/:id/sources
Uploads one or more source files.

Request payload format:

    {
      files: [
        {
          name: 'Gain.hpp',
          data: 'base64 encoded file content'
        },
        ...
      ]
    }

### Authors

#### GET /authors/
Retrieves a list of all authors.

### Tags

#### GET /tags/
Retrieves a list of all tags.

### Builds (Compilation)

#### GET /builds/:id[?format={sysex|js}]
Returns the build for the specified patch.
The `format` parameter defaults to `sysex`.

#### \*PUT /builds/:id
Builds the specified patch.

### Authentication

#### POST /session
To authenticate, send a JSON object like the below in the body of the request:

    { "nonce": "some large random number", "apiKeyHash": "hash" }

* `nonce` should be a different large random number sent along with each authentication request;
* `apiKeyHash` is the SHA256 hash of the result of the
concatenation of the `nonce` and the API key. Below is the reference code to generate the hash in Node.js:
        require('crypto').createHash('sha256').update(nonce + apiKey).digest('hex');

#### Accessing protected resources
Whenever the user wants to access a protected route or resource, the user agent
should send the token in the `Authorization` HTTP header using the Bearer
schema. The content of the header should look like the following:

    Authorization: Bearer <token>

## Testing the API from the command line
Example:

    curl http://localhost:3000/patches

[1]: http://hoxtonowl.com/ "Hoxton OpenWare Laboratory"
