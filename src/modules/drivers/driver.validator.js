const { z } = require('zod');

const createDriverSchema = z.object({
  body: z.object({
    full_name: z.string().min(1).max(150),
    license_number: z.string().min(1).max(100),
    license_category_id: z.number().int().positive().optional(),
    license_expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    safety_score: z.number().min(0).max(100).optional(),
    address: z.string().optional(),
    joining_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
  })
});

const updateDriverSchema = z.object({
  body: z.object({
    full_name: z.string().min(1).max(150).optional(),
    license_number: z.string().min(1).max(100).optional(),
    license_category_id: z.number().int().positive().optional(),
    license_expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    safety_score: z.number().min(0).max(100).optional(),
    address: z.string().optional(),
    joining_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/)
  })
});

const driverFilterSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    status: z.string().optional(),
    license_category_id: z.string().regex(/^\d+$/).optional()
  })
});

module.exports = {
  createDriverSchema,
  updateDriverSchema,
  driverFilterSchema
};
