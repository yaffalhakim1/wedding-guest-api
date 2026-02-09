const express = require("express");
const router = express.Router();
const wishesController = require("../controllers/wishesController");

// Public routes (no authentication required)
// GET /api/wishes - Get all wishes
router.get("/", wishesController.getWishes);

// POST /api/wishes - Create a new wish
router.post("/", wishesController.createWish);

module.exports = router;
