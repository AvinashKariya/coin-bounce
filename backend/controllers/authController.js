const Joi = require("joi");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const UserDTO = require("../dto/user");
const JwtService = require("../services/JwtService");
const RefreshToken = require("../models/token");

//regex for password
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{5,12}$/;

const authController = {
  //Register user into database
  async register(req, res, next) {
    //1. validating given input from req object using  "joi"  -  package for validating inputs
    const userRegisterSchema = Joi.object({
      name: Joi.string().min(5).max(20).required(),
      username: Joi.string().min(5).max(20).required(),
      email: Joi.string().email().required(),
      password: Joi.string().pattern(passwordPattern).required(),
      confirmPassword: Joi.ref("password"),
    });
    const { error } = userRegisterSchema.validate(req.body);

    //2. if error in validation -> return err from mw
    if (error) {
      return next(error);
    }

    //3. if email and user already exsist or not -> return err from mw
    const { username, name, email, password } = req.body;
    try {
      const usedEmail = await User.exists({ email });
      const usedUsername = await User.exists({ username });

      if (usedEmail) {
        const error = {
          status: 409,
          message: "email already in registerd,try with another one",
        };
        return next(error);
      }
      if (usedUsername) {
        const error = {
          status: 409,
          message: "username already taken,try with another one",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    //5. encrypt password , store data in db && send response as 201
    const hashedPass = await bcrypt.hash(password, 10);
    let accessToken, refreshToken, user;

    try {
      const userToReg = new User({
        username,
        name,
        email,
        password: hashedPass,
      });
      user = await userToReg.save();

      //token genration for authenticating
      accessToken = JwtService.signAccessToken({ _id: user._id }, "30m");

      refreshToken = JwtService.signRefreshToken({ _id: user._id }, "60m");
    } catch (error) {
      return next(error);
    }

    //storing refresh token in db
    await JwtService.storeRefreshToken(refreshToken, user._id);
    //sending tokens to cookies.
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    const userDto = new UserDTO(user);
    return res.status(201).json({ user: userDto, auth: true });
  },

  //login user with validating corrrect details from db
  async login(req, res, next) {
    // 1. validate user input
    const userLoginSchema = Joi.object({
      username: Joi.string().min(5).max(20).required(),
      password: Joi.string().pattern(passwordPattern).required(),
    });

    const { error } = userLoginSchema.validate(req.body);
    // 2. if error -> return error with m.w.
    if (error) {
      return next(error);
    }
    // 3. match username or email with password and return response
    const { username, password } = req.body;
    let user;
    try {
      user = await User.findOne({ username });

      if (!user) {
        const error = {
          status: 401,
          message: "username not exists",
        };
        return next(error);
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        const error = {
          status: 401,
          message: "wrong password",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    //token genration for authenticating
    const accessToken = JwtService.signAccessToken({ _id: user._id }, "30m");
    const refreshToken = JwtService.signRefreshToken({ _id: user._id }, "60m");

    //update refresh token in db
    try {
      await RefreshToken.updateOne(
        { _id: user._id },
        { token: refreshToken },
        { upsert: true }
      );
    } catch (error) {
      return next(error);
    }
    //sending tokens to cookies.
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    const userDto = new UserDTO(user);
    return res.status(200).json({ user: userDto, auth: true });
  },

  //logout user
  async logout(req, res, next) {
    // 1.delete refresh token ffrom db and cookies
    const { refreshToken } = req.cookies;

    try {
      await RefreshToken.deleteOne({ token: refreshToken });
    } catch (error) {
      return next(error);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    // 2. send res to client
    res.status(200).json({ user: null, auth: false });
  },

  //refresh token
  async refresh(req, res, next) {
    //1. get refresh token from cookie
    // 2. verify refreshtoken
    // 3. generate new token
    // 4. update db, return res

    const originalToken = req.cookies.refreshToken;

    let id;

    try {
      id = JwtService.verifyRefreshToken(originalToken)._id;
    } catch (e) {
      const error = {
        status: 401,
        message: "Unauthorized",
      };
      return next(error);
    }

    try {
      const match = RefreshToken.findOne({ _id: id, token: originalToken });
      if (!match) {
        const error = {
          status: 401,
          message: "Unauthorized",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    try {
      const accessToken = JwtService.signAccessToken({ _id: id }, "30m");
      const refreshToken = JwtService.signRefreshToken({ _id: id }, "60m");

      await RefreshToken.updateOne({ _id: id }, { token: refreshToken });

      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
    } catch (error) {
      return next(error);
    }
    const user = await User.findOne({ _id: id });
    const userDto = new UserDTO(user);
    return res.status(201).json({ user: userDto, auth: true });
  },
};

module.exports = authController;
