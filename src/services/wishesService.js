const db = require("../utils/dbUtils");
const { v4: uuidv4 } = require("uuid");

class WishesService {
  static formatWish(wish) {
    if (!wish) return null;
    return {
      ...wish,
      createdAt: wish.created_at,
    };
  }

  async getAllWishes() {
    const wishes = await db.all(
      "SELECT * FROM wishes ORDER BY created_at DESC",
    );
    return wishes.map(WishesService.formatWish);
  }

  async createWish(data) {
    const { name, message } = data;
    const id = uuidv4();
    await db.run("INSERT INTO wishes (id, name, message) VALUES (?, ?, ?)", [
      id,
      name,
      message,
    ]);
    return this.getWishById(id);
  }

  async getWishById(id) {
    const wish = await db.get("SELECT * FROM wishes WHERE id = ?", [id]);
    return WishesService.formatWish(wish);
  }

  async deleteWish(id) {
    const result = await db.run("DELETE FROM wishes WHERE id = ?", [id]);
    return result.changes > 0;
  }
}

module.exports = new WishesService();
