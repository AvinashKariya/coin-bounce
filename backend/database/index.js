const mongoose = require("mongoose");
const { MONGODB_CON } = require("../config/index");

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_CON);
    console.log(`Database is running on ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
  }
};

module.exports = dbConnect;
