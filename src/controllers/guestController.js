const guestService = require("../services/guestService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");

/**
 * Guest Controller - Handles HTTP requests/responses for guests
 * Delegates business logic to guestService
 */

exports.getAllGuests = asyncHandler(async (req, res) => {
  const { search, isVIP } = req.query;
  const guests = await guestService.getAllGuests({ search, isVIP });
  return sendSuccess(res, { guests });
});

exports.getGuest = asyncHandler(async (req, res) => {
  const guest = await guestService.getGuestById(req.params.id);
  if (!guest) {
    const error = new Error("Guest not found");
    error.statusCode = 404;
    throw error;
  }
  return sendSuccess(res, { guest });
});

exports.createGuest = asyncHandler(async (req, res) => {
  const guest = await guestService.createGuest(req.body);
  return sendSuccess(res, { guest }, "Guest created successfully", 201);
});

exports.updateGuest = asyncHandler(async (req, res) => {
  const guest = await guestService.updateGuest(req.params.id, req.body);
  if (!guest) {
    const error = new Error("Guest not found");
    error.statusCode = 404;
    throw error;
  }
  return sendSuccess(res, { guest }, "Guest updated successfully");
});

exports.deleteGuest = asyncHandler(async (req, res) => {
  const deleted = await guestService.deleteGuest(req.params.id);
  if (!deleted) {
    const error = new Error("Guest not found");
    error.statusCode = 404;
    throw error;
  }
  return sendSuccess(res, null, "Guest deleted successfully");
});

exports.checkInGuest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { attendanceCount } = req.body;

  const result = await guestService.checkInGuest(id, attendanceCount);
  if (!result) {
    const error = new Error("Guest not found");
    error.statusCode = 404;
    throw error;
  }

  return sendSuccess(res, result, "Guest checked in successfully");
});

exports.getStats = asyncHandler(async (req, res) => {
  const stats = await guestService.getStats();
  return sendSuccess(res, stats);
});

exports.exportGuests = asyncHandler(async (req, res) => {
  const ExcelJS = require("exceljs");
  const guests = await guestService.getAllGuests({});

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
      group: guest.group || "-",
      attendanceCount: guest.attendanceCount || 1,
      isVIP: guest.isVIP ? "Yes" : "No",
      checkedIn: guest.checkedIn ? "Yes" : "No",
      checkedInAt: guest.checkedInAt
        ? new Date(guest.checkedInAt).toLocaleString("id-ID")
        : "-",
    });
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader("Content-Disposition", "attachment; filename=guests.xlsx");

  await workbook.xlsx.write(res);
  res.end();
});
