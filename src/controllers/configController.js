const db = require("../config/database");

// Get wedding config
exports.getConfig = (req, res, next) => {
  db.get("SELECT * FROM event_config WHERE id = 1", (err, config) => {
    if (err) return next(err);

    if (!config) {
      return res.status(404).json({ error: "Configuration not found" });
    }

    res.json({
      config: {
        bride: config.bride,
        groom: config.groom,
        date: config.date,
        time: config.time,
        venue: config.venue,
        message: config.message,
        updatedAt: config.updated_at,
      },
    });
  });
};

// Update wedding config
exports.updateConfig = (req, res, next) => {
  const { bride, groom, date, time, venue, message } = req.body;

  if (!bride || !groom || !date || !time || !venue) {
    return res.status(400).json({
      error: "Bride, groom, date, time, and venue are required",
    });
  }

  const now = new Date().toISOString();

  db.run(
    `UPDATE event_config 
     SET bride = ?, groom = ?, date = ?, time = ?, venue = ?, message = ?, updated_at = ?
     WHERE id = 1`,
    [bride, groom, date, time, venue, message || "", now],
    function (err) {
      if (err) return next(err);

      res.json({
        config: {
          bride,
          groom,
          date,
          time,
          venue,
          message,
          updatedAt: now,
        },
      });
    },
  );
};
