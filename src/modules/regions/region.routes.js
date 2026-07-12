const express = require('express');
const regionController = require('./region.controller');
const validator = require('../../middleware/validate.middleware');
const schemas = require('./region.validator');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');
const { ROLES } = require('../../common/constants');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Only Admins and Fleet Managers can modify regions
const modifyRoles = roleMiddleware(ROLES.ADMIN, ROLES.FLEET_MANAGER);

router.post('/', modifyRoles, validator(schemas.createRegionSchema), regionController.createRegion);
router.get('/', validator(schemas.paginationSchema), regionController.getRegions);
router.get('/:id', validator(schemas.idParamSchema), regionController.getRegionById);
router.put('/:id', modifyRoles, validator(schemas.updateRegionSchema), regionController.updateRegion);
router.delete('/:id', modifyRoles, validator(schemas.idParamSchema), regionController.deleteRegion);

module.exports = router;
