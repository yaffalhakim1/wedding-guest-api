const { z } = require("zod");

const guestSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  isVIP: z.boolean().optional().default(false),
  group: z.string().optional().nullable(),
  attendanceCount: z.number().int().min(0).optional().default(1),
});

module.exports = { guestSchema };
