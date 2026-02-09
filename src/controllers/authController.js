const db = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Login admin
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find admin
    db.get(
      "SELECT * FROM admins WHERE email = ?",
      [email],
      async (err, admin) => {
        if (err) return next(err);

        if (!admin) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, admin.password_hash);

        if (!isValid) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT
        const token = jwt.sign(
          { id: admin.id, email: admin.email },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN },
        );

        res.json({
          token,
          user: {
            id: admin.id,
            email: admin.email,
          },
        });
      },
    );
  } catch (error) {
    next(error);
  }
};

// Verify token
exports.verify = (req, res) => {
  // If we get here, the auth middleware already verified the token
  res.json({
    valid: true,
    user: req.user,
  });
};
