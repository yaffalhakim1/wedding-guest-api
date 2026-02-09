const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { loginSchema } = require("../validations/authSchema");

// POST /api/auth/login - Login
router.post("/login", validate(loginSchema), authController.login);

// POST /api/auth/verify - Verify token (protected)
router.post("/verify", auth, authController.verify);

module.exports = router;
