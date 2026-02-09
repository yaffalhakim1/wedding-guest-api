const express = require("express");
const router = express.Router();
const invitationController = require("../controllers/invitationController");

// GET /api/invitations/:guestId - Get guest invitation details (PUBLIC)
router.get("/:guestId", invitationController.getInvitation);

module.exports = router;
