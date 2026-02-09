const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

// POST /api/auth/login - Login
router.post("/login", authController.login);

// POST /api/auth/verify - Verify token (protected)
router.post("/verify", auth, authController.verify);

module.exports = router;
