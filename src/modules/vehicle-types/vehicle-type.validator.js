const { z } = require('zod');

const createVTSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    maxDefaultCapacity: z.number().positive()
  })
});

const updateVTSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    maxDefaultCapacity: z.number().positive().optional()
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/)
  })
});

module.exports = {
  createVTSchema,
  updateVTSchema
};
