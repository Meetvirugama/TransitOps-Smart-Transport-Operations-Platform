const { z } = require('zod');

const createExpenseSchema = z.object({
  body: z.object({
    vehicle_id: z.number().int().positive(),
    trip_id: z.number().int().positive().optional(),
    expense_type: z.string().min(1).max(100),
    amount: z.number().nonnegative(),
    expense_date: z.string().datetime().optional(),
    description: z.string().optional()
  })
});

const updateExpenseSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  }),
  body: z.object({
    expense_type: z.string().min(1).max(100).optional(),
    amount: z.number().nonnegative().optional(),
    expense_date: z.string().datetime().optional(),
    description: z.string().optional()
  })
});

const queryExpenseSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    vehicle_id: z.string().regex(/^\d+$/).optional(),
    trip_id: z.string().regex(/^\d+$/).optional(),
    expense_type: z.string().optional()
  })
});

const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  })
});

module.exports = {
  createExpenseSchema,
  updateExpenseSchema,
  queryExpenseSchema,
  idParamSchema
};
