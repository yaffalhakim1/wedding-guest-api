const configService = require("../services/configService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

exports.getConfig = asyncHandler(async (req, res) => {
  const config = await configService.getConfig();
  if (!config) {
    const error = new Error("Configuration not found");
    error.statusCode = 404;
    throw error;
  }
  return sendSuccess(res, { config });
});

exports.updateConfig = asyncHandler(async (req, res) => {
  const config = await configService.updateConfig(req.body);
  return sendSuccess(res, { config }, "Configuration updated successfully");
});
