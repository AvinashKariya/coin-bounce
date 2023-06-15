const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SK, REFRESH_TOKEN_SK } = require("../config/index");
const RefreshToken = require("../models/token");
class JwtServices {
  //sign access token
  static signAccessToken(payload, expiryTime) {
    return jwt.sign(payload, ACCESS_TOKEN_SK, { expiresIn: expiryTime });
  }

  //sign refresh token
  static signRefreshToken(payload, expiryTime) {
    return jwt.sign(payload, REFRESH_TOKEN_SK, { expiresIn: expiryTime });
  }

  //verify access token
  static verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_TOKEN_SK);
  }

  //verify refresh token
  static verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_TOKEN_SK);
  }

  //store refresh token
  static async storeRefreshToken(token, userId) {
    try {
      const newToken = new RefreshToken({
        token,
        userId,
      });
      await newToken.save();
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = JwtServices;
