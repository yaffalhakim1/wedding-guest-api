const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.authenticate(email, password);

  if (!result) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  return sendSuccess(res, result, "Login successful");
});

exports.verify = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    valid: true,
    user: req.user,
  });
});
