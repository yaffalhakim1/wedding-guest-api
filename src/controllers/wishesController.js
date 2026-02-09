const wishesService = require("../services/wishesService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

exports.getWishes = asyncHandler(async (req, res) => {
  const wishes = await wishesService.getAllWishes();
  return sendSuccess(res, { wishes });
});

exports.createWish = asyncHandler(async (req, res) => {
  const wish = await wishesService.createWish(req.body);
  return sendSuccess(res, { wish }, "Wish created successfully", 201);
});
