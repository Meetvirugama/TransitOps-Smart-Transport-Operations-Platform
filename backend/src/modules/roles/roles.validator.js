const { z } = require('zod');
const { idParamSchema } = require('../../common/schemas');

const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50),
    permissions: z.record(z.boolean()).optional()
  })
});

const updateRoleSchema = z.object({
  params: idParamSchema,
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    permissions: z.record(z.boolean()).optional()
  })
});

module.exports = {
  createRoleSchema,
  updateRoleSchema,
  idParamSchema
};
