const { z } = require('zod');

const createRegionSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    description: z.string().optional()
  })
});

const updateRegionSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional()
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number')
  })
});

const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number')
  })
});

const paginationSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional()
  })
});

module.exports = {
  createRegionSchema,
  updateRegionSchema,
  idParamSchema,
  paginationSchema
};
