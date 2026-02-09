/**
 * Standardized Success Response Utility
 */
const sendSuccess = (
  res,
  data = null,
  message = "Success",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: data?.meta || null,
    error: null,
  });
};

module.exports = { sendSuccess };
