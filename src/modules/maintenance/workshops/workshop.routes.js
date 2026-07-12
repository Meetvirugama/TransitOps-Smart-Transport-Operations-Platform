const express = require('express');
const workshopController = require('./workshop.controller');
const validator = require('../../../middleware/validate.middleware');
const schemas = require('./workshop.validator');
const authMiddleware = require('../../../middleware/auth.middleware');
const roleMiddleware = require('../../../middleware/role.middleware');
const { ROLES } = require('../../../common/constants');

const router = express.Router();

router.use(authMiddleware);

// Operations/Dispatchers/Fleet Managers can view workshops
router.get('/', validator(schemas.queryWorkshopSchema), workshopController.getWorkshops);
router.get('/:id', validator(schemas.idParamSchema), workshopController.getWorkshopById);

// Only Admins or Fleet Managers can modify workshops
const managerRoles = roleMiddleware(ROLES.ADMIN, ROLES.FLEET_MANAGER);

router.post('/', managerRoles, validator(schemas.createWorkshopSchema), workshopController.createWorkshop);
router.put('/:id', managerRoles, validator(schemas.updateWorkshopSchema), workshopController.updateWorkshop);
router.delete('/:id', managerRoles, validator(schemas.idParamSchema), workshopController.deleteWorkshop);

module.exports = router;
