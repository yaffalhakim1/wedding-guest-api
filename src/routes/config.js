const express = require("express");
const router = express.Router();
const configController = require("../controllers/configController");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { configSchema } = require("../validations/configSchema");

// GET /api/config - Get config (public for invitation page)
router.get("/", configController.getConfig);

// PUT /api/config - Update config (protected)
router.put("/", auth, validate(configSchema), configController.updateConfig);

module.exports = router;
