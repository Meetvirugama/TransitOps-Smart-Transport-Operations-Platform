const { z } = require('zod');

/** Reusable Zod schemas — centralized to avoid duplication across all validators */
const idParam = z.object({ params: z.object({ id: z.string().regex(/^\d+$/, 'ID must be a number') }) });

const pagination = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional()
  })
});

const intId = z.number().int().positive();
const optIntId = intId.optional();

module.exports = { idParam, pagination, intId, optIntId };
