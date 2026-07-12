const { z } = require('zod');
const { idParamSchema } = require('../../common/schemas');

const updateUserRoleSchema = z.object({
  params: idParamSchema,
  body: z.object({
    roleId: z.number().int().positive()
  })
});

module.exports = {
  updateUserRoleSchema
};
