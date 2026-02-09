const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");

// Get all wishes
exports.getWishes = (req, res, next) => {
  db.all(
    "SELECT id, name, message, created_at as createdAt FROM wishes ORDER BY created_at DESC",
    [],
    (err, wishes) => {
      if (err) return next(err);

      res.json({ wishes });
    },
  );
};

// Create wish
exports.createWish = (req, res, next) => {
  const { name, message } = req.body;

  // Validation
  if (!name || name.trim().length < 2 || name.length > 100) {
    return res
      .status(400)
      .json({ error: "Name must be between 2-100 characters" });
  }

  if (!message || message.trim().length < 5 || message.length > 500) {
    return res
      .status(400)
      .json({ error: "Message must be between 5-500 characters" });
  }

  const id = uuidv4();
  const sanitizedName = name.trim();
  const sanitizedMessage = message.trim();

  db.run(
    "INSERT INTO wishes (id, name, message) VALUES (?, ?, ?)",
    [id, sanitizedName, sanitizedMessage],
    function (err) {
      if (err) return next(err);

      // Get the created wish
      db.get("SELECT * FROM wishes WHERE id = ?", [id], (err, wish) => {
        if (err) return next(err);

        res.status(201).json({
          wish: {
            id: wish.id,
            name: wish.name,
            message: wish.message,
            createdAt: wish.created_at,
          },
        });
      });
    },
  );
};
