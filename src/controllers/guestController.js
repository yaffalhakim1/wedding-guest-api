const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");

// Get all guests
exports.getAllGuests = (req, res, next) => {
  const { search, isVIP } = req.query;

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

  db.all(query, params, (err, guests) => {
    if (err) return next(err);

    // Convert 0/1 to boolean for is_vip and checked_in
    const formattedGuests = guests.map((guest) => ({
      ...guest,
      is_vip: Boolean(guest.is_vip),
      checked_in: Boolean(guest.checked_in),
      isVIP: Boolean(guest.is_vip), // Add for frontend compatibility
      checkedIn: Boolean(guest.checked_in),
      group: guest.guest_group,
      attendanceCount: guest.attendance_count,
      checkedInAt: guest.checked_in_at,
      createdAt: guest.created_at,
    }));

    res.json({ guests: formattedGuests });
  });
};

// Get single guest
exports.getGuest = (req, res, next) => {
  db.get("SELECT * FROM guests WHERE id = ?", [req.params.id], (err, guest) => {
    if (err) return next(err);
    if (!guest) return res.status(404).json({ error: "Guest not found" });

    res.json({
      guest: {
        ...guest,
        is_vip: Boolean(guest.is_vip),
        checked_in: Boolean(guest.checked_in),
        isVIP: Boolean(guest.is_vip),
        checkedIn: Boolean(guest.checked_in),
        group: guest.guest_group,
        attendanceCount: guest.attendance_count,
        checkedInAt: guest.checked_in_at,
        createdAt: guest.created_at,
      },
    });
  });
};

