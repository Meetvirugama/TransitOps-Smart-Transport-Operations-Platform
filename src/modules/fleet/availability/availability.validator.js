const { z } = require('zod');

const paramIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  })
});

const vehicleStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  }),
  body: z.object({
    status: z.enum(['Available', 'On Trip', 'In Shop', 'Retired'])
  })
});

const driverStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/)
  }),
  body: z.object({
    status: z.enum(['Available', 'On Trip', 'Off Duty', 'Suspended'])
  })
});

const availableVehiclesQuerySchema = z.object({
  query: z.object({
    regionId: z.string().regex(/^\d+$/).optional()
  })
});

const availableDriversQuerySchema = z.object({
  query: z.object({
    licenseCategoryId: z.string().regex(/^\d+$/).optional()
  })
});

module.exports = {
  paramIdSchema,
  vehicleStatusSchema,
  driverStatusSchema,
  availableVehiclesQuerySchema,
  availableDriversQuerySchema
};
