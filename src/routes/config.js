const express = require("express");
const router = express.Router();
const configController = require("../controllers/configController");
const auth = require("../middleware/auth");

// GET /api/config - Get config (public for invitation page)
router.get("/", configController.getConfig);

// PUT /api/config - Update config (protected)
router.put("/", auth, configController.updateConfig);

module.exports = router;
