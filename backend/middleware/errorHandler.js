const { ValidationError } = require("joi");
const errorHandler = (err, res) => {
  //default error
  let status = 500;
  let data = {
    message: "Internal server error",
  };

  if (err instanceof ValidationError) {
    status = 401;
    data.message = err.message;
    return res.status(status).json(data);
  }

  if (err.status) {
    status = err.status;
  }
  if (err.message) {
    data.message = err.message;
  }

  return res.status(status).json(data);
};

module.exports = errorHandler;
