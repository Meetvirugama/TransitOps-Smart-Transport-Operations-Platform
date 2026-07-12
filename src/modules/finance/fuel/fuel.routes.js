const express = require('express');
const fuelController = require('./fuel.controller');
const validator = require('../../../middleware/validate.middleware');
const schemas = require('./fuel.validator');
const authMiddleware = require('../../../middleware/auth.middleware');
const roleMiddleware = require('../../../middleware/role.middleware');
const { ROLES } = require('../../../common/constants');

const router = express.Router();

router.use(authMiddleware);

router.get('/', validator(schemas.queryFuelSchema), fuelController.getFuelLogs);
router.get('/:id', validator(schemas.idParamSchema), fuelController.getFuelLogById);

const allowedRoles = roleMiddleware(ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DISPATCHER);

router.post('/', allowedRoles, validator(schemas.createFuelSchema), fuelController.createFuelLog);
router.put('/:id', allowedRoles, validator(schemas.updateFuelSchema), fuelController.updateFuelLog);
router.delete('/:id', allowedRoles, validator(schemas.idParamSchema), fuelController.deleteFuelLog);

module.exports = router;
