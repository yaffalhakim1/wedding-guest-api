const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", err);
  }

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  }

  if (err.code === "SQLITE_CONSTRAINT") {
    statusCode = 409;
    message = "Resource already exists";
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      message,
      code: err.code || "INTERNAL_ERROR",
      ...(err.details && { details: err.details }),
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
