const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET /api/invitation/:guestId - Get guest invitation details (PUBLIC)
router.get("/:guestId", (req, res, next) => {
  const { guestId } = req.params;

  // Get guest data
  db.get("SELECT * FROM guests WHERE id = ?", [guestId], (err, guest) => {
    if (err) return next(err);

    if (!guest) {
      return res.status(404).json({ error: "Guest not found" });
    }

    // Get event config
    db.get("SELECT * FROM event_config WHERE id = 1", (err, config) => {
      if (err) return next(err);

      res.json({
        guest: {
          id: guest.id,
          name: guest.name,
          isVIP: Boolean(guest.is_vip),
          checkedIn: Boolean(guest.checked_in),
          checkedInAt: guest.checked_in_at,
          createdAt: guest.created_at,
        },
        config: config
          ? {
              bride: config.bride,
              groom: config.groom,
              date: config.date,
              time: config.time,
              venue: config.venue,
              message: config.message,
            }
          : null,
      });
    });
  });
});

module.exports = router;
