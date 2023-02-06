const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");

// @desc    Get single user
exports.getUser = async (phone) => {
  try {
    const user = await User.findOne({ phone: phone }).exec();
    if (!user) return null;

    return user;
  } catch (error) {
    return undefined;
  }
};

// @desc     Create user
exports.createUser = async (data) => {
  try {
    const user = await User.create(data);
    Promise.resolve(user);
    return user;
  } catch (error) {
    return error;
  }
};

// @desc   update Balance
exports.updateBalance = async (amount, phone) => {
  try {
    const user = await User.where("phone", phone).update({
      $set: { amount: amount },
    });

    return user;
  } catch (error) {
    return error;
  }
};

// @desc  login
exports.login = async (pin, phone) => {
  try {
    const user = await User.findOne({ phone }).select("+pin").exec();
    if (!user) return null;

    // Check if pin matches
    const isMatch = await user.matchPassword(pin);
    if (!isMatch) return null;

    sendTokenResponse(user, 200, res);
    Promise.resolve(isMatch);
  } catch (error) {
    return error;
  }
};

// @desc  change Pin
exports.changePin = async (pin, phone) => {
  try {
    const user = await User.where("phone", phone).update({
      $set: { pin: user.matchPassword(pin) },
    });

    return user;
  } catch (error) {
    return error;
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Secure cookie e.g. https
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
