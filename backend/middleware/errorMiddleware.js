/**
 * Handles requests to routes that do not exist.
 */
const notFound = (req, res, next) => {
  res.status(404);

  const error = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`
  );

  next(error);
};

/**
 * Converts application and database errors into consistent JSON responses.
 */
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode =
    err.statusCode ||
    (res.statusCode >= 400 ? res.statusCode : 500);

  let message =
    err.message || "An unexpected server error occurred.";

  if (err.name === "ValidationError") {
    statusCode = 400;

    message = Object.values(err.errors)
      .map((validationError) => validationError.message)
      .join(" ");
  }

  if (err.name === "CastError" && err.path === "_id") {
    statusCode = 400;
    message = "The provided trip ID is invalid.";
  }

  res.status(statusCode).json({
    success: false,
    message,

    ...(err.details && {
      details: err.details,
    }),

    ...(process.env.NODE_ENV !== "production" && {
      stack: err.stack,
    }),
  });
};

module.exports = {
  notFound,
  errorHandler,
};