const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT;
const MONGODB_CON = process.env.MONGODB_CON;
const ACCESS_TOKEN_SK = process.env.ACCESS_TOKEN_SK;
const REFRESH_TOKEN_SK = process.env.REFRESH_TOKEN_SK;
const BACKEND_SERVER_PATH = process.env.BACKEND_SERVER_PATH;
module.exports = {
  PORT,
  MONGODB_CON,
  ACCESS_TOKEN_SK,
  REFRESH_TOKEN_SK,
  BACKEND_SERVER_PATH,
};
