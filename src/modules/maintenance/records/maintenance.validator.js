const { z } = require('zod');

const createMaintenanceSchema = z.object({
  body: z.object({
    vehicle_id: z.number().int().positive(),
    maintenance_type: z.string().min(1).max(100),
    description: z.string().optional(),
    estimated_cost: z.number().nonnegative().optional()
  })
});

const startMaintenanceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  }),
  body: z.object({
    workshop_id: z.number().int().positive(),
    technician_name: z.string().min(1).max(150),
    expected_completion_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() // YYYY-MM-DD
  })
});

const completeMaintenanceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  }),
  body: z.object({
    actual_cost: z.number().nonnegative(),
    remarks: z.string().optional()
  })
});

const queryMaintenanceSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled']).optional(),
    vehicle_id: z.string().regex(/^\d+$/).optional(),
    workshop_id: z.string().regex(/^\d+$/).optional()
  })
});

const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  })
});

module.exports = {
  createMaintenanceSchema,
  startMaintenanceSchema,
  completeMaintenanceSchema,
  queryMaintenanceSchema,
  idParamSchema
};
