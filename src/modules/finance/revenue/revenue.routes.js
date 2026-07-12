const express = require('express');
const revenueController = require('./revenue.controller');
const validator = require('../../../middleware/validate.middleware');
const schemas = require('./revenue.validator');
const authMiddleware = require('../../../middleware/auth.middleware');
const roleMiddleware = require('../../../middleware/role.middleware');
const { ROLES } = require('../../../common/constants');

const router = express.Router();

router.use(authMiddleware);

router.get('/', validator(schemas.queryRevenueSchema), revenueController.getRevenues);
router.get('/:id', validator(schemas.idParamSchema), revenueController.getRevenueById);

const allowedRoles = roleMiddleware(ROLES.ADMIN, ROLES.FLEET_MANAGER);

router.post('/', allowedRoles, validator(schemas.createRevenueSchema), revenueController.createRevenue);
router.put('/:id', allowedRoles, validator(schemas.updateRevenueSchema), revenueController.updateRevenue);
router.delete('/:id', allowedRoles, validator(schemas.idParamSchema), revenueController.deleteRevenue);

module.exports = router;
