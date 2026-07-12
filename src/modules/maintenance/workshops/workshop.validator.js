const { z } = require('zod');

const createWorkshopSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(150),
    address: z.string().min(1),
    contact_number: z.string().max(50).optional(),
    manager: z.string().max(150).optional()
  })
});

const updateWorkshopSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  }),
  body: z.object({
    name: z.string().min(1).max(150).optional(),
    address: z.string().min(1).optional(),
    contact_number: z.string().max(50).optional(),
    manager: z.string().max(150).optional(),
    status: z.enum(['Active', 'Inactive']).optional()
  })
});

const queryWorkshopSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    status: z.enum(['Active', 'Inactive']).optional()
  })
});

const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  })
});

module.exports = {
  createWorkshopSchema,
  updateWorkshopSchema,
  queryWorkshopSchema,
  idParamSchema
};
