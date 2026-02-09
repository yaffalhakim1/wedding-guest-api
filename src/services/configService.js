const db = require("../utils/dbUtils");

class ConfigService {
  static formatConfig(config) {
    if (!config) return null;
    return {
      bride: config.bride,
      groom: config.groom,
      date: config.date,
      time: config.time,
      venue: config.venue,
      message: config.message,
      updatedAt: config.updated_at,
    };
  }

  async getConfig() {
    const config = await db.get("SELECT * FROM event_config WHERE id = 1");
    return ConfigService.formatConfig(config);
  }

  async updateConfig(data) {
    const { bride, groom, date, time, venue, message } = data;
    const now = new Date().toISOString();

    await db.run(
      `UPDATE event_config 
       SET bride = ?, groom = ?, date = ?, time = ?, venue = ?, message = ?, updated_at = ?
       WHERE id = 1`,
      [bride, groom, date, time, venue, message || "", now],
    );

    return this.getConfig();
  }
}

module.exports = new ConfigService();
