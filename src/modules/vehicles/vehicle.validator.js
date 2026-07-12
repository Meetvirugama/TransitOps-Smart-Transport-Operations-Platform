const { z } = require('zod');

const createVehicleSchema = z.object({
  body: z.object({
    registration_number: z.string().min(1),
    name: z.string().min(1).max(150),
    model: z.string().optional(),
    vehicle_type_id: z.number().int().positive().optional(),
    max_capacity: z.number().positive(),
    odometer: z.number().nonnegative().optional(),
    acquisition_cost: z.number().nonnegative().optional(),
    purchase_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional(),
    region_id: z.number().int().positive().optional(),
    description: z.string().optional()
  })
});

const updateVehicleSchema = z.object({
  body: z.object({
    registration_number: z.string().min(1).optional(),
    name: z.string().min(1).max(150).optional(),
    model: z.string().optional(),
    vehicle_type_id: z.number().int().positive().optional(),
    max_capacity: z.number().positive().optional(),
    odometer: z.number().nonnegative().optional(),
    acquisition_cost: z.number().nonnegative().optional(),
    purchase_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    region_id: z.number().int().positive().optional(),
    description: z.string().optional()
    // Status is intentionally omitted from update payload to prevent bypassing workflow
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/)
  })
});

const vehicleFilterSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    status: z.string().optional(),
    region_id: z.string().regex(/^\d+$/).optional(),
    vehicle_type_id: z.string().regex(/^\d+$/).optional()
  })
});

module.exports = {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleFilterSchema
};
