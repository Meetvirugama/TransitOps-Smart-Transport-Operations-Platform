const express = require('express');
const rolesController = require('./roles.controller');
const validator = require('../../middleware/validate.middleware');
const schemas = require('./roles.validator');
const { paginationSchema } = require('../../common/schemas');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');
const { ROLES } = require('../../common/constants');

const router = express.Router();

// All role management endpoints require Admin access
router.use(authMiddleware);
router.use(roleMiddleware(ROLES.ADMIN));

router.route('/')
  .get(validator(paginationSchema), rolesController.getRoles)
  .post(validator(schemas.createRoleSchema), rolesController.createRole);

router.route('/:id')
  .get(validator(schemas.idParamSchema), rolesController.getRoleById)
  .put(validator(schemas.updateRoleSchema), rolesController.updateRole);

module.exports = router;
