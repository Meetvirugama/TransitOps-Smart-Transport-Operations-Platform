const { z } = require('zod');

const createLCSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50),
    description: z.string().optional()
  })
});

const updateLCSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    description: z.string().optional()
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/)
  })
});

module.exports = {
  createLCSchema,
  updateLCSchema
};
