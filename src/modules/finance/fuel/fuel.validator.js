const { z } = require('zod');

const createFuelSchema = z.object({
  body: z.object({
    vehicle_id: z.number().int().positive(),
    trip_id: z.number().int().positive().optional(),
    driver_id: z.number().int().positive().optional(),
    fuel_station: z.string().optional(),
    quantity: z.number().positive(),
    price_per_liter: z.number().nonnegative(),
    odometer_reading: z.number().nonnegative(),
    fuel_date: z.string().datetime().optional(),
    remarks: z.string().optional()
  })
});

const updateFuelSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  }),
  body: z.object({
    fuel_station: z.string().optional(),
    quantity: z.number().positive().optional(),
    price_per_liter: z.number().nonnegative().optional(),
    odometer_reading: z.number().nonnegative().optional(),
    remarks: z.string().optional()
  })
});

const queryFuelSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    vehicle_id: z.string().regex(/^\d+$/).optional(),
    trip_id: z.string().regex(/^\d+$/).optional(),
    driver_id: z.string().regex(/^\d+$/).optional()
  })
});

const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  })
});

module.exports = {
  createFuelSchema,
  updateFuelSchema,
  queryFuelSchema,
  idParamSchema
};
