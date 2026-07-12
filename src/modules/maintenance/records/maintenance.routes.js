const express = require('express');
const maintenanceController = require('./maintenance.controller');
const validator = require('../../../middleware/validate.middleware');
const schemas = require('./maintenance.validator');
const authMiddleware = require('../../../middleware/auth.middleware');
const roleMiddleware = require('../../../middleware/role.middleware');
const { ROLES } = require('../../../common/constants');

const router = express.Router();

router.use(authMiddleware);

// All authenticated users can view maintenance records
router.get('/', validator(schemas.queryMaintenanceSchema), maintenanceController.getMaintenanceRecords);
router.get('/:id', validator(schemas.idParamSchema), maintenanceController.getMaintenanceById);

// Only Admins or Fleet Managers can modify maintenance records
const managerRoles = roleMiddleware(ROLES.ADMIN, ROLES.FLEET_MANAGER);

router.post('/', managerRoles, validator(schemas.createMaintenanceSchema), maintenanceController.createMaintenance);

// Workflows
router.post('/:id/start', managerRoles, validator(schemas.startMaintenanceSchema), maintenanceController.startMaintenance);
router.post('/:id/complete', managerRoles, validator(schemas.completeMaintenanceSchema), maintenanceController.completeMaintenance);
router.post('/:id/cancel', managerRoles, validator(schemas.idParamSchema), maintenanceController.cancelMaintenance);

module.exports = router;