// Create guest
exports.createGuest = (req, res, next) => {
  const { name, isVIP, group, attendanceCount } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const id = uuidv4();
  const is_vip = isVIP ? 1 : 0;
  const guest_group = group || null;
  const attendance_count = attendanceCount !== undefined ? attendanceCount : 1;

  db.run(
    "INSERT INTO guests (id, name, is_vip, guest_group, attendance_count) VALUES (?, ?, ?, ?, ?)",
    [id, name, is_vip, guest_group, attendance_count],
    function (err) {
      if (err) return next(err);

      res.status(201).json({
        guest: {
          id,
          name,
          is_vip: Boolean(is_vip),
          isVIP: Boolean(is_vip),
          checked_in: false,
          checkedIn: false,
          group: guest_group,
          attendanceCount: attendance_count,
          checked_in_at: null,
          checkedInAt: null,
          created_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      });
    },
  );
};

// Update guest
exports.updateGuest = (req, res, next) => {
  const { name, isVIP, group, attendanceCount } = req.body;
  const { id } = req.params;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const is_vip = isVIP ? 1 : 0;
  const guest_group = group !== undefined ? group : null;
  const attendance_count = attendanceCount !== undefined ? attendanceCount : 1;

  db.run(
    "UPDATE guests SET name = ?, is_vip = ?, guest_group = ?, attendance_count = ? WHERE id = ?",
    [name, is_vip, guest_group, attendance_count, id],
    function (err) {
      if (err) return next(err);

      if (this.changes === 0) {
        return res.status(404).json({ error: "Guest not found" });
      }

      // Fetch updated guest
      db.get("SELECT * FROM guests WHERE id = ?", [id], (err, guest) => {
        if (err) return next(err);

        res.json({
          guest: {
            ...guest,
            is_vip: Boolean(guest.is_vip),
            checked_in: Boolean(guest.checked_in),
            isVIP: Boolean(guest.is_vip),
            checkedIn: Boolean(guest.checked_in),
            group: guest.guest_group,
            attendanceCount: guest.attendance_count,
            checkedInAt: guest.checked_in_at,
            createdAt: guest.created_at,
          },
        });
      });
    },
  );
};

// Delete guest
exports.deleteGuest = (req, res, next) => {
  db.run("DELETE FROM guests WHERE id = ?", [req.params.id], function (err) {
    if (err) return next(err);

    if (this.changes === 0) {
      return res.status(404).json({ error: "Guest not found" });
    }

    res.json({ message: "Guest deleted successfully" });
  });
};

// Check-in guest
exports.checkInGuest = (req, res, next) => {
  const { id } = req.params;
  const { attendanceCount } = req.body;
  const now = new Date().toISOString();

  let query = "UPDATE guests SET checked_in = 1, checked_in_at = ?";
  const params = [now];

  if (attendanceCount !== undefined) {
    query += ", attendance_count = ?";
    params.push(attendanceCount);
  }

  query += " WHERE id = ?";
  params.push(id);

  db.run(query, params, function (err) {
    if (err) return next(err);

    if (this.changes === 0) {
      return res.status(404).json({ error: "Guest not found" });
    }

    // Get updated guest and stats
    db.get("SELECT * FROM guests WHERE id = ?", [id], (err, guest) => {
      if (err) return next(err);

      // Get stats
      db.get(
        `
          SELECT 
            COUNT(*) as total,
            SUM(checked_in) as checkedIn,
            SUM(is_vip) as vipTotal,
            SUM(CASE WHEN is_vip = 1 AND checked_in = 1 THEN 1 ELSE 0 END) as vipCheckedIn
          FROM guests
        `,
        (err, stats) => {
          if (err) return next(err);

          res.json({
            guest: {
              ...guest,
              is_vip: Boolean(guest.is_vip),
              checked_in: Boolean(guest.checked_in),
              isVIP: Boolean(guest.is_vip),
              checkedIn: Boolean(guest.checked_in),
              group: guest.guest_group,
              attendanceCount: guest.attendance_count,
              checkedInAt: guest.checked_in_at,
              createdAt: guest.created_at,
            },
            stats: {
              total: stats.total || 0,
              checkedIn: stats.checkedIn || 0,
              vipTotal: stats.vipTotal || 0,
              vipCheckedIn: stats.vipCheckedIn || 0,
            },
          });
        },
      );
    });
  });
};

// Get dashboard stats
exports.getStats = (req, res, next) => {
  db.get(
    `
    SELECT 
      COUNT(*) as total,
      SUM(checked_in) as checkedIn,
      SUM(is_vip) as vipTotal,
      SUM(CASE WHEN is_vip = 1 AND checked_in = 1 THEN 1 ELSE 0 END) as vipCheckedIn
    FROM guests
  `,
    (err, stats) => {
      if (err) return next(err);

      res.json({
        total: stats.total || 0,
        checkedIn: stats.checkedIn || 0,
        vipTotal: stats.vipTotal || 0,
        vipCheckedIn: stats.vipCheckedIn || 0,
      });
    },
  );
};

// Export guests to Excel
exports.exportGuests = (req, res, next) => {
  const ExcelJS = require("exceljs");

  db.all(
    "SELECT * FROM guests ORDER BY created_at DESC",
    [],
    async (err, guests) => {
      if (err) return next(err);

      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Guests");

        worksheet.columns = [
          { header: "Name", key: "name", width: 30 },
          { header: "Group", key: "group", width: 20 },
          { header: "Pax", key: "attendanceCount", width: 10 },
          { header: "VIP", key: "isVIP", width: 10 },
          { header: "Checked In", key: "checkedIn", width: 15 },
          { header: "Checked In At", key: "checkedInAt", width: 20 },
        ];

        guests.forEach((guest) => {
          worksheet.addRow({
            name: guest.name,
            group: guest.guest_group || "-",
            attendanceCount: guest.attendance_count || 1,
            isVIP: guest.is_vip ? "Yes" : "No",
            checkedIn: guest.checked_in ? "Yes" : "No",
            checkedInAt: guest.checked_in_at
              ? new Date(guest.checked_in_at).toLocaleString("id-ID")
              : "-",
          });
        });

        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=guests.xlsx",
        );

        await workbook.xlsx.write(res);
        res.end();
      } catch (error) {
        next(error);
      }
    },
  );
};
