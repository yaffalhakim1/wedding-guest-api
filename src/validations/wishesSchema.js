const { z } = require("zod");

const wishSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100).trim(),
  message: z.string().min(5, "Pesan minimal 5 karakter").max(500).trim(),
});

module.exports = { wishSchema };
