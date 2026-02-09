const invitationService = require("../services/invitationService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

exports.getInvitation = asyncHandler(async (req, res) => {
  const { guestId } = req.params;
  const result = await invitationService.getInvitationDetails(guestId);

  if (!result) {
    const error = new Error("Guest not found");
    error.statusCode = 404;
    throw error;
  }

  return sendSuccess(res, result);
});
