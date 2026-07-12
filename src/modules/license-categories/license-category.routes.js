const express = require('express');
const lcController = require('./license-category.controller');
const validator = require('../../middleware/validate.middleware');
const schemas = require('./license-category.validator');
const { idParamSchema, paginationSchema } = require('../regions/region.validator');
const authMiddleware = require('../../middleware/auth.middleware');
const roleMiddleware = require('../../middleware/role.middleware');
const { ROLES } = require('../../common/constants');

const router = express.Router();

router.use(authMiddleware);
const modifyRoles = roleMiddleware(ROLES.ADMIN, ROLES.SAFETY_OFFICER, ROLES.FLEET_MANAGER);

router.post('/', modifyRoles, validator(schemas.createLCSchema), lcController.createLC);
router.get('/', validator(paginationSchema), lcController.getLCs);
router.get('/:id', validator(idParamSchema), lcController.getLCById);
router.put('/:id', modifyRoles, validator(schemas.updateLCSchema), lcController.updateLC);
router.delete('/:id', modifyRoles, validator(idParamSchema), lcController.deleteLC);

module.exports = router;
