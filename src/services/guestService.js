const db = require("../utils/dbUtils");
const { v4: uuidv4 } = require("uuid");

/**
 * Guest Service - Handles all business logic and data access for guests
 */
class GuestService {
  /**
   * Format guest data for consistent API output
   */
  static formatGuest(guest) {
    if (!guest) return null;
    return {
      ...guest,
      is_vip: Boolean(guest.is_vip),
      checked_in: Boolean(guest.checked_in),
      isVIP: Boolean(guest.is_vip),
      checkedIn: Boolean(guest.checked_in),
      group: guest.guest_group,
      attendanceCount: guest.attendance_count,
      checkedInAt: guest.checked_in_at,
      createdAt: guest.created_at,
    };
  }

  async getAllGuests({ search, isVIP }) {
    let query = "SELECT * FROM guests WHERE 1=1";
    const params = [];

    if (search) {
      query += " AND name LIKE ?";
      params.push(`%${search}%`);
    }

    if (isVIP !== undefined) {
      query += " AND is_vip = ?";
      params.push(isVIP === "true" ? 1 : 0);
    }

    query += " ORDER BY created_at DESC";

    const guests = await db.all(query, params);
    return guests.map(GuestService.formatGuest);
  }

  async getGuestById(id) {
    const guest = await db.get("SELECT * FROM guests WHERE id = ?", [id]);
    if (!guest) return null;
    return GuestService.formatGuest(guest);
  }

  async createGuest(data) {
    const { name, isVIP, group, attendanceCount } = data;
    const id = uuidv4();
    const is_vip = isVIP ? 1 : 0;
    const guest_group = group || null;
    const attendance_count =
      attendanceCount !== undefined ? attendanceCount : 1;

    await db.run(
      "INSERT INTO guests (id, name, is_vip, guest_group, attendance_count) VALUES (?, ?, ?, ?, ?)",
      [id, name, is_vip, guest_group, attendance_count],
    );

    return this.getGuestById(id);
  }

  async updateGuest(id, data) {
    const { name, isVIP, group, attendanceCount } = data;
    const is_vip = isVIP ? 1 : 0;
    const guest_group = group !== undefined ? group : null;
    const attendance_count =
      attendanceCount !== undefined ? attendanceCount : 1;

    const result = await db.run(
      "UPDATE guests SET name = ?, is_vip = ?, guest_group = ?, attendance_count = ? WHERE id = ?",
      [name, is_vip, guest_group, attendance_count, id],
    );

    if (result.changes === 0) return null;
    return this.getGuestById(id);
  }

  async deleteGuest(id) {
    const result = await db.run("DELETE FROM guests WHERE id = ?", [id]);
    return result.changes > 0;
  }

  async checkInGuest(id, attendanceCount) {
    const now = new Date().toISOString();
    let query = "UPDATE guests SET checked_in = 1, checked_in_at = ?";
    const params = [now];

    if (attendanceCount !== undefined) {
      query += ", attendance_count = ?";
      params.push(attendanceCount);
    }

    query += " WHERE id = ?";
    params.push(id);

    const result = await db.run(query, params);
    if (result.changes === 0) return null;

    const guest = await this.getGuestById(id);
    const stats = await this.getStats();

    return { guest, stats };
  }

  async getStats() {
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total,
        SUM(checked_in) as checkedIn,
        SUM(is_vip) as vipTotal,
        SUM(CASE WHEN is_vip = 1 AND checked_in = 1 THEN 1 ELSE 0 END) as vipCheckedIn
      FROM guests
    `);

    return {
      total: stats.total || 0,
      checkedIn: stats.checkedIn || 0,
      vipTotal: stats.vipTotal || 0,
      vipCheckedIn: stats.vipCheckedIn || 0,
    };
  }
}

module.exports = new GuestService();
