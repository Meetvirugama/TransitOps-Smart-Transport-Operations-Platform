const express = require('express');
const driverController = require('./driver.controller');
const validator = require('../../middleware/validate.middleware');
const schemas = require('./driver.validator');
const { idParamSchema } = require('../regions/region.validator');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');
const { ROLES } = require('../../common/constants');

const router = express.Router();

router.use(authMiddleware);

const modifyRoles = roleMiddleware(ROLES.ADMIN, ROLES.SAFETY_OFFICER, ROLES.FLEET_MANAGER);

router.post('/', modifyRoles, validator(schemas.createDriverSchema), driverController.createDriver);
router.get('/', validator(schemas.driverFilterSchema), driverController.getDrivers);
router.get('/:id', validator(idParamSchema), driverController.getDriverById);
router.put('/:id', modifyRoles, validator(schemas.updateDriverSchema), driverController.updateDriver);
router.delete('/:id', modifyRoles, validator(idParamSchema), driverController.deleteDriver);

module.exports = router;
