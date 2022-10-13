import { describe } from "riteway/esm/riteway.js";

import { errorCauses, createError } from "./error-causes.js";

/*eslint-disable */
const createExampleStack = () => `Error: Foo  
at createError (/Users/eric/dev/error-causes/src/error-causes.js:6:3) 
at Timeout._onTimeout (/Users/eric/dev/error-causes/src/tmp.js:5:97) 
at listOnTimeout (node:internal/timers:559:17) 
at process.processTimers (node:internal/timers:502:7) 
​​​​​at ​​​​​​​​e.stack​​​ ​src/tmp.js:5:3`;
/*eslint-enable */

describe("createError", async (assert) => {
  const optionNames = ["name", "message", "code", "stack"];

  const name = "ImATeapot";
  const message = "I'm a teapot";
  const code = 418;

  const error = createError({
    name,
    message,
    code,
  });
  const cause = {
    name,
    message,
    code,
  };

  assert({
    given: "name, message, and code",
    should: "return an error cause with matching name, message, and code",
    actual: error.cause,
    expected: cause,
  });

  optionNames.forEach((option) => {
    const error = createError();
    assert({
      given: `no ${option}`,
      should: `not return a casue with a ${option} property`,
      actual: Object.prototype.hasOwnProperty.call(error.cause, option),
      expected: false,
    });
  });

  {
    const stack = createExampleStack();
    assert({
      given: "a stack",
      should: "return a cause with the original stack",
      actual: createError({ stack }).cause.stack,
      expected: stack,
    });
  }

  {
    const foo = "bar";

    assert({
      given: "an undocumented prop",
      should: "pass the prop through to the error.cause",
      actual: createError({ foo }).cause.foo,
      expected: foo,
    });
  }
});

describe("errorCauses", async (assert) => {
  const [fetchErrors, configureHandleFetchErrors] = errorCauses({
    NotFound: {
      code: 404,
      message: "The requested resource was not found",
    },
    MissingURI: {
      code: 400,
      message: "URI is required",
    },
  });
  const { NotFound } = fetchErrors;

  assert({
    given: "a list of error causes",
    should: "return a map of error causes keyed by error name",
    actual: fetchErrors,
    expected: {
      NotFound: NotFound,
      MissingURI: {
        name: "MissingURI",
        code: 400,
        message: "URI is required",
      },
    },
  });

  assert({
    given: "a list of error causes",
    should: "return a function to handle errors",
    actual: configureHandleFetchErrors({
      NotFound: ({ cause }) => cause,
    })(createError(NotFound)),
    expected: NotFound,
  });

  // TODO: Throw an error if we're missing an error cause handler
  // TODO: Pass original error to MissingCause error
});
