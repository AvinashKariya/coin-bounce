const mongoose = require("mongoose");

const refreshTokenSchema = mongoose.Schema(
  {
    token: { type: String, required: true },
    userId: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "RefreshToken",
  refreshTokenSchema,
  "refreshtoken"
);
