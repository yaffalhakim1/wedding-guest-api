const { z } = require("zod");

const configSchema = z.object({
  bride: z.string().min(1, "Nama mempelai wanita diperlukan"),
  groom: z.string().min(1, "Nama mempelai pria diperlukan"),
  date: z.string().min(1, "Tanggal diperlukan"),
  time: z.string().min(1, "Waktu diperlukan"),
  venue: z.string().min(1, "Lokasi diperlukan"),
  message: z.string().optional().default(""),
});

module.exports = { configSchema };
