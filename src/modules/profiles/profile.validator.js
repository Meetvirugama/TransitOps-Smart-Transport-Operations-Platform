const { z } = require('zod');

const upsertProfileSchema = z.object({
  body: z.object({
    employee_name: z.string().max(150).optional(),
    phone: z.string().max(50).optional(),
    department: z.string().max(100).optional(),
    profile_photo: z.string().url().optional()
  })
});

const userParamSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^\d+$/)
  })
});

module.exports = {
  upsertProfileSchema,
  userParamSchema
};
