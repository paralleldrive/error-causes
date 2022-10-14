import CausedError from "./caused-error.js";

const exists = (x) => x != null;

const filterStack = (error) => {
  const stack = error.stack.split("\n");
  stack.splice(1, 1);
  error.stack = stack.join("\n");
  return error;
};

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
  return filterStack(error);
};

const MissingHandler = {
  name: "MissingHandler",
  message: "Missing error handler",
};
const UnexpectedError = {
  name: "UnexpectedError",
  message: "An unexpected error was thrown",
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

  const handleErrors = (handlers) => {
    const errorNames = Object.keys(errors);

    errorNames.forEach((errorName) => {
      if (!(errorName in handlers)) {
        throw createError({
          ...MissingHandler,
          message: `${MissingHandler.message}: ${errorName}`,
        });
      }
    });

    return (error) => {
      const { cause = {} } = error;
      const handler = handlers[cause.name];
      if (!handler) {
        throw createError({
          ...UnexpectedError,
          message: `${UnexpectedError.message}: ${
            cause.name ? cause.name : "unknown"
          }`,
        });
      }

      return handler(error);
    };
  };

  return [errors, handleErrors];
};

/*eslint-disable*/
const noop = () => {};
/*eslint-enable */

export { errorCauses, createError, noop };
