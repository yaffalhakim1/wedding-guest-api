const express = require("express");
const router = express.Router();
const guestController = require("../controllers/guestController");
const auth = require("../middleware/auth");

// All routes are protected
router.use(auth);

// GET /api/guests - Get all guests
router.get("/", guestController.getAllGuests);

// GET /api/guests/stats - Get statistics
router.get("/stats", guestController.getStats);

// GET /api/guests/export - Export to Excel
router.get("/export", guestController.exportGuests);

// GET /api/guests/:id - Get single guest
router.get("/:id", guestController.getGuest);

// POST /api/guests - Create guest
router.post("/", guestController.createGuest);

// PUT /api/guests/:id - Update guest
router.put("/:id", guestController.updateGuest);

// DELETE /api/guests/:id - Delete guest
router.delete("/:id", guestController.deleteGuest);

// POST /api/guests/:id/check-in - Check-in guest
router.post("/:id/check-in", guestController.checkInGuest);

module.exports = router;
