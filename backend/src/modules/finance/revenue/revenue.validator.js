const { z } = require('zod');

const createRevenueSchema = z.object({
  body: z.object({
    trip_id: z.number().int().positive(),
    customer_name: z.string().max(150).optional(),
    amount: z.number().nonnegative(),
    payment_status: z.enum(['Pending', 'Partial', 'Paid']).optional(),
    invoice_number: z.string().max(100).optional(),
    received_date: z.string().datetime().optional()
  })
});

const updateRevenueSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  }),
  body: z.object({
    customer_name: z.string().max(150).optional(),
    amount: z.number().nonnegative().optional(),
    payment_status: z.enum(['Pending', 'Partial', 'Paid']).optional(),
    invoice_number: z.string().max(100).optional(),
    received_date: z.string().datetime().optional()
  })
});

const queryRevenueSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    vehicle_id: z.string().regex(/^\d+$/).optional(),
    trip_id: z.string().regex(/^\d+$/).optional(),
    payment_status: z.enum(['Pending', 'Partial', 'Paid']).optional()
  })
});

const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  })
});

module.exports = {
  createRevenueSchema,
  updateRevenueSchema,
  queryRevenueSchema,
  idParamSchema
};
