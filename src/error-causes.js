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

const MissingCause = {
  name: "MissingCause",
  message: "Error is missing a cause",
};
const MissingCauseName = {
  name: "MissingCauseName",
  message: "Error's cause is missing a name",
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

    if (!cause)
      throw createError({
        ...MissingCause,
        message: `${MissingCause.message}: ${error.name}. Did you forget to create the error with createError()?`,
        cause: error,
      });

    if (!cause.name)
      throw createError({
        ...MissingCauseName,
        message: `${MissingCauseName.message}: ${error.name}. Did you forget to create the error with createError()?`,
        cause: error,
      });

    const handler = handlers[cause.name];

    // if (!handler) throw createError({
    //   ...MissingCause,
    //   message: `${ MissingCause.message }: ${ error }`,
    //   cause: error,
    // });

    return handler(error);
  };

  return [errors, handleErrors];
};

export { errorCauses, createError };
