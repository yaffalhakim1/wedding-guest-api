/**
 * Standard Zod Validation Middleware
 * Validates req.body against a provided schema
 */
const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const error = new Error("Validation Error");
      error.statusCode = 400;
      error.code = "VALIDATION_ERROR";
      error.details = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      throw error;
    }

    // Replace req.body with sanitized/parsed data
    req.body = result.data;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = validate;
