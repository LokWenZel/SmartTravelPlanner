const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing from environment variables.");
  }

  return jwt.sign(
    {
      userId,
    },
    jwtSecret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );
};

module.exports = generateToken;