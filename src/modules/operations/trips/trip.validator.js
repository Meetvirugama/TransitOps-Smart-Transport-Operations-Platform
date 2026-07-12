const { z } = require('zod');

const createTripSchema = z.object({
  body: z.object({
    trip_number: z.string().min(1).max(50),
    source: z.string().min(1).max(150),
    destination: z.string().min(1).max(150),
    cargo_weight: z.number().positive(),
    planned_distance: z.number().positive().optional()
  })
});

const dispatchTripSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  }),
  body: z.object({
    vehicle_id: z.number().int().positive(),
    driver_id: z.number().int().positive()
  })
});

const completeTripSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  }),
  body: z.object({
    actual_distance: z.number().positive()
  })
});

const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  })
});

const tripFilterSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    status: z.enum(['Draft', 'Dispatched', 'Completed', 'Cancelled']).optional(),
    vehicle_id: z.string().regex(/^\d+$/).optional(),
    driver_id: z.string().regex(/^\d+$/).optional()
  })
});

module.exports = {
  createTripSchema,
  dispatchTripSchema,
  completeTripSchema,
  idParamSchema,
  tripFilterSchema
};
