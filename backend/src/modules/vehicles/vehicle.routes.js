const express = require('express');
const vehicleController = require('./vehicle.controller');
const validator = require('../../middleware/validate.middleware');
const schemas = require('./vehicle.validator');
const { idParamSchema } = require('../regions/region.validator');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');
const { ROLES } = require('../../common/constants');

const router = express.Router();

router.use(authMiddleware);

const modifyRoles = roleMiddleware(ROLES.ADMIN, ROLES.FLEET_MANAGER);

router.post('/', modifyRoles, validator(schemas.createVehicleSchema), vehicleController.createVehicle);
router.get('/', validator(schemas.vehicleFilterSchema), vehicleController.getVehicles);
router.get('/:id', validator(idParamSchema), vehicleController.getVehicleById);
router.put('/:id', modifyRoles, validator(schemas.updateVehicleSchema), vehicleController.updateVehicle);
router.delete('/:id', modifyRoles, validator(idParamSchema), vehicleController.deleteVehicle);

module.exports = router;
