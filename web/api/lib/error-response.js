'use strict';

/**
 * Returns an error to the client and also:
 * * picks the appropriate HTTP status for the response;
 * * adds additional error properties to the response;
 * * logs errors;
 * * makes sure that we don't leak internal errors.
 *
 * @param  {Error|Object} err - An error.
 * @param  {Object} res       - The current Express Response object.
 * @return {Object}           - A new Express Response object.
 */
const errorResponse = (err, res) => {

  let status = err.status || 500;
  if ([ 'PatchValidationError', 'PatchFieldValidationError' ].includes(err.constructor.name)) {
    status = 400;
  }

  process.stderr.write(err.stack + '\n');
  const additionalErrorProperties = {};
  for (let prop in err) {
    additionalErrorProperties[prop] = err[prop];
    process.stderr.write(`prop = ${prop}\n`);
  }

  let data = {
    success: false,
    status: status,
    message: (err.public && err.message) || 'Internal error.',
  };
  if (err.public) {
    data = Object.assign(additionalErrorProperties, data);
  }

  delete data.public; // no point letting the client know that we filter out errors
  return res.status(status).json(data);
};

module.exports = errorResponse;
