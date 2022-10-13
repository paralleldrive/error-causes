import CausedError from "./caused-error.js";

const exists = (x) => x != null;

/**
 * @param {object} [options]
 * @param {string} [options.name] - The name of the error, e.g. "NotFound"
 * @param {string} [options.message]  - The message of the error, e.g. "The requested resource was not found"
 * @param {number} [options.code] - The status code of the error, e.g. 404
 * @param {string} [options.stack] - The error stack
 * @param {object} [options.cause] - The cause of the error (e.g. the original error)
 * @param {*} [options.*] - undocumented props
 * @returns {CausedError}
 */
const createError = ({ message, ...rest } = {}) => {
  const error = new CausedError(message, {
    cause: {
      ...(exists(message) && { message }),
      ...rest,
    },
  });
  // Remove the createError function from the stack so that
  // the stack trace is more useful.
  const stack = error.stack.split("\n");
  stack.splice(1, 1);
  return error;
};

const MissingHandler = {
  name: "MissingHandler",
  message: "Missing handler for cause",
};

/**
 * @param {object} causes - A map of error causes keyed by error name
 * @returns [object, function]
 */
const errorCauses = (causes = {}) => {
  const errors = Object.entries(causes).reduce(
    (newCauses, [name, cause]) => ({
      ...newCauses,
      [name]: { ...cause, name },
    }),
    {}
  );

  const handleErrors = (handlers) => (error) => {
    const { cause } = error;
    const handler = handlers[cause.name];

    if (!handler)
      throw createError({
        ...MissingHandler,
        message: `${MissingHandler.message}: ${error.cause.name}`,
        cause: error,
      });

    return handler(error);
  };

  return [errors, handleErrors];
};

export { errorCauses, createError };
