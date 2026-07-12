const express = require('express');
const usersController = require('./users.controller');
const validator = require('../../middleware/validate.middleware');
const schemas = require('./users.validator');
const { paginationSchema, idParamSchema } = require('../../common/schemas');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');
const { ROLES } = require('../../common/constants');

const router = express.Router();

// All user management endpoints require Admin access
router.use(authMiddleware);
router.use(roleMiddleware(ROLES.ADMIN));

router.get('/', validator(paginationSchema), usersController.getUsers);
router.put('/:id/role', validator(schemas.updateUserRoleSchema), usersController.updateUserRole);

module.exports = router;
