const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../middleware/asyncHandler");
const generateToken = require("../utils/generateToken");

const sanitizeUser = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * POST /api/v1/auth/register
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required.");
  }

  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered.");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "User registered successfully.",
    data: {
      user: sanitizeUser(user),
      token,
    },
  });
});

/**
 * POST /api/v1/auth/login
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful.",
    data: {
      user: sanitizeUser(user),
      token,
    },
  });
});

/**
 * GET /api/v1/auth/me
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(req.user),
    },
  });
});

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};