const db = require("../utils/dbUtils");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthService {
  async authenticate(email, password) {
    const admin = await db.get("SELECT * FROM admins WHERE email = ?", [email]);
    if (!admin) return null;

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) return null;

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    return {
      token,
      user: {
        id: admin.id,
        email: admin.email,
      },
    };
  }
}

module.exports = new AuthService();
