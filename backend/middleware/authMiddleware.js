const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("./asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authorized. No token provided.");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Not authorized. Token is missing.");
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Not authorized. Token is invalid or expired.");
  }

  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new ApiError(401, "Not authorized. User no longer exists.");
  }

  req.user = user;

  next();
});

module.exports = {
  protect,
};